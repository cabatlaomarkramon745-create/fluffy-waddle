import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageDiv = document.getElementById("message");

  registerBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Check empty fields
    if (username === "" || email === "" || password === "") {
      showError("Please fill in all fields.");
      return;
    }

    // Check gmail
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      showError("Please enter a valid Gmail address (@gmail.com).");
      return;
    }

    // Check localStorage for duplicate email
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.some(u => u.email === email);
    if (exists) {
      showError("Email already registered.");
      return;
    }

    // Disable button during registration
    registerBtn.disabled = true;
    registerBtn.textContent = "Creating account...";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store in Firebase Realtime Database
      await set(ref(db, "users/" + user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString()
      });

      // Also save to localStorage as backup
      const newUser = {
        username: username,
        email: email,
        password: password
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Log in user
      localStorage.setItem("loggedInUser", email);

      showSuccess("✅ Account created successfully! Redirecting...");
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1500);

    } catch (error) {
      handleRegisterError(error);
    } finally {
      // Re-enable button
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  });

  // Allow Enter key to submit
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      registerBtn.click();
    }
  });
});

// Error handler with user-friendly messages
function handleRegisterError(error) {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Invalid email address.",
    "auth/operation-not-allowed": "Registration is currently disabled.",
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
}});

