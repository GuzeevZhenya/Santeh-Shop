import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

type AuthCtx = {
  user: (User & { full_name?: string | null; role?: string }) | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  navigateToLogin: () => void;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingAuth, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile((data as Profile) || null);
  };

  const refreshProfile = async () => {
    if (session?.user?.id) await loadProfile(session.user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthCtx>(() => {
    const u = session?.user
      ? {
          ...session.user,
          full_name: profile?.full_name ?? session.user.user_metadata?.full_name,
          role: profile?.role ?? 'user',
        }
      : null;
    return {
      user: u,
      profile,
      session,
      isAuthenticated: !!session?.user,
      isLoadingAuth,
      isAdmin: profile?.role === 'admin',
      logout: async () => {
        await supabase.auth.signOut();
        setProfile(null);
      },
      navigateToLogin: () => {
        window.location.href = '/login';
      },
      refreshProfile,
    };
  }, [session, profile, isLoadingAuth]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
