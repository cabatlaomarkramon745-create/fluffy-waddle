import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageDiv = document.getElementById("message");

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showError("Please fill in both fields.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      await signInWithEmailAndPassword(auth, email, password);

      showSuccess("✅ Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);

    } catch (error) {
      handleLoginError(error);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });

  // Press Enter to login
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });
});

function handleLoginError(error) {
  const errorMessages = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-email": "Invalid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many failed attempts. Try again later."
  };

  const message = errorMessages[error.code] || error.message;
  showError("❌ " + message);
}

function showError(message) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  messageDiv.style.color = "red";
}

function showSuccess(message) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  messageDiv.style.color = "green";
}
