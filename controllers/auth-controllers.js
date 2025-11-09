const bcrypt = require('bcrypt');
const sendEmailToUser = require('../utils/services/send-email');
const userModel = require('../utils/models/user');
const getToken = require('../utils/services/get-token');
const getOtp = require('../utils/services/get-otp');
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

require("dotenv").config();

// Helper: Get or create user in MongoDB
async function getOrCreateUser(supabaseUser) {
    let user = await userModel.findOne({ supabaseId: supabaseUser.id });
    if (!user) {
        user = await userModel.create({
            supabaseId: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
            email: supabaseUser.email,
            isAccountVerified: supabaseUser.email_confirmed_at ? true : false,
        });
    }
    return user;
}

// ==================== SIGNUP ====================
module.exports.signupUser = async function (req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }, // Pass name to user_metadata
                emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`
            }
        });

        if (error) {
            console.log('Supabase signup error:', error.message);
            return res.status(400).json({ success: false, message: error.message });
        }

        if (!data.user) {
            return res.status(400).json({ success: false, message: "Failed to create user." });
        }

        // Create or get user in MongoDB
        const user = await getOrCreateUser(data.user);

        // Generate JWT
        const token = getToken({ id: data.user.id });

        res.cookie('cipherBucksToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Send Welcome Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Welcome to Cipher Bucks!`,
            html: `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f7fa; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                        .header { text-align: center; margin-bottom: 20px; }
                        .header img { max-width: 180px; }
                        h2 { color: #4CAF50; }
                        p { line-height: 1.6; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
                        .footer a { color: #4CAF50; text-decoration: none; }
                        .cta-button { background-color: #4CAF50; color: white; padding: 12px 25px; text-align: center; font-size: 16px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <a href='https://postimages.org/' target='_blank'>
                                <img src='https://i.postimg.cc/D0xKtM2f/logo-long.png' alt='logo-long'/>
                            </a>
                        </div>
                        <h2>Welcome, ${name}!</h2>
                        <p>We’re thrilled to have you on board! Your account has been created with <strong>${email}</strong>.</p>
                        <p>Please check your email to verify your account and get started.</p>
                        <p>If you have any questions, reach out to us at <a href="mailto:help@cipherbucks.shubham.app">help@cipherbucks.shubham.app</a>.</p>
                        <div class="footer">
                            <p>Warm regards,<br>Team Cipher Bucks</p>
                        </div>
                    </div>
                </body>
            </html>
            `
        };

        try {
            const mailResponse = await sendEmailToUser(mailOptions);
            console.log("Welcome email sent:", mailResponse.message);
        } catch (mailErr) {
            console.error("Failed to send welcome email:", mailErr.message);
        }

        res.status(201).json({
            success: true,
            message: "Account created. Please check your email to verify."
        });

    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ==================== LOGIN ====================
module.exports.loginUser = async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const user = await getOrCreateUser(data.user);
        const token = getToken({ id: data.user.id });

        res.cookie('cipherBucksToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        console.log("User logged in:", data.user.id);
        res.status(200).json({ success: true, message: "Logged in successfully." });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ==================== USER PROFILE ====================
module.exports.userProfile = async function (req, res) {
    try {
        const user = await userModel.findOne({ supabaseId: req.user.id });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const { name, email, hisaabs, isAccountVerified } = user;
        res.json({ success: true, name, email, hisaabs, isAccountVerified });
    } catch (error) {
        console.error("Profile error:", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ==================== LOGOUT ====================
module.exports.logoutUser = function (req, res) {
    res.cookie('cipherBucksToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0
    });

    res.status(200).json({ success: true, message: "Logged out successfully." });
};

// ==================== DELETE USER ====================
module.exports.deleteUser = async function (req, res) {
    try {
        const { data, error } = await supabase.auth.admin.deleteUser(req.user.id);
        if (error) throw error;

        await userModel.deleteOne({ supabaseId: req.user.id });

        res.cookie('cipherBucksToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0
        });

        res.status(200).json({ success: true, message: "Account deleted successfully." });
    } catch (error) {
        console.error("Delete user error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete account." });
    }
};

// ==================== SEND OTP (Manual Email Verify) ====================
module.exports.sendVerifyOtp = async function (req, res) {
    try {
        const user = await userModel.findOne({ supabaseId: req.user.id });
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        if (user.isAccountVerified) return res.json({ success: false, message: "Email already verified." });

        const OTP = getOtp();
        user.verifyOtp = OTP;
        user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Your OTP for Email Verification`,
            html: `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f7fa; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                        .header img { max-width: 150px; }
                        h2 { color: #4CAF50; }
                        .otp-code { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; font-size: 18px; font-weight: bold; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header" style="text-align:center;">
                            <img src='https://i.postimg.cc/D0xKtM2f/logo-long.png' alt='Cipher Bucks'/>
                        </div>
                        <h2>Hi ${user.name}!</h2>
                        <p>Your OTP for email verification is:</p>
                        <div class="otp-code">${OTP}</div>
                        <p>This code expires in <strong>15 minutes</strong>.</p>
                        <p>If you didn’t request this, ignore this email.</p>
                        <div class="footer">
                            <p>Team Cipher Bucks</p>
                        </div>
                    </div>
                </body>
            </html>
            `
        };

        const mailResponse = await sendEmailToUser(mailOptions);
        console.log("OTP email sent:", mailResponse.message);

        res.json({ success: true, message: "OTP sent to email." });
    } catch (error) {
        console.error("Send OTP error:", error.message);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
};

// ==================== VERIFY EMAIL WITH OTP ====================
module.exports.verifyEmail = async function (req, res) {
    try {
        const { enteredOtp } = req.body;
        if (!enteredOtp) return res.status(400).json({ success: false, message: "OTP is required." });

        const user = await userModel.findOne({ supabaseId: req.user.id });
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        if (user.verifyOtp !== enteredOtp) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired." });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        res.json({ success: true, message: "Email verified successfully." });
    } catch (error) {
        console.error("Verify email error:", error.message);
        res.status(500).json({ success: false, message: "Verification failed." });
    }
};

// ==================== RESET PASSWORD ====================
module.exports.resetPassword = async function (req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required." });

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/update-password`,
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.json({ success: true, message: "Password reset link sent to email." });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({ success: false, message: "Failed to send reset link." });
    }
};