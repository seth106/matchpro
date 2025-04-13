const express = require('express');
const router = express.Router();
const GraphValue = require('../models/GraphValue');

// GET current total value
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const entry = await GraphValue.findOne({ userId });

    if (!entry) {
      return res.json({ totalValue: 100 }); // Default value
    }

    res.json({ totalValue: entry.totalValue });
  } catch (err) {
    console.error("Error in GET /graph-value:", err); // 👈 Show full error
    res.status(500).json({ message: 'Server error fetching total value.' });
  }
});

// POST updated total value
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { totalValue } = req.body;

    const updated = await GraphValue.findOneAndUpdate(
      { userId },
      { totalValue },
      { new: true, upsert: true } // Create if not exists
    );

    res.json({ success: true, totalValue: updated.totalValue });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating total value.' });
  }
});

module.exports = router;
