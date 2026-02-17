import { auth, db } from "./firebase.js";
import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ===== MENU + PROFILE =====
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");

window.openMenu = () => {
  if (sideMenu && overlay) {
    sideMenu.style.left = "0";
    overlay.style.display = "block";
  }
};

window.closeMenu = () => {
  if (sideMenu && overlay) {
    sideMenu.style.left = "-250px";
    overlay.style.display = "none";
  }
};

window.toggleProfile = (event) => {
  event.stopPropagation();
  if (profileDropdown) {
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  }
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-area") && profileDropdown) {
    profileDropdown.style.display = "none";
  }
});

// ===== USER STATE =====
let currentUserId = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;
    const userNameDisplay = document.getElementById("userDisplay");
    if (userNameDisplay) userNameDisplay.innerText = formatUserName(user.email);

    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";

    // Load totals and inputs
    await loadQuizTotals();
    loadSavedInputs();
    loadEditData();
  }
});

// Logout
window.logout = async () => {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

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
    if (!el.value.trim()) {
      el.classList.add("input-error");
      if (!firstInvalid) firstInvalid = field;
    }
  });

  if (firstInvalid) {
    alert(firstInvalid.name + " is required.");
    document.getElementById(firstInvalid.id).focus();
    return false;
  }

  return true;
}

// ===== CALCULATE & SAVE =====
async function calculate() {
  if (!validateGradingInputs()) return;
  if (!currentUserId) {
    alert("Please log in to save grades.");
    return;
  }

  const subjectName = document.getElementById("subject").value.trim();
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
    alert("Scores cannot exceed max values");
    return;
  }

  const finalGrade = ((qS/qM)*wQ + (eS/eM)*wE + (aS/aM)*wA).toFixed(2);
  document.getElementById("final").textContent = finalGrade;

  // ===== SAVE TO FIREBASE AND REDIRECT =====
  try {
    const userGradesRef = ref(db, `grades/${currentUserId}`);
    await set(child(userGradesRef, subjectName), {
      subject: subjectName,
      quiz: qS,
      quizMax: qM,
      exam: eS,
      examMax: eM,
      attendance: aS,
      attendanceMax: aM,
      wQuiz: wQ,
      wExam: wE,
      wAttend: wA,
      overall: Number(finalGrade)
    });

    // Redirect after save
    setTimeout(() => {
      window.location.href = "grading.html";
    }, 50);

  } catch (err) {
    console.error("Error saving grade:", err);
    alert("Failed to save grade.");
  }
}

// ===== QUIZ TOTALS =====
async function loadQuizTotals() {
  if (!currentUserId) return;

  try {
    const snapshot = await get(ref(db, `grades/${currentUserId}`));
    let totalScore = 0, totalMax = 0;
    if (snapshot.exists()) {
      Object.values(snapshot.val()).forEach(g => {
        totalScore += Number(g.quiz) || 0;
        totalMax += Number(g.quizMax) || 0;
      });
    }
    document.getElementById("qScore").value = totalScore;
    document.getElementById("qMax").value = totalMax;
  } catch (err) {
    console.error("Error loading quiz totals:", err);
  }
}

// ===== SAVE / LOAD INPUTS =====
function saveCurrentInputs() {
  const data = {
    subject: document.getElementById("subject").value,
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

  document.getElementById("subject").value = data.subject || "";
  document.getElementById("eScore").value = data.eScore || "";
  document.getElementById("eMax").value = data.eMax || 50;
  document.getElementById("aScore").value = data.aScore || "";
  document.getElementById("aMax").value = data.aMax || 100;
  document.getElementById("wQuiz").value = data.wQuiz || 40;
  document.getElementById("wExam").value = data.wExam || 40;
  document.getElementById("wAttend").value = data.wAttend || 20;
}

// ===== UTILITY =====
function formatUserName(email) {
  if (!email) return "Guest";
  return email.replace("@gmail.com", "");
}

// ===== EXPORTS =====
window.calculate = calculate;
window.saveCurrentInputs = saveCurrentInputs;
window.loadSavedInputs = loadSavedInputs;

function loadQuizTotalsFromSession() {
  const data = JSON.parse(sessionStorage.getItem("quizTotals"));
  if (!data) return;

  document.getElementById("subject").value = data.subject || "";
  document.getElementById("qScore").value = data.totalScore || 0;
  document.getElementById("qMax").value = data.totalMax || 0;

  // Remove from sessionStorage so it doesn't overwrite next time
  sessionStorage.removeItem("quizTotals");
}

// Call this on page load
window.addEventListener("DOMContentLoaded", loadQuizTotalsFromSession);

