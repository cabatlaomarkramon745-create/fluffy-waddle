import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, set, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {

  // ========= ELEMENTS =========
  const subjectInput = document.getElementById("subject");
  const subjectDropdown = document.getElementById("subjectDropdown");
  const subjectDropdownBtn = document.getElementById("subjectDropdownBtn");

  const calculateBtn = document.getElementById("calculateBtn");
  const finalDisplay = document.getElementById("final");
  const viewSubjectsBtn = document.getElementById("viewSubjectsBtn");
  const editQuizzesBtn = document.getElementById("editQuizzesBtn");

  const wQuiz = document.getElementById("wQuiz");
  const wExam = document.getElementById("wExam");
  const wAttend = document.getElementById("wAttend");

  const qScore = document.getElementById("qScore");
  const qMax = document.getElementById("qMax");
  const eScore = document.getElementById("eScore");
  const eMax = document.getElementById("eMax");
  const aScore = document.getElementById("aScore");
  const aMax = document.getElementById("aMax");

  let currentUser = null;

  // ========= AUTH =========
  onAuthStateChanged(auth, user => currentUser = user);

  // ========= SUBJECT DROPDOWN =========
  subjectDropdownBtn.onclick = (e) => {
    e.stopPropagation();
    subjectDropdown.style.display =
      subjectDropdown.style.display === "block" ? "none" : "block";
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

    const totalWeight =
      Number(wQuiz.value) +
      Number(wExam.value) +
      Number(wAttend.value);

    if (totalWeight !== 100) {
      alert("Percent must equal 100%");
      return;
    }

    const quiz = (qScore.value / qMax.value) * wQuiz.value;
    const exam = (eScore.value / eMax.value) * wExam.value;
    const attend = (aScore.value / aMax.value) * wAttend.value;

    const final = (quiz + exam + attend).toFixed(2);
    finalDisplay.textContent = final;

    if (!currentUser) {
      alert("Login first to save");
      return;
    }

    // SAVE PER SUBJECT (no overwrite anymore)
    const gradeRef = ref(db, `grades/${currentUser.uid}/${subjectInput.value}`);
    await set(gradeRef, {
      final: Number(final),
      subject: subjectInput.value,
      time: Date.now()
    });

    alert("Saved!");
  };

  // ========= VIEW SUBJECTS =========
  viewSubjectsBtn.onclick = async () => {

    if (!currentUser) {
      alert("Login first");
      return;
    }

    const snapshot = await get(ref(db, `grades/${currentUser.uid}`));

    if (!snapshot.exists()) {
      alert("No subjects yet");
      return;
    }

    let text = "Your Subjects:\n\n";
    snapshot.forEach(child => {
      const g = child.val();
      text += `${g.subject} : ${g.final}%\n`;
    });

    alert(text);
  };

  // ========= EDIT QUIZZES =========
  editQuizzesBtn.onclick = () => {
    let total = prompt("Enter total quiz items:");
    if (!total) return;

    let score = prompt("Enter your score:");
    if (!score) return;

    qMax.value = total;
    qScore.value = score;
  };

});
