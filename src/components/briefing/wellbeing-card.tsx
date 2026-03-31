'use client';

import { cn } from '@/lib/utils';
import { Heart, TrendingUp, TrendingDown, Minus, Clock, Zap, ArrowLeftRight } from 'lucide-react';

interface WellbeingData {
  sustainabilityScore: number;
  trend: 'improving' | 'stable' | 'declining';
  meetingLoad: { hours: number; vsBaseline: number };
  focusTime: { hours: number; vsBaseline: number };
  contextSwitches: { count: number; vsBaseline: number };
  recommendation?: string;
}

export function WellbeingCard({ data }: { data: WellbeingData }) {
  const scoreColor = data.sustainabilityScore >= 70 ? 'text-emerald-400' :
                     data.sustainabilityScore >= 50 ? 'text-yellow-400' :
                     'text-red-400';

  const scoreBgColor = data.sustainabilityScore >= 70 ? 'bg-emerald-500' :
                       data.sustainabilityScore >= 50 ? 'bg-yellow-500' :
                       'bg-red-500';

  const TrendIcon = data.trend === 'improving' ? TrendingUp :
                    data.trend === 'declining' ? TrendingDown : Minus;

  return (
    <div className={cn(
      'rounded-xl border border-[var(--color-border-primary)]',
      'bg-[var(--color-bg-secondary)]',
      'animate-fade-in'
    )}>
      <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              Sustainability
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-lg font-bold', scoreColor)}>
              {data.sustainabilityScore}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">/100</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Score bar */}
        <div className="h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', scoreBgColor)}
            style={{ width: `${data.sustainabilityScore}%` }}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <MetricPill
            icon={Clock}
            label="Meetings"
            value={`${data.meetingLoad.hours.toFixed(1)}h`}
            subtext="avg/day"
            isWarning={data.meetingLoad.hours > 5}
          />
          <MetricPill
            icon={Zap}
            label="Focus"
            value={`${data.focusTime.hours.toFixed(1)}h`}
            subtext="avg/day"
            isWarning={data.focusTime.hours < 2}
          />
          <MetricPill
            icon={ArrowLeftRight}
            label="Switches"
            value={`${data.contextSwitches.count}`}
            subtext="avg/day"
            isWarning={data.contextSwitches.count > 12}
          />
        </div>

        {/* Recommendation */}
        {data.recommendation && (
          <div className={cn(
            'px-3 py-2.5 rounded-lg',
            data.sustainabilityScore < 60
              ? 'bg-red-500/5 border border-red-500/10'
              : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]'
          )}>
            <p className={cn(
              'text-[11px] leading-relaxed',
              data.sustainabilityScore < 60 ? 'text-red-300/70' : 'text-[var(--color-text-tertiary)]'
            )}>
              {data.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
  subtext,
  isWarning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  isWarning: boolean;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-1 py-2 rounded-lg',
      'bg-[var(--color-bg-tertiary)]',
      isWarning && 'ring-1 ring-amber-500/20'
    )}>
      <Icon className={cn('w-3.5 h-3.5', isWarning ? 'text-amber-400' : 'text-[var(--color-text-muted)]')} />
      <span className={cn('text-sm font-semibold', isWarning ? 'text-amber-400' : 'text-[var(--color-text-primary)]')}>
        {value}
      </span>
      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">
        {subtext}
      </span>
    </div>
  );
}
