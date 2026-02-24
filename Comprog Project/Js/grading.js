// ================= IMPORTS =================
import { auth, db } from "./firebase.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUserId = null;

// ================= DOM ELEMENTS =================
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");
const subjectInput = document.getElementById("subject");

// ================= MENU + PROFILE =================
window.openMenu = () => {
  if (!sideMenu || !overlay) return;
  sideMenu.style.left = "0";
  overlay.style.display = "block";
};

window.closeMenu = () => {
  if (!sideMenu || !overlay) return;
  sideMenu.style.left = "-250px";
  overlay.style.display = "none";
};

window.toggleProfile = (event) => {
  if (!profileDropdown) return;
  event.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", (e) => {
  if (!profileDropdown) return;
  if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
});

// ================= FIREBASE AUTH =================
onAuthStateChanged(auth, (user) => {
  const userDisplay = document.getElementById("userDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    currentUserId = user.uid;
    if (userDisplay) {
      userDisplay.innerText = user.email.split("@")[0];
      userDisplay.style.display = "block";
    }
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";

    loadSavedInputs();
    loadQuizTotals();
  } else {
    currentUserId = null;
    if (userDisplay) userDisplay.style.display = "none";
    if (loginBtn) loginBtn.style.display = "block";
    if (registerBtn) registerBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});

// ================= LOGOUT =================
window.logout = async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

// ================= VALIDATION =================
function validateGradingInputs() {
  const lettersOnly = /^[A-Za-z\s]+$/;
  const fields = [
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

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;
    el.classList.remove("input-error");
    const val = el.value.trim();

    if (!val) {
      el.classList.add("input-error");
      if (!firstInvalid) firstInvalid = f;
    } else if (f.id === "subject" && !lettersOnly.test(val)) {
      el.classList.add("input-error");
      if (!firstInvalid) firstInvalid = { ...f, msg: "Subject can only contain letters and spaces" };
    }
  });

  if (firstInvalid) {
    alert(firstInvalid.msg || `${firstInvalid.name} is required`);
    document.getElementById(firstInvalid.id).focus();
    return false;
  }

  return true;
}

// ================= CALCULATE & SAVE =================
async function calculate() {
  if (!validateGradingInputs()) return;

  const subject = subjectInput.value.trim();
  const qS = Number(document.getElementById("qScore").value);
  const qM = Number(document.getElementById("qMax").value);
  const eS = Number(document.getElementById("eScore").value);
  const eM = Number(document.getElementById("eMax").value);
  const aS = Number(document.getElementById("aScore").value);
  const aM = Number(document.getElementById("aMax").value);
  const wQ = Number(document.getElementById("wQuiz").value);
  const wE = Number(document.getElementById("wExam").value);
  const wA = Number(document.getElementById("wAttend").value);

  if (wQ + wE + wA !== 100) { alert("Weights must total 100%"); return; }
  if (qS > qM || eS > eM || aS > aM) { alert("Scores cannot exceed max values"); return; }

  const finalGrade = ((qS / qM) * wQ + (eS / eM) * wE + (aS / aM) * wA).toFixed(2);
  document.getElementById("final").textContent = finalGrade;

  // ===== SAVE TEMP TO SESSION STORAGE =====
  let temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };
  temp.grades.push({ subject, grade: Number(finalGrade) });
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));

  // Optional: save to Firebase if logged in
  if (currentUserId) {
    try {
      await set(ref(db, `grades/${currentUserId}/${subject}`), { subject, overall: Number(finalGrade) });
    } catch (err) {
      console.error("Firebase save failed:", err);
    }
  }

  alert("Grade saved!");

  // ===================== ADDED CODE =====================
  // ===================== EDITED CODE FOR STUDENTS COMPATIBILITY =====================
if (currentUserId) {
  const key = `students_${currentUserId}`;
  let students = JSON.parse(localStorage.getItem(key)) || [];

  // Get updated temp summary
  let updatedTemp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };

  // Ensure tempSummary has a name (load from editStudentIndex if missing)
  const editIndex = localStorage.getItem("editStudentIndex");
  if (!updatedTemp.name && editIndex !== null) {
    const existingStudent = students[editIndex];
    if (existingStudent) {
      updatedTemp.name = existingStudent.name;
      updatedTemp.grades = existingStudent.subjects?.map(s => ({ subject: s.subject, grade: s.grade })) || [];
    }
  }

  // Add current grade
  updatedTemp.grades = updatedTemp.grades || [];
  updatedTemp.grades.push({ subject, grade: Number(finalGrade) });

  // Convert grades -> subjects for students.js
  updatedTemp.subjects = updatedTemp.grades.map(g => ({ subject: g.subject, grade: g.grade }));

  // Save/update student in students array
  if (editIndex !== null) {
    students[editIndex] = updatedTemp;
  } else {
    students.push(updatedTemp);
  }

  localStorage.setItem(key, JSON.stringify(students));
}
// ===================== END EDITED CODE =====================
// ================= SESSION STORAGE HELPERS =================
function saveCurrentInputs() {
  const data = {
    subject: subjectInput.value,
    qScore: document.getElementById("qScore").value,
    qMax: document.getElementById("qMax").value,
    eScore: document.getElementById("eScore").value,
    eMax: document.getElementById("eMax").value,
    aScore: document.getElementById("aScore").value,
    aMax: document.getElementById("aMax").value,
    wQuiz: document.getElementById("wQuiz").value,
    wExam: document.getElementById("wExam").value,
    wAttend: document.getElementById("wAttend").value
  };
  sessionStorage.setItem("gradingInputs", JSON.stringify(data));
}

function loadSavedInputs() {
  const data = JSON.parse(sessionStorage.getItem("gradingInputs"));
  if (!data) return;
  subjectInput.value = data.subject || "";
  document.getElementById("qScore").value = data.qScore || 0;
  document.getElementById("qMax").value = data.qMax || 50;
  document.getElementById("eScore").value = data.eScore || 0;
  document.getElementById("eMax").value = data.eMax || 50;
  document.getElementById("aScore").value = data.aScore || 0;
  document.getElementById("aMax").value = data.aMax || 100;
  document.getElementById("wQuiz").value = data.wQuiz || 40;
  document.getElementById("wExam").value = data.wExam || 40;
  document.getElementById("wAttend").value = data.wAttend || 20;
}

function loadQuizTotals() {
  const totals = JSON.parse(sessionStorage.getItem("quizTotals")) || { totalScore: 0, totalMax: 0 };
  document.getElementById("qScore").value = totals.totalScore;
  document.getElementById("qMax").value = totals.totalMax;
}

// ================= REAL-TIME SUBJECT VALIDATION =================
if (subjectInput) {
  subjectInput.addEventListener("input", () => {
    subjectInput.value = subjectInput.value.replace(/[^A-Za-z\s]/g, "");
  });
}

// ================= EXPORT FUNCTIONS =================
window.calculate = calculate;
window.saveCurrentInputs = saveCurrentInputs;
window.loadSavedInputs = loadSavedInputs;

// ================= INITIAL LOAD =================
window.addEventListener("DOMContentLoaded", () => {
  loadSavedInputs();
  loadQuizTotals();
});
