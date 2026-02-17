/* Add a new quiz input */
function addQuiz() {
  let quizList = document.getElementById("quizList");
  let count = quizList.children.length + 1;

  let div = document.createElement("div");
  div.className = "score-group";

  // ggCreate delete button
  div.innerHTML =
    "<h3>Quiz " + count + "</h3>" +
    "Score: <input type='number' class='qScore' value='0'>" +
    " Max: <input type='number' class='qMax' value='20'>" +
    " <button type='button' class='deleteBtn'>Delete</button>";

  // Add delete functionality
  div.querySelector(".deleteBtn").addEventListener("click", function() {
    quizList.removeChild(div);
    renumberQuizzes(); 
  });

  quizList.appendChild(div);
}

/* Count remaining quizzes after deletion */
function renumberQuizzes() {
  let quizzes = document.getElementById("quizList").children;
  for (let i = 0; i < quizzes.length; i++) {
    quizzes[i].querySelector("h3").textContent = "Quiz " + (i + 1);
  }
}

/* Save quiz */
function saveQuizzes() {
  let scores = document.getElementsByClassName("qScore");
  let maxes = document.getElementsByClassName("qMax");

  let quizzes = [];

  for (let i = 0; i < scores.length; i++) {
    quizzes.push({
      score: Number(scores[i].value),
      max: Number(maxes[i].value)
    });
  }

  localStorage.setItem("quizzes", JSON.stringify(quizzes));
  alert("Quizzes saved!");
  location.href = "grading.html";
}

/* Load existing quiz */
function loadQuizzes() {
  let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];

  for (let i = 0; i < quizzes.length; i++) {
    addQuiz();
    document.getElementsByClassName("qScore")[i].value = quizzes[i].score;
    document.getElementsByClassName("qMax")[i].value = quizzes[i].max;
  }
}

loadQuizzes();
