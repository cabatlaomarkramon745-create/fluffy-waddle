import { auth, db } from "./firebase.js";
import { ref, set, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
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
  await auth.signOut();
  location.href = "login.html";
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
    if (!el.value.trim()) {
      alert(id + " required");
      el.focus();
      return false;
    }
  }
  return true;
}

// ================= CALCULATE =================
async function calculate() {
  if (!validateGradingInputs()) return;
  if (!currentUserId) return alert("Login first");

  const subject = document.getElementById("subject").value.trim();

  const wQ = +wQuiz.value;
  const wE = +wExam.value;
  const wA = +wAttend.value;

  if (wQ + wE + wA !== 100) {
    alert("Weights must total 100%");
    return;
  }

  const qS = +qScore.value, qM = +qMax.value;
  const eS = +eScore.value, eM = +eMax.value;
  const aS = +aScore.value, aM = +aMax.value;

  const final =
    ((qS/qM)*wQ + (eS/eM)*wE + (aS/aM)*wA).toFixed(2);

  document.getElementById("final").textContent = final;

  try {
    const userRef = ref(db, grades/${currentUserId});

    await set(child(userRef, subject), {
      subject,
      quiz:qS, quizMax:qM,
      exam:eS, examMax:eM,
      attendance:aS, attendanceMax:aM,
      wQuiz:wQ, wExam:wE, wAttend:wA,
      overall:Number(final)
    });

    alert("Saved!");
  } catch(err) {
    alert("Save failed");
    console.error(err);
  }
}

// ================= SESSION QUIZ TOTALS =================
function loadQuizTotalsFromSession() {
  const data = JSON.parse(sessionStorage.getItem("quizTotals"));
  if (!data) return;

  subject.value = data.subject;
  qScore.value = data.totalScore;
  qMax.value = data.totalMax;

  sessionStorage.removeItem("quizTotals");
}

window.addEventListener("DOMContentLoaded", loadQuizTotalsFromSession);

// ================= SAVE/LOAD INPUTS =================
function saveCurrentInputs() {
  const data = {
    subject:subject.value,
    eScore:eScore.value,
    eMax:eMax.value,
    aScore:aScore.value,
    aMax:aMax.value,
    wQuiz:wQuiz.value,
    wExam:wExam.value,
    wAttend:wAttend.value
  };

  sessionStorage.setItem("gradingInputs", JSON.stringify(data));
}

function loadSavedInputs() {
  const d = JSON.parse(sessionStorage.getItem("gradingInputs"));
  if (!d) return;

  subject.value=d.subject||"";
  eScore.value=d.eScore||"";
  eMax.value=d.eMax||50;
  aScore.value=d.aScore||"";
  aMax.value=d.aMax||100;
  wQuiz.value=d.wQuiz||40;
  wExam.value=d.wExam||40;
  wAttend.value=d.wAttend||20;
}

// ================= UTILITY =================
function formatUserName(email){
  return email ? email.replace("@gmail.com","") : "Guest";
}

// ================= EXPORTS =================
window.calculate = calculate;
window.saveCurrentInputs = saveCurrentInputs;
