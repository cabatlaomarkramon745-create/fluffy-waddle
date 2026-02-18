import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Menu functions
  window.openMenu = () => {
    sideMenu.style.left = "0";
    overlay.style.display = "block";
  };

  window.closeMenu = () => {
    sideMenu.style.left = "-250px";
    overlay.style.display = "none";
  };

  // Profile dropdown
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

  // Format email to display name
  const formatUserName = (email) => {
    if (!email) return "Guest";
    return email.split("@")[0];
  };

  // Firestore: check if user is logged in
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email;
      userNameDisplay.innerText = formatUserName(email);

      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      logoutBtn.style.display = "block";

      // OPTIONAL: load extra info about user from Firestore
      try {
        const userDoc = await getDoc(doc(db, "students", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("Student data:", data);
          // e.g., display student's full name somewhere
        }
      } catch (err) {
        console.error("Error loading student data:", err);
      }

    } else {
      userNameDisplay.innerText = "Guest";
      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
      logoutBtn.style.display = "none";
    }
  });

  // Logout
  window.logout = async () => {
    try {
      await signOut(auth);
      userNameDisplay.innerText = "Guest";
      loginBtn.style.display = "block";
      registerBtn.style.display = "block";
      logoutBtn.style.display = "none";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

});
