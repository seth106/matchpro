const express = require("express");
const jwt = require("jsonwebtoken"); // ✅ Added this import
const { register, login } = require("../controllers/authController");
const router = express.Router();
require("dotenv").config(); // ✅ Ensure env is loaded

router.post("/register", register);
router.post("/login", login);

// Verify JWT Token (Used in `account.js`)
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      res.json({ message: "Token is valid", userId: decoded.userId });
  });
});

module.exports = router;

