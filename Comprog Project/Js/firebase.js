// Import the functions you need from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyDDNz-1PjZE3AJbB6LlkMGiSrzjGyPAqho",
  authDomain: "comprog-project-account.firebaseapp.com",
  databaseURL: "https://comprog-project-account-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "comprog-project-account",
  storageBucket: "comprog-project-account.firebasestorage.app",
  messagingSenderId: "256831010069",
  appId: "1:256831010069:web:86b0314ab907232a7ba51c",
  measurementId: "G-1BH1RCXW7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ===== EXPORT AUTH & DB =====
export const auth = getAuth(app);
export const db = getDatabase(app);
