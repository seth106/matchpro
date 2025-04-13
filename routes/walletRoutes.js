const express = require("express");
const { getWallet, topUpWallet, withdrawFromWallet } = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get wallet balance & transactions
router.get("/", authMiddleware, getWallet);

// Top-up wallet
router.post("/top-up", authMiddleware, topUpWallet);

// Withdraw from wallet
router.post("/withdraw", authMiddleware, withdrawFromWallet);

module.exports = router;
