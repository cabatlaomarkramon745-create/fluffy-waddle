// ================= MENU + PROFILE =================
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");

function openMenu() { sideMenu.style.left = "0"; overlay.style.display = "block"; }
function closeMenu() { sideMenu.style.left = "-250px"; overlay.style.display = "none"; }
function toggleProfile(event) { event.stopPropagation(); profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block"; }
function logout() { localStorage.removeItem("loggedInUser"); window.location.href = "login.html"; }

document.addEventListener("click", e => {
  if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
});

// ================= SUMMARY =================
let studentNameInput, list, avg;

document.addEventListener("DOMContentLoaded", () => {
  studentNameInput = document.getElementById("studentName");
  list = document.getElementById("list");
  avg = document.getElementById("avg");

  loadTempSummary();
});

// Load grades from sessionStorage
function loadTempSummary() {
  const temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };
  if (!list || !avg) return; // safety
  list.innerHTML = "";
  avg.textContent = "0.00";
  if (!temp.grades.length) {
    list.innerHTML = "<p>No pending grades yet. Go to Grading first.</p>";
    return;
  }

  studentNameInput.value = temp.name || "";
  let total = 0;

  temp.grades.forEach((g, i) => {
    total += Number(g.grade || 0);
    list.innerHTML += `
      <div class="subject-item">
        <strong>${g.subject}</strong> - Grade: ${Number(g.grade).toFixed(2)}%
        <button onclick="deleteTempSubject(${i})">Delete</button>
      </div>
    `;
  });

  avg.textContent = (total / temp.grades.length).toFixed(2);
}

const totalDiv = document.getElementById("totalGrades");
  if (totalDiv) {
    const gradingTotal = JSON.parse(sessionStorage.getItem("gradingTotal")) || 0;
    totalDiv.textContent = `Total Grading: ${gradingTotal.toFixed(2)}`;
  }
}

// Delete single subject
function deleteTempSubject(index) {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };
  temp.grades.splice(index, 1);
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));
  loadTempSummary();
}

// Save student name temporarily
function saveStudentName() {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };
  temp.name = studentNameInput.value.trim();
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));
  alert("Name saved temporarily.");
}

// Final save to localStorage
function saveToStudents() {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };
  if (!temp.grades.length) { alert("No pending grades to save."); return; }

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
