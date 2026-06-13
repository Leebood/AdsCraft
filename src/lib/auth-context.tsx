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
  route: string; // 零售商、制造商、品牌方、本地服务商、localService
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
  refreshSubscription: () => Promise<void>;
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

  // 从数据库获取真实订阅状态
  const fetchSubscriptionFromDB = async (userId: string) => {
    try {
      const client = await getSupabaseBrowserClientWithRetry();
      
      // 获取当前 session token
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/subscription', {
        headers: {
          'x-session': session.access_token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionState(data.subscription);
        
        // 同步到 localStorage 以减少 API 调用
        localStorage.setItem('adscraft_subscription', JSON.stringify(data.subscription));
      }
    } catch (error) {
      console.error('获取订阅状态失败:', error);
    }
  };

  // 刷新订阅状态（支付成功后调用）
  const refreshSubscription = async () => {
    if (!user) return;
    await fetchSubscriptionFromDB(user.id);
  };

  useEffect(() => {
    // 等待配置加载完成
    if (configLoading) return;

    let authSubscription: { unsubscribe: () => void } | null = null;

    // 检查当前登录状态
    getSupabaseBrowserClientWithRetry().then((client) => {
      client.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user as User);
          // 从数据库获取真实订阅状态
          await fetchSubscriptionFromDB(session.user.id);
        }
        setLoading(false);
      });

      // 监听登录状态变化
      const { data } = client.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user as User || null);
        if (session?.user) {
          // 登录后获取订阅状态
          await fetchSubscriptionFromDB(session.user.id);
        } else {
          // 登出后清除订阅状态
          setSubscriptionState({ route: '', status: 'none' });
          localStorage.removeItem('adscraft_subscription');
        }
        setLoading(false);
      });
      
      authSubscription = data.subscription;
    });

    // 正确的清理函数位置
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [configLoading]);

  const signIn = async (email: string, password: string) => {
    const client = await getSupabaseBrowserClientWithRetry();
    const { error, data } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // 登录成功后获取订阅状态
    if (data.user) {
      await fetchSubscriptionFromDB(data.user.id);
    }
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

  // 设置订阅（本地临时方案，支付成功后应该调用 refreshSubscription）
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
  // route 参数格式: 'retailer', 'manufacturer', 'brand', 'localService', 'local_service'
  const checkRouteAccess = (route: string): boolean => {
    if (!user) return false; // 未登录无权限
    if (subscription.status !== 'active') return false; // 未订阅无权限
    
    // 兼容不同的路线名称格式
    const normalizedRoute = route === 'local_service' ? 'localService' : route;
    const normalizedSubscriptionRoute = subscription.route === 'local_service' ? 'localService' : subscription.route;
    
    return normalizedSubscriptionRoute === normalizedRoute;
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
      checkRouteAccess,
      refreshSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
}