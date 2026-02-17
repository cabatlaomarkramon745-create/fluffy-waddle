import { auth, db } from "./firebase.js";
import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ================= USER AUTH =================
let currentUserId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  currentUserId = user.uid;

  const userNameDisplay = document.getElementById("userDisplay");
  if (userNameDisplay) userNameDisplay.innerText = formatUserName(user.email);

  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("registerBtn").style.display = "none";
  document.getElementById("logoutBtn").style.display = "block";

  loadSavedInputs();
  loadQuizTotalsFromSession();
});

// ================= MENU =================
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");

window.openMenu = () => {
  sideMenu.style.left = "0";
  overlay.style.display = "block";
};

window.closeMenu = () => {
  sideMenu.style.left = "-250px";
  overlay.style.display = "none";
};

window.toggleProfile = (e) => {
  e.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-area")) {
    profileDropdown.style.display = "none";
  }
});

// ================= LOGOUT =================
window.logout = async () => {
  try {
    await auth.signOut();
    location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

// ================= VALIDATION =================
function validateGradingInputs() {
  const ids = [
    "subject","qScore","qMax",
    "eScore","eMax","aScore","aMax",
    "wQuiz","wExam","wAttend"
  ];

  for (let id of ids) {
    const el = document.getElementById(id);
    el.classList.remove("input-error");
    if (!el.value.trim()) {
      el.classList.add("input-error");
      alert(${id} is required);
      el.focus();
      return false;
    }
  }
  return true;
}

// ================= CALCULATE & SAVE =================
async function calculate() {
  if (!validateGradingInputs()) return;
  if (!currentUserId) return alert("Please log in first");

  const subject = document.getElementById("subject").value.trim();

  const wQ = +document.getElementById("wQuiz").value;
  const wE = +document.getElementById("wExam").value;
  const wA = +document.getElementById("wAttend").value;

  if (wQ + wE + wA !== 100) {
    alert("Weights must total 100%");
    return;
  }

  const qS = +document.getElementById("qScore").value;
  const qM = +document.getElementById("qMax").value;
  const eS = +document.getElementById("eScore").value;
  const eM = +document.getElementById("eMax").value;
  const aS = +document.getElementById("aScore").value;
  const aM = +document.getElementById("aMax").value;

  if (qS > qM || eS > eM || aS > aM) {
    alert("Scores cannot exceed max values");
    return;
  }

  const final = ((qS/qM)*wQ + (eS/eM)*wE + (aS/aM)*wA).toFixed(2);
  document.getElementById("final").textContent = final;

  // Save to Firebase
  try {
    const userRef = ref(db, grades/${currentUserId});
    await set(child(userRef, subject), {
      subject,
      quiz: qS, quizMax: qM,
      exam: eS, examMax: eM,
      attendance: aS, attendanceMax: aM,
      wQuiz: wQ, wExam: wE, wAttend: wA,
      overall: Number(final)
    });

    alert("Saved!");
    setTimeout(() => {
      window.location.href = "grading.html";
    }, 50);

  } catch (err) {
    console.error(err);
    alert("Failed to save grade");
  }
}

// ================= SESSION QUIZ TOTALS =================
function loadQuizTotalsFromSession() {
  const data = JSON.parse(sessionStorage.getItem("quizTotals"));
  if (!data) return;

  document.getElementById("subject").value = data.subject || "";
  document.getElementById("qScore").value = data.totalScore || 0;
  document.getElementById("qMax").value = data.totalMax || 0;

  sessionStorage.removeItem("quizTotals");
}

// ================= SAVE / LOAD INPUTS =================
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

// ================= UTILITY =================
function formatUserName(email){
  return email ? email.replace("@gmail.com","") : "Guest";
}

// ================= EXPORTS =================
window.calculate = calculate;
window.saveCurrentInputs = saveCurrentInputs;
window.loadSavedInputs = loadSavedInputs;
