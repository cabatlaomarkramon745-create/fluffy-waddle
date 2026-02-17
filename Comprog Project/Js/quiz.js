// ===== QUIZZES =====
async function loadQuizzes(subject) {
  if (!currentUserId) return;

  const quizList = document.getElementById("quizList");
  quizList.innerHTML = "";

  try {
    const snapshot = await get(ref(db, `grades/${currentUserId}/${subject}/quizzes`));
    const quizzes = snapshot.val() || [];
    quizzes.forEach(q => addQuiz(q.score, q.max));
  } catch (err) {
    console.error("Error loading quizzes:", err);
  }
}

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

  // Delete quiz
  div.querySelector(".deleteBtn").addEventListener("click", () => {
    quizList.removeChild(div);
    renumberQuizzes();
    saveQuizzes(false); // Save without redirect on delete
  });

  quizList.appendChild(div);
}

// Renumber quiz headings
function renumberQuizzes() {
  const quizzes = document.getElementById("quizList").children;
  for (let i = 0; i < quizzes.length; i++) {
    quizzes[i].querySelector("h3").textContent = "Quiz " + (i + 1);
  }
}

// Save quizzes to Firebase
// redirectAfterSave = true → go to grading.html
async function saveQuizzes(redirectAfterSave = true) {
  if (!currentUserId) return;

  const subjectInput = document.getElementById("subject");
  const subject = subjectInput?.value.trim();
  if (!subject) return alert("Enter subject first");

  const quizList = document.getElementById("quizList");
  const quizzes = Array.from(quizList.children).map(div => ({
    score: Number(div.querySelector(".qScore").value) || 0,
    max: Number(div.querySelector(".qMax").value) || 20
  }));

  try {
    await set(ref(db, `grades/${currentUserId}/${subject}/quizzes`), quizzes);
    console.log("Quizzes saved to Firebase:", quizzes);

    if (redirectAfterSave) {
      window.location.href = "grading.html";
    }
  } catch (err) {
    console.error("Failed to save quizzes:", err);
    alert("Failed to save quizzes.");
  }
}

// Expose functions to HTML
window.addQuiz = addQuiz;
window.saveQuizzes = saveQuizzes;
window.loadQuizzes = loadQuizzes;
