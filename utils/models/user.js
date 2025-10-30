// models/user.js
const mongoose = require("mongoose");
const hisabSchema = require("./hisab");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hisabs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hisab" }],
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
