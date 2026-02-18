import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const profileNameDisplay = document.getElementById("profileNameDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Menu
  window.openMenu = () => { sideMenu.style.left = "0"; overlay.style.display = "block"; };
  window.closeMenu = () => { sideMenu.style.left = "-250px"; overlay.style.display = "none"; };

  // Profile dropdown
  window.toggleProfile = (e) => {
    e.stopPropagation();
    profileDropdown.style.display = (profileDropdown.style.display === "block") ? "none" : "block";
  };
  document.addEventListener("click", e => {
    if (!e.target.closest(".profile-area")) profileDropdown.style.display = "none";
  });

  // Firebase auth
  onAuthStateChanged(auth, async user => {
    if (user) {
      const email = user.email;
      userNameDisplay.innerText = formatUserName(email);
      profileNameDisplay.innerText = formatUserName(email);

      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      logoutBtn.style.display = "block";
    } else {
      userNameDisplay.innerText = "Guest";
      profileNameDisplay.innerText = "Guest";
      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
      logoutBtn.style.display = "none";
    }
  });

  // Logout
  window.logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
});

// Utility
function formatUserName(email) {
  if (!email) return "Guest";
  return email.split("@")[0];
}
