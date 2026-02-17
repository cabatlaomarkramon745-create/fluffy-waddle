import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  // ===== ELEMENTS =====
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
  window.openMenu = () => {
    if (sideMenu && overlay) {
      sideMenu.style.left = "0";
      overlay.style.display = "block";
    }
  };

  window.closeMenu = () => {
    if (sideMenu && overlay) {
      sideMenu.style.left = "-250px";
      overlay.style.display = "none";
    }
  };

  window.toggleProfile = (event) => {
    event.stopPropagation();
    if (profileDropdown) {
      profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
    }
  };

  // Close profile dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-area") && profileDropdown) {
      profileDropdown.style.display = "none";
    }
  });

  // ===== FIREBASE AUTH =====
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Show user info
      const email = user.email;
      if (userNameDisplay) {
        userNameDisplay.style.display = "inline";
        userNameDisplay.innerText = formatUserName(email);
      }

      // Toggle buttons
      loginBtn?.style.display = "none";
      registerBtn?.style.display = "none";
      logoutBtn?.style.display = "block";

      // Fetch students from Firebase
      try {
        const dbRef = ref(db, "students");
        const snapshot = await get(child(dbRef, ""));
        const students = snapshot.exists() ? Object.values(snapshot.val()) : [];

        if (studentCount) studentCount.innerText = students.length;

        if (students.length && averageGrade) {
          const total = students.reduce((sum, s) => typeof s.overall === "number" ? sum + s.overall : sum, 0);
          const gradedCount = students.filter(s => typeof s.overall === "number").length;
          if (gradedCount) averageGrade.innerText = (total / gradedCount).toFixed(1);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    } else {
      // No user logged in
      userNameDisplay?.style.setProperty("display", "none");
      logoutBtn?.style.setProperty("display", "none");
      loginBtn?.style.setProperty("display", "block");
      registerBtn?.style.setProperty("display", "block");
    }
  });

  // ===== LOGOUT =====
  window.logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
});

// ===== UTILITIES =====
function formatUserName(email) {
  return email ? email.replace("@gmail.com", "") : "Guest";
}
