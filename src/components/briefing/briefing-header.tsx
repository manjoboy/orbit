'use client';

import { cn } from '@/lib/utils';
import { Sparkles, Activity, TrendingUp, Zap } from 'lucide-react';

interface BriefingHeaderProps {
  greeting: string;
  date: Date;
  signalCount: number;
  insightCount: number;
}

export function BriefingHeader({ greeting, date, signalCount, insightCount }: BriefingHeaderProps) {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="relative px-6 pt-10 pb-8 overflow-hidden">
      {/* Subtle gradient orbs for depth */}
      <div className="absolute top-0 right-[20%] w-[500px] h-[300px] bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-[40%] w-[400px] h-[250px] bg-purple-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto">
        {/* Greeting */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/10">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">Daily Briefing</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {dateStr} &middot; Here&apos;s what needs your attention
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center gap-3 mt-6">
          <QuickStat icon={Activity} label="Signals" value={signalCount} color="blue" />
          <QuickStat icon={Sparkles} label="Insights" value={insightCount} color="purple" />
          <QuickStat icon={TrendingUp} label="Accuracy" value="94%" color="emerald" />
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border-secondary)] to-transparent" />
    </header>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: 'blue' | 'purple' | 'emerald';
}) {
  const styles = {
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/10' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/10' },
  };
  const s = styles[color];

  return (
    <div className={cn(
      'flex items-center gap-2.5 px-3.5 py-2 rounded-xl border',
      s.bg, s.border
    )}>
      <Icon className={cn('w-4 h-4', s.text)} />
      <span className={cn('text-[15px] font-semibold', s.text)}>{value}</span>
      <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}
