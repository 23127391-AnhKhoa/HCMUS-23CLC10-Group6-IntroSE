// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwpvqathheyehfwriplc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cHZxYXRoaGV5ZWhmd3JpcGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MDE3NjksImV4cCI6MjA2NzE3Nzc2OX0.m6WZLty8cba8x2sikDcobAdST1HOnggK08XY-cFmwts'

// Create the Supabase client with development mode RLS bypass
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  global: {
    headers: {
      // For development only - this bypasses RLS for Realtime
      apikey: supabaseAnonKey,
    },
  },
})

// Initialize Supabase connection and setup monitoring
let connectionMonitoring = false;
let monitoringChannel = null;

// Helper to check if WebSocket is connected
export const checkRealtimeConnection = async () => {
  try {
    const testChannel = supabase.channel('connection_test');
    let connectionOk = false;
    let timeoutId = null;
    
    return new Promise((resolve) => {
      // Set a timeout to consider it failed if we don't get a response
      timeoutId = setTimeout(() => {
        supabase.removeChannel(testChannel);
        console.log('⏱️ Connection test timed out');
        resolve(false);
      }, 3000);
      
      testChannel
        .subscribe((status) => {
          clearTimeout(timeoutId);
          console.log('🔌 Connection test status:', status);
          connectionOk = status === 'SUBSCRIBED';
          
          // Remove the test channel after test
          setTimeout(() => {
            supabase.removeChannel(testChannel);
          }, 500);
          
          resolve(connectionOk);
        });
    });
  } catch (error) {
    console.error('❌ Error checking connection:', error);
    return false;
  }
};

// Helper to setup connection monitoring if needed
export const setupConnectionMonitoring = () => {
  if (connectionMonitoring && monitoringChannel) {
    // Check if the channel is still active
    try {
      supabase.removeChannel(monitoringChannel);
      console.log('Removed existing monitoring channel');
    } catch (err) {
      console.log('No active monitoring channel to remove');
    }
  }
  
  try {
    console.log("🔍 Setting up Supabase connection monitoring");
    
    // Log when connection state changes
    monitoringChannel = supabase.channel('system_monitor');
    monitoringChannel
      .on('presence', { event: 'sync' }, () => {
        console.log('🔄 Supabase connection: Sync complete');
      })
      .on('postgres_changes', { event: '*' }, (payload) => {
        console.log('📝 Database change received:', payload.eventType);
      })
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('📢 Broadcast received:', payload);
      })
      .subscribe((status) => {
        console.log(`📡 Monitoring channel status: ${status}`);
        connectionMonitoring = status === 'SUBSCRIBED';
      });
  } catch (error) {
    console.error('❌ Error setting up connection monitoring:', error);
    connectionMonitoring = false;
    monitoringChannel = null;
  }
}

// Initialize monitoring
setupConnectionMonitoring();

// Helper for development mode to bypass RLS
export const bypassAuthForDevelopment = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.log('bypassAuthForDevelopment should only be used in development');
    return false;
  }
  
  try {
    console.log('⚠️ DEVELOPMENT MODE: Setting up direct Supabase access');
    
    // First sign out any existing auth
    await supabase.auth.signOut();
    
    // Wait for signout to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For development - enable anon access
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'anonymous@example.com',
      password: 'anonymous_access'
    });
    
    if (error) {
      // Try sign up if sign in fails
      console.log('Attempting anonymous signup...');
      const signupResult = await supabase.auth.signUp({
        email: 'anonymous@example.com',
        password: 'anonymous_access'
      });
      
      if (signupResult.error) {
        console.error('Failed to set up development bypass:', signupResult.error);
        return false;
      }
    }
    
    console.log('✅ Development mode bypass setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up development bypass:', error);
    return false;
  }
};

// Auto-attempt bypass in development mode
if (process.env.NODE_ENV === 'development') {
  bypassAuthForDevelopment().then(success => {
    console.log('Development mode bypass setup:', success ? 'succeeded' : 'failed');
  });
}
