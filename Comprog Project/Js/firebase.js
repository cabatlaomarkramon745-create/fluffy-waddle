// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your Firebase project config (copy exactly from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDDNz-1PjZE3AJbB6LlkMGiSrzjGyPAqho",
  authDomain: "comprog-project-account.firebaseapp.com",
  databaseURL: "https://comprog-project-account-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "comprog-project-account",
  storageBucket: "comprog-project-account.firebasestorage.app",
  messagingSenderId: "256831010069",
  appId: "1:256831010069:web:86b0314ab907232a7ba51c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
