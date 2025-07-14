import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwpvqathheyehfwriplc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cHZxYXRoaGV5ZWhmd3JpcGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MDE3NjksImV4cCI6MjA2NzE3Nzc2OX0.m6WZLty8cba8x2sikDcobAdST1HOnggK08XY-cFmwts'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
