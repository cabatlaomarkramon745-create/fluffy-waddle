import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userNameDisplayMain = document.getElementById("userNameDisplayMain");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // ===== MENU =====
  window.openMenu = () => {
    sideMenu.style.left = "0";
    overlay.style.display = "block";
  };

  window.closeMenu = () => {
    sideMenu.style.left = "-250px";
    overlay.style.display = "none";
  };

  // ===== PROFILE DROPDOWN =====
  window.toggleProfile = (event) => {
    event.stopPropagation();
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-area")) {
      profileDropdown.style.display = "none";
    }
  });

  // ===== AUTH =====
  const formatUserName = (email) => email ? email.split("@")[0] : "Guest";

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const name = formatUserName(user.email);
      userNameDisplay.innerText = name;
      userNameDisplayMain.innerText = name;
      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      logoutBtn.style.display = "block";
    } else {
      userNameDisplay.innerText = "Guest";
      userNameDisplayMain.innerText = "Guest";
      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
      logoutBtn.style.display = "none";
    }
  });

  // ===== LOGOUT =====
  window.logout = async () => {
    try {
      await signOut(auth);
      userNameDisplay.innerText = "Guest";
      userNameDisplayMain.innerText = "Guest";
      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
      logoutBtn.style.display = "none";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
});
