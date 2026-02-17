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

  // ===== MENU & PROFILE =====
  window.openMenu = () => { sideMenu.style.left = "0"; overlay.style.display = "block"; };
  window.closeMenu = () => { sideMenu.style.left = "-250px"; overlay.style.display = "none"; };
  window.toggleProfile = (e) => {
    e.stopPropagation();
    profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
  };
  window.logout = () => { alert("Logout function goes here"); };
  document.addEventListener("click", e => { if(!e.target.closest(".profile-area")) profileDropdown.style.display = "none"; });

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

  // ===== CALCULATION =====
  calculateBtn.addEventListener("click", () => {
    const qS = Number(document.getElementById("qScore").value) || 0;
    const qM = Number(document.getElementById("qMax").value) || 1;
    const eS = Number(document.getElementById("eScore").value) || 0;
    const eM = Number(document.getElementById("eMax").value) || 1;
    const aS = Number(document.getElementById("aScore").value) || 0;
    const aM = Number(document.getElementById("aMax").value) || 1;

    const wQ = Number(document.getElementById("wQuiz").value) || 0;
    const wE = Number(document.getElementById("wExam").value) || 0;
    const wA = Number(document.getElementById("wAttend").value) || 0;

    if(wQ + wE + wA !== 100){ alert("Weights must total 100"); return; }

    const final = ((qS/qM)*wQ + (eS/eM)*wE + (aS/aM)*wA).toFixed(2);
    document.getElementById("final").textContent = final;
    saveInputs();
  });

  // ===== SESSION STORAGE =====
  function saveInputs(){
    const data = {
      subject: subjectInput.value,
      qScore: document.getElementById("qScore").value,
      qMax: document.getElementById("qMax").value,
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

  function loadInputs(){
    const data = JSON.parse(sessionStorage.getItem("gradingInputs"));
    if(!data) return;
    subjectInput.value = data.subject || "";
    document.getElementById("qScore").value = data.qScore || "";
    document.getElementById("qMax").value = data.qMax || "";
    document.getElementById("eScore").value = data.eScore || "";
    document.getElementById("eMax").value = data.eMax || 50;
    document.getElementById("aScore").value = data.aScore || "";
    document.getElementById("aMax").value = data.aMax || 100;
    document.getElementById("wQuiz").value = data.wQuiz || 40;
    document.getElementById("wExam").value = data.wExam || 40;
    document.getElementById("wAttend").value = data.wAttend || 20;
  }

  loadInputs();

});
