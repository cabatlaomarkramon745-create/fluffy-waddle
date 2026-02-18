import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// auto redirect if already logged in 
onAuthStateChanged(auth, (user) => {
  if(user){
    window.location.href = "grading.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageDiv = document.getElementById("message");

  loginBtn.addEventListener("click", async () => {
    let email = emailInput.value.trim().toLowerCase(); // lowercase for consistency
    let password = passwordInput.value.trim();

    if (!email || !password) {
      showError("Please fill in both fields.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Login successful:", user);

      // Optionally save logged in email locally
      localStorage.setItem("loggedInUser", email);

      showSuccess("✅ Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);

    } catch (error) {
      console.error("Firebase login error:", error); // debug
      handleLoginError(error);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });

  // Press Enter to login (works on both email & password fields)
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") loginBtn.click();
    });
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
