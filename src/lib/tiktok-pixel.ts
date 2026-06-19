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

  // 点击订阅按钮
  clickSubscribe: (planName?: string) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ClickSubscribe', { plan_name: planName });
    }
  },

  // 开始结账流程
  startCheckout: (value?: number) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('StartCheckout', { value: value || 0 });
    }
  },

  // 付费完成
  completePayment: (value?: number, currency?: string) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('CompletePayment', {
        value: value || 0,
        currency: currency || 'USD',
      });
    }
  },

  // 开始免费诊断
  startFreeDiagnosis: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('StartFreeDiagnosis');
    }
  },

  // 提交诊断表单
  submitDiagnosis: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('SubmitDiagnosis');
    }
  },

  // 查看诊断结果
  viewDiagnosisResult: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ViewDiagnosisResult');
    }
  },

  // 点击免费按钮（通用）
  clickStartFree: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ClickStartFree');
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

  // 通用事件追踪
  track: (event: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track(event, params);
    }
  },
};