'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock } from 'lucide-react';

export function ProjectHealthCard({ data }: { data: Record<string, unknown> }) {
  const projects = (data.projects as Array<{
    name: string; health: number; trend: string; velocity: number; blockers: number; deadline?: number; status: string;
  }>) ?? [];

  return (
    <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] overflow-hidden divide-y divide-[var(--color-border-primary)]">
      {projects.map((p, i) => {
        const TrendIcon = p.trend === 'improving' ? TrendingUp : p.trend === 'declining' ? TrendingDown : Minus;
        const trendColor = p.trend === 'improving' ? 'text-emerald-400' : p.trend === 'declining' ? 'text-red-400' : 'text-[var(--color-text-muted)]';
        const healthColor = p.health >= 0.7 ? 'text-emerald-400' : p.health >= 0.4 ? 'text-yellow-400' : 'text-red-400';
        const barColor = p.health >= 0.7 ? 'bg-emerald-500' : p.health >= 0.4 ? 'bg-yellow-500' : 'bg-red-500';

        return (
          <div key={i} className={cn(
            'px-4 py-3 hover:bg-[var(--color-bg-tertiary)] transition-colors',
            p.status === 'AT_RISK' && 'border-l-2 border-l-red-500/50'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={cn('text-[15px] font-bold tabular-nums', healthColor)}>
                  {Math.round(p.health * 100)}
                </span>
                <div>
                  <h4 className="text-[13px] font-medium text-[var(--color-text-primary)]">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <TrendIcon className={cn('w-3 h-3', trendColor)} />
                      <span className={cn('text-[11px]', trendColor)}>
                        {p.velocity > 0 ? '+' : ''}{p.velocity}%
                      </span>
                    </div>
                    {p.blockers > 0 && (
                      <span className="flex items-center gap-0.5 text-[11px] text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        {p.blockers} blocked
                      </span>
                    )}
                    {p.deadline && (
                      <span className={cn(
                        'flex items-center gap-0.5 text-[11px]',
                        p.deadline < 7 ? 'text-amber-400' : 'text-[var(--color-text-muted)]'
                      )}>
                        <Clock className="w-3 h-3" />
                        {p.deadline}d
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 h-1 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${Math.round(p.health * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
