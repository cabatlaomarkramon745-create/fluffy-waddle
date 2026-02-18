import { auth } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageDiv = document.getElementById("message");

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Pick ONE destination. I chose home.html based on your other code.
    window.location.href = "home.html"; 
  }
});

// Login Function
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage("Please fill in all fields.", "red");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showMessage("✅ Login successful! Redirecting...", "green");
            // No need to manually redirect here; onAuthStateChanged will handle it
        } catch (error) {
            console.error(error);
            handleError(error);
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
        }
    });
}

function handleError(error) {
    let msg = "An error occurred.";
    switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            msg = "Invalid email or password.";
            break;
        case "auth/too-many-requests":
            msg = "Too many failed attempts. Try again later.";
            break;
    }
    showMessage(msg, "red");
}

function showMessage(text, color) {
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.style.color = color;
    } else {
        alert(text);
    }
}
