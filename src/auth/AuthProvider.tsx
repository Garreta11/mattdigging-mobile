import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { apiFetch } from '@/api/client';
import type { Auth } from '@/api/types';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  /** Supabase session, or null when logged out. */
  session: Session | null;
  /** False until the saved session has been read from the phone's storage. */
  isReady: boolean;
  /** Profile + subscription from the backend's GET /auth. */
  profile: Auth['profile'] | null;
  isMember: boolean;
  signOut: () => Promise<void>;
  /** Permanently deletes the logged-in account (and cancels any membership). */
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. On app start: restore the session saved in AsyncStorage (stays logged in between launches).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsReady(true);
    });

    // 2. Afterwards: react to sign in, sign out and token refreshes.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  // Only runs while logged in. Cached per user, so a different login never sees stale data.
  const { data: auth } = useQuery({
    queryKey: ['auth', userId],
    queryFn: () => apiFetch<Auth>('/auth'),
    enabled: !!userId,
    staleTime: 0,
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ['auth'] });
  };

  // Permanently deletes the account on the backend (DELETE /auth/account), which also cancels
  // any active membership. Throws if the backend fails, so the screen can show the error.
  const deleteAccount = async () => {
    await apiFetch<{ deleted: boolean }>('/auth/account', { method: 'DELETE' });
    // The user no longer exists: forget the saved login on this phone only (no server call needed).
    await supabase.auth.signOut({ scope: 'local' });
    queryClient.clear();
  };

  const profile = userId ? (auth?.profile ?? null) : null;
  // Same rule as the website's AppContext.
  const isMember = !!session && (profile?.is_member === true || session.user.user_metadata?.is_member === true);

  return (
    <AuthContext.Provider value={{ session, isReady, profile, isMember, signOut, deleteAccount }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
