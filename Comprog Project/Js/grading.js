import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, child, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {

  // ========= ELEMENTS =========
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay"); // Make sure HTML ID matches
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const studentCount = document.getElementById("studentCount");
  const averageGrade = document.getElementById("averageGrade");

  // Grading Elements
  const subjectInput = document.getElementById("subject");
  const subjectDropdown = document.getElementById("subjectDropdown");
  const subjectDropdownBtn = document.getElementById("subjectDropdownBtn");

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
  const finalDisplay = document.getElementById("final");
  const viewSubjectsBtn = document.getElementById("viewSubjectsBtn");
  const editQuizzesBtn = document.getElementById("editQuizzesBtn");

  let currentUser = null;

  // ========= MENU =========
  window.openMenu = () => { sideMenu.style.left = "0"; overlay.style.display = "block"; };
  window.closeMenu = () => { sideMenu.style.left = "-250px"; overlay.style.display = "none"; };
  window.toggleProfile = (e) => { 
    e.stopPropagation(); 
    profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block"; 
  };
  document.addEventListener("click", () => profileDropdown.style.display = "none");

  // ========= AUTH =========
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      const email = user.email;
      if (userNameDisplay) { userNameDisplay.style.display = "inline"; userNameDisplay.innerText = formatUserName(email); }
      if (loginBtn) loginBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";

      // ===== Fetch students =====
      try {
        const snapshot = await get(child(ref(db), "students"));
        let students = [];
        if (snapshot.exists()) students = Object.values(snapshot.val());

        if (studentCount) studentCount.innerText = students.length;

        if (students.length > 0 && averageGrade) {
          let total = 0, graded = 0;
          students.forEach(s => {
            if (typeof s.overall === "number") { total += s.overall; graded++; }
          });
          if (graded > 0) averageGrade.innerText = (total / graded).toFixed(1);
        }
      } catch (err) { console.error("Error fetching students:", err); }

    } else {
      // No user logged in
      if (userNameDisplay) userNameDisplay.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (loginBtn) loginBtn.style.display = "block";
      if (registerBtn) registerBtn.style.display = "block";
    }
  });

  window.logout = async () => {
    try { await signOut(auth); window.location.href = "login.html"; }
    catch (err) { console.error("Logout failed:", err); }
  };

  function formatUserName(email) { return email ? email.replace("@gmail.com", "") : "Guest"; }

  // ========= SUBJECT DROPDOWN =========
  subjectDropdownBtn.onclick = (e) => {
    e.stopPropagation();
    subjectDropdown.style.display = subjectDropdown.style.display === "block" ? "none" : "block";
  };

  subjectDropdown.querySelectorAll("div").forEach(item => {
    item.onclick = () => {
      subjectInput.value = item.dataset.subject;
      subjectDropdown.style.display = "none";
    };
  });

  document.addEventListener("click", () => subjectDropdown.style.display = "none");

  // ========= CALCULATE =========
  calculateBtn.onclick = async () => {

    const totalWeight = Number(wQuiz.value) + Number(wExam.value) + Number(wAttend.value);
    if (totalWeight !== 100) { alert("Percentages must sum to 100%"); return; }

    const final = (
      (Number(qScore.value)/Number(qMax.value))*Number(wQuiz.value) +
      (Number(eScore.value)/Number(eMax.value))*Number(wExam.value) +
      (Number(aScore.value)/Number(aMax.value))*Number(wAttend.value)
    ).toFixed(2);

    finalDisplay.textContent = final;

    if (!currentUser) { alert("Login first to save grades"); return; }

    // Save grade per subject to avoid overwrite
    const gradeRef = ref(db, `grades/${currentUser.uid}/${subjectInput.value}`);
    await set(gradeRef, {
      final: Number(final),
      subject: subjectInput.value,
      time: Date.now()
    });

    alert("Grade saved successfully!");
  };

  // ========= VIEW ALL SUBJECTS =========
  viewSubjectsBtn.onclick = async () => {
    if (!currentUser) { alert("Login first"); return; }

    const snapshot = await get(ref(db, `grades/${currentUser.uid}`));
    if (!snapshot.exists()) { alert("No subjects found"); return; }

    let text = "Your Subjects:\n\n";
    snapshot.forEach(child => {
      const g = child.val();
      text += `${g.subject} : ${g.final}%\n`;
    });

    alert(text);
  };

  // ========= EDIT QUIZZES =========
  editQuizzesBtn.onclick = () => {
    const total = prompt("Enter total quiz items:");
    if (!total) return;
    const score = prompt("Enter your score:");
    if (!score) return;
    qMax.value = total;
    qScore.value = score;
  };

});
