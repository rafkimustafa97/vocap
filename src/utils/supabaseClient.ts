import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tfyuvlouxwbtnqchklxa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeXV2bG91eHdidG5xY2hrbHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4ODI5ODgsImV4cCI6MjEwMTQ1ODk4OH0.IqCB6FhRTlM1NL-r_Ta5-WvLBJvz2b0gXeLhi5361AI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/**
 * Triggers 1-Click Google OAuth login/register via Supabase
 */
export async function signInWithGoogle() {
  const redirectUrl = window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error initiating Google OAuth:', error.message);
    throw error;
  }

  return data;
}
