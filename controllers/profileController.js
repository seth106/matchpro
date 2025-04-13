const Profile = require("../models/Profile");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
require("dotenv").config();
const getMpesaToken = require("../utils/mpesaAuth");

// Multer Configuration (for handling profile picture uploads)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Ensure you have an "uploads" folder
    },
    filename: function (req, file, cb) {
        cb(null, req.user.id + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single("profilePicture");

// ✅ Create Profile API
exports.createProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Check if profile already exists
        const existingProfile = await Profile.findOne({ user: userId });
        if (existingProfile) {
            return res.status(400).json({ error: "Profile already exists" });
        }

        // Fetch user details (Ensure required fields exist)
        const user = await User.findById(userId).select("phone name");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.phone) {
            return res.status(400).json({ error: "Phone number is required for profile creation." });
        }

        if (!user.name) {
            return res.status(400).json({ error: "Username is required for profile creation." });
        }

        // Create new profile
        const newProfile = new Profile({
            user: userId,
            username: user.name, // Ensure username is set
            phone: user.phone,       // Ensure phone is set
            profilePicture: "default.jpg",
            bio: "",
            balance: 0,
            transactionHistory: [],
        });

        await newProfile.save();

        return res.status(201).json({ message: "Profile created successfully", profile: newProfile });
    } catch (error) {
        console.error("❌ Error creating profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/// **🔹 Get User Profile (Auto-create if not found)**
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("📌 Received userId:", userId);

        if (!userId) {
            return res.status(400).json({ message: "Bad Request: No user ID provided" });
        }

        // **Find profile and populate user details**
        let profile = await Profile.findOne({ user: userId }).populate("user", "name phone");

        // **Auto-create profile if not found**
        if (!profile) {
            console.log("⚠️ No profile found, creating a new profile...");
            const user = await User.findById(userId).select("name phone");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.phone) {
                return res.status(400).json({ message: "Phone number is required for profile creation." });
            }

            if (!user.name) {
                return res.status(400).json({ message: "Name is required for profile creation." });
            }

            // ✅ Create new profile
            profile = await Profile.create({
                user: userId,
                profilePicture: "", // ✅ Matches default in schema
                bio: "",
                balance: 1000, // ✅ Matches schema default
                transactionHistory: [],
                createdAt: new Date(), // ✅ Matches schema default
            });
            
            // ✅ Re-fetch profile after creation to populate `user` field
            profile = await Profile.findOne({ user: userId }).populate("user", "name phone");
        }

        // **Return Profile with Proper User Data**
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.json({
            user: {
                name: profile.user?.name || "Unknown",
                phone: profile.user?.phone || "Unknown"
            },
            bio: profile.bio,
            profilePicture: profile.profilePicture,
            balance: profile.balance,
            transactionHistory: profile.transactionHistory
        });
        
    } catch (error) {
        console.error("❌ Error retrieving profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **🔹 Update Profile (Profile Picture & Bio)**
exports.updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID found" });
        }

        const { bio } = req.body;
        let profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        if (bio) profile.bio = bio;

        await profile.save();
        res.json({ message: "Profile updated successfully", profile });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **🔹 Upload Profile Picture**
exports.uploadProfilePicture = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ message: "File upload failed", error: err.message });
        }

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (!profile) {
                return res.status(404).json({ message: "Profile not found" });
            }

            profile.profilePicture = `/uploads/${req.file.filename}`;
            await profile.save();

            res.json({ message: "Profile picture updated", profilePicture: profile.profilePicture });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    });
};

// **🔹 Update Username & Phone**
exports.updateUserInfo = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID found" });
        }

        const { name, phone } = req.body;
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **🔹 Wallet: Top-up Balance**
exports.topUpBalance = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID found" });
        }

        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Enter a valid amount." });
        }

        let profile = await Profile.findOne({ user: req.user.id });

        // **Auto-create profile if not found**
        if (!profile) {
            profile = new Profile({
                user: req.user.id,
                balance: 0,
                transactionHistory: []
            });
        }

        profile.balance += amount;
        profile.transactionHistory.push({ type: "top-up", amount, date: new Date() });

        await profile.save();
        res.json({ message: "Top-up successful", balance: profile.balance });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **🔹 Wallet: Withdraw Balance**
exports.withdrawBalance = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID found" });
        }

        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Enter a valid amount." });
        }

        let profile = await Profile.findOne({ user: req.user.id });

        // **Auto-create profile if not found**
        if (!profile) {
            profile = new Profile({
                user: req.user.id,
                balance: 0,
                transactionHistory: []
            });
        }

        if (amount > profile.balance) {
            return res.status(400).json({ message: "Insufficient balance!" });
        }

        profile.balance -= amount;
        profile.transactionHistory.push({ type: "withdraw", amount, date: new Date() });

        await profile.save();
        res.json({ message: "Withdrawal successful", balance: profile.balance });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **🔹 Get Transaction History**
exports.getTransactionHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID found" });
        }

        let profile = await Profile.findOne({ user: req.user.id });

        // **Auto-create profile if not found**
        if (!profile) {
            profile = new Profile({
                user: req.user.id,
                balance: 0,
                transactionHistory: []
            });

            await profile.save();
        }

        res.json(profile.transactionHistory);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **🔹 Clear Transaction History**
exports.clearTransactionHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user ID found" });
        }

        let profile = await Profile.findOne({ user: req.user.id });

        // **Auto-create profile if not found**
        if (!profile) {
            profile = new Profile({
                user: req.user.id,
                balance: 0,
                transactionHistory: []
            });

            await profile.save();
        }

        profile.transactionHistory = [];
        await profile.save();

        res.json({ message: "Transaction history cleared" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **🔹 M-Pesa STK Push for Top-Up**
exports.mpesaTopUp = async (req, res) => {
    try {
        const { phone, amount } = req.body;
        if (!phone || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid phone number or amount" });
        }

        const token = await getMpesaToken();
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
        const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

        const requestBody = {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phone,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: "MatchPro",
            TransactionDesc: "Wallet Top-up",
        };

        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        res.json({ message: "STK Push Sent", response: response.data });
    } catch (error) {
        res.status(500).json({ message: "M-Pesa Error", error: error.response?.data || error.message });
    }
};

// **🔹 M-Pesa B2C Withdrawal**
exports.mpesaWithdraw = async (req, res) => {
    try {
        const { phone, amount } = req.body;
        if (!phone || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid phone number or amount" });
        }

        const token = await getMpesaToken();

        const requestBody = {
            InitiatorName: "api_initiator",
            SecurityCredential: "your_encrypted_security_credential",
            CommandID: "BusinessPayment",
            Amount: amount,
            PartyA: process.env.MPESA_SHORTCODE,
            PartyB: phone,
            Remarks: "Wallet Withdrawal",
            QueueTimeOutURL: process.env.MPESA_CALLBACK_URL,
            ResultURL: process.env.MPESA_CALLBACK_URL,
            Occasion: "Withdraw",
        };

        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest", requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        res.json({ message: "Withdrawal initiated", response: response.data });
    } catch (error) {
        res.status(500).json({ message: "M-Pesa Error", error: error.response?.data || error.message });
    }
};

// **🔹 M-Pesa Callback Handling**
exports.mpesaCallback = async (req, res) => {
    console.log("M-Pesa Callback Received:", req.body);
    res.status(200).send("OK");
};  
