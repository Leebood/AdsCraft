/**
 * TikTok Token 管理模块
 * 负责：Token存储、自动刷新（每12小时）、过期检测
 * 
 * TikTok Token 特性：
 * - access_token 24小时过期
 * - 无传统refresh_token，用当前access_token作为refresh_token
 * - 刷新端点：POST https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/refresh/
 * - 请求体：{"app_id": "xxx", "secret": "xxx", "refresh_token": "当前access_token"}
 */

import { createServerSupabaseClient } from '@/lib/platforms/tiktok-adapter';
import { getTikTokFullConfig } from '@/storage/database/supabase-client';

const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

// 系统级Token的用户ID标识
const SYSTEM_USER_ID = 'system_tiktok';

interface TikTokTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface TikTokRefreshResponse {
  code: number;
  message: string;
  data: TikTokTokenData;
  request_id: string;
}

interface StoredToken {
  id: string;
  user_id: string;
  platform: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  platform_user_id: string;
  is_active: boolean;
}

/**
 * 刷新TikTok Access Token
 * 使用当前access_token作为refresh_token
 */
export async function refreshTikTokAccessToken(
  currentAccessToken: string,
  appId: string,
  appSecret: string
): Promise<TikTokTokenData> {
  const response = await fetch(`${TIKTOK_API_BASE}/oauth2/access_token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      secret: appSecret,
      refresh_token: currentAccessToken, // TikTok使用当前access_token作为refresh_token
    }),
  });

  const data: TikTokRefreshResponse = await response.json();

  if (data.code !== 0) {
    throw new Error(`TikTok token refresh failed: ${data.message} (code: ${data.code})`);
  }

  return data.data;
}

/**
 * 从Supabase获取存储的系统Token
 */
export async function getStoredToken(): Promise<StoredToken | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('user_id', SYSTEM_USER_ID)
    .eq('platform', 'tiktok')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as StoredToken;
}

/**
 * 初始化系统Token到Supabase（从环境变量读取）
 */
export async function initializeTokenFromEnv(): Promise<boolean> {
  const config = getTikTokFullConfig();
  if (!config) {
    console.error('TikTok config not found in environment variables');
    return false;
  }

  const supabase = createServerSupabaseClient();

  // 检查是否已存在token
  const existing = await getStoredToken();
  if (existing && existing.access_token === config.accessToken) {
    console.log('Token already initialized and matches env');
    return true;
  }

  // 存储新token（24小时过期）
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('platform_connections')
    .upsert({
      user_id: SYSTEM_USER_ID,
      platform: 'tiktok',
      access_token: config.accessToken,
      refresh_token: config.accessToken, // TikTok用access_token作为refresh_token
      token_expires_at: expiresAt.toISOString(),
      platform_user_id: config.advertiserId,
      is_active: true,
      scopes: [],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,platform'
    });

  if (error) {
    console.error('Failed to store TikTok token:', error);
    return false;
  }

  console.log('TikTok token initialized successfully');
  return true;
}

/**
 * 检查Token是否需要刷新（距离过期少于12小时）
 */
export function needsRefresh(expiresAt: string): boolean {
  const expiration = new Date(expiresAt);
  const now = new Date();
  const hoursUntilExpiry = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // 距离过期少于12小时时需要刷新
  return hoursUntilExpiry < 12;
}

/**
 * 执行Token刷新并更新Supabase
 */
export async function refreshTokenIfNeeded(): Promise<{
  success: boolean;
  newToken?: string;
  error?: string;
}> {
  try {
    const config = getTikTokFullConfig();
    if (!config) {
      return { success: false, error: 'TikTok config not available' };
    }

    // 获取存储的token
    let storedToken = await getStoredToken();
    
    // 如果没有存储的token，从环境变量初始化
    if (!storedToken) {
      const initialized = await initializeTokenFromEnv();
      if (!initialized) {
        return { success: false, error: 'Failed to initialize token from env' };
      }
      storedToken = await getStoredToken();
      if (!storedToken) {
        return { success: false, error: 'Token not found after initialization' };
      }
    }

    // 检查是否需要刷新
    if (!needsRefresh(storedToken.token_expires_at)) {
      console.log('Token does not need refresh yet');
      return { success: true, newToken: storedToken.access_token };
    }

    // 执行刷新
    console.log('Refreshing TikTok token...');
    const newTokenData = await refreshTikTokAccessToken(
      storedToken.access_token,
      config.appId,
      config.appSecret
    );

    // 计算新的过期时间
    const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);

    // 更新Supabase
    const supabase = createServerSupabaseClient();
    const { error: updateError } = await supabase
      .from('platform_connections')
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        token_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', storedToken.id);

    if (updateError) {
      console.error('Failed to update token in Supabase:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('TikTok token refreshed successfully, expires at:', newExpiresAt);
    return { success: true, newToken: newTokenData.access_token };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Token refresh failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 获取有效的Access Token（自动刷新如果需要）
 */
export async function getValidAccessToken(): Promise<string | null> {
  const result = await refreshTokenIfNeeded();
  return result.success ? result.newToken ?? null : null;
}

/**
 * 获取Advertiser ID
 */
export async function getAdvertiserId(): Promise<string | null> {
  const config = getTikTokFullConfig();
  if (config) {
    return config.advertiserId;
  }

  const storedToken = await getStoredToken();
  return storedToken?.platform_user_id ?? null;
}

/**
 * 标记Token为需要重新授权
 */
export async function markTokenAsNeedsReauth(reason: string): Promise<void> {
  const storedToken = await getStoredToken();
  if (!storedToken) return;

  const supabase = createServerSupabaseClient();
  await supabase
    .from('platform_connections')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storedToken.id);
  
  console.log('Token marked as needing reauth:', reason);
}