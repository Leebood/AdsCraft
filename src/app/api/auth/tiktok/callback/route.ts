/**
 * TikTok OAuth 授权回调
 * TikTok 授权成功后回调，获取 access_token 并存储
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tiktokConfig } from '@/lib/platforms/registry';
import { getSupabaseCredentials } from '@/storage/database/supabase-client';

// TikTok OAuth 配置
function getTikTokOAuthConfig() {
  return {
    appId: process.env.TIKTOK_APP_ID || '',
    appSecret: process.env.TIKTOK_APP_SECRET || '',
    redirectUri: process.env.TIKTOK_REDIRECT_URI || 
      `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'localhost:5000'}/api/auth/tiktok/callback`
  };
}

// 获取 Supabase 服务端客户端
function getSupabaseServerClient() {
  const { url, anonKey } = getSupabaseCredentials();
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const config = getTikTokOAuthConfig();
    const supabase = getSupabaseServerClient();
    
    // 获取回调参数
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const error = request.nextUrl.searchParams.get('error');

    // 处理授权失败
    if (error) {
      console.error('TikTok OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=tiktok_auth_failed', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=missing_params', request.url)
      );
    }

    // 解析 state 获取用户 session
    let stateData: { sessionToken: string; timestamp: number; returnTo?: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=invalid_state', request.url)
      );
    }

    // 验证 state 时间戳（防止过期）
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) { // 10分钟有效期
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=state_expired', request.url)
      );
    }

    // 用 code 换取 access_token
    const tokenResponse = await fetch(tiktokConfig.oauth!.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: config.appId,
        app_secret: config.appSecret,
        auth_code: code,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('TikTok token exchange failed:', errorText);
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    
    // 解析 access_token
    const accessToken = tokenData.data?.access_token;
    const refreshToken = tokenData.data?.refresh_token;
    const expiresIn = tokenData.data?.expires_in;
    const advertiserIds = tokenData.data?.advertiser_ids || [];

    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=no_access_token', request.url)
      );
    }

    // 验证用户身份（通过 session token）
    const { data: { user }, error: userError } = await supabase.auth.getUser(stateData.sessionToken);
    
    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=invalid_session', request.url)
      );
    }

    // 存储连接信息到 platform_connections 表
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    
    const { error: insertError } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        platform_user_id: advertiserIds[0] || null, // 主广告账号ID
        scopes: tiktokConfig.oauth!.scopes,
        is_active: true,
        updated_at: new Date()
      }, {
        onConflict: 'user_id,platform'
      });

    if (insertError) {
      console.error('Failed to save TikTok connection:', insertError);
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=save_failed', request.url)
      );
    }

    // 成功，重定向到审查页面（从审查页面发起的授权）
    // 或者重定向到连接管理页面（从其他页面发起的授权）
    const returnTo = stateData.returnTo || '/dashboard/connections';
    return NextResponse.redirect(
      new URL(`${returnTo}?success=tiktok_connected`, request.url)
    );

  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/connections?error=unknown', request.url)
    );
  }
}