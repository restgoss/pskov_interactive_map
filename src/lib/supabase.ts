import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  throw new Error('Missing Supabase env: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(url, key, {
  auth: {
    // Admin sessions need to survive page reloads — Supabase keeps the
    // session in localStorage and silently refreshes the token.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
