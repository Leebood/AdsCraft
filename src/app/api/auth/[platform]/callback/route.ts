/**
 * 统一 OAuth 回调路由
 * GET /api/auth/[platform]/callback - 处理 OAuth 回调
 * 按平台读取配置，换取 token 并存储
 */

import { NextRequest, NextResponse } from 'next/server';
import { PLATFORM_CONFIGS, PlatformId } from '@/lib/platforms/registry';
import { createServerSupabaseClient } from '@/lib/platforms/tiktok-adapter';

// TikTok Token 换取函数
async function exchangeTikTokToken(code: string, redirectUri: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  advertiser_ids?: string[];
}> {
  const clientId = process.env.TIKTOK_CLIENT_ID;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('TikTok OAuth credentials not configured');
  }
  
  const response = await fetch('https://business-api.tiktok.com/open_api/v1.0/oauth2/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok token exchange failed: ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`);
  }
  
  return {
    access_token: data.data.access_token,
    refresh_token: data.data.refresh_token,
    expires_in: data.data.expires_in,
    advertiser_ids: data.data.advertiser_ids,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // 获取授权码和 state
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }
    
    // 解析 state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const platformId = platform as PlatformId;
    const config = PLATFORM_CONFIGS[platformId];
    
    if (!config || !config.oauth) {
      return NextResponse.json(
        { error: `Unsupported platform: ${platform}` },
        { status: 400 }
      );
    }
    
    // 验证 state 中的 platform 匹配
    if (stateData.platform !== platformId) {
      return NextResponse.json(
        { error: 'State platform mismatch' },
        { status: 400 }
      );
    }
    
    // 构建 redirect_uri（必须与授权请求一致）
    const redirectUri = `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}${config.oauth.callbackPath}`;
    
    // 按平台换取 token
    let tokenData: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      advertiser_ids?: string[];
    };
    
    if (platformId === 'tiktok') {
      tokenData = await exchangeTikTokToken(code, redirectUri);
    } else {
      // 其他平台的 token 换取逻辑
      // TODO: 实现 Facebook/Meta OAuth
      return NextResponse.json(
        { error: `OAuth for ${platform} not implemented yet` },
        { status: 501 }
      );
    }
    
    // 获取用户信息（从 state 或 session）
    const supabase = createServerSupabaseClient();
    let userId: string | undefined;
    
    if (stateData.sessionToken) {
      const { data: { user } } = await supabase.auth.getUser(stateData.sessionToken);
      userId = user?.id;
    }
    
    if (!userId) {
      // 未登录用户，需要先登录再绑定账号
      // 将 token 信息存入临时位置，引导用户登录
      return NextResponse.redirect(
        `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}/login?message=please_login_to_connect&platform=${platform}`
      );
    }
    
    // 存储 token 到 platform_connections 表
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    
    const { error: insertError } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: userId,
        platform: platformId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        advertiser_ids: tokenData.advertiser_ids || [],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform',
      });
    
    if (insertError) {
      console.error('Failed to store token:', insertError);
      return NextResponse.json(
        { error: 'Failed to store connection' },
        { status: 500 }
      );
    }
    
    // 成功，重定向到仪表板或设置页面
    return NextResponse.redirect(
      `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}/dashboard?platform_connected=${platform}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}