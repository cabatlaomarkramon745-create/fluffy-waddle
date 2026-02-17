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

// ================= SUMMARY.JS =================
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

// ----------------- LOAD TEMP SUMMARY (PREVIEW ONLY) -----------------
function loadTempSummary() {
  const temp = JSON.parse(localStorage.getItem("tempSummary"));

  list.innerHTML = "";
  avg.textContent = "0.00";
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

// ----------------- DELETE SUBJECT FROM TEMP ONLY -----------------
function deleteTempSubject(index) {
  let temp = JSON.parse(localStorage.getItem("tempSummary"));
  if (!temp || !temp.grades) return;

  temp.grades.splice(index, 1);

  localStorage.setItem("tempSummary", JSON.stringify(temp));
  loadTempSummary();
}

// ----------------- SAVE STUDENT NAME (TEMP ONLY) -----------------
function saveStudentName() {
  let temp = JSON.parse(localStorage.getItem("tempSummary")) || { name: "", grades: [] };

  temp.name = studentNameInput.value.trim(); // allow blank
  localStorage.setItem("tempSummary", JSON.stringify(temp));

  alert("Name saved in Summary (temp only).");
}

// ----------------- FINAL SAVE (TEMP -> STUDENTS) -----------------
function saveToStudents() {
  let temp = JSON.parse(localStorage.getItem("tempSummary"));

  if (!temp || !temp.grades || temp.grades.length === 0) {
    alert("No pending grades to save.");
    return;
  }

  // Always update temp name before saving
  temp.name = studentNameInput.value.trim();
  localStorage.setItem("tempSummary", JSON.stringify(temp));

  students = JSON.parse(localStorage.getItem("students")) || [];

  const studentIndex = localStorage.getItem("editStudentIndex");

  const newStudentData = {
    name: temp.name || "",
    subjects: temp.grades.map(g => ({
      subject: g.subject || "Unnamed Subject",
      grade: Number(g.grade || 0)
    })),
    overall: temp.grades.reduce((a, b) => a + Number(b.grade || 0), 0) / temp.grades.length
  };

  // If editing existing student → overwrite
  if (studentIndex !== null && students[studentIndex]) {
    students[studentIndex] = newStudentData;
    alert("Student updated!");
  } else {
    // Otherwise create new student
    students.push(newStudentData);
    alert("New student saved!");
  }

  localStorage.setItem("students", JSON.stringify(students));

  // Clear tempSummary after saving
  localStorage.removeItem("tempSummary");

  // Clear edit mode after saving
  localStorage.removeItem("editStudentIndex");
  localStorage.removeItem("editSubjectIndex");

  loadTempSummary();
}

// ----------------- ADD SUBJECT (GO TO GRADING) -----------------
function addSubject() {
  window.location.href = "grading.html";
}