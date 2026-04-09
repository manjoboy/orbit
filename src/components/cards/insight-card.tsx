'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BriefingInsight } from '@/lib/agent-types';

interface InsightCardProps {
  insight: BriefingInsight;
  onAction?: (insight: BriefingInsight, action: BriefingInsight['proposedActions'][number]) => void;
  className?: string;
}

export function InsightCard({ insight, onAction, className }: InsightCardProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const urgencyColor = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  }[insight.urgency];

  return (
    <div className={cn(
      'rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4',
      'hover:border-[var(--color-border-default)] transition-colors',
      className
    )}>
      {/* Header: urgency dot + headline */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', urgencyColor)} />
        <h4 className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">
          {insight.headline}
        </h4>
      </div>

      {/* Body */}
      <p className="text-[12.5px] text-[var(--color-text-secondary)] leading-relaxed ml-[18px] mb-3">
        {insight.body}
      </p>

      {/* Reasoning toggle */}
      {insight.reasoning && (
        <div className="ml-[18px] mb-3">
          <button
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {reasoningOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            See reasoning
          </button>
          {reasoningOpen && (
            <div className="mt-1.5 pl-3 border-l-2 border-[var(--color-border-subtle)]">
              <p className="text-[11.5px] text-[var(--color-text-tertiary)] leading-relaxed">
                {insight.reasoning}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer: sources + action buttons */}
      <div className="flex items-center justify-between gap-2 ml-[18px]">
        <div className="flex items-center gap-1 flex-wrap">
          {insight.sources.map((source) => (
            <span
              key={source}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
            >
              {source}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {insight.proposedActions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              size="sm"
              onClick={() => onAction?.(insight, action)}
            >
              <Zap className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
