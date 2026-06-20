/**
 * L0 - 硬规则审查（纯代码判定，不调用AI）
 * 
 * 检查维度：
 * 1. 禁止行业判定
 * 2. 限制行业资质判定
 * 3. 视频规格判定
 * 4. URL可达性判定
 * 5. Pixel安装状态判定
 * 6. 目标×检查项判定矩阵
 */

// 检查结果类型
export type L0CheckResult = 'block' | 'high_risk' | 'pass' | 'irrelevant';

// 检查项接口
export interface L0CheckItem {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  result: L0CheckResult;
  reason?: string;
  suggestion?: string;
}

// L0整体结果
export interface L0Result {
  overall: L0CheckResult;
  checks: L0CheckItem[];
  summary: string;
  summaryZh: string;
}

// 禁止行业列表（TikTok Ads）
const PROHIBITED_INDUSTRIES = [
  'tobacco',
  'drugs',
  'weapons',
  'adult_content',
  'gambling',
  'counterfeit',
];

// 限制行业列表（需要特殊资质）
const RESTRICTED_INDUSTRIES = [
  'healthcare',
  'pharmaceutical',
  'financial_services',
  'crypto',
  'political',
  'beauty_medical', // 医疗美容
];

// 限制行业所需资质映射
const RESTRICTED_INDUSTRIES_REQUIREMENTS: Record<string, string[]> = {
  healthcare: ['医疗机构执业许可证', 'Healthcare License'],
  pharmaceutical: ['药品广告审批', 'Pharmaceutical Advertising Approval'],
  financial_services: ['金融牌照', 'Financial License'],
  crypto: ['加密货币合规证明', 'Crypto Compliance Certificate'],
  political: ['政治广告审批', 'Political Advertising Approval'],
  beauty_medical: ['医疗美容机构资质', 'Medical Beauty Facility License'],
};

// 视频规格要求（TikTok Ads）
const VIDEO_SPEC_REQUIREMENTS = {
  min_duration: 5, // 最短5秒
  max_duration: 60, // 最长60秒
  recommended_duration: [15, 30], // 推荐15-30秒
  min_resolution: 720, // 最低720p
  recommended_resolution: [1080, 1920], // 推荐1080p
  aspect_ratios: ['9:16', '16:9', '1:1'], // 支持的宽高比
  max_file_size_mb: 500, // 最大500MB
};

/**
 * 检查行业是否被禁止
 */
export function checkProhibitedIndustry(industry: string): L0CheckItem {
  const isProhibited = PROHIBITED_INDUSTRIES.includes(industry.toLowerCase());
  
  return {
    id: 'industry_prohibited',
    name: 'Prohibited Industry Check',
    nameZh: '禁止行业检查',
    category: 'industry',
    result: isProhibited ? 'block' : 'pass',
    reason: isProhibited 
      ? `Industry "${industry}" is prohibited on TikTok Ads`
      : undefined,
    suggestion: isProhibited 
      ? 'This industry is not allowed. Please choose a different industry or platform.'
      : undefined,
  };
}

/**
 * 检查行业是否受限及资质要求
 */
export function checkRestrictedIndustry(
  industry: string,
  hasLicense: boolean
): L0CheckItem {
  const industryLower = industry.toLowerCase();
  const isRestricted = RESTRICTED_INDUSTRIES.some(r => 
    industryLower.includes(r) || r.includes(industryLower)
  );
  
  const requirements = isRestricted 
    ? RESTRICTED_INDUSTRIES_REQUIREMENTS[industryLower] || []
    : [];
  
  if (!isRestricted) {
    return {
      id: 'industry_restricted',
      name: 'Restricted Industry Check',
      nameZh: '限制行业检查',
      category: 'industry',
      result: 'pass',
    };
  }
  
  // 受限行业但无资质
  if (!hasLicense) {
    return {
      id: 'industry_restricted',
      name: 'Restricted Industry Check',
      nameZh: '限制行业检查',
      category: 'industry',
      result: 'high_risk',
      reason: `Industry "${industry}" requires special license`,
      suggestion: `Required licenses: ${requirements.join(', ')}. Please upload relevant certifications.`,
    };
  }
  
  // 受限行业且有资质
  return {
    id: 'industry_restricted',
    name: 'Restricted Industry Check',
    nameZh: '限制行业检查',
    category: 'industry',
    result: 'pass',
    reason: 'Restricted industry with valid license',
  };
}

/**
 * 检查视频规格
 */
export function checkVideoSpecs(
  duration: number,
  resolution: number,
  aspectRatio: string,
  fileSizeMb: number
): L0CheckItem[] {
  let checks: L0CheckItem[] = [];
  
  // 时长检查
  const durationCheck: L0CheckItem = {
    id: 'video_duration',
    name: 'Video Duration Check',
    nameZh: '视频时长检查',
    category: 'video',
    result: 'pass',
  };
  
  if (duration < VIDEO_SPEC_REQUIREMENTS.min_duration) {
    durationCheck.result = 'block';
    durationCheck.reason = `Video duration ${duration}s is too short (min: ${VIDEO_SPEC_REQUIREMENTS.min_duration}s)`;
    durationCheck.suggestion = 'Extend video to at least 5 seconds';
  } else if (duration > VIDEO_SPEC_REQUIREMENTS.max_duration) {
    durationCheck.result = 'high_risk';
    durationCheck.reason = `Video duration ${duration}s exceeds recommended max (${VIDEO_SPEC_REQUIREMENTS.max_duration}s)`;
    durationCheck.suggestion = 'Shorten video to 60 seconds or less for better performance';
  }
  checks.push(durationCheck);
  
  // 分辨率检查
  const resolutionCheck: L0CheckItem = {
    id: 'video_resolution',
    name: 'Video Resolution Check',
    nameZh: '视频分辨率检查',
    category: 'video',
    result: 'pass',
  };
  
  if (resolution < VIDEO_SPEC_REQUIREMENTS.min_resolution) {
    resolutionCheck.result = 'high_risk';
    resolutionCheck.reason = `Resolution ${resolution}p is below minimum (${VIDEO_SPEC_REQUIREMENTS.min_resolution}p)`;
    resolutionCheck.suggestion = 'Use at least 720p resolution for better ad performance';
  }
  checks.push(resolutionCheck);
  
  // 宽高比检查
  const aspectRatioCheck: L0CheckItem = {
    id: 'video_aspect_ratio',
    name: 'Video Aspect Ratio Check',
    nameZh: '视频宽高比检查',
    category: 'video',
    result: 'pass',
  };
  
  if (!VIDEO_SPEC_REQUIREMENTS.aspect_ratios.includes(aspectRatio)) {
    aspectRatioCheck.result = 'high_risk';
    aspectRatioCheck.reason = `Aspect ratio ${aspectRatio} is not recommended`;
    aspectRatioCheck.suggestion = `Use recommended ratios: ${VIDEO_SPEC_REQUIREMENTS.aspect_ratios.join(', ')}`;
  }
  checks.push(aspectRatioCheck);
  
  // 文件大小检查
  const fileSizeCheck: L0CheckItem = {
    id: 'video_file_size',
    name: 'Video File Size Check',
    nameZh: '视频文件大小检查',
    category: 'video',
    result: 'pass',
  };
  
  if (fileSizeMb > VIDEO_SPEC_REQUIREMENTS.max_file_size_mb) {
    fileSizeCheck.result = 'block';
    fileSizeCheck.reason = `File size ${fileSizeMb}MB exceeds limit (${VIDEO_SPEC_REQUIREMENTS.max_file_size_mb}MB)`;
    fileSizeCheck.suggestion = 'Compress video or reduce resolution to meet file size limit';
  }
  checks.push(fileSizeCheck);
  
  return checks;
}

/**
 * 检查URL可达性（简化版，实际需要HTTP请求）
 */
export function checkUrlAccessibility(url: string): L0CheckItem {
  // 基础URL格式检查
  const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
  
  if (!isValidUrl) {
    return {
      id: 'url_format',
      name: 'URL Format Check',
      nameZh: 'URL格式检查',
      category: 'landing_page',
      result: 'block',
      reason: 'Invalid URL format',
      suggestion: 'Use valid URL starting with https://',
    };
  }
  
  // HTTPS检查
  const isHttps = url.startsWith('https://');
  
  if (!isHttps) {
    return {
      id: 'url_https',
      name: 'HTTPS Check',
      nameZh: 'HTTPS检查',
      category: 'landing_page',
      result: 'high_risk',
      reason: 'URL is not using HTTPS',
      suggestion: 'Use HTTPS URL for better security and trust',
    };
  }
  
  // 格式正确，实际可达性需要HTTP请求验证（在L4技术验证层）
  return {
    id: 'url_format',
    name: 'URL Format Check',
    nameZh: 'URL格式检查',
    category: 'landing_page',
    result: 'pass',
    reason: 'URL format is valid (actual accessibility will be verified)',
  };
}

/**
 * 检查Pixel安装状态
 */
export function checkPixelStatus(
  pixelInstalled: boolean,
  eventsConfigured: string[]
): L0CheckItem[] {
  const checks: L0CheckItem[] = [];
  
  // Pixel安装检查
  const installCheck: L0CheckItem = {
    id: 'pixel_install',
    name: 'Pixel Installation Check',
    nameZh: 'Pixel安装检查',
    category: 'tracking',
    result: pixelInstalled ? 'pass' : 'high_risk',
    reason: pixelInstalled ? undefined : 'TikTok Pixel is not installed',
    suggestion: pixelInstalled ? undefined : 'Install TikTok Pixel on your landing page',
  };
  checks.push(installCheck);
  
  // 关键事件配置检查
  const requiredEvents = ['PageView', 'SubmitForm', 'ClickButton'];
  const missingEvents = requiredEvents.filter(e => !eventsConfigured.includes(e));
  
  const eventsCheck: L0CheckItem = {
    id: 'pixel_events',
    name: 'Pixel Events Check',
    nameZh: 'Pixel事件检查',
    category: 'tracking',
    result: missingEvents.length > 0 ? 'high_risk' : 'pass',
    reason: missingEvents.length > 0 
      ? `Missing required events: ${missingEvents.join(', ')}`
      : undefined,
    suggestion: missingEvents.length > 0 
      ? 'Configure basic events: PageView, SubmitForm, ClickButton'
      : undefined,
  };
  checks.push(eventsCheck);
  
  return checks;
}

/**
 * 目标×检查项判定矩阵
 * 根据广告目标决定哪些检查项必须通过
 */
const OBJECTIVE_CHECK_MATRIX: Record<string, string[]> = {
  purchase: ['pixel_install', 'pixel_events', 'url_format', 'url_https'],
  lead_gen: ['pixel_install', 'url_format', 'url_https'],
  app_install: ['url_format'], // 应用商店链接
  traffic: ['pixel_install', 'pixel_events', 'url_format', 'url_https'],
  messaging: [], // 私信不需要Pixel
  live_promotion: [], // 直播引流不需要Pixel
};

/**
 * 根据目标筛选必须通过的检查项
 */
export function filterChecksByObjective(
  checks: L0CheckItem[],
  objective: string
): L0CheckItem[] {
  const requiredCheckIds = OBJECTIVE_CHECK_MATRIX[objective] || [];
  
  // 标记必须检查项和可选检查项
  return checks.map(check => ({
    ...check,
    // 如果是必须检查项且未通过，则升级为block
    result: requiredCheckIds.includes(check.id) && check.result !== 'pass'
      ? 'block'
      : check.result,
  }));
}

/**
 * 执行L0硬规则审查
 * 纯代码逻辑，不调用AI
 */
export function executeLayer0(
  formData: {
    industry?: string;
    hasLicense?: boolean;
    videoDuration?: number;
    videoResolution?: number;
    videoAspectRatio?: string;
    videoFileSizeMb?: number;
    landingPageUrl?: string;
    pixelInstalled?: boolean;
    pixelEvents?: string[];
    objective?: string;
  }
): L0Result {
  let checks: L0CheckItem[] = [];
  
  // 1. 禁止行业检查
  if (formData.industry) {
    checks.push(checkProhibitedIndustry(formData.industry));
  }
  
  // 2. 限制行业检查
  if (formData.industry) {
    checks.push(checkRestrictedIndustry(formData.industry, formData.hasLicense || false));
  }
  
  // 3. 视频规格检查
  if (formData.videoDuration && formData.videoResolution) {
    checks.push(...checkVideoSpecs(
      formData.videoDuration,
      formData.videoResolution,
      formData.videoAspectRatio || '9:16',
      formData.videoFileSizeMb || 0
    ));
  }
  
  // 4. URL可达性检查
  if (formData.landingPageUrl) {
    checks.push(checkUrlAccessibility(formData.landingPageUrl));
  }
  
  // 5. Pixel安装状态检查
  if (formData.pixelInstalled !== undefined) {
    checks.push(...checkPixelStatus(formData.pixelInstalled, formData.pixelEvents || []));
  }
  
  // 6. 根据目标筛选检查项
  if (formData.objective) {
    checks = filterChecksByObjective(checks, formData.objective);
  }
  
  // 计算整体结果
  const hasBlock = checks.some(c => c.result === 'block');
  const hasHighRisk = checks.some(c => c.result === 'high_risk');
  
  let overall: L0CheckResult;
  if (hasBlock) {
    overall = 'block';
  } else if (hasHighRisk) {
    overall = 'high_risk';
  } else if (checks.every(c => c.result === 'irrelevant')) {
    overall = 'irrelevant';
  } else {
    overall = 'pass';
  }
  
  // 生成摘要
  const blockChecks = checks.filter(c => c.result === 'block');
  const highRiskChecks = checks.filter(c => c.result === 'high_risk');
  
  const summary = overall === 'pass'
    ? 'All checks passed. Proceed to next layer.'
    : overall === 'block'
    ? `Blocked by: ${blockChecks.map(c => c.name).join(', ')}. Fix before proceeding.`
    : `High risk items: ${highRiskChecks.map(c => c.name).join(', ')}. Review recommended.`;
    
  const summaryZh = overall === 'pass'
    ? '所有检查通过，进入下一层审查。'
    : overall === 'block'
    ? `阻断项: ${blockChecks.map(c => c.nameZh).join(', ')}。请修复后再继续。`
    : `高风险项: ${highRiskChecks.map(c => c.nameZh).join(', ')}。建议检查。`;
  
  return {
    overall,
    checks,
    summary,
    summaryZh,
  };
}

/**
 * 从前端提交的 checkItems 格式执行 L0 检查
 * 用于 rejection-check 页面的审查流程
 */
export interface CheckItemInput {
  id: string;
  name: string;
  value: string | boolean | number;
}

export function executeLayer0FromCheckItems(
  checkItems: CheckItemInput[],
  objective: string
): L0Result {
  // 将 checkItems 转换为 formData 格式
  const formData: {
    industry?: string;
    hasLicense?: boolean;
    videoDuration?: number;
    videoResolution?: number;
    videoAspectRatio?: string;
    videoFileSizeMb?: number;
    landingPageUrl?: string;
    pixelInstalled?: boolean;
    pixelEvents?: string[];
    objective?: string;
  } = {
    objective,
  };
  
  // 解析 checkItems
  for (const item of checkItems) {
    switch (item.id) {
      case 'industry':
        formData.industry = String(item.value);
        break;
      case 'hasLicense':
        formData.hasLicense = Boolean(item.value);
        break;
      case 'videoDuration':
        formData.videoDuration = Number(item.value);
        break;
      case 'videoResolution':
        formData.videoResolution = Number(item.value);
        break;
      case 'videoAspectRatio':
        formData.videoAspectRatio = String(item.value);
        break;
      case 'videoFileSizeMb':
        formData.videoFileSizeMb = Number(item.value);
        break;
      case 'landingPageUrl':
        formData.landingPageUrl = String(item.value);
        break;
      case 'pixelInstalled':
        formData.pixelInstalled = Boolean(item.value);
        break;
      case 'pixelEvents':
        if (Array.isArray(item.value)) {
          formData.pixelEvents = item.value as string[];
        }
        break;
    }
  }
  
  // 调用原始的 executeLayer0 函数
  return executeLayer0(formData);
}