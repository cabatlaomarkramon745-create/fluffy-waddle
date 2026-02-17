function goToHome() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageDiv = document.getElementById("message");

  if (username === "" || password === "") {
    messageDiv.textContent = "Please fill in both fields.";
    return;
  }

  if (!username.toLowerCase().endsWith("@gmail.com")) {
    messageDiv.textContent = "Use a valid Gmail.";
    return;
  }

  // save user
  localStorage.setItem("loggedInUser", username);

  window.location.href = "home.html";
}
