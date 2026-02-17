// ===== FIREBASE =====
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {

  // ===== ELEMENTS =====
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userDisplay = document.getElementById("userDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const calculateBtn = document.getElementById("calculateBtn");
  const subjectInput = document.getElementById("subject");
  const subjectDropdown = document.getElementById("subjectDropdown");
  const subjectDropdownBtn = document.getElementById("subjectDropdownBtn");

  let currentUserId = null;

  // ===== MENU FUNCTIONS =====
  window.openMenu = () => { sideMenu.style.left = "0"; overlay.style.display = "block"; };
  window.closeMenu = () => { sideMenu.style.left = "-250px"; overlay.style.display = "none"; };
  window.toggleProfile = (e) => {
    e.stopPropagation();
    profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
  };
  window.logout = async () => {
    try { await signOut(auth); window.location.href = "login.html"; }
    catch(err){ console.error("Logout failed:", err);}
  };
  document.addEventListener("click", e => { if(!e.target.closest(".profile-area")) profileDropdown.style.display = "none"; });

  // ===== AUTH =====
  onAuthStateChanged(auth, async (user) => {
    if(user){
      currentUserId = user.uid;
      userDisplay.innerText = formatUserName(user.email);
      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      logoutBtn.style.display = "block";
      await loadQuizTotals();
      loadSavedInputs();
    } else {
      currentUserId = null;
      userDisplay.innerText = "Guest";
      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
      logoutBtn.style.display = "none";
    }
  });

  // ===== SUBJECT DROPDOWN =====
  if(subjectDropdown){
    subjectDropdown.querySelectorAll("div").forEach(div => {
      div.addEventListener("click", () => {
        subjectInput.value = div.dataset.subject;
        subjectDropdown.style.display = "none";
      });
    });
  }
  if(subjectDropdownBtn){
    subjectDropdownBtn.addEventListener("click", () => {
      subjectDropdown.style.display = subjectDropdown.style.display === "block" ? "none" : "block";
    });
  }

  // ===== VALIDATION =====
  function validateInputs(){
    const ids = ["subject","eScore","eMax","aScore","aMax","wQuiz","wExam","wAttend"];
    for(let id of ids){
      const el = document.getElementById(id);
      el.classList.remove("input-error");
      if(!el.value.trim()){ el.classList.add("input-error"); el.focus(); alert(`${id} is required`); return false; }
    }
    return true;
  }

  // ===== CALCULATE =====
  async function calculate(){
    if(!validateInputs()) return;
    if(!currentUserId) return alert("Please log in first");

    const subjectName = subjectInput.value.trim();
    const wQ = Number(document.getElementById("wQuiz").value);
    const wE = Number(document.getElementById("wExam").value);
    const wA = Number(document.getElementById("wAttend").value);

    if(wQ + wE + wA !== 100){ alert("Weights must total 100%"); return; }

    const qS = Number(document.getElementById("qScore").value);
    const qM = Number(document.getElementById("qMax").value);
    const eS = Number(document.getElementById("eScore").value);
    const eM = Number(document.getElementById("eMax").value);
    const aS = Number(document.getElementById("aScore").value);
    const aM = Number(document.getElementById("aMax").value);

    if(qS > qM || eS > eM || aS > aM){ alert("Scores cannot exceed max values"); return; }

    const finalGrade = ((qS/qM)*wQ + (eS/eM)*wE + (aS/aM)*wA).toFixed(2);
    document.getElementById("final").textContent = finalGrade;

    saveCurrentInputs();

    try{
      const gradeRef = ref(db, `grades/${currentUserId}/${subjectName}`);
      await set(gradeRef, {
        subject: subjectName,
        quizzes: [{score:qS,max:qM}],
        exam:eS, examMax:eM,
        attendance:aS, attendanceMax:aM,
        wQuiz:wQ, wExam:wE, wAttend:wA,
        overall: Number(finalGrade)
      });
      alert("Grade saved to Firebase!");
    } catch(err){ console.error("Error saving grade:", err); alert("Error saving grade"); }
  }

  // ===== LOAD QUIZ TOTALS =====
  async function loadQuizTotals(){
    if(!currentUserId) return;
    try{
      const snapshot = await get(ref(db, `grades/${currentUserId}`));
      let totalScore=0, totalMax=0;
      if(snapshot.exists()){
        const subjects = snapshot.val();
        for(let sub in subjects){
          (subjects[sub].quizzes || []).forEach(q => { totalScore += Number(q.score); totalMax += Number(q.max); });
        }
      }
      document.getElementById("qScore").value = totalScore;
      document.getElementById("qMax").value = totalMax;
    } catch(err){ console.error("Error loading quiz totals:", err); }
  }

  // ===== SAVE / LOAD INPUTS =====
  function saveCurrentInputs(){
    const data = {
      subject: subjectInput.value,
      eScore: document.getElementById("eScore").value,
      eMax: document.getElementById("eMax").value,
      aScore: document.getElementById("aScore").value,
      aMax: document.getElementById("aMax").value,
      wQuiz: document.getElementById("wQuiz").value,
      wExam: document.getElementById("wExam").value,
      wAttend: document.getElementById("wAttend").value
    };
    sessionStorage.setItem("gradingInputs", JSON.stringify(data));
  }

  function loadSavedInputs(){
    const data = JSON.parse(sessionStorage.getItem("gradingInputs"));
    if(!data) return;
    subjectInput.value = data.subject || "";
    document.getElementById("eScore").value = data.eScore || "";
    document.getElementById("eMax").value = data.eMax || 50;
    document.getElementById("aScore").value = data.aScore || "";
    document.getElementById("aMax").value = data.aMax || 100;
    document.getElementById("wQuiz").value = data.wQuiz || 40;
    document.getElementById("wExam").value = data.wExam || 40;
    document.getElementById("wAttend").value = data.wAttend || 20;
  }

  // ===== BUTTON EVENTS =====
  calculateBtn.addEventListener("click", calculate);

  // ===== UTILITY =====
  function formatUserName(email){ return email? email.replace("@gmail.com",""):"Guest"; }

});
