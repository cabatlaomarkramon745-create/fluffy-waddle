// Add a new quiz input
function addQuiz(score = 0, max = 20) {
  let quizList = document.getElementById("quizList");
  let count = quizList.children.length + 1;

  let div = document.createElement("div");
  div.className = "score-group";

  div.innerHTML = `
    <h3>Quiz ${count}</h3>
    Score: <input type="number" class="qScore" value="${score}">
    Max: <input type="number" class="qMax" value="${max}">
    <button type="button" class="deleteBtn">Delete</button>
  `;

  // Delete functionality
  div.querySelector(".deleteBtn").addEventListener("click", function() {
    quizList.removeChild(div);
    renumberQuizzes();
    saveQuizzes(); // auto-save after deletion
  });

  quizList.appendChild(div);
}

// Renumber quizzes after deletion
function renumberQuizzes() {
  let quizzes = document.getElementById("quizList").children;
  for (let i = 0; i < quizzes.length; i++) {
    quizzes[i].querySelector("h3").textContent = "Quiz " + (i + 1);
  }
}

// Save quizzes to localStorage
function saveQuizzes() {
  let quizList = document.getElementById("quizList");
  let quizzes = [];

  Array.from(quizList.children).forEach(div => {
    let score = Number(div.querySelector(".qScore").value) || 0;
    let max = Number(div.querySelector(".qMax").value) || 20;
    quizzes.push({ score, max });
  });

  localStorage.setItem("quizzes", JSON.stringify(quizzes));
  console.log("Quizzes saved:", quizzes);
}

// Load quizzes from localStorage
function loadQuizzes() {
  let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
  let quizList = document.getElementById("quizList");

  // Clear existing
  quizList.innerHTML = "";

  quizzes.forEach(q => addQuiz(q.score, q.max));
}

// Initialize
document.addEventListener("DOMContentLoaded", loadQuizzes);
