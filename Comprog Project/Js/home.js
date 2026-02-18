import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {

  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // ===== MENU =====
  window.openMenu = function () {
    if (sideMenu && overlay) {
      sideMenu.style.left = "0";
      overlay.style.display = "block";
    }
  };

  window.closeMenu = function () {
    if (sideMenu && overlay) {
      sideMenu.style.left = "-250px";
      overlay.style.display = "none";
    }
  };

  window.toggleProfile = function (event) {
    if (!profileDropdown) return;
    event.stopPropagation();
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  };

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".profile-area") && profileDropdown) {
      profileDropdown.style.display = "none";
    }
  });

  // ===== AUTH =====
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Show logged-in user
      if (userNameDisplay) userNameDisplay.innerText = formatUserName(user.email);

      if (loginBtn) loginBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";

    } else {
      // User not logged in -> redirect to login page
      window.location.href = "login.html";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // ===== STUDENT COUNT + AVERAGE =====
  let students = JSON.parse(localStorage.getItem("students")) || [];

  const studentCount = document.getElementById("studentCount");
  if (studentCount) studentCount.innerText = students.length;

  if (students.length > 0) {
    let total = 0;
    let graded = 0;

    students.forEach(s => {
      if (typeof s.overall === "number") {
        total += s.overall;
        graded++;
      }
    });

    const averageGrade = document.getElementById("averageGrade");
    if (averageGrade && graded > 0) {
      averageGrade.innerText = (total / graded).toFixed(1);
    }
  }

});

// ===== FUNCTIONS =====
function formatUserName(email) {
  return email ? email.replace("@gmail.com", "") : "";
}

function logout() {
  signOut(auth).then(() => {
    console.log("User logged out");
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
}
