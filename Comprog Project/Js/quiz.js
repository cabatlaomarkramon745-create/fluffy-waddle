// Js/quiz.js
import { auth, db } from "./firebase.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUserId = null;

// ===== AUTH =====
onAuthStateChanged(auth, (user) => {
  if (user) currentUserId = user.uid;
});

// ===== LOAD QUIZZES =====
export async function loadQuizzes(subject) {
  if (!subject) return;

  const quizList = document.getElementById("quizList");
  quizList.innerHTML = "";

  try {
    if (currentUserId) {
      const snapshot = await get(ref(db, `grades/${currentUserId}/${subject}/quizzes`));
      const quizzes = snapshot.val() || [];
      quizzes.forEach(q => addQuiz(q.score, q.max));
    } else {
      // load from localStorage if not logged in
      const saved = JSON.parse(localStorage.getItem(`quizzes-${subject}`)) || [];
      saved.forEach(q => addQuiz(q.score, q.max));
    }
  } catch (err) {
    console.error("Error loading quizzes:", err);
  }
}

// ===== ADD QUIZ =====
export function addQuiz(score = 0, max = 20) {
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

// ===== SAVE QUIZZES =====
export async function saveQuizzes() {
  const subjectInput = document.getElementById("subject");
  let subject = subjectInput?.value.trim() || "default";

  const quizList = document.getElementById("quizList");
  if (!quizList.children.length) return alert("Add at least one quiz!");

  const quizzes = Array.from(quizList.children).map(div => ({
    score: Number(div.querySelector(".qScore").value) || 0,
    max: Number(div.querySelector(".qMax").value) || 0
  }));

  const totalScore = quizzes.reduce((s,q)=>s+q.score,0);
  const totalMax = quizzes.reduce((s,q)=>s+q.max,0);

  // save
  try {
    if (currentUserId) {
      await set(ref(db, `grades/${currentUserId}/${subject}/quizzes`), quizzes);
    } else {
      // fallback to localStorage
      localStorage.setItem(`quizzes-${subject}`, JSON.stringify(quizzes));
    }

    // store totals for grading page
    sessionStorage.setItem("quizTotals", JSON.stringify({
      subject,
      totalScore,
      totalMax
    }));

    alert("Quizzes saved!");
  } catch (err) {
    console.error("Error saving quizzes:", err);
    alert("Failed to save quizzes.");
  }
}

// ===== AUTO LOAD IF SUBJECT FILLED =====
window.addEventListener("DOMContentLoaded", () => {
  const subjectInput = document.getElementById("subject");
  if (subjectInput && subjectInput.value.trim()) {
    loadQuizzes(subjectInput.value.trim());
  }
});

// ===== EXPORT FUNCTIONS FOR HTML BUTTONS =====
window.addQuiz = addQuiz;
window.saveQuizzes = saveQuizzes;
window.loadQuizzes = loadQuizzes;
