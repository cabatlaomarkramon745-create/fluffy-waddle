import { auth, db } from "./firebase.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
    saveQuizzes();
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

// Save quizzes to Firebase
function saveQuizzes() {
  if (!auth.currentUser) {
    alert("Please sign in first.");
    return;
  }

  let quizList = document.getElementById("quizList");
  let quizzes = [];

  Array.from(quizList.children).forEach(div => {
    let score = Number(div.querySelector(".qScore").value) || 0;
    let max = Number(div.querySelector(".qMax").value) || 20;
    quizzes.push({ score, max });
  });

  const userId = auth.currentUser.uid;
  set(ref(db, `users/${userId}/quizzes`), quizzes)
    .then(() => {
      console.log("Quizzes saved to Firebase:", quizzes);
      alert("Quizzes saved!");
    })
    .catch(err => console.error("Error saving quizzes:", err));
}

// Load quizzes from Firebase
function loadQuizzes() {
  if (!auth.currentUser) {
    console.log("No user signed in yet.");
    return;
  }

  const userId = auth.currentUser.uid;
  const dbRef = ref(db);

  get(child(dbRef, `users/${userId}/quizzes`))
    .then(snapshot => {
      let quizzes = snapshot.val() || [];
      let quizList = document.getElementById("quizList");
      quizList.innerHTML = "";
      quizzes.forEach(q => addQuiz(q.score, q.max));
    })
    .catch(err => console.error("Error loading quizzes:", err));
}

// Auth state observer to load quizzes automatically
auth.onAuthStateChanged(user => {
  if (user) {
    loadQuizzes();
  } else {
    console.log("User not signed in");
  }
});

// Expose addQuiz to the HTML buttons
window.addQuiz = addQuiz;
window.saveQuizzes = saveQuizzes;
