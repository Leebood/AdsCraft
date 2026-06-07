'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

// 订阅状态
interface Subscription {
  route: string; // 零售商、制造商、品牌方、本地服务商
  status: 'active' | 'expired' | 'none';
  expiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  subscription: Subscription;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setPremium: (value: boolean) => void;
  setSubscription: (route: string) => void;
  checkRouteAccess: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscriptionState] = useState<Subscription>({ route: '', status: 'none' });
  const { isLoading: configLoading } = useSupabaseConfig();

  // isPremium 基于订阅状态计算
  const isPremium = subscription.status === 'active';

  useEffect(() => {
    // 从localStorage读取订阅状态（简化方案，实际应从数据库/API获取）
    const savedSubscription = localStorage.getItem('adscraft_subscription');
    if (savedSubscription) {
      try {
        const sub = JSON.parse(savedSubscription);
        setSubscriptionState(sub);
      } catch {
        // ignore
      }
    }

    // 等待配置加载完成
    if (configLoading) return;

    // 检查当前登录状态
    getSupabaseBrowserClientWithRetry().then((client) => {
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
    });
  }, [configLoading]);

  const signIn = async (email: string, password: string) => {
    const client = await getSupabaseBrowserClientWithRetry();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const client = await getSupabaseBrowserClientWithRetry();
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
    const client = await getSupabaseBrowserClientWithRetry();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    setUser(null);
    localStorage.removeItem('adscraft_subscription');
    setSubscriptionState({ route: '', status: 'none' });
  };

  // 设置订阅（简化方案，实际应调用支付API）
  const setSubscription = (route: string) => {
    const newSub: Subscription = {
      route,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后过期
    };
    localStorage.setItem('adscraft_subscription', JSON.stringify(newSub));
    setSubscriptionState(newSub);
  };

  // 保留旧的setPremium方法兼容性
  const setPremium = (value: boolean) => {
    if (value) {
      setSubscription('retailer'); // 默认设置为零售商
    } else {
      localStorage.removeItem('adscraft_subscription');
      setSubscriptionState({ route: '', status: 'none' });
    }
  };

  // 检查用户是否有权限访问特定路线的内容
  const checkRouteAccess = (route: string): boolean => {
    if (!user) return false; // 未登录无权限
    if (subscription.status !== 'active') return false; // 未订阅无权限
    return subscription.route === route; // 只能访问已订阅路线的内容
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPremium,
      subscription,
      signIn,
      signUp,
      signOut,
      setPremium,
      setSubscription,
      checkRouteAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
}