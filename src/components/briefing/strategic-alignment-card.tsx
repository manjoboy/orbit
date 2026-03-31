'use client';

import { cn } from '@/lib/utils';
import { Target, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface StrategicAlignmentData {
  overallScore: number;
  timeBreakdown: Array<{
    category: string;
    percentageOfTime: number;
    isStrategic: boolean;
  }>;
  topTimeSink: {
    category: string;
    percentageOfTime: number;
    suggestion: string;
  };
  weekOverWeekTrend: 'improving' | 'stable' | 'declining';
}

export function StrategicAlignmentCard({ data }: { data: StrategicAlignmentData }) {
  const alignmentPct = Math.round(data.overallScore * 100);
  const TrendIcon = data.weekOverWeekTrend === 'improving' ? TrendingUp :
                    data.weekOverWeekTrend === 'declining' ? TrendingDown : Minus;
  const trendColor = data.weekOverWeekTrend === 'improving' ? 'text-emerald-400' :
                     data.weekOverWeekTrend === 'declining' ? 'text-red-400' :
                     'text-[var(--color-text-muted)]';

  return (
    <div className={cn(
      'rounded-xl border border-[var(--color-border-primary)]',
      'bg-[var(--color-bg-secondary)]',
      'animate-fade-in'
    )}>
      <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              Strategic Alignment
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon className={cn('w-3 h-3', trendColor)} />
            <span className={cn('text-[11px]', trendColor)}>
              {data.weekOverWeekTrend}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Score ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="var(--color-bg-primary)"
                strokeWidth="4"
              />
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke={alignmentPct >= 70 ? '#10b981' : alignmentPct >= 40 ? '#eab308' : '#ef4444'}
                strokeWidth="4"
                strokeDasharray={`${alignmentPct * 1.76} 176`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-[var(--color-text-primary)]">
                {alignmentPct}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              of your time is aligned with stated priorities
            </p>
            {alignmentPct < 50 && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Below target
              </p>
            )}
          </div>
        </div>

        {/* Time breakdown bars */}
        <div className="space-y-2">
          {data.timeBreakdown.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {item.category}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-text-primary)]">
                  {item.percentageOfTime}%
                </span>
              </div>
              <div className="h-1.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    item.isStrategic ? 'bg-blue-500' : 'bg-[var(--color-text-muted)]'
                  )}
                  style={{ width: `${item.percentageOfTime}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion */}
        {data.topTimeSink.suggestion && (
          <div className="px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]">
            <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
              💡 {data.topTimeSink.suggestion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
