'use client';

import { cn } from '@/lib/utils';
import { Sparkles, ExternalLink, ArrowRight, TrendingUp, DollarSign, Shield, Rocket } from 'lucide-react';

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PRODUCT_LAUNCH: Rocket, FUNDING_ROUND: DollarSign, REGULATION_CHANGE: Shield, ACQUISITION: TrendingUp,
};

export function IntelBriefCard({ data }: { data: Record<string, unknown> }) {
  const intel = data as {
    title: string; eventType: string; company?: string; summary: string;
    impact: string; relevance: number; action?: string; sourceUrl?: string;
  };

  const Icon = EVENT_ICONS[intel.eventType] ?? TrendingUp;
  const relevancePct = Math.round(intel.relevance * 100);

  return (
    <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] overflow-hidden">
      <div className="px-4 py-3">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-500/10">
            <Icon className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            {intel.eventType.replace(/_/g, ' ')}
          </span>
          {intel.company && (
            <>
              <span className="text-[var(--color-text-muted)]">&middot;</span>
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">{intel.company}</span>
            </>
          )}
          <span className="ml-auto text-[10px] font-medium text-purple-400">{relevancePct}% match</span>
        </div>

        {/* Title */}
        <h4 className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">{intel.title}</h4>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1 leading-relaxed">{intel.summary}</p>

        {/* Impact — the key differentiator */}
        <div className="flex gap-2 mt-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/10">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-[12px] text-purple-300/90 leading-relaxed">{intel.impact}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          {intel.action && (
            <button className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowRight className="w-3 h-3" />
              {intel.action}
            </button>
          )}
          {intel.sourceUrl && (
            <button className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] transition-colors">
              <ExternalLink className="w-3 h-3" />
              Source
            </button>
          )}
        </div>
      </div>

      {/* Relevance bar */}
      <div className="h-0.5 bg-[var(--color-bg-primary)]">
        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${relevancePct}%` }} />
      </div>
    </div>
  );
}
