import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const studentCount = document.getElementById("studentCount");
  const averageGrade = document.getElementById("averageGrade");

  // ===== MENU FUNCTIONS =====
  window.openMenu = () => { sideMenu.style.left="0"; overlay.style.display="block"; };
  window.closeMenu = () => { sideMenu.style.left="-250px"; overlay.style.display="none"; };
  window.toggleProfile = (e) => { e.stopPropagation(); profileDropdown.style.display=profileDropdown.style.display==="block"?"none":"block"; };
  document.addEventListener("click", e => { if(!e.target.closest(".profile-area")) profileDropdown.style.display="none"; });

  // ===== Firebase Auth & Realtime DB =====
  onAuthStateChanged(auth, async (user) => {
    if(user){
      const name = user.email.split("@")[0];
      userNameDisplay.innerText = name;
      loginBtn.style.display="none";
      registerBtn.style.display="none";
      logoutBtn.style.display="block";

      try{
        const snapshot = await get(ref(db,"students"));
        const students = snapshot.exists() ? Object.values(snapshot.val()) : [];
        studentCount.innerText = students.length;

        let total=0, graded=0;
        students.forEach(s => { if(typeof s.overall === "number"){ total+=s.overall; graded++; } });
        averageGrade.innerText = graded>0 ? (total/graded).toFixed(1) : "0.0";

      }catch(err){
        console.error("Error fetching students:", err);
      }

    } else {
      userNameDisplay.innerText="Guest";
      loginBtn.style.display="block";
      registerBtn.style.display="block";
      logoutBtn.style.display="none";
      studentCount.innerText="0";
      averageGrade.innerText="0.0";
    }
  });

  // ===== LOGOUT =====
  window.logout = async () => {
    try{
      await signOut(auth);
      window.location.href="login.html";
    }catch(err){
      console.error("Logout failed:", err);
    }
  };
});
