// ================= SUMMARY.JS =================
let students = [];
let studentNameInput;
let list;
let avg;

// DOMContentLoaded setup
document.addEventListener("DOMContentLoaded", () => {
  studentNameInput = document.getElementById("studentName");
  list = document.getElementById("list");
  avg = document.getElementById("avg");

  // Load students from localStorage
  students = JSON.parse(localStorage.getItem("students")) || [];

  // Load temporary summary from grading.html
  loadTempSummary();
});

// ----------------- LOAD TEMP SUMMARY -----------------
function loadTempSummary() {
  const temp = JSON.parse(localStorage.getItem("tempSummary"));

  list.innerHTML = "";
  avg.textContent = "0.00";
  if (!studentNameInput) return;

  studentNameInput.value = temp?.name || "";

  if (!temp || !temp.grades || temp.grades.length === 0) {
    list.innerHTML = "<p>No pending grades yet. Go to Grading first.</p>";
    return;
  }

  let total = 0;

  temp.grades.forEach((g, i) => {
    const gradeValue = Number(g.grade || 0);
    total += gradeValue;

    list.innerHTML += `
      <div class="subject-item">
        <strong>${g.subject || "Unnamed Subject"}</strong> - Grade: ${gradeValue.toFixed(2)}%
        <button onclick="deleteTempSubject(${i})">Delete</button>
      </div>
    `;
  });

  avg.textContent = (total / temp.grades.length).toFixed(2);
}

// ----------------- DELETE TEMP SUBJECT -----------------
function deleteTempSubject(index) {
  let temp = JSON.parse(localStorage.getItem("tempSummary"));
  if (!temp?.grades) return;

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

// ----------------- ADD SUBJECT (BACK TO GRADING) -----------------
function addSubject() {
  window.location.href = "grading.html";
}

// Make functions accessible from HTML buttons
window.saveStudentName = saveStudentName;
window.saveToStudents = saveToStudents;
window.addSubject = addSubject;
window.deleteTempSubject = deleteTempSubject;
