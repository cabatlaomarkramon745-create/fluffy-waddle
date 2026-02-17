import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageDiv = document.getElementById("message");

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if (!email || !password) {
      showError("Please fill in both fields.");
      return;
    }

    if (!isValidEmail(email)) {
      showError("Use a valid Gmail.");
      return;
    }

    // Disable button during login
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Save user to localStorage
      localStorage.setItem("loggedInUser", email);
      
      showSuccess("✅ Login successful! Redirecting...");
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);

    } catch (error) {
      // Handle specific Firebase errors
      handleLoginError(error);
    } finally {
      // Re-enable button
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });

  // Allow Enter key to submit
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });
});

// Email validation helper
function isValidEmail(email) {
  // Must be a valid email AND end with @gmail.com
  const emailRegex = /^[^\s@]+@gmail\.com$/;
  return emailRegex.test(email);
}

// Error handler with user-friendly messages
function handleLoginError(error) {
  const errorMessages = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-email": "Invalid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many failed login attempts. Please try again later."
  };

  const message = errorMessages[error.code] || error.message;
  showError("❌ " + message);
}

// UI helper functions
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
