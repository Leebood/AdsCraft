'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FeedbackCollectorProps {
  caseId?: string;
  diagnosisType: string;
  platform: string;
  route: string;
  onSubmit?: (feedback: { score: number; comment: string }) => void;
  className?: string;
}

export function FeedbackCollector({
  caseId,
  diagnosisType,
  platform,
  route,
  onSubmit,
  className,
}: FeedbackCollectorProps) {
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleScoreClick = (selectedScore: number) => {
    setScore(selectedScore);
  };

  const handleSubmit = async () => {
    if (score === 0) return;

    setIsSubmitting(true);

    try {
      // 如果有 caseId，直接更新反馈
      if (caseId) {
        const response = await fetch('/api/diagnosis-cases', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseId,
            feedback_score: score,
            feedback_comment: comment,
          }),
        });

        if (!response.ok) {
          throw new Error('提交反馈失败');
        }
      } else {
        // 如果没有 caseId，创建新案例并添加反馈
        const response = await fetch('/api/diagnosis-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform,
            route,
            diagnosis_type: diagnosisType,
            input_data: {},
            diagnosis_result: {},
            feedback_score: score,
            feedback_comment: comment,
          }),
        });

        if (!response.ok) {
          throw new Error('提交反馈失败');
        }
      }

      setSubmitted(true);
      onSubmit?.({ score, comment });
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={cn('text-center py-4', className)}>
        <div className="text-emerald-400 text-lg mb-2">感谢您的反馈！</div>
        <div className="text-blue-300/70 text-sm">
          您的评价将帮助我们持续优化诊断质量
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white/5 rounded-xl p-6 border border-white/20', className)}>
      <div className="text-white text-lg mb-4">这个诊断对您有帮助吗？</div>
      
      {/* 评分按钮 */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => handleScoreClick(s)}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
              score === s
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 scale-105'
                : 'bg-white/10 border-white/30 hover:bg-white/20'
            )}
          >
            <span className="text-white font-semibold">{s}</span>
          </button>
        ))}
      </div>
      
      {/* 评分说明 */}
      <div className="flex justify-between text-blue-300/70 text-xs mb-4">
        <span>完全没用</span>
        <span>非常有帮助</span>
      </div>
      
      {/* 评论输入 */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="请告诉我们您的具体感受或建议..."
        className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-blue-300/50 resize-none h-20 focus:outline-none focus:border-cyan-400/50"
      />
      
      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={score === 0 || isSubmitting}
        className={cn(
          'w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-4',
          score > 0
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105'
            : 'bg-white/10 text-blue-300/50 cursor-not-allowed'
        )}
      >
        {isSubmitting ? '提交中...' : '提交反馈'}
      </button>
    </div>
  );
}