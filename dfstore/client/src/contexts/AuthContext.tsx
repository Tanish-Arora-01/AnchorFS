// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;   // true while determining initial session
  signInWithOtp: (email: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

 const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin, // correct placement
    },
  });
  if (error) return { error: error.message };
  const needsVerification = !data.user?.email_confirmed_at;
  return { needsVerification };
};

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const value = useMemo(
    () => ({ session, user, loading, signInWithOtp, signIn, signUp, signOut, getAccessToken }),
    [session, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
