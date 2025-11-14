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

        // Pass extra fields to raw_user_meta_data (for trigger to use in role tables)
        const metaData = { 
            name, 
            role, 
            ...extra  // Includes: specialization, license_number, hospital (for doctors)
                       //          medical_history, blood_group (for patients)
        };

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
        // Cookie configuration - same as login
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'lax' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        };
        
        if (isProduction && process.env.FRONTEND_ORIGIN && process.env.BACKEND_URL) {
            const frontendDomain = new URL(process.env.FRONTEND_ORIGIN).hostname;
            const backendDomain = new URL(process.env.BACKEND_URL).hostname;
            if (frontendDomain !== backendDomain) {
                cookieOptions.sameSite = 'none';
                cookieOptions.secure = true;
            }
        }
        
        res.cookie('neuroShieldToken', token, cookieOptions);

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
    
    // Cookie configuration for production
    // Use 'lax' for production to allow cross-site cookies (frontend on Netlify, backend on different domain)
    // Use 'none' with secure if domains are completely different (requires HTTPS)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Requires HTTPS in production
      sameSite: isProduction ? 'lax' : 'lax', // 'lax' works better for cross-origin in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/' // Ensure cookie is available for all paths
    };
    
    // If frontend and backend are on different domains, we need 'none' with secure
    // This is required for cross-origin requests (e.g., Netlify frontend to separate backend)
    if (isProduction && process.env.FRONTEND_ORIGIN && process.env.BACKEND_URL) {
      try {
        const frontendDomain = new URL(process.env.FRONTEND_ORIGIN).hostname;
        const backendDomain = new URL(process.env.BACKEND_URL).hostname;
        if (frontendDomain !== backendDomain) {
          // Different domains - need 'none' with secure (requires HTTPS)
          cookieOptions.sameSite = 'none';
          cookieOptions.secure = true; // Required when sameSite is 'none'
          console.log(`[Login] Cross-origin detected: Frontend=${frontendDomain}, Backend=${backendDomain}, Using sameSite='none'`);
        } else {
          console.log(`[Login] Same domain: ${frontendDomain}, Using sameSite='lax'`);
        }
      } catch (err) {
        console.warn('[Login] Could not parse FRONTEND_ORIGIN or BACKEND_URL, using default cookie settings');
      }
    }
    
    console.log(`[Login] Setting cookie with options:`, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path
    });
    
    res.cookie('neuroShieldToken', token, cookieOptions);

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
    // Clear cookie with same settings as set
    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'lax' : 'lax',
        path: '/'
    };
    
    if (isProduction && process.env.FRONTEND_ORIGIN && process.env.BACKEND_URL) {
        const frontendDomain = new URL(process.env.FRONTEND_ORIGIN).hostname;
        const backendDomain = new URL(process.env.BACKEND_URL).hostname;
        if (frontendDomain !== backendDomain) {
            clearOptions.sameSite = 'none';
            clearOptions.secure = true;
        }
    }
    
    res.clearCookie('neuroShieldToken', clearOptions);
    res.json({ success: true, message: 'Logged out.' });
};

// GET /dashboard
exports.dashboard = async (req, res) => {
  try {
    console.log('[Dashboard] Starting dashboard request for user:', req.user.id, 'role:', req.user.role);
    const authId = req.user.authId;
    const role = req.user.role;

    let profile = {};
    if (role === 'patient') {
      console.log('[Dashboard] Fetching patient profile for authId:', authId);
      const { data, error } = await supabase.from('patients').select('*').eq('auth_id', authId).single();
      if (error) {
        console.error('[Dashboard] Error fetching patient profile:', error);
      } else {
        profile = data || {};
        console.log('[Dashboard] Patient profile fetched, ID:', profile.id);
      }
    } else if (role === 'doctor') {
      console.log('[Dashboard] Fetching doctor profile for authId:', authId);
      const { data, error } = await supabase.from('doctors').select('*').eq('auth_id', authId).single();
      if (error) {
        console.error('[Dashboard] Error fetching doctor profile:', error);
      } else {
        profile = data || {};
        console.log('[Dashboard] Doctor profile fetched, ID:', profile.id);
      }
    } else if (role === 'admin') {
      console.log('[Dashboard] Fetching admin profile for authId:', authId);
      const { data, error } = await supabase.from('admins').select('*').eq('auth_id', authId).single();
      if (error) {
        console.error('[Dashboard] Error fetching admin profile:', error);
      } else {
        profile = data || {};
        console.log('[Dashboard] Admin profile fetched, ID:', profile.id);
      }
    }

    const userResponse = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role,
      profile
    };

    // Add role-specific ID fields
    if (role === 'patient') {
      userResponse.patient_id = profile.id || req.user.patient_id;
    } else if (role === 'doctor') {
      userResponse.doctor_id = profile.id || req.user.doctor_id;
    } else if (role === 'admin') {
      userResponse.admin_id = profile.id || req.user.admin_id;
    }

    console.log('[Dashboard] Returning user data for role:', role);
    res.json({
      success: true,
      user: userResponse
    });
  } catch (err) {
    console.error('[Dashboard] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};