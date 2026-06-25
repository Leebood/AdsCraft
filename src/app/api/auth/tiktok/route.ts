/**
 * TikTok OAuth 授权启动
 * 用户点击授权按钮后，重定向到 TikTok 授权页面
 */

import { NextRequest, NextResponse } from 'next/server';
import { tiktokConfig } from '@/lib/platforms/registry';

// TikTok OAuth 配置
function getTikTokOAuthConfig() {
  return {
    appId: process.env.TIKTOK_APP_ID || '',
    appSecret: process.env.TIKTOK_APP_SECRET || '',
    redirectUri: process.env.TIKTOK_REDIRECT_URI || 
      `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'localhost:5000'}/api/auth/tiktok/callback`
  };
}

export async function GET(request: NextRequest) {
  try {
    const config = getTikTokOAuthConfig();
    
    if (!config.appId) {
      return NextResponse.json(
        { error: 'TikTok OAuth not configured. Please set TIKTOK_APP_ID environment variable.' },
        { status: 500 }
      );
    }

    // 获取 session token 用于关联用户
    const sessionToken = request.headers.get('x-session') || 
      request.cookies.get('sb-access-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // 生成 state 参数（用于防 CSRF 和关联用户）
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard/connections';
    const state = Buffer.from(JSON.stringify({
      sessionToken,
      timestamp: Date.now(),
      returnTo
    })).toString('base64url');

    // 构建 TikTok 授权 URL
    const authorizeUrl = new URL(tiktokConfig.oauth!.authorizeUrl);
    authorizeUrl.searchParams.set('app_id', config.appId);
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('scope', tiktokConfig.oauth!.scopes.join(','));
    authorizeUrl.searchParams.set('redirect_uri', config.redirectUri);
    authorizeUrl.searchParams.set('response_type', 'code');

    // 重定向到 TikTok 授权页面
    return NextResponse.redirect(authorizeUrl.toString());

  } catch (error) {
    console.error('TikTok OAuth start error:', error);
    return NextResponse.json(
      { error: 'Failed to start TikTok OAuth' },
      { status: 500 }
    );
  }
}