// config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  Missing Supabase environment variables');
  console.error('Please check your .env file for:');
  console.error('SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_KEY=your_service_key');
  console.error('');
  console.error('You can find these in your Supabase Dashboard > Settings > API');
  
  // Export a dummy client for testing purposes
  module.exports = {
    from: () => ({ select: () => ({ limit: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
    storage: {
      from: () => ({ 
        upload: () => Promise.resolve({ data: null, error: { message: 'Storage not configured' } }),
        createSignedUrl: () => Promise.resolve({ data: null, error: { message: 'Storage not configured' } })
      })
    }
  };
  return;
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

// Add enhanced connection health check
const testConnection = async () => {
  try {
    console.log('Testing Supabase database connection...');
    const { data, error } = await supabase.from('Gigs').select('count').limit(1);
    
    if (error) {
      console.error('Supabase database connection test failed:', error);
      return false;
    }
    
    console.log('Supabase database connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Test realtime connection health
const testRealtimeConnection = async () => {
  return new Promise((resolve) => {
    try {
      console.log('Testing Supabase realtime connection...');
      
      // Create a test channel with unique name
      const channelName = 'connection_test_' + Date.now();
      const channel = supabase.channel(channelName);
      
      let timeoutId = setTimeout(() => {
        console.error('Supabase realtime connection test timed out');
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.warn('Error cleaning up test channel:', err.message);
        }
        resolve(false);
      }, 6000); // Increased timeout to 6 seconds
      
      let resolved = false;
      
      channel.subscribe((status, error) => {
        console.log(`Realtime test channel status: ${status}`);
        
        if (resolved) return; // Prevent multiple resolves
        
        if (error) {
          console.error('Realtime subscription error:', error);
          clearTimeout(timeoutId);
          resolved = true;
          resolve(false);
        } else if (status === 'SUBSCRIBED') {
          clearTimeout(timeoutId);
          console.log('Supabase realtime subscription successful');
          resolved = true;
          
          // Clean up after short delay
          setTimeout(() => {
            try {
              supabase.removeChannel(channel);
            } catch (err) {
              console.warn('Error cleaning up test channel:', err.message);
            }
          }, 500);
          
          resolve(true);
        } else if (status === 'CHANNEL_ERROR') {
          clearTimeout(timeoutId);
          console.error('Supabase realtime channel error - may be disabled in project settings');
          resolved = true;
          resolve(false);
        } else if (status === 'CLOSED') {
          clearTimeout(timeoutId);
          console.error('Supabase realtime channel closed unexpectedly');
          resolved = true;
          resolve(false);
        }
      });
      
    } catch (error) {
      console.error('Error testing realtime connection:', error);
      resolve(false);
    }
  });
};

// Run test connections on startup
(async () => {
  const dbConnected = await testConnection();
  console.log('Database connection test result:', dbConnected ? 'SUCCESS' : 'FAILED');
  
  const realtimeConnected = await testRealtimeConnection();
  console.log('Realtime connection test result:', realtimeConnected ? 'SUCCESS' : 'FAILED');
})();

// Track active channels for better cleanup
let activeChannels = [];

// Add a method to refresh connection by creating a new client with proper cleanup
const refreshConnection = async () => {
  console.log('Refreshing Supabase connection...');
  
  try {
    // Clean up existing channels
    console.log(`Cleaning up ${activeChannels.length} active channels`);
    
    // Remove all active channels
    activeChannels.forEach(channelName => {
      try {
        supabase.removeChannel(channelName);
        console.log(`Removed channel: ${channelName}`);
      } catch (err) {
        console.warn(`Error removing channel ${channelName}:`, err.message);
      }
    });
    
    // Reset active channels list
    activeChannels = [];
    
    // Create fresh client
    const freshClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        },
        heartbeat: {
          interval: 5000, // Send heartbeat every 5 seconds
          timeout: 10000  // Wait 10 seconds before considering connection dropped
        }
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    });
    
    // Test the new connection
    const connectionTest = await testRealtimeConnection();
    console.log('New connection test:', connectionTest ? 'SUCCESS' : 'FAILED');
    
    return freshClient;
  } catch (error) {
    console.error('Error refreshing Supabase connection:', error);
    // Return original client as fallback
    return supabase;
  }
};

// Helper to track channels for cleanup
const createChannel = (channelName) => {
  activeChannels.push(channelName);
  return supabase.channel(channelName);
};

// Export client and helper functions
module.exports = supabase;
