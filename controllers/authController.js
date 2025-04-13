const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 📌 Register User
exports.register = async (req, res) => {  // ✅ Add "exports."
  try {
      const { name, phone, password } = req.body;

      // Debugging: Log received values
      console.log("Received Data:", req.body);

      if (!name || !phone || !password) {
          return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
          return res.status(400).json({ message: "Phone number already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, phone, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ message: "Server error" });
  }
};

// 📌 Login User
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "Invalid phone number or password" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid phone number or password" });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ token, user: { name: user.name, phone: user.phone, walletBalance: user.walletBalance } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

