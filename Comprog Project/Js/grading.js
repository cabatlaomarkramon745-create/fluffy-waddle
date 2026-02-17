import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {

  // Elements
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const studentCount = document.getElementById("studentCount");
  const averageGrade = document.getElementById("averageGrade");

  // ===== MENU FUNCTIONS =====
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
    event.stopPropagation();
    if (profileDropdown) {
      profileDropdown.style.display =
        profileDropdown.style.display === "block" ? "none" : "block";
    }
  };

  // Close profile dropdown if clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".profile-area") && profileDropdown) {
      profileDropdown.style.display = "none";
    }
  });

  // ===== FIREBASE USER STATE =====
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email;
      if (userNameDisplay) {
        userNameDisplay.style.display = "inline";
        userNameDisplay.innerText = formatUserName(email);
      }

      if (loginBtn) loginBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";

      // Fetch students from Firebase Realtime Database
      const dbRef = ref(db, "students");
      try {
        const snapshot = await get(child(dbRef, ""));
        let students = [];
        if (snapshot.exists()) {
          students = Object.values(snapshot.val());
        }

        if (studentCount) studentCount.innerText = students.length;

        if (students.length > 0 && averageGrade) {
          let total = 0;
          let graded = 0;

          students.forEach(s => {
            if (typeof s.overall === "number") {
              total += s.overall;
              graded++;
            }
          });

          if (graded > 0) {
            averageGrade.innerText = (total / graded).toFixed(1);
          }
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      }

    } else {
      // No user logged in
      if (userNameDisplay) userNameDisplay.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (loginBtn) loginBtn.style.display = "block";
      if (registerBtn) registerBtn.style.display = "block";
    }
  });

  // ===== LOGOUT FUNCTION =====
  window.logout = async function () {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
});

// ===== UTILITY =====
function formatUserName(email) {
  if (!email) return "Guest";
  return email.replace("@gmail.com", "");
}
