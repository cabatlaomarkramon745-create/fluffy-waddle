<script type="module">
import { loadStudentFromCloud, waitForUser } from "./firebase.js";

waitForUser(async user => {

  const student = await loadStudentFromCloud(user.uid);

  if (!student) {
    document.getElementById("studentContainer").innerHTML =
      "<p>No saved student yet.</p>";
    return;
  }

  document.getElementById("studentContainer").innerHTML = `
    <h2>${student.name}</h2>
    <p>Section: ${student.section}</p>
  `;
});
</script>
