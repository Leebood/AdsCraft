'use client';

interface ScoreBarProps {
  score: number;
}

export function ScoreBar({ score }: ScoreBarProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getGradientColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-500';
    if (score >= 60) return 'from-yellow-400 to-yellow-500';
    return 'from-red-400 to-red-500';
  };

  return (
    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"></div>
      
      {/* 进度条 */}
      <div 
        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getGradientColor(score)} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${score}%` }}
      >
        {/* 发光效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      
      {/* 分数标记 */}
      <div className="absolute inset-0 flex items-center justify-between px-1">
        <span className="text-xs text-white/30">0</span>
        <span className="text-xs text-white/30">50</span>
        <span className="text-xs text-white/30">100</span>
      </div>
    </div>
  );
}