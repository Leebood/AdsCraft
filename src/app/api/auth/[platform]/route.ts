/**
 * 统一 OAuth 入口路由
 * GET /api/auth/[platform] - 发起 OAuth 授权
 * 按平台读取配置，生成授权 URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { PLATFORM_CONFIGS, PlatformId } from '@/lib/platforms/registry';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    
    // 验证平台是否支持
    const platformId = platform as PlatformId;
    const config = PLATFORM_CONFIGS[platformId];
    
    if (!config) {
      return NextResponse.json(
        { error: `Unsupported platform: ${platform}` },
        { status: 400 }
      );
    }
    
    // 检查平台是否支持 OAuth
    if (config.dataSource !== 'api' || !config.oauth) {
      return NextResponse.json(
        { error: `Platform ${platform} does not support OAuth` },
        { status: 400 }
      );
    }
    
    // 获取 session token（可选，用于关联用户）
    const sessionToken = request.headers.get('x-session');
    
    // 生成 state 参数（包含用户信息和时间戳，用于防 CSRF）
    const state = Buffer.from(JSON.stringify({
      platform: platformId,
      timestamp: Date.now(),
      sessionToken: sessionToken || '',
    })).toString('base64');
    
    // 构建授权 URL
    const authUrl = new URL(config.oauth.authorizeUrl);
    authUrl.searchParams.set('client_id', process.env[`TIKTOK_CLIENT_ID`] || ''); // TODO: 支持多平台环境变量
    authUrl.searchParams.set('redirect_uri', `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'}${config.oauth.callbackPath}`);
    authUrl.searchParams.set('scope', config.oauth.scopes.join(','));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    
    // TikTok 特有参数
    if (platformId === 'tiktok') {
      // TikTok 需要额外参数
    }
    
    // 重定向到授权页面
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('OAuth init error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}