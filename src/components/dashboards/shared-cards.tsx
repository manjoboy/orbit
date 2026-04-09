'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { StatusDot } from '@/components/ui/status-dot';
import { InsightCard } from '@/components/cards/insight-card';
import type { BriefingInsight, BriefingStreamState } from '@/lib/agent-types';

// ─── AgentActionCard ────────────────────────────────────────────────────────
// Hero "wow" component showing what the AI agent proactively prepared.
// Supports two modes:
//   1. Static mode: renders a simple message (existing behavior)
//   2. Streaming mode: shows live briefing with insight cards

interface AgentAction {
  label: string;
  variant: 'primary' | 'secondary';
}

interface AgentActionCardProps {
  title?: string;
  message?: string;
  reasoning?: string;
  actions?: AgentAction[];
  sources?: string[];
  className?: string;
  // Streaming briefing mode
  isStreaming?: boolean;
  briefingState?: BriefingStreamState;
  onInsightAction?: (insight: BriefingInsight, action: BriefingInsight['proposedActions'][number]) => void;
}

export function AgentActionCard({
  title = 'Orbit prepared your day',
  message,
  reasoning,
  actions,
  sources,
  className,
  isStreaming,
  briefingState,
  onInsightAction,
}: AgentActionCardProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const isBriefingMode = briefingState !== undefined;
  const showPulse = isStreaming && (!briefingState || briefingState.status === 'streaming');

  return (
    <div className={cn(
      'bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 rounded-xl p-5',
      className
    )}>
      {/* Header: Orbit logo + title */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          'w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0',
          showPulse && 'animate-pulse'
        )}>
          <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
        </div>
        <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
          {isBriefingMode && briefingState.status === 'streaming' ? 'Orbit is preparing your briefing...' :
           isBriefingMode && briefingState.status === 'complete' ? 'Your briefing is ready' :
           title}
        </span>
      </div>

      {/* Briefing mode: streaming text + insight cards */}
      {isBriefingMode ? (
        <div>
          {/* Greeting */}
          {briefingState.greeting && (
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {briefingState.greeting}
              {briefingState.status === 'streaming' && briefingState.insights.length === 0 && (
                <span className="inline-block w-1.5 h-4 bg-[var(--color-accent)] ml-0.5 animate-pulse align-text-bottom" />
              )}
            </p>
          )}

          {/* Insight cards */}
          {briefingState.insights.length > 0 && (
            <div className="space-y-2.5 mt-3">
              {briefingState.insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAction={onInsightAction}
                />
              ))}
            </div>
          )}

          {/* Streaming indicator while no insights yet */}
          {briefingState.status === 'streaming' && briefingState.insights.length === 0 && !briefingState.greeting && (
            <div className="flex items-center gap-2 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[12px] text-[var(--color-text-muted)]">Analyzing your data...</span>
            </div>
          )}

          {/* Error state */}
          {briefingState.status === 'error' && (
            <p className="text-[12px] text-[var(--color-status-critical)] mt-2">
              Failed to load briefing. The static dashboard is shown below.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Static mode: original message body */}
          {message && (
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {message}
            </p>
          )}

          {/* Optional reasoning collapsible */}
          {reasoning && (
            <div className="mb-4">
              <button
                onClick={() => setReasoningOpen(!reasoningOpen)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                {reasoningOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                See reasoning
              </button>
              {reasoningOpen && (
                <div className="mt-2 pl-4 border-l-2 border-[var(--color-accent)]/20">
                  <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">
                    {reasoning}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom bar: sources + actions */}
          <div className="flex items-center justify-between gap-3">
            {/* Source pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {sources?.map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
                >
                  {source}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            {actions && actions.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                {actions.map((action) => (
                  <Button
                    key={action.label}
                    variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── DashboardMetric ────────────────────────────────────────────────────────
// Compact metric card for dashboard header rows.

interface DashboardMetricProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  status?: 'healthy' | 'warning' | 'critical';
  className?: string;
}

export function DashboardMetric({
  label,
  value,
  change,
  trend,
  status,
  className,
}: DashboardMetricProps) {
  return (
    <div className={cn(
      'rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3',
      className
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{label}</p>
        {status && <StatusDot status={status} size="sm" />}
      </div>
      <p className={cn(
        'text-[24px] font-bold tabular-nums leading-tight',
        status === 'critical' ? 'text-[var(--color-status-critical)]' :
        status === 'warning' ? 'text-[var(--color-status-warning)]' :
        'text-[var(--color-text-primary)]'
      )}>
        {value}
      </p>
      {change && (
        <p className={cn(
          'text-[11px] mt-0.5 font-medium',
          trend === 'up' ? 'text-[var(--color-status-healthy)]' :
          trend === 'down' ? 'text-[var(--color-status-critical)]' :
          'text-[var(--color-text-tertiary)]'
        )}>
          {trend === 'up' && '\u2191 '}
          {trend === 'down' && '\u2193 '}
          {change}
        </p>
      )}
    </div>
  );
}

// ─── QuickActions ───────────────────────────────────────────────────────────
// Grid of quick action buttons with icons.

interface QuickAction {
  icon: LucideIcon;
  label: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {actions.map(({ icon: Icon, label }) => (
        <button
          key={label}
          className={cn(
            'flex flex-col items-center gap-2 py-3.5 rounded-xl transition-all duration-150',
            'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
            'hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]',
            'active:scale-95'
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── DashboardSection ───────────────────────────────────────────────────────
// Section wrapper with title, optional count badge, and "View all" link.

interface DashboardSectionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  onViewAll?: () => void;
  className?: string;
}

export function DashboardSection({
  title,
  count,
  children,
  onViewAll,
  className,
}: DashboardSectionProps) {
  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] font-medium text-[var(--color-accent)] hover:underline"
          >
            View all
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
