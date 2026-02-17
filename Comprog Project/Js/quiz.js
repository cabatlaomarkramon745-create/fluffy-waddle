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
    Score: <input type="number" class="qScore" value="${score}">
    Max: <input type="number" class="qMax" value="${max}">
    <button type="button" class="deleteBtn">Delete</button>
  `;

  div.querySelector(".deleteBtn").addEventListener("click", () => {
    quizList.removeChild(div);
    renumberQuizzes();
    saveQuizzes();
  });

  quizList.appendChild(div);
}

function renumberQuizzes() {
  const quizzes = document.getElementById("quizList").children;
  for (let i = 0; i < quizzes.length; i++) {
    quizzes[i].querySelector("h3").textContent = "Quiz " + (i + 1);
  }
}

async function saveQuizzes() {
  if (!currentUserId) return;
  const subject = document.getElementById("subject").value.trim();
  if (!subject) return alert("Enter subject first");

  const quizList = document.getElementById("quizList");
  const quizzes = Array.from(quizList.children).map(div => ({
    score: Number(div.querySelector(".qScore").value) || 0,
    max: Number(div.querySelector(".qMax").value) || 20
  }));

  try {
    await set(ref(db, `grades/${currentUserId}/${subject}/quizzes`), quizzes);
    console.log("Quizzes saved to Firebase:", quizzes);

    // ✅ Redirect to grading page
    window.location.href = "grading.html";  // replace with your grading HTML filename
  } catch (err) {
    console.error("Failed to save quizzes:", err);
    alert("Failed to save quizzes.");
  }
}

// Expose functions
window.addQuiz = addQuiz;
window.saveQuizzes = saveQuizzes;
window.loadQuizzes = loadQuizzes;
