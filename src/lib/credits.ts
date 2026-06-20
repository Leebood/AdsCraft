/**
 * Credits额度管理模块
 * 月度额度初始化、扣减、查询、每月1号重置
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';
import {
  TierKey,
  CreditType,
  Platform,
  getTierLimit,
  TIER_LIMITS,
} from './tierLimits';

// 月度使用记录表结构
export interface MonthlyUsage {
  id: string;
  user_id: string;
  tier_key: TierKey;
  platform: Platform;
  period_start: string; // YYYY-MM-01
  diagnosis_used: number;
  creative_review_used: number;
  deep_attribution_used: number;
  created_at: string;
}

// 额度状态
export interface CreditStatus {
  tierKey: TierKey;
  platform: Platform;
  periodStart: string;
  // 已使用
  diagnosisUsed: number;
  creativeReviewUsed: number;
  deepAttributionUsed: number;
  // 额度上限
  diagnosisLimit: number;
  creativeReviewLimit: number;
  deepAttributionLimit: number;
  // 剩余额度
  diagnosisRemaining: number;
  creativeReviewRemaining: number;
  deepAttributionRemaining: number;
}

/**
 * 获取当前月份起始日期 (YYYY-MM-01)
 */
export function getCurrentPeriodStart(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

/**
 * 初始化用户本月额度记录
 * 如果记录不存在，创建新记录
 */
export async function initializeMonthlyUsage(
  userId: string,
  tierKey: TierKey,
  platform: Platform
): Promise<MonthlyUsage> {
  const supabase = getSupabaseClient();
  const periodStart = getCurrentPeriodStart();

  // 先查询是否存在
  const { data: existing, error: queryError } = await supabase
    .from('monthly_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('period_start', periodStart)
    .single();

  if (existing && !queryError) {
    return existing as MonthlyUsage;
  }

  // 创建新记录
  const { data, error } = await supabase
    .from('monthly_usage')
    .insert({
      user_id: userId,
      tier_key: tierKey,
      platform: platform,
      period_start: periodStart,
      diagnosis_used: 0,
      creative_review_used: 0,
      deep_attribution_used: 0,
    })
    .select()
    .single();

  if (error) {
    // 可能是并发插入导致重复，再次查询
    if (error.code === '23505') {
      const { data: retryData } = await supabase
        .from('monthly_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .eq('period_start', periodStart)
        .single();
      return retryData as MonthlyUsage;
    }
    throw error;
  }

  return data as MonthlyUsage;
}

/**
 * 获取用户当前额度状态
 */
export async function getCreditStatus(
  userId: string,
  tierKey: TierKey,
  platform: Platform
): Promise<CreditStatus> {
  const usage = await initializeMonthlyUsage(userId, tierKey, platform);
  const tierLimit = getTierLimit(tierKey);

  return {
    tierKey,
    platform,
    periodStart: usage.period_start,
    // 已使用
    diagnosisUsed: usage.diagnosis_used,
    creativeReviewUsed: usage.creative_review_used,
    deepAttributionUsed: usage.deep_attribution_used,
    // 额度上限
    diagnosisLimit: tierLimit.diagnosis,
    creativeReviewLimit: tierLimit.creative_review,
    deepAttributionLimit: tierLimit.deep_attribution,
    // 剩余额度
    diagnosisRemaining: tierLimit.diagnosis - usage.diagnosis_used,
    creativeReviewRemaining: tierLimit.creative_review - usage.creative_review_used,
    deepAttributionRemaining: tierLimit.deep_attribution - usage.deep_attribution_used,
  };
}

/**
 * 检查额度是否足够
 */
export function checkCreditsAvailable(
  status: CreditStatus,
  creditType: CreditType
): boolean {
  switch (creditType) {
    case 'diagnosis':
      return status.diagnosisRemaining > 0;
    case 'creative_review':
      return status.creativeReviewRemaining > 0;
    case 'deep_attribution':
      return status.deepAttributionRemaining > 0;
    default:
      return false;
  }
}

/**
 * 扣减额度
 */
export async function consumeCredit(
  userId: string,
  tierKey: TierKey,
  platform: Platform,
  creditType: CreditType,
  amount: number = 1
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const periodStart = getCurrentPeriodStart();

  // 获取当前使用量
  const usage = await initializeMonthlyUsage(userId, tierKey, platform);
  const tierLimit = getTierLimit(tierKey);

  // 检查额度是否足够
  const currentUsed = usage[`${creditType}_used` as keyof MonthlyUsage] as number;
  const limit = tierLimit[creditType];

  if (currentUsed + amount > limit) {
    return false; // 额度不足
  }

  // 更新使用量
  const fieldToUpdate = `${creditType}_used`;
  const { error } = await supabase
    .from('monthly_usage')
    .update({ [fieldToUpdate]: currentUsed + amount })
    .eq('id', usage.id);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * 批量检查并扣减额度（原子操作）
 * 先检查，再扣减，失败不扣减
 */
export async function checkAndConsumeCredit(
  userId: string,
  tierKey: TierKey,
  platform: Platform,
  creditType: CreditType
): Promise<{ success: boolean; status?: CreditStatus }> {
  try {
    const status = await getCreditStatus(userId, tierKey, platform);

    if (!checkCreditsAvailable(status, creditType)) {
      return { success: false, status };
    }

    const consumed = await consumeCredit(userId, tierKey, platform, creditType);

    if (!consumed) {
      return { success: false, status };
    }

    // 返回更新后的状态
    const newStatus = await getCreditStatus(userId, tierKey, platform);
    return { success: true, status: newStatus };
  } catch (error) {
    console.error('Credit check/consume error:', error);
    return { success: false };
  }
}

/**
 * 获取用户历史使用记录（最近N个月）
 */
export async function getUsageHistory(
  userId: string,
  platform: Platform,
  months: number = 6
): Promise<MonthlyUsage[]> {
  const supabase = getSupabaseClient();
  const now = new Date();

  // 计算起始月份
  const startMonth = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const startDate = `${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('monthly_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .gte('period_start', startDate)
    .order('period_start', { ascending: false });

  if (error) {
    throw error;
  }

  return data as MonthlyUsage[];
}

/**
 * 重置用户套餐（订阅变更时）
 * 更新 tier_key 并重置使用量
 */
export async function updateTierAndResetUsage(
  userId: string,
  newTierKey: TierKey,
  platform: Platform
): Promise<void> {
  const supabase = getSupabaseClient();
  const periodStart = getCurrentPeriodStart();

  // 更新或创建本月记录
  const { error } = await supabase
    .from('monthly_usage')
    .upsert({
      user_id: userId,
      tier_key: newTierKey,
      platform: platform,
      period_start: periodStart,
      diagnosis_used: 0,
      creative_review_used: 0,
      deep_attribution_used: 0,
    }, {
      onConflict: 'user_id,platform,period_start',
    });

  if (error) {
    throw error;
  }
}