import { auth, db } from "./firebase.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUserId = null;

// ===== AUTH =====
onAuthStateChanged(auth, (user) => {
  if (user) currentUserId = user.uid;
});

// ===== LOAD QUIZZES =====
async function loadQuizzes(subject) {
  if (!currentUserId || !subject) return;

  const quizList = document.getElementById("quizList");
  quizList.innerHTML = "";

  const snapshot = await get(ref(db, grades/${currentUserId}/${subject}/quizzes));
  const quizzes = snapshot.val() || [];

  quizzes.forEach(q => addQuiz(q.score, q.max));
}

// ===== ADD QUIZ =====
function addQuiz(score = 0, max = 20) {
  const quizList = document.getElementById("quizList");
  const count = quizList.children.length + 1;

  const div = document.createElement("div");
  div.className = "score-group";

  div.innerHTML = `
    <h3>Quiz ${count}</h3>
    Score: <input type="number" class="qScore" value="${score}" min="0">
    Max: <input type="number" class="qMax" value="${max}" min="1">
    <button type="button" class="deleteBtn">Delete</button>
  `;

  div.querySelector(".deleteBtn").onclick = () => {
    div.remove();
    renumber();
  };

  quizList.appendChild(div);
}

// ===== RENUMBER =====
function renumber() {
  const items = document.getElementById("quizList").children;
  Array.from(items).forEach((el, i) => {
    el.querySelector("h3").textContent = Quiz ${i+1};
  });
}

// ===== SAVE QUIZZES =====
async function saveQuizzes() {
  if (!currentUserId) return alert("Login first");

  const subject = document.getElementById("subject").value.trim();
  if (!subject) return alert("Enter subject");

  const quizList = document.getElementById("quizList");

  const quizzes = Array.from(quizList.children).map(div => ({
    score: Number(div.querySelector(".qScore").value) || 0,
    max: Number(div.querySelector(".qMax").value) || 0
  }));

  // totals
  const totalScore = quizzes.reduce((s,q)=>s+q.score,0);
  const totalMax = quizzes.reduce((s,q)=>s+q.max,0);

  // save quizzes
  await set(ref(db, grades/${currentUserId}/${subject}/quizzes), quizzes);

  // save totals for grading page
  sessionStorage.setItem("quizTotals", JSON.stringify({
    subject,
    totalScore,
    totalMax
  }));

  // redirect
  window.location.href = "grading.html";
}

// ===== EXPORT =====
window.addQuiz = addQuiz;
window.saveQuizzes = saveQuizzes;
window.loadQuizzes = loadQuizzes;
