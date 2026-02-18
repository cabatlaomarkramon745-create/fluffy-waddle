import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const profileDropdown = document.getElementById("profileDropdown");
  const userName = document.getElementById("userName");
  const userNameMain = document.getElementById("userNameMain");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Menu
  window.openMenu = () => { sideMenu.style.left = "0"; overlay.style.display="block"; }
  window.closeMenu = () => { sideMenu.style.left = "-250px"; overlay.style.display="none"; }

  // Profile dropdown
  window.toggleProfile = (e) => {
    e.stopPropagation();
    profileDropdown.style.display = profileDropdown.style.display==="block" ? "none":"block";
  }
  document.addEventListener("click", (e)=>{
    if(!e.target.closest(".profile-area")) profileDropdown.style.display="none";
  });

  // Auth
  const formatName = (email)=>email?email.split("@")[0]:"Guest";
  onAuthStateChanged(auth, user=>{
    if(user){
      const name = formatName(user.email);
      userName.innerText = name;
      userNameMain.innerText = name;
      loginBtn.style.display="none";
      registerBtn.style.display="none";
      logoutBtn.style.display="block";
    } else {
      userName.innerText = "Guest";
      userNameMain.innerText = "Guest";
      loginBtn.style.display="block";
      registerBtn.style.display="block";
      logoutBtn.style.display="none";
    }
  });

  // Logout
  window.logout = async () => {
    await signOut(auth);
    userName.innerText="Guest";
    userNameMain.innerText="Guest";
    loginBtn.style.display="block";
    registerBtn.style.display="block";
    logoutBtn.style.display="none";
  };
});
