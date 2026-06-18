'use client';

import { useState } from 'react';
import { ComplianceItem, PlatformId, PLATFORM_CONFIGS } from '@/lib/platforms/registry';

interface ComplianceChecklistProps {
  platform: PlatformId;
  onComplete: () => void;
  onSkip: () => void;
}

export function ComplianceChecklist({ platform, onComplete, onSkip }: ComplianceChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const config = PLATFORM_CONFIGS[platform];
  
  // 按严重程度分组
  const highSeverityItems = config.complianceChecklist.filter(item => item.severity === 'high');
  const mediumSeverityItems = config.complianceChecklist.filter(item => item.severity === 'medium');
  const lowSeverityItems = config.complianceChecklist.filter(item => item.severity === 'low');
  
  // 按类别分组（用于显示）
  const groupedItems = {
    creative: config.complianceChecklist.filter(item => item.category === 'creative'),
    copy: config.complianceChecklist.filter(item => item.category === 'copy'),
    landing_page: config.complianceChecklist.filter(item => item.category === 'landing_page'),
    platform_specific: config.complianceChecklist.filter(item => item.category === 'platform_specific'),
    industry: config.complianceChecklist.filter(item => item.category === 'industry')
  };
  
  const handleCheckItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };
  
  // 计算完成百分比
  const totalItems = config.complianceChecklist.length;
  const checkedCount = checkedItems.size;
  const progressPercentage = Math.round((checkedCount / totalItems) * 100);
  
  // 检查高风险项是否全部完成
  const allHighSeverityChecked = highSeverityItems.every(item => checkedItems.has(item.id));
  
  // 获取严重程度对应的图标和颜色
  const getSeverityStyle = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return { icon: '🔴', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30' };
      case 'medium':
        return { icon: '🟡', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30' };
      case 'low':
        return { icon: '🟢', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30' };
    }
  };
  
  // 获取类别对应的图标和名称
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'creative':
        return { icon: '🎨', name: '素材合规', nameEn: 'Creative' };
      case 'copy':
        return { icon: '📝', name: '文案合规', nameEn: 'Copy' };
      case 'landing_page':
        return { icon: '🔗', name: '落地页', nameEn: 'Landing Page' };
      case 'platform_specific':
        return { icon: '⚙️', name: '平台要求', nameEn: 'Platform Rules' };
      case 'industry':
        return { icon: '📋', name: '行业资质', nameEn: 'Industry' };
      default:
        return { icon: '❓', name: '其他', nameEn: 'Other' };
    }
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-2xl border border-cyan-400/20 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{config.icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {config.name} 合规预检
                </h2>
                <p className="text-blue-200/70 text-sm">
                  提交前检查，降低拒审风险
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-blue-300/60 hover:text-blue-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
            >
              跳过检查
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  allHighSeverityChecked ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm text-blue-200">
              {checkedCount}/{totalItems}
            </span>
          </div>
          
          {/* Warning if high severity items not checked */}
          {!allHighSeverityChecked && checkedCount > 0 && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300 text-sm">
                请确保完成所有高风险项（红色标记）以降低拒审概率
              </span>
            </div>
          )}
        </div>
        
        {/* Checklist Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Group by category */}
          {Object.entries(groupedItems).filter(([_, items]) => items.length > 0).map(([category, items]) => {
            const categoryInfo = getCategoryInfo(category);
            return (
              <div key={category} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                  <span className="text-lg">{categoryInfo.icon}</span>
                  <h3 className="text-base font-medium text-blue-200">
                    {categoryInfo.name}
                  </h3>
                  <span className="text-xs text-blue-300/50">
                    {items.length}项
                  </span>
                </div>
                
                <div className="space-y-2">
                  {items.map((item) => {
                    const severityStyle = getSeverityStyle(item.severity);
                    const isChecked = checkedItems.has(item.id);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleCheckItem(item.id)}
                        className={`w-full p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                          isChecked 
                            ? 'bg-cyan-500/10 border-cyan-400/50' 
                            : `${severityStyle.bg} ${severityStyle.border} hover:bg-white/10`
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-cyan-500 border-cyan-500' 
                            : 'border-white/30'
                        }`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm ${severityStyle.color}`}>
                              {severityStyle.icon}
                            </span>
                            <h4 className={`text-sm font-medium transition-colors ${
                              isChecked ? 'text-cyan-300' : 'text-white'
                            }`}>
                              {item.titleZh}
                            </h4>
                          </div>
                          <p className={`text-xs transition-colors ${
                            isChecked ? 'text-blue-200/60' : 'text-blue-200/80'
                          }`}>
                            {item.descriptionZh}
                          </p>
                        </div>
                        
                        {/* Severity Badge */}
                        {!isChecked && (
                          <span className={`px-2 py-1 rounded-md text-xs ${severityStyle.bg} ${severityStyle.color}`}>
                            {item.severity === 'high' ? '高风险' : item.severity === 'medium' ? '中风险' : '低风险'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-200/60">
              <span className="text-red-400">{highSeverityItems.length}</span> 高风险 · 
              <span className="text-yellow-400">{mediumSeverityItems.length}</span> 中风险 · 
              <span className="text-green-400">{lowSeverityItems.length}</span> 低风险
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onSkip}
                className="px-4 py-2 rounded-xl border border-white/20 text-blue-200 hover:bg-white/5 transition-colors"
              >
                跳过检查
              </button>
              <button
                onClick={onComplete}
                disabled={!allHighSeverityChecked}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  allHighSeverityChecked 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30'
                    : 'bg-white/10 text-blue-300/50 cursor-not-allowed'
                }`}
              >
                {allHighSeverityChecked ? '确认提交' : '请完成高风险项'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 导出获取合规清单的函数
export function getComplianceChecklist(platform: PlatformId): ComplianceItem[] {
  return PLATFORM_CONFIGS[platform]?.complianceChecklist || [];
}