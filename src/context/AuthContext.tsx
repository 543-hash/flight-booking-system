import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsLogin?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: friendlyAuthError(error.message) };

    if (data.user && !data.session) {
      const createdAt = data.user.created_at;
      const isExisting =
        createdAt && Date.now() - new Date(createdAt).getTime() > 30_000;
      if (isExisting) {
        return {
          error: 'An account with this email already exists. Please sign in instead.',
          needsLogin: false,
        };
      }
      return { error: null, needsLogin: true };
    }
    return { error: null, needsLogin: false };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: friendlyAuthError(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (m.includes('email not confirmed')) {
    return 'Your email has not been confirmed yet.';
  }
  if (m.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return 'Something went wrong. Please try again.';
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
