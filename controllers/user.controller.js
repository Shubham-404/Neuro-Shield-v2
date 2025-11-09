// controllers/user.controller.js
const { supabase } = require('../utils/supabaseClient');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (userId) => {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.signup = async (req, res) => {
    try {
        console.log('Signup Request Body:', req.body);

        const { name, email, password, role = 'patient', ...extra } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password required.' });
        }

        const validRoles = ['patient', 'doctor', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role.' });
        }

        // Pass extra fields to raw_user_meta_data (for future use in role tables)
        const metaData = { name, role, ...extra };

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData,
                emailRedirectTo: `${process.env.FRONTEND_ORIGIN}/verify`
            }
        });

        if (error) {
            console.error('Supabase Auth Error:', error);
            return res.status(400).json({ success: false, message: error.message });
        }

        if (!data.user) {
            return res.status(400).json({ success: false, message: 'User creation failed.' });
        }

        // Generate JWT
        const token = generateToken(data.user.id);
        res.cookie('neuroShieldToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Send email
        try {
            await sendEmail({
                to: email,
                subject: 'Welcome to Neuro Shield!',
                html: `
          <h2>Hi ${name}!</h2>
          <p>Your <strong>${role}</strong> account has been created.</p>
          <p>Email: <strong>${email}</strong></p>
          <br>
          <p style="color:red;">If this wasn't you, secure your account now!</p>
          <br>
          <p>Contact: <a href="mailto:help@neuro-shield.io">help@neuro-shield.io</a></p>
          <p>Team Neuro Shield</p>
        `
            });
        } catch (mailErr) {
            console.error('Email failed:', mailErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Account created. Check your email to verify.'
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userId = data.user.id;

    // Generate JWT
    const token = generateToken(userId);
    res.cookie('neuroShieldToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Get role from raw_user_meta_data (set during signup)
    const role = data.user.user_metadata?.role || 'patient';
    const name = data.user.user_metadata?.name || data.user.email?.split('@')[0];

    let profile = {};

    // Fetch role-specific profile using auth_id
    if (role === 'patient') {
      const { data } = await supabase.from('patients').select('*').eq('auth_id', userId).single();
      profile = data || {};
    } else if (role === 'doctor') {
      const { data } = await supabase.from('doctors').select('*').eq('auth_id', userId).single();
      profile = data || {};
    } else if (role === 'admin') {
      const { data } = await supabase.from('admins').select('*').eq('auth_id', userId).single();
      profile = data || {};
    }

    // Return full user context
    res.json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: profile.id || userId,  // Use profile.id if available, otherwise auth.id
        email: data.user.email,
        name: name,
        role,
        profile
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /logout
exports.logout = (req, res) => {
    res.clearCookie('neuroShieldToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true, message: 'Logged out.' });
};

// GET /dashboard
exports.dashboard = async (req, res) => {
  try {
    const authId = req.user.authId;
    const role = req.user.role;

    let profile = {};
    if (role === 'patient') {
      const { data } = await supabase.from('patients').select('*').eq('auth_id', authId).single();
      profile = data || {};
    } else if (role === 'doctor') {
      const { data } = await supabase.from('doctors').select('*').eq('auth_id', authId).single();
      profile = data || {};
    } else if (role === 'admin') {
      const { data } = await supabase.from('admins').select('*').eq('auth_id', authId).single();
      profile = data || {};
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role,
        profile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};