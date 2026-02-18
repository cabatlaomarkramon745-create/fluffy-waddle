// ================= FIREBASE =================
import { auth, db } from "./firebase.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// ===== LOGOUT =====
function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  }).catch(err => console.error("Logout failed:", err));
}

// ================= LOAD USER DISPLAY =================
const userDisplay = document.getElementById("userDisplay");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

auth.onAuthStateChanged(async (user) => {
  if (user) {
    if (userDisplay) {
      userDisplay.innerText = user.email.split("@")[0];
      userDisplay.style.display = "block";
    }
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";

    // Load students from Firebase
    await loadStudentsFromFirebase(user.uid);
  } else {
    if (userDisplay) userDisplay.style.display = "none";
    if (loginBtn) loginBtn.style.display = "block";
    if (registerBtn) registerBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";

    // Load students from localStorage only if no user
    loadStudentsFromLocal();
  }
});

// ================= STUDENTS =================
let students = [];

// ----------------- LOAD STUDENTS FROM FIREBASE -----------------
async function loadStudentsFromFirebase(uid) {
  try {
    const snapshot = await get(ref(db, `users/${uid}/students`));
    students = snapshot.exists() ? snapshot.val() : [];
    localStorage.setItem("students", JSON.stringify(students));
    renderStudents();
  } catch (err) {
    console.error("Failed to load students from Firebase:", err);
    loadStudentsFromLocal();
  }
}

// ----------------- LOAD STUDENTS FROM LOCALSTORAGE -----------------
function loadStudentsFromLocal() {
  students = JSON.parse(localStorage.getItem("students")) || [];
  renderStudents();
}

// ----------------- RENDER STUDENTS -----------------
function renderStudents() {
  const container = document.getElementById("studentContainer");
  if (!container) return;

  container.innerHTML = "";

  // Remove students with no subjects
  students = students.filter(s => s.subjects && s.subjects.length > 0);
  localStorage.setItem("students", JSON.stringify(students));

  if (!students.length) {
    container.innerHTML = "<p>No students yet.</p>";
    return;
  }

  students.forEach((student, si) => {
    let studentHTML = `
      <div class="student-card">
        <button class="close-student" onclick="deleteStudent(${si})">X</button>
        <h3>${student.name || ""}</h3>
        <p><strong>Overall:</strong> ${(student.overall || 0).toFixed(2)}%</p>
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

    studentHTML += "</ul></div>";
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
async function deleteSubject(studentIndex, subjectIndex) {
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

  if (auth.currentUser) {
    await set(ref(db, `users/${auth.currentUser.uid}/students`), students);
  }

  renderStudents();
}

// ----------------- DELETE WHOLE STUDENT -----------------
async function deleteStudent(studentIndex) {
  if (!students[studentIndex]) return;

  if (confirm(`Are you sure you want to delete ${students[studentIndex].name}?`)) {
    students.splice(studentIndex, 1);
    localStorage.setItem("students", JSON.stringify(students));

    if (auth.currentUser) {
      await set(ref(db, `users/${auth.currentUser.uid}/students`), students);
    }

    renderStudents();
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
