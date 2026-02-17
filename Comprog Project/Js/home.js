import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {

  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");

  // Menu functions
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

  const userNameDisplay = document.getElementById("userNameDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const studentCount = document.getElementById("studentCount");
  const averageGrade = document.getElementById("averageGrade");

  // Firebase: check if user is logged in
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email;
      userNameDisplay.innerText = formatUserName(email);

      if (loginBtn) loginBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";

      // Fetch students from Firebase Realtime Database
      const dbRef = ref(db, "students");
      try {
        const snapshot = await get(child(dbRef, ""));
        let students = [];
        if (snapshot.exists()) {
          // Convert snapshot object to array
          students = Object.values(snapshot.val());
        }

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

          if (averageGrade && graded > 0) {
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
    }
  });

  // Attach logout
  window.logout = async function () {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
});

// Format email for display
function formatUserName(email) {
  return email.replace("@gmail.com", "");
}
