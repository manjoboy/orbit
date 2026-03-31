'use client';

import { cn } from '@/lib/utils';
import { Sparkles, Activity, TrendingUp } from 'lucide-react';

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
    <header className="relative px-6 pt-8 pb-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {dateStr} — Here&apos;s your briefing
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-5">
          <QuickStat
            icon={Activity}
            label="Signals detected"
            value={signalCount}
            color="blue"
          />
          <div className="w-px h-5 bg-[var(--color-border-primary)]" />
          <QuickStat
            icon={Sparkles}
            label="Insights generated"
            value={insightCount}
            color="purple"
          />
          <div className="w-px h-5 bg-[var(--color-border-primary)]" />
          <QuickStat
            icon={TrendingUp}
            label="Briefing accuracy"
            value="94%"
            color="emerald"
          />
        </div>
      </div>

      {/* Subtle gradient line */}
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
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('flex items-center justify-center w-7 h-7 rounded-lg', colorMap[color])}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{value}</p>
        <p className="text-[11px] text-[var(--color-text-muted)]">{label}</p>
      </div>
    </div>
  );
}
