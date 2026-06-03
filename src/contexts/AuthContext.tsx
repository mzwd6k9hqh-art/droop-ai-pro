import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { lovable } from '@/integrations/lovable';

export type PlanType = 'free' | 'starter' | 'pro' | 'premium';

interface AppUser {
  id: string;
  email: string;
  name: string;
  storeUrl: string;
  plan: PlanType;
  isGuest: boolean;
  dailyAiMessagesUsed: number;
  lastMessageDate: string;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePlan: (plan: PlanType) => void;
  incrementAiMessages: () => boolean;
  getAiMessagesRemaining: () => number;
  getDailyLimit: () => number;
  isUnlimitedPlan: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_KEY = 'zyra_guest_user';
const PLAN_KEY = 'zyra_user_plan';

const today = () => new Date().toISOString().split('T')[0];

const buildGuest = (): AppUser => {
  const raw = localStorage.getItem(GUEST_KEY);
  const base = raw ? JSON.parse(raw) : null;
  const guest: AppUser = base ?? {
    id: 'guest',
    email: 'guest@zyra.local',
    name: 'Guest',
    storeUrl: localStorage.getItem('droop_store_url') || '',
    plan: (localStorage.getItem(PLAN_KEY) as PlanType) || 'free',
    isGuest: true,
    dailyAiMessagesUsed: 0,
    lastMessageDate: today(),
    createdAt: new Date().toISOString(),
  };
  if (guest.lastMessageDate !== today()) {
    guest.dailyAiMessagesUsed = 0;
    guest.lastMessageDate = today();
  }
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  return guest;
};

const buildFromSupabase = (su: SupabaseUser): AppUser => ({
  id: su.id,
  email: su.email ?? '',
  name:
    (su.user_metadata?.name as string) ||
    (su.user_metadata?.full_name as string) ||
    (su.email?.split('@')[0] ?? 'You'),
  storeUrl: localStorage.getItem('droop_store_url') || '',
  plan: (localStorage.getItem(PLAN_KEY) as PlanType) || 'free',
  isGuest: false,
  dailyAiMessagesUsed: 0,
  lastMessageDate: today(),
  createdAt: su.created_at,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setUser(buildFromSupabase(newSession.user));
      } else {
        setUser(buildGuest());
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ? buildFromSupabase(s.user) : buildGuest());
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: name ? { name } : undefined,
      },
    });
    return error ? { error: error.message } : {};
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (result.error) return { error: result.error.message ?? String(result.error) };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updatePlan = (plan: PlanType) => {
    localStorage.setItem(PLAN_KEY, plan);
    setUser(prev => (prev ? { ...prev, plan } : prev));
  };

  const isUnlimitedPlan = () => user?.plan === 'premium';

  const getDailyLimit = () => {
    switch (user?.plan) {
      case 'starter': return 25;
      case 'pro': return 100;
      case 'premium': return Infinity;
      default: return 5;
    }
  };

  const getAiMessagesRemaining = () => {
    if (!user) return 0;
    if (isUnlimitedPlan()) return Infinity;
    if (user.lastMessageDate !== today()) return getDailyLimit();
    return Math.max(0, getDailyLimit() - user.dailyAiMessagesUsed);
  };

  const incrementAiMessages = () => {
    if (!user) return false;
    if (isUnlimitedPlan()) return true;
    const t = today();
    let used = user.lastMessageDate !== t ? 0 : user.dailyAiMessagesUsed;
    if (used >= getDailyLimit()) return false;
    used += 1;
    const next: AppUser = { ...user, dailyAiMessagesUsed: used, lastMessageDate: t };
    setUser(next);
    if (user.isGuest) localStorage.setItem(GUEST_KEY, JSON.stringify(next));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        updatePlan,
        incrementAiMessages,
        getAiMessagesRemaining,
        getDailyLimit,
        isUnlimitedPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
