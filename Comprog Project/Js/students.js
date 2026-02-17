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

document.addEventListener("click", function (e) {
  if (!profileDropdown) return;
  if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
});

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// ================= LOAD USER DISPLAY =================
document.addEventListener("DOMContentLoaded", function () {
  let user = localStorage.getItem("loggedInUser");
  const userDisplay = document.getElementById("userDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!userDisplay) return; // skip if page has no menu

  if (user) {
    userDisplay.innerText = user.replace("@gmail.com", "");
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
  } else {
    userDisplay.style.display = "none";
  }
});

// ================= STUDENTS =================
let students = JSON.parse(localStorage.getItem("students")) || [];

document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
});

// ----------------- LOAD STUDENTS -----------------
function loadStudents() {
  const container = document.getElementById("studentContainer");
  if (!container) return;

  container.innerHTML = "";

  students = JSON.parse(localStorage.getItem("students")) || [];

  // AUTO REMOVE STUDENTS WITH NO SUBJECTS
  students = students.filter(s => s.subjects && s.subjects.length > 0);
  localStorage.setItem("students", JSON.stringify(students));

  if (!students.length) {
    container.innerHTML = "<p>No students yet.</p>";
    return;
  }

  students.forEach((student, si) => {
    let studentHTML = `
      <div class="student-card">
        <!-- RED X TOP-RIGHT -->
        <button class="close-student" onclick="deleteStudent(${si})">X</button>

        <h3>${student.name || ""}</h3>

        <p><strong>Overall:</strong> ${(student.overall || 0).toFixed(2)}%</p>

        <!-- ADD SUBJECT BUTTON BELOW OVERALL -->
        <button class="add-subject-btn" onclick="addSubjectToStudent(${si})">Add Subject</button>

        <ul class="subject-list">
    `;

    student.subjects.forEach((sub, subi) => {
      studentHTML += `
        <li class="subject-item">
          ${sub.subject || "Unnamed Subject"}: ${(sub.grade || 0).toFixed(2)}%
          <div class="subject-buttons">
            <button onclick="editSubject(${si}, ${subi})">Edit</button>
            <button onclick="deleteSubject(${si}, ${subi})">Delete</button>
          </div>
        </li>
      `;
    });

    studentHTML += `
        </ul>
      </div>
    `;

    container.innerHTML += studentHTML;
  });
}

// ----------------- EDIT SUBJECT -----------------
function editSubject(studentIndex, subjectIndex) {
  localStorage.setItem("editStudentIndex", studentIndex);
  localStorage.setItem("editSubjectIndex", subjectIndex);
  window.location.href = "grading.html";
}

// ----------------- DELETE SUBJECT -----------------
function deleteSubject(studentIndex, subjectIndex) {
  students = JSON.parse(localStorage.getItem("students")) || [];
  if (!students[studentIndex] || !students[studentIndex].subjects[subjectIndex]) return;

  students[studentIndex].subjects.splice(subjectIndex, 1);

  if (!students[studentIndex].subjects.length) {
    students.splice(studentIndex, 1);
    alert("Student removed (no subjects left)");
  } else {
    students[studentIndex].overall =
      students[studentIndex].subjects.reduce((a, b) => a + Number(b.grade || 0), 0) /
      students[studentIndex].subjects.length;
  }

  localStorage.setItem("students", JSON.stringify(students));
  loadStudents();
}

// ----------------- DELETE WHOLE STUDENT -----------------
function deleteStudent(studentIndex) {
  students = JSON.parse(localStorage.getItem("students")) || [];
  if (!students[studentIndex]) return;

  if (confirm(`Are you sure you want to delete ${students[studentIndex].name}?`)) {
    students.splice(studentIndex, 1);
    localStorage.setItem("students", JSON.stringify(students));
    loadStudents();
  }
}

// ----------------- ADD SUBJECT TO EXISTING STUDENT -----------------
function addSubjectToStudent(studentIndex) {
  localStorage.setItem("editStudentIndex", studentIndex);
  localStorage.removeItem("editSubjectIndex"); // new subject
  window.location.href = "grading.html";
}

// ----------------- ADD NEW STUDENT -----------------
function addNewStudent() {
  localStorage.removeItem("editStudentIndex");
  localStorage.removeItem("editSubjectIndex");
  localStorage.removeItem("tempSummary");
  window.location.href = "grading.html";
}