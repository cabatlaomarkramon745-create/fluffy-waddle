import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, child, set, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ===== ELEMENTS =====
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");
const userNameDisplay = document.getElementById("userNameDisplay");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const studentCount = document.getElementById("studentCount");
const averageGrade = document.getElementById("averageGrade");

const subjectDropdown = document.getElementById("subjectDropdown");
const subjectInput = document.getElementById("subject");

// ===== MENU + PROFILE FUNCTIONS =====
function openMenu() {
  sideMenu.style.left = "0";
  overlay.style.display = "block";
}
function closeMenu() {
  sideMenu.style.left = "-250px";
  overlay.style.display = "none";
}
function toggleProfile(event) {
  event.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
}
document.addEventListener("click", e => {
  if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
});

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// Firebase logout
async function firebaseLogout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

// ===== USER AUTH STATE =====
onAuthStateChanged(auth, async user => {
  if (user) {
    // Firebase user
    if (userNameDisplay) {
      userNameDisplay.style.display = "inline";
      userNameDisplay.innerText = formatUserName(user.email);
    }
    loginBtn?.style.setProperty("display", "none");
    registerBtn?.style.setProperty("display", "none");
    logoutBtn?.style.setProperty("display", "block");

    // Fetch students from Firebase
    try {
      const dbRef = ref(db, "students");
      const snapshot = await get(child(dbRef, ""));
      const students = snapshot.exists() ? Object.values(snapshot.val()) : [];
      if (studentCount) studentCount.innerText = students.length;

      if (students.length && averageGrade) {
        const total = students.reduce((sum, s) => typeof s.overall === "number" ? sum + s.overall : sum, 0);
        const gradedCount = students.filter(s => typeof s.overall === "number").length;
        if (gradedCount) averageGrade.innerText = (total / gradedCount).toFixed(1);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  } else {
    // Fallback to localStorage user
    const localUser = localStorage.getItem("loggedInUser");
    if (localUser) {
      if (userNameDisplay) {
        userNameDisplay.style.display = "inline";
        userNameDisplay.innerText = localUser.replace("@gmail.com", "");
      }
      loginBtn?.style.setProperty("display", "none");
      registerBtn?.style.setProperty("display", "none");
      logoutBtn?.style.setProperty("display", "block");
    } else {
      userNameDisplay?.style.setProperty("display", "none");
      logoutBtn?.style.setProperty("display", "none");
      loginBtn?.style.setProperty("display", "block");
      registerBtn?.style.setProperty("display", "block");
    }
  }
});

// ===== DOCUMENT READY =====
document.addEventListener("DOMContentLoaded", () => {
  loadQuizTotals();
  loadSavedInputs();
  loadEditData();

  // Remove red border when typing
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => input.classList.remove("input-error"));
  });
});

// ===== VALIDATION =====
function validateGradingInputs() {
  const requiredFields = [
    { id: "subject", name: "Subject" },
    { id: "qScore", name: "Quiz Score" },
    { id: "qMax", name: "Quiz Max" },
    { id: "eScore", name: "Exam Score" },
    { id: "eMax", name: "Exam Max" },
    { id: "aScore", name: "Attendance Score" },
    { id: "aMax", name: "Attendance Max" },
    { id: "wQuiz", name: "Quiz Weight" },
    { id: "wExam", name: "Exam Weight" },
    { id: "wAttend", name: "Attendance Weight" }
  ];

  let firstInvalid = null;
  requiredFields.forEach(field => {
    const el = document.getElementById(field.id);
    el.classList.remove("input-error");
    if (!el.value.trim() && !firstInvalid) firstInvalid = field;
    if (!el.value.trim()) el.classList.add("input-error");
  });

  if (firstInvalid) {
    alert(firstInvalid.name + " is required.");
    document.getElementById(firstInvalid.id).focus();
    return false;
  }

  return true;
}

// ===== CALCULATE AND SAVE =====
function calculate() {
  if (!validateGradingInputs()) return;

  const subjectName = subjectInput.value.trim();
  const wQ = Number(document.getElementById("wQuiz").value);
  const wE = Number(document.getElementById("wExam").value);
  const wA = Number(document.getElementById("wAttend").value);

  if (wQ + wE + wA !== 100) {
    alert("Percentage must total 100%");
    return;
  }

  const qS = Number(document.getElementById("qScore").value);
  const qM = Number(document.getElementById("qMax").value);
  const eS = Number(document.getElementById("eScore").value);
  const eM = Number(document.getElementById("eMax").value);
  const aS = Number(document.getElementById("aScore").value);
  const aM = Number(document.getElementById("aMax").value);

  if (qS > qM || eS > eM || aS > aM) {
    alert("Scores cannot be greater than max");
    return;
  }

  const finalGrade = ((qS / qM) * wQ + (eS / eM) * wE + (aS / aM) * wA).toFixed(2);
  document.getElementById("final").textContent = finalGrade;

  // ===== SAVE TO TEMP SUMMARY (localStorage & Firebase) =====
  let temp = JSON.parse(localStorage.getItem("tempSummary")) || { name: "", grades: [] };
  const editIndex = localStorage.getItem("editSubjectIndex");

  if (editIndex !== null) {
    temp.grades[editIndex] = { subject: subjectName, grade: Number(finalGrade) };
    alert("Grade updated!");
  } else {
    temp.grades.push({ subject: subjectName, grade: Number(finalGrade) });
    alert("Grade saved!");
  }

  localStorage.setItem("tempSummary", JSON.stringify(temp));

  // Firebase push if logged in
  onAuthStateChanged(auth, async user => {
    if (user) {
      try {
        const userRef = ref(db, `grades/${user.uid}`);
        if (editIndex !== null) {
          await set(child(userRef, editIndex), { subject: subjectName, grade: Number(finalGrade) });
        } else {
          await push(userRef, { subject: subjectName, grade: Number(finalGrade) });
        }
      } catch (err) {
        console.error("Error saving grade to Firebase:", err);
      }
    }
  });

  localStorage.removeItem("editSubjectIndex");
}

// ===== QUIZ TOTALS =====
function loadQuizTotals() {
  let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
  let totalScore = 0, totalMax = 0;
  quizzes.forEach(q => {
    totalScore += Number(q.score) || 0;
    totalMax += Number(q.max) || 0;
  });
  document.getElementById("qScore").value = totalScore;
  document.getElementById("qMax").value = totalMax;
}

// ===== SAVE / LOAD INPUTS =====
function saveCurrentInputs() {
  const data = {
    subject: subjectInput.value,
    eScore: document.getElementById("eScore").value,
    eMax: document.getElementById("eMax").value,
    aScore: document.getElementById("aScore").value,
    aMax: document.getElementById("aMax").value,
    wQuiz: document.getElementById("wQuiz").value,
    wExam: document.getElementById("wExam").value,
    wAttend: document.getElementById("wAttend").value
  };
  localStorage.setItem("gradingInputs", JSON.stringify(data));
}

function loadSavedInputs() {
  const data = JSON.parse(localStorage.getItem("gradingInputs"));
  if (!data) return;
  subjectInput.value = data.subject || "";
  document.getElementById("eScore").value = data.eScore || "";
  document.getElementById("eMax").value = data.eMax || 50;
  document.getElementById("aScore").value = data.aScore || "";
  document.getElementById("aMax").value = data.aMax || 100;
  document.getElementById("wQuiz").value = data.wQuiz || 40;
  document.getElementById("wExam").value = data.wExam || 40;
  document.getElementById("wAttend").value = data.wAttend || 20;
}

// ===== SUBJECT DROPDOWN =====
function toggleSubjects() {
  subjectDropdown.style.display =
    subjectDropdown.style.display === "block" ? "none" : "block";
}
function selectSubject(value) {
  subjectInput.value = value;
  subjectDropdown.style.display = "none";
}
function filterSubjects() {
  removeNumbers(subjectInput);
  const filter = subjectInput.value.toLowerCase();
  subjectDropdown.querySelectorAll("div").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(filter) ? "block" : "none";
  });
  subjectDropdown.style.display = "block";
}
document.addEventListener("click", e => {
  if (!e.target.closest(".subject-wrapper")) subjectDropdown.style.display = "none";
});
function removeNumbers(input) {
  input.value = input.value.replace(/[^a-zA-Z\s]/g, "");
}

// ===== LOAD EDIT DATA =====
function loadEditData() {
  const subjectIndex = localStorage.getItem("editSubjectIndex");
  if (subjectIndex === null) return;

  let temp = JSON.parse(localStorage.getItem("tempSummary")) || { name: "", grades: [] };
  let subject = temp.grades[subjectIndex];
  if (!subject) return;

  subjectInput.value = subject.subject;
  document.getElementById("final").textContent = subject.grade.toFixed(2);
}

// ===== UTILITIES =====
function formatUserName(email) {
  return email ? email.replace("@gmail.com", "") : "Guest";
}

// ===== EXPORT LOGOUT =====
window.logout = () => {
  logout();
  firebaseLogout();
};
window.calculate = calculate;
window.toggleSubjects = toggleSubjects;
window.selectSubject = selectSubject;
window.filterSubjects = filterSubjects;
window.saveCurrentInputs = saveCurrentInputs;
