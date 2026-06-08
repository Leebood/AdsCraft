// Creem支付配置 - 4个线路的产品链接
export const CREEM_PRODUCTS = {
  // 零售商路线
  retailer: {
    productId: 'prod_77H9iTdPoURp4C2Le1xhE8',
    url: 'https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8',
    price: '$19.9',
    priceValue: 19.9,
  },
  // 制造商路线
  manufacturer: {
    productId: 'prod_2jkEL15rXCjBQxkEGpXR5v',
    url: 'https://www.creem.io/payment/prod_2jkEL15rXCjBQxkEGpXR5v',
    price: '$29.9',
    priceValue: 29.9,
  },
  // 品牌方路线
  brand: {
    productId: 'prod_2B7hXzysLFhXYvP8bmTa9c',
    url: 'https://www.creem.io/payment/prod_2B7hXzysLFhXYvP8bmTa9c',
    price: '$29.9',
    priceValue: 29.9,
  },
  // 本地服务商路线
  local_service: {
    productId: 'prod_4iIOpYQLDR8tlnxu6Ziwz6',
    url: 'https://www.creem.io/payment/prod_4iIOpYQLDR8tlnxu6Ziwz6',
    price: '$9.9',
    priceValue: 9.9,
  },
} as const;

export type CreemRoute = keyof typeof CREEM_PRODUCTS;