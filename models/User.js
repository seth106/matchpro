const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 }, // Default wallet balance
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
