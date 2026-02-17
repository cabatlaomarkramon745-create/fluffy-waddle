import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ================= MENU ================= */
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");

window.openMenu = function () {
  if (sideMenu) sideMenu.style.left = "0";
  if (overlay) overlay.style.display = "block";
};

window.closeMenu = function () {
  if (sideMenu) sideMenu.style.left = "-250px";
  if (overlay) overlay.style.display = "none";
};

window.toggleProfile = function (event) {
  event.stopPropagation();
  if (!profileDropdown) return;
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", function (e) {
  if (!e.target.closest(".profile-area") && profileDropdown) {
    profileDropdown.style.display = "none";
  }
});

/* ================= AUTH CHECK ================= */
onAuthStateChanged(auth, function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadSavedInputs();
  loadQuizTotals();
});

/* ================= VALIDATION ================= */
function validateGradingInputs() {
  const required = [
    "subject","qScore","qMax",
    "eScore","eMax",
    "aScore","aMax",
    "wQuiz","wExam","wAttend"
  ];

  for (let id of required) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      alert(id + " is required");
      if (el) el.focus();
      return false;
    }
  }
  return true;
}

/* ================= CALCULATE ================= */
function calculate() {

  if (!validateGradingInputs()) return;

  const subject = document.getElementById("subject").value.trim();

  const qS = Number(document.getElementById("qScore").value);
  const qM = Number(document.getElementById("qMax").value);
  const eS = Number(document.getElementById("eScore").value);
  const eM = Number(document.getElementById("eMax").value);
  const aS = Number(document.getElementById("aScore").value);
  const aM = Number(document.getElementById("aMax").value);

  const wQ = Number(document.getElementById("wQuiz").value);
  const wE = Number(document.getElementById("wExam").value);
  const wA = Number(document.getElementById("wAttend").value);

  if (wQ + wE + wA !== 100) {
    alert("Weights must equal 100%");
    return;
  }

  if (qS > qM || eS > eM || aS > aM) {
    alert("Score exceeds max");
    return;
  }

  const grade = ((qS/qM)*wQ + (eS/eM)*wE + (aS/aM)*wA).toFixed(2);

  document.getElementById("final").textContent = grade;

  saveToDraft(subject, grade);
}

/* ================= SAVE TO LOCAL DRAFT ================= */
function saveToDraft(subject, grade) {

  let draft = JSON.parse(localStorage.getItem("studentDraft")) || {
    name: "",
    subjects: []
  };

  const index = draft.subjects.findIndex(s => s.subject === subject);

  if (index >= 0) {
    draft.subjects[index].grade = Number(grade);
  } else {
    draft.subjects.push({
      subject: subject,
      grade: Number(grade)
    });
  }

  localStorage.setItem("studentDraft", JSON.stringify(draft));
  console.log("Draft saved:", draft);
}

/* ================= QUIZ TOTALS ================= */
function loadQuizTotals() {
  const saved = JSON.parse(sessionStorage.getItem("quizTotals")) || {
    totalScore: 0,
    totalMax: 0
  };

  const qScore = document.getElementById("qScore");
  const qMax = document.getElementById("qMax");

  if (qScore) qScore.value = saved.totalScore;
  if (qMax) qMax.value = saved.totalMax;
}

/* ================= TEMP INPUT SAVE ================= */
function saveCurrentInputs() {
  const data = {
    subject: document.getElementById("subject")?.value,
    eScore: document.getElementById("eScore")?.value,
    eMax: document.getElementById("eMax")?.value,
    aScore: document.getElementById("aScore")?.value,
    aMax: document.getElementById("aMax")?.value,
    wQuiz: document.getElementById("wQuiz")?.value,
    wExam: document.getElementById("wExam")?.value,
    wAttend: document.getElementById("wAttend")?.value
  };

  sessionStorage.setItem("gradingInputs", JSON.stringify(data));
}

function loadSavedInputs() {
  const data = JSON.parse(sessionStorage.getItem("gradingInputs"));
  if (!data) return;

  if (document.getElementById("subject")) document.getElementById("subject").value = data.subject || "";
  if (document.getElementById("eScore")) document.getElementById("eScore").value = data.eScore || "";
  if (document.getElementById("eMax")) document.getElementById("eMax").value = data.eMax || 50;
  if (document.getElementById("aScore")) document.getElementById("aScore").value = data.aScore || "";
  if (document.getElementById("aMax")) document.getElementById("aMax").value = data.aMax || 100;
  if (document.getElementById("wQuiz")) document.getElementById("wQuiz").value = data.wQuiz || 40;
  if (document.getElementById("wExam")) document.getElementById("wExam").value = data.wExam || 40;
  if (document.getElementById("wAttend")) document.getElementById("wAttend").value = data.wAttend || 20;
}

/* ================= LOGOUT ================= */
window.logout = async function () {
  await auth.signOut();
  window.location.href = "login.html";
};

/* ================= EXPORT ================= */
window.calculate = calculate;
window.saveCurrentInputs = saveCurrentInputs;

window.addEventListener("DOMContentLoaded", function () {
  loadSavedInputs();
  loadQuizTotals();
});
