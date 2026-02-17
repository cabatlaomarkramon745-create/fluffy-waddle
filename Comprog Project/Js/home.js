  import { auth } from "./firebase.js";
  import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });

document.addEventListener("DOMContentLoaded", function () {

  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");

  // menu
  window.openMenu = function () {
    sideMenu.style.left = "0";
    overlay.style.display = "block";
  };

  window.closeMenu = function () {
    sideMenu.style.left = "-250px";
    overlay.style.display = "none";
  };

  window.toggleProfile = function (event) {
    event.stopPropagation();
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  };

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".profile-area")) {
      profileDropdown.style.display = "none";
    }
  });

  // login
  let user = localStorage.getItem("loggedInUser");

  if (user) {
    document.getElementById("userNameDisplay").innerText = formatUserName(user);

    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
  }

  // hide user display if no user
  if (!user) {
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay) userDisplay.style.display = "none";
  }

  // student count + average
  let students = JSON.parse(localStorage.getItem("students")) || [];

  const studentCount = document.getElementById("studentCount");
  if (studentCount) studentCount.innerText = students.length;

  if (students.length > 0) {
    let total = 0;
    let graded = 0;

    students.forEach(s => {
      if (typeof s.overall === "number") {   // FIXED (use overall not grade)
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

// outside so it can be used
function formatUserName(email) {
  return email.replace("@gmail.com", "");
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
