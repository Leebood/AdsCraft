// lib/tiktok-pixel.ts
// TikTok Pixel 事件追踪工具函数

declare global {
  interface Window {
    ttq: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

export const tiktokPixel = {
  // 页面浏览（首页/落地页加载时调用）
  viewContent: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ViewContent');
    }
  },

  // 用户开始答题/点击Start按钮时调用
  addToCart: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('AddToCart');
    }
  },

  // 用户提交诊断/点击Submit按钮时调用
  initiateCheckout: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('InitiateCheckout');
    }
  },

  // 用户付费成功时调用
  purchase: (value?: number) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('Purchase', {
        value: value || 0,
        currency: 'USD',
      });
    }
  },
};