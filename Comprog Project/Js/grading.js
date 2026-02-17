// MENU + PROFILE
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");

function openMenu() {
  sideMenu.style.left = "0";
  overlay.style.display = "block";
}
function closeMenu() {
  sideMenu.style.left = "-250px";
  overlay.style.display = "none";
}

function toggleProfile(event) {
  event.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function (e) {
  if (!e.target.closest(".profile-area"))
    profileDropdown.style.display = "none";
});

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// LOAD USER & QUIZ
document.addEventListener("DOMContentLoaded", function () {
  let user = localStorage.getItem("loggedInUser");
  if (user) {
    document.getElementById("userDisplay").innerText =
      user.replace("@gmail.com", "");
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
  } else {
    document.getElementById("userDisplay").style.display = "none";
  }

  loadQuizTotals();
  loadSavedInputs();
  loadEditData();

  // Remove red border when typing
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", function () {
      this.classList.remove("input-error");
    });
  });
});

// VALIDATION
function validateGradingInputs() {
  const requiredFields = [
    { id: "subject", name: "Subject" },
    { id: "qScore", name: "Quiz Score" },
    { id: "qMax", name: "Quiz Max" },
    { id: "eScore", name: "Exam Score" },
    { id: "eMax", name: "Exam Max" },
    { id: "aScore", name: "Attendance Score" },
    { id: "aMax", name: "Attendance Max" },
    { id: "wQuiz", name: "Quiz Weight" },
    { id: "wExam", name: "Exam Weight" },
    { id: "wAttend", name: "Attendance Weight" }
  ];

  let firstInvalid = null;

  requiredFields.forEach(field => {
    const el = document.getElementById(field.id);
    el.classList.remove("input-error");

    if (!el.value.trim()) {
      el.classList.add("input-error");
      if (!firstInvalid) firstInvalid = field;
    }
  });

  if (firstInvalid) {
    alert(firstInvalid.name + " is required.");
    document.getElementById(firstInvalid.id).focus();
    return false;
  }

  return true;
}

// CALCULATE AND SAVE TO TEMP
function calculate() {
  if (!validateGradingInputs()) return;

  let subjectName = document.getElementById("subject").value.trim();

  let wQ = Number(document.getElementById("wQuiz").value);
  let wE = Number(document.getElementById("wExam").value);
  let wA = Number(document.getElementById("wAttend").value);

  if (wQ + wE + wA !== 100) {
    alert("Percentage must total 100%");
    return;
  }

  let qS = Number(document.getElementById("qScore").value);
  let qM = Number(document.getElementById("qMax").value);
  let eS = Number(document.getElementById("eScore").value);
  let eM = Number(document.getElementById("eMax").value);
  let aS = Number(document.getElementById("aScore").value);
  let aM = Number(document.getElementById("aMax").value);

  if (qS > qM || eS > eM || aS > aM) {
    alert("Scores cannot be greater than max");
    return;
  }

  let finalGrade = (
    (qS / qM) * wQ +
    (eS / eM) * wE +
    (aS / aM) * wA
  ).toFixed(2);

  document.getElementById("final").textContent = finalGrade;

  // ===== SAVE TO TEMP SUMMARY (instead of students directly) =====
  let temp = JSON.parse(localStorage.getItem("tempSummary")) || { name: "", grades: [] };
  const editSubjectIndex = localStorage.getItem("editSubjectIndex");

  if (editSubjectIndex !== null) {
    temp.grades[editSubjectIndex] = {
      subject: subjectName,
      grade: Number(finalGrade)
    };
    alert("Grade updated!");
  } else {
    temp.grades.push({
      subject: subjectName,
      grade: Number(finalGrade)
    });
    alert("Grade saved!");
  }

  localStorage.setItem("tempSummary", JSON.stringify(temp));

  // Clear editSubjectIndex after save
  localStorage.removeItem("editSubjectIndex");
}

// QUIZ TOTALS
function loadQuizTotals() {
  let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
  let totalScore = 0, totalMax = 0;
  quizzes.forEach(q => {
    totalScore += Number(q.score) || 0;
    totalMax += Number(q.max) || 0;
  });
  document.getElementById("qScore").value = totalScore;
  document.getElementById("qMax").value = totalMax;
}

// SAVE / LOAD INPUTS
function saveCurrentInputs() {
  let data = {
    subject: document.getElementById("subject").value,
    eScore: document.getElementById("eScore").value,
    eMax: document.getElementById("eMax").value,
    aScore: document.getElementById("aScore").value,
    aMax: document.getElementById("aMax").value,
    wQuiz: document.getElementById("wQuiz").value,
    wExam: document.getElementById("wExam").value,
    wAttend: document.getElementById("wAttend").value
  };
  localStorage.setItem("gradingInputs", JSON.stringify(data));
}

function loadSavedInputs() {
  let data = JSON.parse(localStorage.getItem("gradingInputs"));
  if (!data) return;

  document.getElementById("subject").value = data.subject || "";
  document.getElementById("eScore").value = data.eScore || "";
  document.getElementById("eMax").value = data.eMax || 50;
  document.getElementById("aScore").value = data.aScore || "";
  document.getElementById("aMax").value = data.aMax || 100;
  document.getElementById("wQuiz").value = data.wQuiz || 40;
  document.getElementById("wExam").value = data.wExam || 40;
  document.getElementById("wAttend").value = data.wAttend || 20;
}

// SUBJECT DROPDOWN
const subjectDropdown = document.getElementById("subjectDropdown");
const subjectInput = document.getElementById("subject");

function toggleSubjects() {
  subjectDropdown.style.display =
    subjectDropdown.style.display === "block" ? "none" : "block";
}

function selectSubject(value) {
  subjectInput.value = value;
  subjectDropdown.style.display = "none";
}

function filterSubjects() {
  removeNumbers(subjectInput);

  const filter = subjectInput.value.toLowerCase();
  const items = subjectDropdown.querySelectorAll("div");

  items.forEach(item => {
    item.style.display =
      item.textContent.toLowerCase().includes(filter) ? "block" : "none";
  });

  subjectDropdown.style.display = "block";
}

document.addEventListener("click", e => {
  if (!e.target.closest(".subject-wrapper")) {
    subjectDropdown.style.display = "none";
  }
});

function removeNumbers(input) {
  input.value = input.value.replace(/[^a-zA-Z\s]/g, "");
}

// LOAD EDIT DATA
function loadEditData() {
  const subjectIndex = localStorage.getItem("editSubjectIndex");
  if (subjectIndex === null) return;

  let temp = JSON.parse(localStorage.getItem("tempSummary")) || { name: "", grades: [] };
  let subject = temp.grades[subjectIndex];
  if (!subject) return;

  document.getElementById("subject").value = subject.subject;
  document.getElementById("final").textContent = subject.grade.toFixed(2);
}