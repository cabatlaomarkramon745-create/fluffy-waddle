import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const userNameDisplay = document.getElementById("userNameDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const studentCount = document.getElementById("studentCount");
const averageGrade = document.getElementById("averageGrade");

// Handle Auth State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        console.log("User detected:", user.email);
        
        // Use displayName if available, fallback to email prefix
        const displayName = user.displayName || user.email.split("@")[0];
        if(userNameDisplay) userNameDisplay.innerText = displayName;

        // Load Data
        loadDashboardData();
    } else {
        // User is NOT logged in - Redirect to login
        window.location.href = "login.html";
    }
});

// Fetch Dashboard Data
async function loadDashboardData() {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, "students"));
        
        if (snapshot.exists()) {
            const students = Object.values(snapshot.val());
            
            // Update UI
            if(studentCount) studentCount.innerText = students.length;
            
            // Calculate Average
            let total = 0, count = 0;
            students.forEach(s => {
                if (s.overall && !isNaN(s.overall)) {
                    total += Number(s.overall);
                    count++;
                }
            });

            if (count > 0 && averageGrade) {
                averageGrade.innerText = (total / count).toFixed(1);
            }
        } else {
            if(studentCount) studentCount.innerText = "0";
            if(averageGrade) averageGrade.innerText = "N/A";
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Logout Function
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout failed", error);
        }
    });
}
