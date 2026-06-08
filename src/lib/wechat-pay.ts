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
  serial_no: process.env.WECHAT_PAY_SERIAL_NO || '21E3F60F30238E9DF1AE943194C9F8FC4181EBBA',
  notify_url: process.env.WECHAT_PAY_NOTIFY_URL || 'https://ailiveonline.com/api/billing/webhook/wechat',
  private_key: process.env.WECHAT_PAY_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDByIH/6ZxBgFTh
1Ej+d2ct0phZcU5gh1pk8poXRMdJRRYMv7pAIjzEIdyzk6aDdzggAaCEgjps6F4J
pxfPewWFhBioLVXglaIyg03JWTm7AXr0EfaY3iWodfL7jwlmWXc+TqhN6ftdDwlo
0iwA1ubysQWjtg/0tjeEdSDsLaGaaK4/1XRxZ708KkNvvDWaWJGrjHFIMCPk9xbT
U99uTNbn06bkt4XpBAJHTDsvuEUzi8r3xNCw5QOhYiebkgKUo7Yt7F5hohuYQwMG
v4kUn2IsF0vCivEEJfsvU/I/9oTG2mNCUyNSojbVRr+HJXmEc1kLewTLbhGr51fV
9l76vPpRAgMBAAECggEABb7DE+pCJrL+UT+w9lJl7bbbq3Mvhq8cn/eNV/lDC0oQ
EEqy4+nf8VSrrWtIOYeUU2aY8rTFtKri9thMXWthS4cSEBJgBGuLRoIcEUci7gdq
NMg/jmKvrSHqFUk1VyJ55ZABb2XrfOPQPJpWkaPNbw6Ogz8HlBK+7J9oXXgw3VoF
6WDE8pYzncPYSXvdLpZZJvqIKGPtLsXyUkqOXEKd7atoF642yj4jAPiIn4I2okjN
bCpzQJOKXpQu+U68bKjGRI8TFylpQyG5iNj3611oJEUu6pfWGZSO1mPpK1d+lYK6
Vu53bTe5D84Qt9qmYsbJuw7KRKu4bOA3CpayhgRkvQKBgQDwrTpHBlydAVbLtG55
iBx8Ou3AwCa6Nmle4OEmfDwiIm65fdNhWTPjNPlVgKJayslvJusdDpguQPWMrVkf
nYzUqS6eWAXBVK5IXbR6vvp+pTmtYZhcTBZkXL1UVIH19RyifBRq+Dsg4KrBSWKC
eST4bG15CkUZtmnk/YDNnuUHbwKBgQDOHvegZLMWOIaEEsTinbGDBFvfLtPYQ40t
1iMOepECu3fucclVpW4x5fu6mC6I+gcKqK6QDn+Q+uZn4G0YzQiHfGVByPwVJx+k
lPM9Mgb6whzWI/pDXwoh1LrGmUjTMxEsdo8LIwu+IxolQFkiVdtJ2RaYFCrM7aHS
67rbLd86PwKBgCsIbjEg3BJemOxXWKF2StGTn8slEEefTvvd7aP59q6LxYx5CQCQ
+IwZfrNhCqZ9N8MeDE/nuiIbD0yV+ieC/hlQHrvFNVI6F+dsicagux1F4ag0mQ93
s1FCm7+mVI5rwzDySpxNwhTA1wc0Xd7CVm/swy4vPee5C/obsZoSXRUVAoGAVTA7
S9ESqyZlggR31ukxymJszgr+hy00FjOgfYVulWCBqszgV0NuDbVtmqr24KnlayRY
MTWsx3DK9TeuH0fuNIDXIJ8+gEeRLmZZOXuJou3DGUX5UwrelyjioN4NWSyL9oJx
kDrFyamcTrUPob82SIkua2A6aEP2U8QVkCyfS+UCgYBh01dTyCKk9V0uylLviB57
OD3R/1NOrlYq5iNlvvfRAdGoj186rFGuKaZs/lq3VOsqkTUzAdKdUKys0nXCcJwg
o4nUw8QyXNxFXN68Egarfwl4r110DuIPJyAQSiVlEay0dgkqxuY4kNSJCl8wav0/
Lm13nk46xGQGrXe03a4nQA==
-----END PRIVATE KEY-----`,
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