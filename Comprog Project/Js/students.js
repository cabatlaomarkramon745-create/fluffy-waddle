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
  if (auth.currentUser) {
    auth.signOut()
      .then(() => window.location.href = "login.html")
      .catch(err => console.error("Logout failed:", err));
  } else {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }
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

    // Merge summary localStorage into Firebase for this user
    await uploadSummaryLocalToFirebase(user.uid);

  } else {
    // Offline / localStorage fallback
    const localUser = localStorage.getItem("loggedInUser");
    if (localUser) {
      userDisplay.innerText = localUser.replace("@gmail.com", "");
      userDisplay.style.display = "block";
      if (loginBtn) loginBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";


    } else {
      userDisplay.style.display = "none";
      if (loginBtn) loginBtn.style.display = "block";
      if (registerBtn) registerBtn.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
loadStudentsFromLocal(null);  }
});

// ----------------- UPLOAD SUMMARY LOCAL TO FIREBASE -----------------
async function uploadSummaryLocalToFirebase(uid) {
  try {
    const snapshot = await get(ref(db, `users/${uid}/students`));
    const cloudStudents = snapshot.exists() ? snapshot.val() : [];

    // 🔐 account-specific local storage
    const localStudents =
      JSON.parse(localStorage.getItem(`students_${uid}`)) || [];

    let merged = [...cloudStudents];

    localStudents.forEach(local => {
      const exists = merged.some(f =>
        f.name === local.name &&
        JSON.stringify(f.subjects) === JSON.stringify(local.subjects)
      );
      if (!exists) merged.push(local);
    });

    students = merged;

    await set(ref(db, `users/${uid}/students`), students);

    // 🔐 save per account
    localStorage.setItem(`students_${uid}`, JSON.stringify(students));
    localStorage.setItem("studentsSynced", "true");

    renderStudents();

  } catch (err) {
    console.error("Firebase upload failed, using offline:", err);
    loadStudentsFromLocal(uid);
  }
}
// ----------------- LOAD FROM LOCAL -----------------
function loadStudentsFromLocal(uid = null) {
  if (uid) {
    students =
      JSON.parse(localStorage.getItem(`students_${uid}`)) || [];
  } else {
    students =
      JSON.parse(localStorage.getItem("students")) || [];
  }
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

// ----------------- EDIT / DELETE / ADD -----------------
function editSubject(studentIndex, subjectIndex) {
  localStorage.setItem("editStudentIndex", studentIndex);
  localStorage.setItem("editSubjectIndex", subjectIndex);
  localStorage.setItem("studentsSynced", "false");
  window.location.href = "grading.html";
}

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

 if (auth.currentUser) {
  localStorage.setItem(
    `students_${auth.currentUser.uid}`,
    JSON.stringify(students)
  );
} else {
  localStorage.setItem("students", JSON.stringify(students));
}
  localStorage.setItem("studentsSynced", "false");

  if (auth.currentUser) {
    await set(ref(db, `users/${auth.currentUser.uid}/students`), students);

  }

  renderStudents();
}

async function deleteStudent(studentIndex) {
  if (!students[studentIndex]) return;

  if (confirm(`Are you sure you want to delete ${students[studentIndex].name}?`)) {
    students.splice(studentIndex, 1);

   if (auth.currentUser) {
  localStorage.setItem(
    `students_${auth.currentUser.uid}`,
    JSON.stringify(students)
  );
} else {
  localStorage.setItem("students", JSON.stringify(students));
}
    localStorage.setItem("studentsSynced", "false");

    if (auth.currentUser) {
      await set(ref(db, `users/${auth.currentUser.uid}/students`), students);

    }

    renderStudents();
  }
}

function addSubjectToStudent(studentIndex) {
  localStorage.setItem("editStudentIndex", studentIndex);
  localStorage.removeItem("editSubjectIndex");
  localStorage.setItem("studentsSynced", "false");
  window.location.href = "grading.html";
}

function addNewStudent() {
  localStorage.removeItem("editStudentIndex");
  localStorage.removeItem("editSubjectIndex");
  localStorage.removeItem("tempSummary");
  localStorage.setItem("studentsSynced", "false");
  window.location.href = "grading.html";
}

// ================= EXPORT GLOBAL FUNCTIONS =================
// make functions callable from HTML buttons
window.openMenu = openMenu;
window.closeMenu = closeMenu;
window.toggleProfile = toggleProfile;
window.logout = logout;
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;
window.deleteStudent = deleteStudent;
window.addSubjectToStudent = addSubjectToStudent;
window.addNewStudent = addNewStudent;
