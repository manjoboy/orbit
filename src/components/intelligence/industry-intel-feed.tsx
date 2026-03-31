'use client';

import { cn, truncate } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Rocket,
  Shield,
  Users,
  Newspaper,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface IndustryBriefItem {
  id: string;
  title: string;
  summary: string;
  relevanceScore: number;
  eventType: string;
  company?: string;
  impactOnYou: string;
  suggestedAction?: string;
  sourceUrl?: string;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: React.ComponentType<any>; accent: string; bgAccent: string }> = {
  FUNDING_ROUND: { icon: DollarSign, accent: 'text-emerald-400', bgAccent: 'bg-emerald-500/10' },
  PRODUCT_LAUNCH: { icon: Rocket, accent: 'text-blue-400', bgAccent: 'bg-blue-500/10' },
  ACQUISITION: { icon: TrendingUp, accent: 'text-purple-400', bgAccent: 'bg-purple-500/10' },
  LEADERSHIP_CHANGE: { icon: Users, accent: 'text-amber-400', bgAccent: 'bg-amber-500/10' },
  PRICING_CHANGE: { icon: DollarSign, accent: 'text-orange-400', bgAccent: 'bg-orange-500/10' },
  REGULATION_CHANGE: { icon: Shield, accent: 'text-red-400', bgAccent: 'bg-red-500/10' },
  SECURITY_BREACH: { icon: Shield, accent: 'text-red-400', bgAccent: 'bg-red-500/10' },
};

const DEFAULT_CONFIG = { icon: Newspaper, accent: 'text-cyan-400', bgAccent: 'bg-cyan-500/10' };

export function IndustryIntelFeed({ signals }: { signals: IndustryBriefItem[] }) {
  if (signals.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            Intelligence
          </h2>
          <span className="flex items-center gap-1 text-[11px] text-purple-400">
            <Sparkles className="w-3 h-3" />
            AI-curated
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          Scored by relevance to your work
        </span>
      </div>

      <div className="space-y-2">
        {signals.map((signal, index) => {
          const config = EVENT_TYPE_CONFIG[signal.eventType] ?? DEFAULT_CONFIG;
          const Icon = config.icon;
          const relevancePct = Math.round(signal.relevanceScore * 100);

          return (
            <div
              key={signal.id}
              className={cn(
                'group rounded-xl border p-4 transition-all duration-200',
                'bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]',
                'hover:border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-elevated)]',
                'stagger-item animate-fade-in opacity-0'
              )}
              style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
                  config.bgAccent
                )}>
                  <Icon className={cn('w-4 h-4', config.accent)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      {signal.eventType.replace(/_/g, ' ')}
                    </span>
                    {signal.company && (
                      <>
                        <span className="text-[var(--color-text-muted)]">·</span>
                        <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                          {signal.company}
                        </span>
                      </>
                    )}
                    <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">
                      {relevancePct}% match
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-[var(--color-text-primary)] leading-snug">
                    {signal.title}
                  </h3>

                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1 leading-relaxed">
                    {truncate(signal.summary, 180)}
                  </p>

                  {/* Impact on user — the differentiator */}
                  <div className={cn(
                    'mt-2.5 flex gap-2 px-3 py-2 rounded-lg',
                    'bg-purple-500/5 border border-purple-500/10'
                  )}>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-purple-300/80 leading-relaxed">
                      {signal.impactOnYou}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-2.5">
                    {signal.suggestedAction && (
                      <button className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
                        <ArrowRight className="w-3 h-3" />
                        {signal.suggestedAction}
                      </button>
                    )}
                    {signal.sourceUrl && (
                      <button className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Source
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Relevance bar */}
              <div className="mt-3 h-0.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${relevancePct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
