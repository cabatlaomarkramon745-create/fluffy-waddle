function registerUser() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageDiv = document.getElementById("message");

  // Check empty fields
  if (username === "" || email === "" || password === "") {
    messageDiv.textContent = "Please fill in all fields.";
    return;
  }

  // Check gmail
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    messageDiv.textContent = "Please enter a valid Gmail address (@gmail.com).";
    return;
  }

 
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Prevent duplicate email
  const exists = users.some(u => u.email === email);
  if (exists) {
    messageDiv.textContent = "Email already registered.";
    return;
  }

  // Save usser
  const newUser = {
    username: username,
    email: email,
    password: password
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // log in
  localStorage.setItem("loggedInUser", email);

  messageDiv.textContent = "";
  window.location.href = "home.html";
}
