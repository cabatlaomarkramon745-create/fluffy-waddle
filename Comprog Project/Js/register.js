import { auth, db } from "./firebase.js";
import { 
    createUserWithEmailAndPassword, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const registerBtn = document.getElementById("registerBtn");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageDiv = document.getElementById("message");

// SHOW PASSWORD
const showPasswordCheckbox = document.getElementById("showPassword");

//PASSWORD VISIBLE
if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener("change", () => {
        passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
    });
}

//PASSWORD STRENGTH VALIDATION
function isStrongPassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 6;

    return hasUppercase && hasNumber && hasSymbol && hasMinLength;
}

if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !email || !password) {
            showMessage("All fields are required.", "red");
            return;
        }

       //PASSWORD VALIDATION
        if (!isStrongPassword(password)) {
            showMessage(
                "Password must contain at least 1 capital letter, 1 number, and 1 symbol.",
                "red"
            );
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = "Creating account...";

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            await set(ref(db, "users/" + user.uid), {
                username: username,
                email: email,
                role: "student", 
                createdAt: new Date().toISOString()
            });

            showMessage("✅ Account created! Redirecting...", "green");
            setTimeout(() => window.location.href = "home.html", 1500);

        } catch (error) {
            console.error(error);
            handleError(error);
            registerBtn.disabled = false;
            registerBtn.textContent = "Register";
        }
    });
}

function handleError(error) {
    let msg = error.message;
    if (error.code === "auth/email-already-in-use") msg = "Email is already registered.";
    if (error.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
    showMessage(msg, "red");
}

function showMessage(text, color) {
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.style.color = color;
    }
}
