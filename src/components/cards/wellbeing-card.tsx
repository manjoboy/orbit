'use client';

import { cn } from '@/lib/utils';
import { Heart, Clock, Zap, ArrowLeftRight } from 'lucide-react';

export function WellbeingCard({ data }: { data: Record<string, unknown> }) {
  const wellbeing = data as {
    score: number; meetings: string; focus: string; switches: number; recommendation?: string;
  };

  const scoreColor = wellbeing.score >= 70 ? 'text-emerald-400' : wellbeing.score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const barColor = wellbeing.score >= 70 ? 'bg-emerald-500' : wellbeing.score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Sustainability</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-[20px] font-bold', scoreColor)}>{wellbeing.score}</span>
          <span className="text-[11px] text-[var(--color-text-muted)]">/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden mb-3">
        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${wellbeing.score}%` }} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric icon={Clock} label="Meetings" value={wellbeing.meetings} warn={parseFloat(wellbeing.meetings) > 5} />
        <Metric icon={Zap} label="Focus" value={wellbeing.focus} warn={parseFloat(wellbeing.focus) < 2} />
        <Metric icon={ArrowLeftRight} label="Switches" value={String(wellbeing.switches)} warn={wellbeing.switches > 12} />
      </div>

      {/* Recommendation */}
      {wellbeing.recommendation && (
        <div className={cn(
          'px-3 py-2 rounded-xl text-[11px] leading-relaxed',
          wellbeing.score < 60
            ? 'bg-red-500/5 border border-red-500/10 text-red-300/80'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
        )}>
          {wellbeing.recommendation}
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, warn }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; warn: boolean;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)]',
      warn && 'ring-1 ring-amber-500/20'
    )}>
      <Icon className={cn('w-3 h-3', warn ? 'text-amber-400' : 'text-[var(--color-text-muted)]')} />
      <span className={cn('text-[13px] font-semibold', warn ? 'text-amber-400' : 'text-[var(--color-text-primary)]')}>{value}</span>
      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
    </div>
  );
}
