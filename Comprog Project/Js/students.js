// ================= FIREBASE =================
import { auth, db } from "./firebase.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ================= MENU + PROFILE =================
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const profileDropdown = document.getElementById("profileDropdown");
const userDisplay = document.getElementById("userDisplay");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

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
  auth.signOut()
    .then(() => window.location.href = "login.html")
    .catch(err => console.error("Logout failed:", err));
}

// ================= STUDENTS =================
let students = [];

// ----------------- AUTH + LOAD -----------------
auth.onAuthStateChanged(async (user) => {
  if (user) {
    if (userDisplay) {
      userDisplay.innerText = user.email.split("@")[0];
      userDisplay.style.display = "block";
    }
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";

    // Load students from Firebase and merge localStorage from summary
    setTimeout(() => uploadSummaryLocalToFirebase(user.uid), 200);
  } else {
    if (userDisplay) userDisplay.style.display = "none";
    if (loginBtn) loginBtn.style.display = "block";
    if (registerBtn) registerBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";

    // Offline-only
    loadStudentsFromLocal();
  }
});

// ----------------- UPLOAD SUMMARY LOCAL TO FIREBASE -----------------
async function uploadSummaryLocalToFirebase(uid) {
  try {
    // Firebase students first
    const snapshot = await get(ref(db, `users/${uid}/students`));
    const cloudStudents = snapshot.exists() ? snapshot.val() : [];

    // LocalStorage from summary
    const localStudents = JSON.parse(localStorage.getItem("students")) || [];
    let merged = [...cloudStudents];

    // Add local students if they don't already exist in Firebase
    localStudents.forEach(local => {
      const exists = merged.some(f =>
        f.name === local.name &&
        JSON.stringify(f.subjects) === JSON.stringify(local.subjects)
      );
      if (!exists) merged.push(local);
    });

    students = merged;

    // Save merged permanently to Firebase
    await set(ref(db, `users/${uid}/students`), students);

    // Clear localStorage flag so next summary additions can be uploaded again
    localStorage.setItem("studentsSynced", "true");
    localStorage.setItem("students", JSON.stringify(students));

    renderStudents();
  } catch (err) {
    console.error("Firebase upload failed, using offline:", err);
    loadStudentsFromLocal();
  }
}

// ----------------- LOAD FROM LOCAL -----------------
function loadStudentsFromLocal() {
  students = JSON.parse(localStorage.getItem("students")) || [];
  renderStudents();
}

// ----------------- RENDER STUDENTS -----------------
function renderStudents() {
  const container = document.getElementById("studentContainer");
  if (!container) return;

  container.innerHTML = "";
  students = students || [];

  if (students.length === 0) {
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

    student.subjects?.forEach((sub, subi) => {
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
  localStorage.setItem("studentsSynced", "false");
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
  localStorage.setItem("studentsSynced", "false");

  if (auth.currentUser) {
    await set(ref(db, `users/${auth.currentUser.uid}/students`), students);
  }

  renderStudents();
}

// ----------------- DELETE STUDENT -----------------
async function deleteStudent(studentIndex) {
  if (!students[studentIndex]) return;

  if (confirm(`Are you sure you want to delete ${students[studentIndex].name}?`)) {
    students.splice(studentIndex, 1);

    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("studentsSynced", "false");

    if (auth.currentUser) {
      await set(ref(db, `users/${auth.currentUser.uid}/students`), students);
    }

    renderStudents();
  }
}

// ----------------- ADD SUBJECT TO EXISTING STUDENT -----------------
function addSubjectToStudent(studentIndex) {
  localStorage.setItem("editStudentIndex", studentIndex);
  localStorage.removeItem("editSubjectIndex");
  localStorage.setItem("studentsSynced", "false");
  window.location.href = "grading.html";
}

// ----------------- ADD NEW STUDENT -----------------
function addNewStudent() {
  localStorage.removeItem("editStudentIndex");
  localStorage.removeItem("editSubjectIndex");
  localStorage.removeItem("tempSummary");
  localStorage.setItem("studentsSynced", "false");
  window.location.href = "grading.html";
}
