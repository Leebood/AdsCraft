// Creem支付配置 - Facebook + TikTok 付费线路的产品链接
// 使用 platform_routeId 格式作为 key，区分不同平台的同名线路
export const CREEM_PRODUCTS = {
  // Facebook 零售商路线
  fb_retailer: {
    productId: 'prod_77H9iTdPoURp4C2Le1xhE8',
    url: 'https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8',
    price: '$19.9',
    priceValue: 19.9,
    priceCn: '¥143',
  },
  // Facebook 制造商路线
  fb_manufacturer: {
    productId: 'prod_2jkEL15rXCjBQxkEGpXR5v',
    url: 'https://www.creem.io/payment/prod_2jkEL15rXCjBQxkEGpXR5v',
    price: '$29.9',
    priceValue: 29.9,
    priceCn: '¥215',
  },
  // Facebook 品牌方路线
  fb_brand: {
    productId: 'prod_2B7hXzysLFhXYvP8bmTa9c',
    url: 'https://www.creem.io/payment/prod_2B7hXzysLFhXYvP8bmTa9c',
    price: '$29.9',
    priceValue: 29.9,
    priceCn: '¥215',
  },
  // Facebook 本地服务商路线
  fb_local_service: {
    productId: 'prod_4iIOpYQLDR8tlnxu6Ziwz6',
    url: 'https://www.creem.io/payment/prod_4iIOpYQLDR8tlnxu6Ziwz6',
    price: '$9.9',
    priceValue: 9.9,
    priceCn: '¥71',
  },
  // TikTok Local Service Plan
  tiktok_local_service: {
    productId: 'prod_sOYjwKXMpsOig5VmY0R4d',
    url: 'https://www.creem.io/payment/prod_sOYjwKXMpsOig5VmY0R4d',
    price: '$14.9',
    priceValue: 14.9,
    priceCn: '¥107',
  },
  // TikTok Website Conversion Plan
  tiktok_website_conv: {
    productId: 'prod_8D7PXxYlpaNfTQ9MgMoQ2',
    url: 'https://www.creem.io/payment/prod_8D7PXxYlpaNfTQ9MgMoQ2',
    price: '$24.9',
    priceValue: 24.9,
    priceCn: '¥179',
  },
  // TikTok Brand Awareness Plan
  tiktok_brand_awareness: {
    productId: 'prod_6TrbXbote5e43Baxh87OlK',
    url: 'https://www.creem.io/payment/prod_6TrbXbote5e43Baxh87OlK',
    price: '$39.9',
    priceValue: 39.9,
    priceCn: '¥287',
  },
} as const;

export type CreemRoute = keyof typeof CREEM_PRODUCTS;