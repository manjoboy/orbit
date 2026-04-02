'use client';

import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

export function RelationshipAlertCard({ data }: { data: Record<string, unknown> }) {
  const alerts = (data.alerts as Array<{
    name: string; title?: string; type: string; days: number; description: string; action: string;
  }>) ?? [];

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden divide-y divide-[var(--color-border-subtle)]">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 hover:bg-[var(--color-bg-tertiary)] transition-colors">
          <div className="w-7 h-7 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)] shrink-0 mt-0.5">
            {a.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{a.name}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{a.days}d</span>
            </div>
            {a.title && <p className="text-[10px] text-[var(--color-text-muted)]">{a.title}</p>}
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{a.description}</p>
            <button className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] transition-colors">
              <MessageSquare className="w-3 h-3" />{a.action}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
