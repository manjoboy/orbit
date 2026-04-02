'use client';

import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

export function WellbeingCard({ data }: { data: Record<string, unknown> }) {
  const w = data as { score: number; meetings: string; focus: string; switches: number; recommendation?: string };
  const sc = w.score >= 70 ? 'text-emerald-400/80' : w.score >= 50 ? 'text-amber-400/80' : 'text-red-400/80';
  const bc = w.score >= 70 ? 'bg-emerald-500/50' : w.score >= 50 ? 'bg-amber-500/50' : 'bg-red-500/50';

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] px-3.5 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">Sustainability</span>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className={cn('text-[16px] font-semibold tabular-nums', sc)}>{w.score}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">/100</span>
        </div>
      </div>
      <div className="h-[3px] bg-[var(--color-bg-elevated)] rounded-full overflow-hidden mb-2.5">
        <div className={cn('h-full rounded-full', bc)} style={{ width: `${w.score}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-2.5">
        <Metric label="Meetings" value={w.meetings} warn={parseFloat(w.meetings) > 5} />
        <Metric label="Focus" value={w.focus} warn={parseFloat(w.focus) < 2} />
        <Metric label="Switches" value={String(w.switches)} warn={w.switches > 12} />
      </div>
      {w.recommendation && (
        <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed px-2.5 py-2 rounded-lg bg-[var(--color-bg-tertiary)]">
          {w.recommendation}
        </p>
      )}
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string; warn: boolean }) {
  return (
    <div className="py-1.5 rounded-md bg-[var(--color-bg-tertiary)]">
      <div className={cn('text-[13px] font-semibold tabular-nums', warn ? 'text-amber-400/80' : 'text-[var(--color-text-primary)]')}>{value}</div>
      <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
