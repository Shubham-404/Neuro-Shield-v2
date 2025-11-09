// middleware/auth.js
const { supabase, supabaseAdmin } = require('../utils/supabaseClient');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.cookies.neuroShieldToken;
  if (!token) {
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
      return res.status(403).json({ success: false, message: 'User profile not found.' });
    }

    req.user = {
      id: profile.id,          // role table id (from doctors/patients/admins table)
      authId: userId,         // Supabase auth.id
      email: profile.email || user?.email,
      name: profile.full_name || profile.name || user?.user_metadata?.name,
      role: determinedRole
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.clearCookie('neuroShieldToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};