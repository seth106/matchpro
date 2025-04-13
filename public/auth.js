const API_URL = "http://localhost:5000/api/auth"; // Backend API URL

// 🔄 Toggle Between Register & Login Forms
function toggleForms() {
    document.getElementById("register-form").classList.toggle("hidden");
    document.getElementById("login-form").classList.toggle("hidden");
}

// ✅ Register User with Password
async function registerUser() {
    const name = document.getElementById("reg-name").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const confirmPassword = document.getElementById("reg-confirm-password").value.trim();
    const errorMsg = document.getElementById("reg-error");

    // Debugging: Log values to check if phone is null or empty
    console.log("Registering user:", { name, phone, password });

    if (!name || !phone || !password || !confirmPassword) {
        errorMsg.textContent = "All fields are required!";
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match!";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/register", {  // Use full URL for debugging
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, password })
        });

        const data = await response.json();
        console.log("Server Response:", data); // Debugging

        if (response.ok) {
            alert("Registration successful!");
            toggleForms(); // Switch to login form
        } else {
            errorMsg.textContent = data.message || "Registration failed!";
        }
    } catch (error) {
        console.error("Error:", error);
        errorMsg.textContent = "Something went wrong. Try again.";
    }
}


// ✅ Login User with Phone Number & Password
async function loginUser() {
    const phone = document.getElementById("login-phone").value;
    const password = document.getElementById("login-password").value;
    const errorMsg = document.getElementById("login-error");

    if (!phone || !password) {
        errorMsg.innerText = "Phone number and password are required!";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorMsg.innerText = data.error;
            return;
        }

        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // 🔹 Decode token & store userId separately
        const decodedToken = JSON.parse(atob(data.token.split(".")[1])); // Decode JWT payload
        localStorage.setItem("userId", decodedToken.userId);

        console.log("✅ Stored userId:", localStorage.getItem("userId"));

        alert("✅ Login successful!");
        window.location.href = "account.html"; // Redirect to account page
    } catch (error) {
        console.error("Error:", error);
        errorMsg.innerText = "❌ Server error, try again!";
    }
}

