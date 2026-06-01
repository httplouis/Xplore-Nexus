import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key are loaded from environment variables.
// NEXT_PUBLIC_ prefix makes them available in the browser bundle and on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing. Check .env.local');
}

// Export a singleton Supabase client that can be reused across the app.
export const supabase = createClient(supabaseUrl, supabaseKey);
