import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const messageDiv = document.getElementById("message");

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
                // Attempt to log in
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("Login successful:", userCredential.user.email);

                showMessage("✅ Login successful! Redirecting...", "green");

                // Redirect immediately after login
                window.location.href = "home.html";

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

});
