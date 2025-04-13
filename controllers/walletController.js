const Wallet = require("../models/Wallet");

// Get wallet balance and transactions
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.json({ balance: 0, transactions: [] });  

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Top-up wallet
exports.topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) wallet = new Wallet({ user: req.user.id, balance: 0, transactions: [] });

    wallet.balance += amount;
    wallet.transactions.push({ type: "top-up", amount });
    await wallet.save();

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token or user session" });
    }    

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Withdraw from wallet
exports.withdrawFromWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

    wallet.balance -= amount;
    wallet.transactions.push({ type: "withdraw", amount });
    await wallet.save();

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token or user session" });
    }    

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
