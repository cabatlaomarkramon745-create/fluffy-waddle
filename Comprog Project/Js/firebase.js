// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PASTE HERE",
  authDomain: "PASTE HERE",
  projectId: "PASTE HERE",
  storageBucket: "PASTE HERE",
  messagingSenderId: "PASTE HERE",
  appId: "PASTE HERE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// ===== SAVE FINAL STUDENT =====
export async function saveStudentToCloud(uid, studentData) {
  await setDoc(doc(db, "students", uid), studentData);
}

// ===== LOAD STUDENT =====
export async function loadStudentFromCloud(uid) {
  const snap = await getDoc(doc(db, "students", uid));
  return snap.exists() ? snap.data() : null;
}

// ===== AUTH HELPER =====
export function waitForUser(callback) {
  onAuthStateChanged(auth, user => {
    if (user) callback(user);
    else location.href = "index.html";
  });
}
