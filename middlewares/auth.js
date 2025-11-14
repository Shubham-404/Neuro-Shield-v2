// middleware/auth.js
const { supabase, supabaseAdmin } = require('../utils/supabaseClient');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.cookies.neuroShieldToken;
  if (!token) {
    // Log for debugging in production
    if (process.env.NODE_ENV === 'production') {
      console.log('[Auth] No token in cookies. Cookies received:', Object.keys(req.cookies));
      console.log('[Auth] Request origin:', req.headers.origin);
      console.log('[Auth] Request host:', req.headers.host);
    }
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

    // Try to get user from Supabase auth using admin client
    let user = null;
    let role = 'patient';
    
    try {
      const { data: { user: authUser }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!userError && authUser) {
        user = authUser;
        role = authUser.user_metadata?.role || 'patient';
      }
    } catch (err) {
      console.warn('Could not fetch user from Supabase auth:', err.message);
      // Continue without user - we'll determine role from profile tables
    }

    // Try to fetch profile from each role table to determine role
    let profile = null;
    let profileError = null;
    let determinedRole = role;

    // Try doctor first
    if (!profile) {
      const { data, error: err } = await supabase
      .from('doctors')
        .select('id, full_name, email, specialization')
        .eq('auth_id', userId)
        .single();
      if (data && !err) {
        profile = data;
        determinedRole = 'doctor';
      }
    }

    // Try patient
    if (!profile) {
      const { data, error: err } = await supabase
        .from('patients')
        .select('id, name, email')
        .eq('auth_id', userId)
        .single();
      if (data && !err) {
        profile = data;
        determinedRole = 'patient';
      }
    }

    // Try admin
    if (!profile) {
      const { data, error: err } = await supabase
        .from('admins')
        .select('id, name, email')
      .eq('auth_id', userId)
      .single();
      if (data && !err) {
        profile = data;
        determinedRole = 'admin';
      }
    }

    if (!profile) {
      console.error('[Auth] User profile not found for userId:', userId);
      return res.status(403).json({ success: false, message: 'User profile not found.' });
    }

    // Set role-specific IDs
    const userData = {
      id: profile.id,          // role table id (from doctors/patients/admins table)
      authId: userId,         // Supabase auth.id
      email: profile.email || user?.email,
      name: profile.full_name || profile.name || user?.user_metadata?.name,
      role: determinedRole
    };

    // Add role-specific ID fields for easier access in controllers
    if (determinedRole === 'patient') {
      userData.patient_id = profile.id;
    } else if (determinedRole === 'doctor') {
      userData.doctor_id = profile.id;
    } else if (determinedRole === 'admin') {
      userData.admin_id = profile.id;
    }

    req.user = userData;
    
    console.log(`[Auth] User authenticated: ${determinedRole} (ID: ${profile.id}, AuthID: ${userId})`);
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    // Clear cookie with same settings as login
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
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};