const express = require("express");
const { 
  createProfile,
  getProfile, 
  updateProfile, 
  updateUserInfo, 
  topUpBalance, 
  withdrawBalance, 
  getTransactionHistory,
  clearTransactionHistory,
  mpesaTopUp,
  mpesaWithdraw,
  mpesaCallback,
  checkMpesaStatus
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Profile Routes
router.post("/", authMiddleware, createProfile);
router.get("/:userId", authMiddleware, getProfile);
router.put("/:userId", authMiddleware, updateProfile);
router.put("/:userId/update-info", authMiddleware, updateUserInfo);

// ✅ Wallet System
router.post("/:userId/top-up", authMiddleware, topUpBalance);
router.post("/:userId/withdraw", authMiddleware, withdrawBalance);
router.get("/:userId/transactions", authMiddleware, getTransactionHistory);
router.delete("/:userId/history/clear", authMiddleware, clearTransactionHistory);

// ✅ M-Pesa Integration
router.post("/:userId/mpesa/top-up", authMiddleware, mpesaTopUp);
router.post("/:userId/mpesa/withdraw", authMiddleware, mpesaWithdraw);
router.post("/mpesa/callback", mpesaCallback);

// 🔹 M-Pesa Transaction Status Check
router.get("/mpesa/status/:transactionId", authMiddleware, checkMpesaStatus);


router.post("/mpesa/callback", async (req, res) => {
  console.log("M-Pesa Callback Received:", req.body);
  res.status(200).send("OK");
});


module.exports = router;

