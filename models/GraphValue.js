// models/GraphValue.js
const mongoose = require('mongoose');

const GraphValueSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  totalValue: {
    type: Number,
    default: 100
  }
});

module.exports = mongoose.model('GraphValue', GraphValueSchema);
