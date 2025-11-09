// middleware/auth.js
const { supabase } = require('../utils/supabaseClient');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.cookies.neuroShieldToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || user.id !== userId) {
      throw new Error('Invalid token');
    }

    // Get role from raw_user_meta_data
    const role = user.user_metadata?.role || 'patient';

    let profile = null;
    let profileError = null;

    // Fetch role-specific profile (auth_id = user.id)
    if (role === 'doctor') {
      const { data, error: err } = await supabase
        .from('doctors')
        .select('id, full_name, email, specialization')
        .eq('auth_id', userId)
        .single();
      profile = data;
      profileError = err;
    } else if (role === 'patient') {
      const { data, error: err } = await supabase
        .from('patients')
        .select('id, name, email')
        .eq('auth_id', userId)
        .single();
      profile = data;
      profileError = err;
    } else if (role === 'admin') {
      const { data, error: err } = await supabase
        .from('admins')
        .select('id, name, email')
        .eq('auth_id', userId)
        .single();
      profile = data;
      profileError = err;
    }

    if (profileError || !profile) {
      return res.status(403).json({ success: false, message: `${role} profile not found.` });
    }

    req.user = {
      id: profile.id,          // role table id (from doctors/patients/admins table)
      authId: userId,         // Supabase auth.id
      email: profile.email || user.email,
      name: profile.full_name || profile.name || user.user_metadata?.name,
      role: role
    };

    next();
  } catch (err) {
    res.clearCookie('neuroShieldToken');
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};