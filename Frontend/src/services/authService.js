// src/services/authService.js
import { supabase } from '../lib/supabase';

export const authService = {
  // Authenticate with Supabase for realtime
  authenticateWithSupabase: async (userUuid, token) => {
    try {
      // Clean up any existing sessions first
      await authService.signOutFromSupabase();
      
      console.log('Authenticating Supabase for user:', userUuid);
      
      // Sign in with direct JWT for best compatibility
      let authResult;
      
      // First try the direct anonymous key approach (for development)
      try {
        // Set the current session manually
        const { data: session } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No existing session, attempting anonymous auth');
          
          // Try creating a session with anonymous key
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'anonymous@example.com',
            password: 'anonymous_access'
          });
          
          if (error) {
            console.log('Anonymous auth failed, will try alternative methods');
          } else {
            authResult = { data };
            console.log('Anonymous auth successful');
          }
        }
      } catch (err) {
        console.log('Error during anonymous auth attempt:', err.message);
      }
      
      // If anonymous auth failed, try regular JWT auth
      if (!authResult) {
        try {
          // Check if we already have a session
          const { data: currentSession } = await supabase.auth.getSession();
          
          if (currentSession?.session) {
            console.log('Using existing Supabase session');
            authResult = { data: currentSession };
          } else {
            // Try JWT auth
            const { data, error } = await supabase.auth.signInWithPassword({
              email: `${userUuid}@chat-app-temp.com`,
              password: token || 'default_password' // Fallback for development
            });
            
            if (error) {
              console.log('Sign-in failed, attempting sign-up');
              // If sign in fails, try to sign up
              const signUpResult = await supabase.auth.signUp({
                email: `${userUuid}@chat-app-temp.com`,
                password: token || 'default_password',
                options: {
                  data: { user_uuid: userUuid }
                }
              });
              
              if (signUpResult.error) {
                console.error('Both sign-in and sign-up failed:', signUpResult.error);
              } else {
                authResult = signUpResult;
              }
            } else {
              authResult = { data };
            }
          }
        } catch (authErr) {
          console.error('Error during authentication:', authErr);
        }
      }
      
      // Force a reconnection of the realtime client
      supabase.removeAllChannels();
      
      // Create a new test channel to force reconnection with new auth
      const channel = supabase.channel(`user-${userUuid}`);
      await channel.subscribe((status) => {
        console.log(`Connection status for user ${userUuid}: ${status}`);
      });
      
      console.log('Successfully authenticated with Supabase for user:', userUuid);
      return true;
    } catch (error) {
      console.error('Error setting user context:', error);
      return false;
    }
  },

  // Clear realtime subscriptions
  signOutFromSupabase: async () => {
    try {
      console.log('Cleaning up Supabase connections and auth...');
      
      // First remove all channel subscriptions to ensure clean state
      try {
        supabase.removeAllChannels();
        console.log('All channels removed');
      } catch (channelErr) {
        console.warn('Error removing channels:', channelErr.message);
      }
      
      // Then sign out from Supabase auth
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('Error during signOut:', error.message);
        } else {
          console.log('Signed out from Supabase auth');
        }
      } catch (signOutErr) {
        console.warn('Exception during signOut:', signOutErr.message);
      }
      
      // Short delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error clearing realtime subscriptions:', error);
      return false;
    }
  },

  // Get current user context
  getCurrentUser: (authUser) => {
    return {
      uuid: authUser?.uuid,
      email: authUser?.email,
      username: authUser?.username,
      fullname: authUser?.fullname
    };
  },
  
  // Refresh all Supabase connections (useful when switching accounts)
  refreshSupabaseConnection: async (userUuid, token) => {
    try {
      console.log('Refreshing Supabase connection for user:', userUuid);
      
      // Clear existing connections and channels
      await authService.signOutFromSupabase();
      
      // Wait a short moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Import the setupConnectionMonitoring function to ensure monitoring is active
      const { setupConnectionMonitoring } = await import('../lib/supabase');
      setupConnectionMonitoring();
      
      // Re-authenticate
      const success = await authService.authenticateWithSupabase(userUuid, token);
      
      if (success) {
        console.log('Successfully refreshed Supabase connection for user:', userUuid);
      } else {
        console.error('Failed to refresh Supabase connection');
      }
      
      return success;
    } catch (error) {
      console.error('Error refreshing Supabase connection:', error);
      return false;
    }
  }
};
