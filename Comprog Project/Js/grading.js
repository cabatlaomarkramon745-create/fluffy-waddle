import { auth, db } from "./firebase.js";
import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ================= USER AUTH =================
let currentUserId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUserId = user.uid;
  const userNameDisplay = document.getElementById("userDisplay");
  if (userNameDisplay) userNameDisplay.innerText = formatUserName(user.email);

  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("registerBtn").style.display = "none";
  document.getElementById("logoutBtn").style.display = "block";

  // Load saved quiz totals and inputs from Firebase
  await loadQuizTotals();
  loadSavedInputs();
});

// ================= MENU + PROFILE =================
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
window.toggleProfile = (event) => {
  event.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
};
document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
});
window.logout = async () => {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

// ================= VALIDATION =================
function validateGradingInputs() {
  const requiredFields = [
    "subject", "qScore", "qMax",
    "eScore", "eMax",
    "aScore", "aMax",
    "wQuiz", "wExam", "wAttend"
  ];

  for (let id of requiredFields) {
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

// ================= CALCULATE AND SAVE TO FIREBASE =================
async function calculate() {
  if (!validateGradingInputs()) return;
  if (!currentUserId) return alert("Please log in first");

  const subjectName = document.getElementById("subject").value.trim();
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

  const finalGrade = ((qS/qM)*wQ + (eS/eM)*wE + (aS/aM)*wA).toFixed(2);
  document.getElementById("final").textContent = finalGrade;

  try {
    // Save to Firebase
    const userRef = ref(db, grades/${currentUserId}/${subjectName});
    await set(userRef, {
      subject: subjectName,
      quiz: qS, quizMax: qM,
      exam: eS, examMax: eM,
      attendance: aS, attendanceMax: aM,
      wQuiz: wQ, wExam: wE, wAttend: wA,
      overall: Number(finalGrade)
    });

    alert("Grade saved to Firebase!");
  } catch (err) {
    console.error("Failed to save grade:", err);
    alert("Error saving grade to Firebase");
  }
}

// ================= LOAD QUIZ TOTALS =================
async function loadQuizTotals() {
  if (!currentUserId) return;

  try {
    const snapshot = await get(ref(db, grades/${currentUserId}));
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
function formatUserName(email) {
  return email ? email.replace("@gmail.com","") : "Guest";
}

// ================= EXPORTS =================
window.calculate = calculate;
window.saveCurrentInputs = saveCurrentInputs;
window.loadSavedInputs = loadSavedInputs;
window.loadQuizTotals = loadQuizTotals;
