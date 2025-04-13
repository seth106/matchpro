const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  profilePicture: { type: String, default: "" },
  bio: { type: String, maxlength: 500 },
  balance: { type: Number, default: 1000 }, 
  transactionHistory: [
    {
      type: { type: String, enum: ["top-up", "withdraw"], required: true },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Profile", ProfileSchema);
