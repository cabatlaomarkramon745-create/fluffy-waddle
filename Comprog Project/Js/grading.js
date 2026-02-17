import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, set, child, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {

  // ===== ELEMENTS =====
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Grading Elements
  const subjectInput = document.getElementById("subject");
  const subjectDropdownBtn = document.getElementById("subjectDropdownBtn");
  const subjectDropdown = document.getElementById("subjectDropdown");
  const wQuiz = document.getElementById("wQuiz");
  const wExam = document.getElementById("wExam");
  const wAttend = document.getElementById("wAttend");
  const qScore = document.getElementById("qScore");
  const qMax = document.getElementById("qMax");
  const eScore = document.getElementById("eScore");
  const eMax = document.getElementById("eMax");
  const aScore = document.getElementById("aScore");
  const aMax = document.getElementById("aMax");
  const calculateBtn = document.getElementById("calculateBtn");
  const finalGradeDisplay = document.getElementById("final");
  const viewSubjectsBtn = document.getElementById("viewSubjectsBtn");

  // ===== MENU FUNCTIONS =====
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

  // ===== FIREBASE USER STATE =====
  let currentUserEmail = null;
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserEmail = user.email;
      if (userNameDisplay) {
        userNameDisplay.style.display = "inline";
        userNameDisplay.innerText = formatUserName(currentUserEmail);
      }
      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      logoutBtn.style.display = "block";
    } else {
      currentUserEmail = null;
      if (userNameDisplay) userNameDisplay.style.display = "none";
      logoutBtn.style.display = "none";
      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
    }
  });

  window.logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  function formatUserName(email) {
    return email ? email.replace("@gmail.com", "") : "Guest";
  }

  // ===== SUBJECT DROPDOWN =====
  subjectDropdownBtn.addEventListener("click", () => {
    subjectDropdown.style.display =
      subjectDropdown.style.display === "block" ? "none" : "block";
  });
  subjectDropdown.querySelectorAll("div").forEach((div) => {
    div.addEventListener("click", () => {
      subjectInput.value = div.dataset.subject;
      subjectDropdown.style.display = "none";
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".subject-wrapper")) subjectDropdown.style.display = "none";
  });

  // ===== CALCULATE FINAL GRADE =====
  calculateBtn.addEventListener("click", async () => {
    const quizW = parseFloat(wQuiz.value) || 0;
    const examW = parseFloat(wExam.value) || 0;
    const attendW = parseFloat(wAttend.value) || 0;

    const quizScore = parseFloat(qScore.value) || 0;
    const quizMax = parseFloat(qMax.value) || 1;
    const examScore = parseFloat(eScore.value) || 0;
    const examMax = parseFloat(eMax.value) || 1;
    const attendScore = parseFloat(aScore.value) || 0;
    const attendMax = parseFloat(aMax.value) || 1;

    // Validate weights sum to 100
    const totalWeight = quizW + examW + attendW;
    if (totalWeight !== 100) {
      alert("Percentages must add up to 100%");
      return;
    }

    const finalGrade = (
      (quizScore / quizMax) * quizW +
      (examScore / examMax) * examW +
      (attendScore / attendMax) * attendW
    ).toFixed(2);

    finalGradeDisplay.innerText = finalGrade;

    // Save grade to Firebase
    if (!currentUserEmail) {
      alert("You must be logged in to save grades!");
      return;
    }
    const dbRef = ref(db, "grades");
    const newGradeRef = push(dbRef);
    await set(newGradeRef, {
      user: currentUserEmail,
      subject: subjectInput.value || "Unknown",
      quizScore,
      quizMax,
      examScore,
      examMax,
      attendScore,
      attendMax,
      finalGrade: parseFloat(finalGrade),
      timestamp: Date.now(),
    });

    alert("Grade saved successfully!");
  });

  // ===== VIEW ALL SUBJECTS =====
  viewSubjectsBtn.addEventListener("click", async () => {
    if (!currentUserEmail) {
      alert("Login to view saved subjects!");
      return;
    }
    const dbRef = ref(db, "grades");
    const snapshot = await get(dbRef);
    if (!snapshot.exists()) {
      alert("No grades found.");
      return;
    }
    const grades = Object.values(snapshot.val())
      .filter(g => g.user === currentUserEmail)
      .map(g => `${g.subject}: ${g.finalGrade}%`)
      .join("\n");

    alert(grades || "No grades saved yet.");
  });

});
