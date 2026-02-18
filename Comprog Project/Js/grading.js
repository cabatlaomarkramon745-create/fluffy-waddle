import { auth, db } from "./firebase.js";
import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUserId = null;

// ===== DOM ELEMENTS =====
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");

// ===== MENU + PROFILE =====
window.openMenu = () => {
  sideMenu.style.left = "0";
  overlay.style.display = "block";
};

window.closeMenu = () => {
  sideMenu.style.left = "-250px";
  overlay.style.display = "none";
};

window.toggleProfile = (event) => {
  event.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
});

// ===== FIREBASE AUTH =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;

    const userDisplay = document.getElementById("userDisplay");
    userDisplay.innerText = user.email.split("@")[0];
    userDisplay.style.display = "block";

    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";

    // Load saved inputs if any
    loadSavedInputs();
    loadQuizTotals();
  } else {
    currentUserId = null;
    document.getElementById("userDisplay").style.display = "none";
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("registerBtn").style.display = "block";
    document.getElementById("logoutBtn").style.display = "none";
  }
});

// ===== LOGOUT =====
window.logout = async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

// ===== VALIDATION =====
function validateGradingInputs() {
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
    el.classList.remove("input-error");

    if (!el.value.trim()) {
      el.classList.add("input-error");
      if (!firstInvalid) firstInvalid = f;
    }
  });

  if (firstInvalid) {
    alert(`${firstInvalid.name} is required`);
    document.getElementById(firstInvalid.id).focus();
    return false;
  }

  return true;
}

// ===== CALCULATE FINAL GRADE =====
async function calculate() {
  if (!validateGradingInputs()) return;
  if (!currentUserId) {
    alert("You must be logged in!");
    return;
  }

  const subject = document.getElementById("subject").value.trim();
  const wQ = Number(document.getElementById("wQuiz").value);
  const wE = Number(document.getElementById("wExam").value);
  const wA = Number(document.getElementById("wAttend").value);

  if (wQ + wE + wA !== 100) {
    alert("Weights must total 100%");
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

  const finalGrade = ((qS / qM) * wQ + (eS / eM) * wE + (aS / aM) * wA).toFixed(2);
  document.getElementById("final").textContent = finalGrade;

  // ===== SAVE TO FIREBASE =====
  try {
    await set(ref(db, `grades/${currentUserId}/${subject}`), {
      subject,
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
    alert("Grade saved to Firebase!");
  } catch (err) {
    console.error("Error saving grade:", err);
    alert("Failed to save grade");
  }
}

// ===== SESSION STORAGE HELPERS =====
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

function loadQuizTotals() {
  const totals = JSON.parse(sessionStorage.getItem("quizTotals")) || { totalScore: 0, totalMax: 0 };
  document.getElementById("qScore").value = totals.totalScore;
  document.getElementById("qMax").value = totals.totalMax;
}

// ===== EXPORT FUNCTIONS FOR HTML =====
window.calculate = calculate;
window.saveCurrentI
