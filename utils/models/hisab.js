// models/hisaab.js
const mongoose = require("mongoose");

const hisabSchema = mongoose.Schema({
  amount: { type: String, required: true },
  description: { type: String, required: true },
  encrypt: { type: Boolean, default: false },
  passcode: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("hisab", hisabSchema);
