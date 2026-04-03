'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock } from 'lucide-react';

export function ProjectHealthCard({ data }: { data: Record<string, unknown> }) {
  const projects = (data.projects as Array<{
    name: string; health: number; trend: string; velocity: number; blockers: number; deadline?: number; status: string;
  }>) ?? [];

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden divide-y divide-[var(--color-border-subtle)]">
      {projects.map((p, i) => {
        const T = p.trend === 'improving' ? TrendingUp : p.trend === 'declining' ? TrendingDown : Minus;
        const tc = p.trend === 'improving' ? 'text-emerald-400/70' : p.trend === 'declining' ? 'text-red-400/70' : 'text-[var(--color-text-muted)]';
        const hc = p.health >= 0.7 ? 'text-emerald-400/80' : p.health >= 0.4 ? 'text-amber-400/80' : 'text-red-400/80';
        const bc = p.health >= 0.7 ? 'bg-emerald-500/50' : p.health >= 0.4 ? 'bg-amber-500/50' : 'bg-red-500/50';
        return (
          <div key={i} className="px-3.5 py-2.5 hover:bg-[var(--color-bg-tertiary)] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('text-[14px] font-semibold tabular-nums', hc)}>{Math.round(p.health * 100)}</span>
                <span className="text-[12.5px] font-medium text-[var(--color-text-primary)]">{p.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className={cn('flex items-center gap-0.5 text-[11px]', tc)}><T className="w-3 h-3" />{p.velocity > 0 ? '+' : ''}{p.velocity}%</span>
              {p.blockers > 0 && <span className="flex items-center gap-0.5 text-[11px] text-amber-400/70"><AlertTriangle className="w-3 h-3" />{p.blockers}</span>}
              {p.deadline !== undefined && p.deadline !== null && <span className="flex items-center gap-0.5 text-[11px] text-[var(--color-text-muted)]"><Clock className="w-3 h-3" />{p.deadline}d</span>}
            </div>
            <div className="mt-1.5 h-[3px] bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', bc)} style={{ width: `${Math.round(p.health * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
