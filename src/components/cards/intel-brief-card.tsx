'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, ExternalLink } from 'lucide-react';

export function IntelBriefCard({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    title: string; eventType: string; company?: string; summary: string;
    impact: string; relevance: number; action?: string; sourceUrl?: string;
  };

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{d.eventType.replace(/_/g, ' ')}</span>
          {d.company && <><span className="text-[var(--color-text-muted)]">·</span><span className="text-[10px] text-[var(--color-text-tertiary)]">{d.company}</span></>}
          <span className="ml-auto text-[10px] font-medium text-[var(--color-accent)]">{Math.round(d.relevance * 100)}%</span>
        </div>
        <h4 className="text-[13px] font-medium text-[var(--color-text-primary)] leading-snug">{d.title}</h4>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1 leading-relaxed">{d.summary}</p>
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-[var(--color-accent-subtle)] border border-[rgba(129,140,248,0.06)]">
          <p className="text-[11.5px] text-[var(--color-text-secondary)] leading-relaxed">{d.impact}</p>
        </div>
        <div className="flex items-center gap-3 mt-2.5">
          {d.action && (
            <button className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] transition-colors">
              <ArrowRight className="w-3 h-3" />{d.action}
            </button>
          )}
          {d.sourceUrl && (
            <button className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] transition-colors">
              <ExternalLink className="w-3 h-3" />Source
            </button>
          )}
        </div>
      </div>
      <div className="h-[2px] bg-[var(--color-bg-tertiary)]">
        <div className="h-full bg-[var(--color-accent)]" style={{ width: `${Math.round(d.relevance * 100)}%`, opacity: 0.5 }} />
      </div>
    </div>
  );
}
