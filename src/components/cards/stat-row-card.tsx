'use client';

import { cn } from '@/lib/utils';
import { Activity, Sparkles, TrendingUp, Shield } from 'lucide-react';

const STAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  signals: Activity, insights: Sparkles, accuracy: TrendingUp, health: Shield,
};

const STAT_COLORS: Record<string, string> = {
  signals: 'text-blue-400 bg-blue-500/10 border-blue-500/10',
  insights: 'text-purple-400 bg-purple-500/10 border-purple-500/10',
  accuracy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
  health: 'text-amber-400 bg-amber-500/10 border-amber-500/10',
};

export function StatRowCard({ data }: { data: Record<string, unknown> }) {
  const stats = (data.stats as Array<{
    key: string; label: string; value: string;
  }>) ?? [];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stats.map((stat, i) => {
        const Icon = STAT_ICONS[stat.key] ?? Activity;
        return (
          <div key={i} className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl border',
            STAT_COLORS[stat.key] ?? STAT_COLORS.signals
          )}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[13px] font-semibold">{stat.value}</span>
            <span className="text-[11px] text-[var(--color-text-muted)]">{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
}
