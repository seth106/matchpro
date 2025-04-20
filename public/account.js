document.addEventListener("DOMContentLoaded", async function () {
    const usernameEl = document.getElementById("username");
    const phoneEl = document.getElementById("user-phone");
    const editProfileBtn = document.getElementById("edit-profile");

    const profileImgEl = document.getElementById("profile-img");
    const uploadImgInput = document.getElementById("upload-img");

    const toggleBioBtn = document.querySelector(".toggle-bio");
    const bioContainer = document.querySelector(".bio-content");
    const bioTextarea = document.getElementById("bio-text");
    const saveBioBtn = document.getElementById("save-bio");

    const balanceEl = document.getElementById("balance");
    const amountInput = document.getElementById("amount");
    const topUpBtn = document.getElementById("top-up");
    const withdrawBtn = document.getElementById("withdraw");

    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history");

    const logoutBtn = document.getElementById("logout");

    const API_BASE_URL = "http://localhost:5000/api/profile";
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // Ensure the user ID is stored in localStorage

    if (!token || !userId) {
        alert("Unauthorized! Please log in.");
        window.location.href = "auth.html";
    }
    
    let profileCreated = false; // Prevent infinite loop

    function generateDefaultAvatar(name = "User") {
        const canvas = document.createElement("canvas");
        const size = 60;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
    
        // Make the canvas circular with a clip
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
    
        // Background
        ctx.fillStyle = "#007bff";
        ctx.fillRect(0, 0, size, size);
    
        // Initials
        const initials = name
            .split(" ")
            .map((n) => n[0].toUpperCase())
            .join("")
            .substring(0, 2);
    
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initials, size / 2, size / 2);
    
        return canvas.toDataURL();
    }    

    async function fetchProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: "GET",
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Cache-Control": "no-cache, no-store, must-revalidate", // Prevent caching
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            });
    
            if (!response.ok) throw new Error("Failed to fetch profile");
    
            const profile = await response.json();
    
            if ((!profile || !profile.user?.name) && !profileCreated) {
                console.warn("No profile found, creating one...");
                profileCreated = true;
                await createProfile();
                return;
            }
            
            if (!profile.user) {
                console.error("Profile exists but missing user details!");
                return;
            }
    
            // ✅ Correctly set user details
            usernameEl.textContent = profile.user.name || "New User";
            phoneEl.textContent = profile.user.phone || "Not set";
            bioTextarea.value = profile.bio || "";
    
           
            // ✅ Set profile image (default if missing)
if (!profile.profilePicture) {
    console.warn("No profile picture found, generating default avatar...");
    const avatarDataUrl = generateDefaultAvatar(profile.user.name || "User");
    profileImgEl.src = avatarDataUrl;
    localStorage.setItem("userAvatar", avatarDataUrl); // Store generated avatar
} else {
    profileImgEl.src = profile.profilePicture;
    localStorage.setItem("userAvatar", profile.profilePicture); // Store uploaded avatar
}
localStorage.setItem("userName", profile.user.name || "User");
    
            // ✅ Ensure balance displays properly
            balanceEl.textContent = `$${profile.balance?.toFixed(2) || "0.00"}`;
    
            // ✅ Render transaction history
            historyList.innerHTML = profile.transactionHistory.length 
                ? profile.transactionHistory.map(tx => `<li>${tx}</li>`).join("")
                : `<li>No transactions yet</li>`;
    
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }
    

// 🔹 **Fixed createProfile Function**
async function createProfile() {
    try {
        const name = usernameEl.textContent !== "New User" ? usernameEl.textContent : null;
        const phone = phoneEl.textContent !== "Not set" ? phoneEl.textContent : null;

        const requestBody = { userId };
        if (name) requestBody.name = name;
        if (phone) requestBody.phone = phone;

        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || "Failed to create profile");
        }

    } catch (error) {
        console.error("Error creating profile:", error);
    }
}


// 🚀 Call fetchProfile on page load
await fetchProfile();

    // **🔹 Edit Profile**
    editProfileBtn.addEventListener("click", async function () {
        const newName = prompt("Enter your new name:", usernameEl.textContent);
        const newPhone = prompt("Enter your phone number:", phoneEl.textContent);

        if (!newName && !newPhone) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newName, phone: newPhone })
            });

            if (!response.ok) throw new Error("Failed to update profile");

            await fetchProfile();

        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });

    // **🔹 Profile Picture Upload**
    profileImgEl.addEventListener("click", () => uploadImgInput.click());

    uploadImgInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePicture", file);

        try {
            const response = await fetch(`${API_BASE_URL}/${userId}/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to upload image");

            await fetchProfile();

        } catch (error) {
            console.error("Error uploading profile picture:", error);
        }
    });

    // **🔹 Toggle & Save Bio**
    toggleBioBtn.addEventListener("click", () => bioContainer.classList.toggle("hidden"));

    saveBioBtn.addEventListener("click", async function () {
        const bioText = bioTextarea.value.trim();
        if (!bioText) return alert("Bio cannot be empty.");

        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ bio: bioText })
            });

            if (!response.ok) throw new Error("Failed to update bio");

            await fetchProfile();

        } catch (error) {
            console.error("Error updating bio:", error);
        }
    });

    // **🔹 Wallet: Top-up & Withdraw**
    async function updateBalance(amount, type) {
        try {
            const phoneNumber = prompt("Enter your M-Pesa phone number");
            if (!phoneNumber) return alert("Phone number is required!");
    
            const endpoint = type === "top-up" 
                ? `${API_BASE_URL}/${userId}/mpesa/top-up` 
                : `${API_BASE_URL}/${userId}/mpesa/withdraw`;
    
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ amount, phone: phoneNumber })
            });
    
            const responseData = await response.json();
    
            if (!response.ok) {
                throw new Error(responseData.message || "Failed to process transaction");
            }
    
            alert(responseData.message || "Transaction initiated. Awaiting confirmation...");
    
            if (type === "top-up") await checkMpesaStatus(responseData.transactionId);
    
            await fetchProfile();
            await fetchTransactionHistory();
        } catch (error) {
            console.error("Error processing transaction:", error);
            alert(error.message);
        }
    }
    
    async function checkMpesaStatus(transactionId) {
        try {
            let status = "PENDING";
            while (status === "PENDING") {
                const response = await fetch(`${API_BASE_URL}/mpesa/status/${transactionId}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
    
                if (!response.ok) break;
    
                const { transactionStatus } = await response.json();
                status = transactionStatus;
    
                if (status === "CONFIRMED") {
                    alert("Top-up successful!");
                    await fetchProfile();
                    await fetchTransactionHistory();
                    return;
                }
    
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
    
            alert("M-Pesa payment failed or was not confirmed in time.");
        } catch (error) {
            console.error("Error checking M-Pesa status:", error);
            alert("Could not verify transaction status.");
        }
    }
    
    topUpBtn.addEventListener("click", async function () {
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount.");
    
        await updateBalance(amount, "top-up");
        amountInput.value = "";
    });
    
    withdrawBtn.addEventListener("click", async function () {
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount.");
    
        await updateBalance(amount, "withdraw");
        amountInput.value = "";
    });
    
    async function fetchTransactionHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}/transactions`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch transaction history");
            }
    
            const transactionHistory = await response.json();
            displayTransactionHistory(transactionHistory);
        } catch (error) {
            console.error("Error fetching transaction history:", error);
            alert(error.message);
        }
    }
    
    function displayTransactionHistory(history) {
        const historyContainer = document.getElementById("history-list");
        historyContainer.innerHTML = "";
    
        if (!history.length) {
            historyContainer.innerHTML = "<p>No transactions yet.</p>";
            return;
        }
    
        history.forEach((transaction) => {
            const transactionItem = document.createElement("div");
            transactionItem.classList.add("transaction-item");
            transactionItem.innerHTML = `
                <span class="${transaction.type === 'top-up' ? 'text-green' : 'text-red'}">
                    ${transaction.type.toUpperCase()}
                </span>
                <span>Amount: $${transaction.amount.toFixed(2)}</span>
                <span>${new Date(transaction.date).toLocaleString()}</span>
            `;
            historyContainer.appendChild(transactionItem);
        });
    }
    
    clearHistoryBtn.addEventListener("click", async function () {
        if (!confirm("Are you sure you want to clear all transaction history?")) return;
    
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}/history/clear`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to clear history");
            }
    
            await fetchProfile();
            await fetchTransactionHistory();
        } catch (error) {
            console.error("Error clearing history:", error);
            alert(error.message);
        }
    });
    
    // **🔹 Logout**
    logoutBtn.addEventListener("click", function () {
        if (confirm("Do you want to log out?")) {
            localStorage.clear();
            window.location.href = "auth.html";
        }
    });
});
