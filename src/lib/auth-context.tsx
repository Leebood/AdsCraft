'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPremium: boolean; // 简化：使用localStorage模拟付费状态
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setPremium: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // 从localStorage读取付费状态（简化方案）
    const premiumStatus = localStorage.getItem('adscraft_premium');
    setIsPremium(premiumStatus === 'true');

    // 检查当前登录状态
    const client = getSupabaseClient();
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as User);
      }
      setLoading(false);
    });

    // 监听登录状态变化
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const client = getSupabaseClient();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const client = getSupabaseClient();
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    setUser(null);
    localStorage.removeItem('adscraft_premium');
    setIsPremium(false);
  };

  const setPremium = (value: boolean) => {
    localStorage.setItem('adscraft_premium', value.toString());
    setIsPremium(value);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPremium,
      signIn,
      signUp,
      signOut,
      setPremium
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}