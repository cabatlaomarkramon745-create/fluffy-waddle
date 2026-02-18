// ================= FIREBASE =================
import { auth, db } from "./firebase.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// ================= SUMMARY =================
let students = [];
let studentNameInput;
let list;
let avg;

document.addEventListener("DOMContentLoaded", () => {
  studentNameInput = document.getElementById("studentName");
  list = document.getElementById("list");
  avg = document.getElementById("avg");

  students = JSON.parse(localStorage.getItem("students")) || [];

  loadTempSummary();
});

// ----------------- LOAD TEMP SUMMARY (SESSION STORAGE) -----------------
function loadTempSummary() {
  // USE sessionStorage here to match grading.js
  const temp = JSON.parse(sessionStorage.getItem("tempSummary"));

  list.innerHTML = "";
  avg.textContent = "0.00";
  if (!studentNameInput) return;
  studentNameInput.value = "";

  if (!temp || !temp.grades || temp.grades.length === 0) {
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

// ----------------- DELETE SUBJECT FROM TEMP -----------------
function deleteTempSubject(index) {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary"));
  if (!temp || !temp.grades) return;

  temp.grades.splice(index, 1);

  sessionStorage.setItem("tempSummary", JSON.stringify(temp));
  loadTempSummary();
}

// ----------------- SAVE STUDENT NAME -----------------
// ----------------- FINAL SAVE TO LOCALSTORAGE STUDENTS + FIREBASE -----------------
async function saveToStudents() {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary"));
  if (!temp || !temp.grades || temp.grades.length === 0) {
    alert("No pending grades to save.");
    return;
  }

  // Update temp name
  temp.name = studentNameInput.value.trim();
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));

  // Load existing students from localStorage
  let students = JSON.parse(localStorage.getItem("students")) || [];

  const newStudentData = {
    name: temp.name || "",
    subjects: temp.grades.map(g => ({
      subject: g.subject || "Unnamed Subject",
      grade: Number(g.grade || 0)
    })),
    overall: temp.grades.reduce((a, g) => a + Number(g.grade || 0), 0) / temp.grades.length
  };

  // Add new student to localStorage
  students.push(newStudentData);
  localStorage.setItem("students", JSON.stringify(students));

  // ====== SAVE TO FIREBASE ======
  // Only save if a user is logged in
  if (auth.currentUser) {
    try {
      await set(ref(db, `users/${auth.currentUser.uid}/students`), students);
      console.log("Student saved to Firebase!");
    } catch (err) {
      console.error("Failed to save students to Firebase:", err);
      alert("Failed to save to your account");
    }
  }

  // Remove tempSummary after saving
  sessionStorage.removeItem("tempSummary");

  alert("Student saved permanently locally and in your account!");
  loadTempSummary();
}


// ----------------- FINAL SAVE TO LOCALSTORAGE STUDENTS -----------------
function saveToStudents() {
  let temp = JSON.parse(sessionStorage.getItem("tempSummary"));
  if (!temp || !temp.grades || temp.grades.length === 0) {
    alert("No pending grades to save.");
    return;
  }

  temp.name = studentNameInput.value.trim();
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));

  students = JSON.parse(localStorage.getItem("students")) || [];

  const newStudentData = {
    name: temp.name || "",
    subjects: temp.grades.map(g => ({
      subject: g.subject || "Unnamed Subject",
      grade: Number(g.grade || 0)
    })),
    overall: temp.grades.reduce((a, g) => a + Number(g.grade || 0), 0) / temp.grades.length
  };

  students.push(newStudentData);

  localStorage.setItem("students", JSON.stringify(students));
  sessionStorage.removeItem("tempSummary");

  alert("Student saved permanently!");
  loadTempSummary();
}

// ----------------- ADD SUBJECT (BACK TO GRADING) -----------------
function addSubject() {
  window.location.href = "grading.html";
}
