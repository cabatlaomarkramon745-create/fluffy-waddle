// ================= MENU + PROFILE =================
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");

function openMenu() {
  if (!sideMenu || !overlay) return;
  sideMenu.style.left = "0";
  overlay.style.display = "block";
}

function closeMenu() {
  if (!sideMenu || !overlay) return;
  sideMenu.style.left = "-250px";
  overlay.style.display = "none";
}

function toggleProfile(event) {
  if (!profileDropdown) return;
  event.stopPropagation();
  profileDropdown.style.display =
    profileDropdown.style.display === "block" ? "none" : "block";
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

document.addEventListener("click", function (e) {
  if (!profileDropdown) return;
  if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
});

// ================= LOAD USER DISPLAY =================
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("loggedInUser");
  const userDisplay = document.getElementById("userDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!userDisplay) return;

  if (user) {
    userDisplay.innerText = user.replace("@gmail.com", "");
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
  } else {
    userDisplay.style.display = "none";
  }
});

// ================= SUMMARY FUNCTIONS =================
let studentNameInput = document.getElementById("studentName");
let list = document.getElementById("list");
let avg = document.getElementById("avg");

// Load temp grades from grading page
function loadTempSummary() {
  const temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };

  list.innerHTML = "";
  avg.textContent = "0.00";
  if (!temp.grades || temp.grades.length === 0) {
    list.innerHTML = "<p>No pending grades yet. Go to Grading first.</p>";
    return;
  }

  studentNameInput.value = temp.name || "";
  let total = 0;

  temp.grades.forEach((g, i) => {
    total += Number(g.grade || 0);
    list.innerHTML += `
      <div class="subject-item">
        <strong>${g.subject || "Unnamed Subject"}</strong> - Grade: ${Number(g.grade || 0).toFixed(2)}%
        <button onclick="deleteTempSubject(${i})">Delete</button>
      </div>
    `;
  });

  avg.textContent = (total / temp.grades.length).toFixed(2);
}

// Delete a single subject from temp
function deleteTempSubject(index) {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary"));
  if (!temp || !temp.grades) return;
  temp.grades.splice(index, 1);
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));
  loadTempSummary();
}

// Save student name to temp
function saveStudentName() {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };
  temp.name = studentNameInput.value.trim();
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));
  alert("Name saved temporarily.");
}

// Save temp -> students (final save)
function saveToStudents() {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary"));
  if (!temp || !temp.grades || temp.grades.length === 0) {
    alert("No pending grades to save.");
    return;
  }

  temp.name = studentNameInput.value.trim();
  let students = JSON.parse(localStorage.getItem("students")) || [];

  const newStudent = {
    name: temp.name,
    subjects: temp.grades.map(g => ({ subject: g.subject, grade: Number(g.grade) })),
    overall: temp.grades.reduce((a, b) => a + Number(b.grade), 0) / temp.grades.length
  };

  students.push(newStudent);
  localStorage.setItem("students", JSON.stringify(students));
  sessionStorage.removeItem("tempSummary");
  alert("Student saved!");
  loadTempSummary();
}

// Initialize
document.addEventListener("DOMContentLoaded", loadTempSummary);
