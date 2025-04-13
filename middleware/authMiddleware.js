const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    console.log("Authorization Header:", req.headers.authorization); // Check if header is received

    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    console.log("Token Received:", token);
    console.log("JWT_SECRET:", process.env.JWT_SECRET); // Check if secret is loaded

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("Decoded Token:", decoded);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    req.user = { id: decoded.userId };
    console.log("Authenticated User ID:", req.user.id);

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
