import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AdminAuthState {
  session: Session | null;
  isAdmin: boolean;
  // True until we've checked both the persisted session AND the admin
  // whitelist. The UI shows a spinner while this is true.
  isLoading: boolean;
}

async function checkIsAdmin(): Promise<boolean> {
  // Hits the admins table — RLS allows the user to read their own row.
  // If it returns 0 rows, the user isn't an admin.
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .limit(1);
  if (error) return false;
  return (data ?? []).length > 0;
}

export function useAdminAuth(): AdminAuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const sync = async (s: Session | null) => {
      if (cancelled) return;
      setSession(s);
      if (!s) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      const ok = await checkIsAdmin();
      if (cancelled) return;
      setIsAdmin(ok);
      setIsLoading(false);
    };

    // Initial: read whatever Supabase has in storage already.
    supabase.auth.getSession().then(({ data }) => sync(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // Don't await here — we want the listener to be synchronous.
      void sync(s);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, isAdmin, isLoading, signIn, signOut };
}
