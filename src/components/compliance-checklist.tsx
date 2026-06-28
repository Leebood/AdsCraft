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
        return { 
          icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
          color: 'text-red-400', 
          bg: 'bg-red-500/10', 
          border: 'border-red-400/30' 
        };
      case 'medium':
        return { 
          icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          color: 'text-yellow-400', 
          bg: 'bg-yellow-500/10', 
          border: 'border-yellow-400/30' 
        };
      case 'low':
        return { 
          icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          color: 'text-green-400', 
          bg: 'bg-green-500/10', 
          border: 'border-green-400/30' 
        };
    }
  };
  
  // 获取类别对应的图标和名称
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'creative':
        return { 
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
          name: '素材合规', 
          nameEn: 'Creative' 
        };
      case 'copy':
        return { 
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
          name: '文案合规', 
          nameEn: 'Copy' 
        };
      case 'landing_page':
        return { 
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
          name: '落地页', 
          nameEn: 'Landing Page' 
        };
      case 'platform_specific':
        return { 
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
          name: '平台要求', 
          nameEn: 'Platform Rules' 
        };
      case 'industry':
        return { 
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
          name: '行业资质', 
          nameEn: 'Industry' 
        };
      default:
        return { 
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          name: '其他', 
          nameEn: 'Other' 
        };
    }
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-2xl border border-cyan-400/20 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: config.icon }} />
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
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
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
                  <span className="text-blue-300">{categoryInfo.icon}</span>
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
                            <span className={`${severityStyle.color}`}>
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
        <div className="p-6 border-t border-white/10">
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