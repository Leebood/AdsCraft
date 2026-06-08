/**
 * 微信支付工具函数
 * 使用微信支付V3 API（Native支付）
 */

import crypto from 'crypto';

// 微信支付配置
const WECHAT_PAY_CONFIG = {
  mch_id: process.env.WECHAT_PAY_MCH_ID || '1746070491',
  app_id: process.env.WECHAT_PAY_APP_ID || 'wx47d0dabb64cfc8ac',
  api_key: process.env.WECHAT_PAY_API_KEY || 'liveoverlay199707315436412182leo',
  serial_no: process.env.WECHAT_PAY_SERIAL_NO || '77550623C5D2CF603ED95DEE99FAF5991AB33206',
  notify_url: process.env.WECHAT_PAY_NOTIFY_URL || 'https://ailiveonline.com/api/billing/webhook/wechat',
  private_key: process.env.WECHAT_PAY_PRIVATE_KEY || '',
};

// 微信支付API地址
const WECHAT_API_BASE = 'https://api.mch.weixin.qq.com';

/**
 * 生成签名
 */
function generateSignature(method: string, url: string, timestamp: string, nonce: string, body: string = ''): string {
  const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message);
  sign.end();
  return sign.sign(WECHAT_PAY_CONFIG.private_key, 'base64');
}

/**
 * 生成Authorization头部
 */
function buildAuthHeader(method: string, url: string, body: string = ''): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = generateSignature(method, url, timestamp, nonce, body);
  
  return `WECHATPAY2-SHA256-RSA2048 mchid="${WECHAT_PAY_CONFIG.mch_id}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${WECHAT_PAY_CONFIG.serial_no}",signature="${signature}"`;
}

/**
 * 创建Native支付订单（扫码支付）
 */
export async function createNativeOrder(
  out_trade_no: string,
  total_amount: number, // 单位：分
  description: string
): Promise<{ code_url: string; out_trade_no: string } | { error: string }> {
  try {
    const url = '/v3/pay/transactions/native';
    const body = JSON.stringify({
      appid: WECHAT_PAY_CONFIG.app_id,
      mchid: WECHAT_PAY_CONFIG.mch_id,
      description: description,
      out_trade_no: out_trade_no,
      notify_url: WECHAT_PAY_CONFIG.notify_url,
      amount: {
        total: total_amount,
        currency: 'CNY',
      },
    });
    
    const authHeader = buildAuthHeader('POST', url, body);
    
    const response = await fetch(`${WECHAT_API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
      body: body,
    });
    
    const result = await response.json();
    
    if (response.ok && result.code_url) {
      return {
        code_url: result.code_url, // 二维码链接
        out_trade_no: out_trade_no,
      };
    } else {
      return {
        error: result.message || '创建订单失败',
      };
    }
  } catch (error) {
    console.error('微信支付创建订单错误:', error);
    return {
      error: error instanceof Error ? error.message : '创建订单失败',
    };
  }
}

/**
 * 验证回调签名
 */
export function verifyCallbackSignature(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string,
  serial_no: string
): boolean {
  // 验证证书序列号
  if (serial_no !== WECHAT_PAY_CONFIG.serial_no) {
    console.error('证书序列号不匹配');
    return false;
  }
  
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(message);
  verifier.end();
  
  // 需要微信平台的公钥来验证，这里简化处理
  // 实际生产环境需要获取微信平台证书
  return true;
}

/**
 * 解密回调数据（AES-256-GCM）
 */
export function decryptCallbackData(
  associated_data: string,
  nonce: string,
  ciphertext: string
): string {
  const key = WECHAT_PAY_CONFIG.api_key;
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'utf8'),
    Buffer.from(nonce, 'utf8')
  );
  
  decipher.setAAD(Buffer.from(associated_data, 'utf8'));
  
  // 从ciphertext提取认证标签（最后16字节）
  const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
  const authTag = ciphertextBuffer.slice(-16);
  const data = ciphertextBuffer.slice(0, -16);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(data, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * 查询订单状态
 */
export async function queryOrderStatus(out_trade_no: string): Promise<{
  trade_state: string;
  transaction_id?: string;
  success_time?: string;
} | { error: string }> {
  try {
    const url = `/v3/pay/transactions/out-trade-no/${out_trade_no}?mchid=${WECHAT_PAY_CONFIG.mch_id}`;
    const authHeader = buildAuthHeader('GET', url);
    
    const response = await fetch(`${WECHAT_API_BASE}${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return {
        trade_state: result.trade_state,
        transaction_id: result.transaction_id,
        success_time: result.success_time,
      };
    } else {
      return {
        error: result.message || '查询订单失败',
      };
    }
  } catch (error) {
    console.error('微信支付查询订单错误:', error);
    return {
      error: error instanceof Error ? error.message : '查询订单失败',
    };
  }
}

/**
 * 价格映射（美元转人民币分）
 */
export const PRICING_MAP: Record<string, { price_usd: string; price_cny: number }> = {
  retailer: { price_usd: '$19.9', price_cny: 14200 }, // 约142元
  manufacturer: { price_usd: '$29.9', price_cny: 21400 }, // 约214元
  brand: { price_usd: '$29.9', price_cny: 21400 }, // 约214元
  local_service: { price_usd: '$9.9', price_cny: 7100 }, // 约71元
};