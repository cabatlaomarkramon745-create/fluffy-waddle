async function calculate() {
  // ===== VALIDATION =====
  if (!validateGradingInputs()) return;
  if (!currentUserId) {
    alert("You must be logged in!");
    return;
  }

  // ===== GET INPUTS =====
  const subject = document.getElementById("subject").value.trim();
  const wQ = Number(document.getElementById("wQuiz").value);
  const wE = Number(document.getElementById("wExam").value);
  const wA = Number(document.getElementById("wAttend").value);

  if (wQ + wE + wA !== 100) {
    alert("Weights must total 100%");
    return;
  }

  const qS = Number(document.getElementById("qScore").value);
  const qM = Number(document.getElementById("qMax").value);
  const eS = Number(document.getElementById("eScore").value);
  const eM = Number(document.getElementById("eMax").value);
  const aS = Number(document.getElementById("aScore").value);
  const aM = Number(document.getElementById("aMax").value);

  if (qS > qM || eS > eM || aS > aM) {
    alert("Scores cannot exceed max values");
    return;
  }

  // ===== CALCULATE FINAL GRADE =====
  const finalGrade = ((qS / qM) * wQ + (eS / eM) * wE + (aS / aM) * wA).toFixed(2);
  document.getElementById("final").textContent = finalGrade;

  // ===== PUSH TO SESSION STORAGE =====
  let temp = JSON.parse(sessionStorage.getItem("tempSummary")) || { name: "", grades: [] };

  // Remove any previous grade for the same subject (optional, avoids duplicates)
  temp.grades = temp.grades.filter(g => g.subject !== subject);

  // Add the new grade
  temp.grades.push({
    subject: subject,
    grade: Number(finalGrade)
  });

  // Calculate total grading
  const gradingTotal = temp.grades.reduce((sum, g) => sum + g.grade, 0);

  // Save back to sessionStorage
  sessionStorage.setItem("tempSummary", JSON.stringify(temp));
  sessionStorage.setItem("gradingTotal", JSON.stringify(gradingTotal));

  // ===== SAVE TO FIREBASE =====
  try {
    await set(ref(db, `grades/${currentUserId}/${subject}`), {
      subject,
      quiz: qS,
      quizMax: qM,
      exam: eS,
      examMax: eM,
      attendance: aS,
      attendanceMax: aM,
      overall: Number(finalGrade)
    });
    alert("Grade calculated and added to Summary!");
  } catch (err) {
    console.error("Error saving grade:", err);
    alert("Failed to save grade to Firebase. Check console for details.");
  }
}
