'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { clearLocalData } from '@/lib/persistence';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!initialUser);
  // One browser client for the provider's lifetime.
  const [supabase] = useState(createClient);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  /**
   * Sign out and always land on the home page. A full page load (not a
   * client-side push) wins over redirects that pages like /dashboard fire as
   * soon as `user` becomes null, and drops any signed-in state held in memory.
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Still clear local state, e.g. when the account was just deleted.
      console.error('signOut failed:', err);
    } finally {
      clearLocalData();
      setUser(null);
      setSession(null);
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
