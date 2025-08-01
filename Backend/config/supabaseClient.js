// config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  Missing Supabase environment variables');
  throw new Error('Missing Supabase URL or Service Key');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,  // Backend không cần session
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  }
});



// Helper to track channels for cleanup
const createChannel = (channelName) => {
  activeChannels.push(channelName);
  return supabase.channel(channelName);
};

// Export client and helper functions
module.exports = supabase;
