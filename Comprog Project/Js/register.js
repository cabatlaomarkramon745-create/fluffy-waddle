import { auth, db } from "../firebase.js";

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");

  registerBtn.addEventListener("click", async () => {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!fullName || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store extra info in Realtime Database
      await set(ref(db, "users/" + user.uid), {
        fullName: fullName,
        email: email,
        createdAt: new Date().toISOString()
      });

      alert("✅ Account created successfully!");
      window.location.href = "login.html";

    } catch (error) {
      alert("❌ " + error.message);
    }
  });
});

