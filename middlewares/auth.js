// middleware/auth.js
const { supabase } = require('../utils/supabaseClient');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.cookies.neuroShieldToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

    // Validate with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || user.id !== userId) {
      throw new Error('Invalid token');
    }

    // Fetch role from `users` table
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (roleError || !userData) {
      throw new Error('User profile not found');
    }

    // Attach full user context
    req.user = {
      id: userId,
      email: user.email,
      role: userData.role
    };

    next();
  } catch (err) {
    res.clearCookie('neuroShieldToken');
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};