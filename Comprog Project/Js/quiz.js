import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUserId = null;

// ===== AUTH =====
onAuthStateChanged(auth, (user) => {
  if (user) currentUserId = user.uid;
});

// ===== LOAD QUIZZES =====
export function loadQuizzes() {
  const quizList = document.getElementById("quizList");
  if (!quizList) return;

  quizList.innerHTML = "";

  // Load saved totals from sessionStorage
  const savedTotals = JSON.parse(sessionStorage.getItem("quizTotals"));
  if (savedTotals) {
    addQuiz(savedTotals.totalScore, savedTotals.totalMax);
  }
}

// ===== ADD QUIZ =====
export function addQuiz(score = 0, max = 20) {
  const quizList = document.getElementById("quizList");
  if (!quizList) return;

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
    renumberQuizzes();
  };

  quizList.appendChild(div);
}

// ===== RENUMBER QUIZZES =====
function renumberQuizzes() {
  const items = document.getElementById("quizList").children;
  Array.from(items).forEach((el, i) => {
    el.querySelector("h3").textContent = `Quiz ${i + 1}`;
  });
}

// ===== SAVE TOTALS ONLY =====
export function saveQuizzes() {
  const quizList = document.getElementById("quizList");
  if (!quizList || !quizList.children.length) {
    alert("Add at least one quiz!");
    return;
  }

  // Calculate totals
  let totalScore = 0;
  let totalMax = 0;

  Array.from(quizList.children).forEach(div => {
    const score = Number(div.querySelector(".qScore").value) || 0;
    const max = Number(div.querySelector(".qMax").value) || 0;

    totalScore += score;
    totalMax += max;
  });

  // Save totals in sessionStorage for grading page
  sessionStorage.setItem("quizTotals", JSON.stringify({ totalScore, totalMax }));

  alert(`Total saved! Score: ${totalScore} / ${totalMax}`);
  location.href = "grading.html";
}

// ===== AUTO LOAD ON PAGE LOAD =====
window.addEventListener("DOMContentLoaded", loadQuizzes);

// ===== EXPORT FUNCTIONS FOR HTML BUTTONS =====
window.addQuiz = addQuiz;
window.saveQuizzes = saveQuizzes;
window.loadQuizzes = loadQuizzes;
