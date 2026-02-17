import { auth, saveStudentToCloud, waitForUser } from "./firebase.js";

let currentUser = null;

waitForUser(user => {
  currentUser = user;
  loadDraft();
});

// ===== AUTOSAVE WHILE EDITING =====
function getStudentForm() {
  return {
    name: document.getElementById("name").value,
    section: document.getElementById("section").value,
    subjects: JSON.parse(localStorage.getItem("subjectsDraft")) || []
  };
}

function autoSave() {
  localStorage.setItem("studentDraft", JSON.stringify(getStudentForm()));
}

// load draft when page opens
function loadDraft() {
  const draft = JSON.parse(localStorage.getItem("studentDraft"));
  if (!draft) return;

  document.getElementById("name").value = draft.name || "";
  document.getElementById("section").value = draft.section || "";
}

// attach autosave
document.querySelectorAll("input").forEach(el => {
  el.addEventListener("input", autoSave);
});

// ===== FINAL SAVE BUTTON =====
window.finalSave = async function() {
  const data = getStudentForm();

  if (!data.name) {
    alert("Student name required");
    return;
  }

  await saveStudentToCloud(currentUser.uid, data);

  localStorage.removeItem("studentDraft");

  alert("Saved permanently!");
  location.href = "student.html";
};
