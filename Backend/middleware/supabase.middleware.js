// Backend/middleware/supabase.middleware.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to set user context for Supabase RLS
const setSupabaseUser = async (req, res, next) => {
  try {
    if (req.user && req.user.uuid) {
      // Set the user context for Supabase RLS
      await supabase.auth.admin.getUserById(req.user.uuid);
    }
    next();
  } catch (error) {
    console.error('Error setting Supabase user context:', error);
    next(); // Continue anyway
  }
};

module.exports = {
  setSupabaseUser,
  supabase
};
