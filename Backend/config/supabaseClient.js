// config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase URL or Service Key');
}

// Create client with enhanced connection options for WebSocket stability
const supabase = createClient(supabaseUrl, supabaseKey, {
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
      
      // Create a test channel to verify WebSocket connection
      const channel = supabase.channel('connection_test');
      let timeoutId = setTimeout(() => {
        console.error('Supabase realtime connection test timed out');
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.warn('Error cleaning up test channel:', err.message);
        }
        resolve(false);
      }, 5000);
      
      channel
        .on('system', { event: 'connected' }, () => {
          clearTimeout(timeoutId);
          console.log('Supabase realtime connected successfully');
          
          // Clean up test channel
          setTimeout(() => {
            try {
              supabase.removeChannel(channel);
            } catch (err) {
              console.warn('Error cleaning up test channel:', err.message);
            }
          }, 1000);
          
          resolve(true);
        })
        .subscribe((status) => {
          console.log(`Realtime test channel status: ${status}`);
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeoutId);
            console.log('Supabase realtime subscription successful');
            resolve(true);
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
module.exports.refreshConnection = refreshConnection;
module.exports.testConnection = testConnection;
module.exports.testRealtimeConnection = testRealtimeConnection;
module.exports.createChannel = createChannel;