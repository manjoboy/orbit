'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Check, X, Clock, MessageSquare, LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AgentAction } from '@/lib/agent-types';

interface ActionQueueCardProps {
  action: AgentAction;
  onApprove?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function ActionQueueCard({ action, onApprove, onDismiss, className }: ActionQueueCardProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const urgencyColor = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };

  // Derive urgency from confidence (high confidence = likely high urgency)
  const urgency = action.confidence >= 0.9 ? 'high' : action.confidence >= 0.75 ? 'medium' : 'low';

  const originIcon = {
    briefing: <Sparkles className="w-3 h-3" />,
    chat: <MessageSquare className="w-3 h-3" />,
    dashboard: <LayoutDashboard className="w-3 h-3" />,
  }[action.origin];

  const originLabel = {
    briefing: 'Briefing',
    chat: 'Chat',
    dashboard: 'Dashboard',
  }[action.origin];

  const statusStyles = {
    pending: 'border-[var(--color-border-default)]',
    approved: 'border-emerald-500/30 bg-emerald-500/5',
    dismissed: 'border-[var(--color-border-subtle)] opacity-50',
    executing: 'border-blue-500/30 bg-blue-500/5',
    completed: 'border-emerald-500/30 bg-emerald-500/5',
  }[action.status];

  const timeAgo = getTimeAgo(action.createdAt);

  return (
    <div className={cn(
      'rounded-xl border bg-[var(--color-bg-secondary)] p-4',
      statusStyles,
      className
    )}>
      {/* Top row: urgency + title + status badge */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', urgencyColor[urgency])} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">
            {action.title}
          </h4>
        </div>
        {action.status !== 'pending' && (
          <span className={cn(
            'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize',
            action.status === 'completed' || action.status === 'approved'
              ? 'bg-emerald-500/10 text-emerald-500'
              : action.status === 'dismissed'
              ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
              : 'bg-blue-500/10 text-blue-500'
          )}>
            {action.status}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[12.5px] text-[var(--color-text-secondary)] leading-relaxed ml-[18px] mb-3">
        {action.description}
      </p>

      {/* Reasoning toggle */}
      {action.reasoning && (
        <div className="ml-[18px] mb-3">
          <button
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {reasoningOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            See reasoning
          </button>
          {reasoningOpen && (
            <div className="mt-1.5 space-y-2">
              <div className="pl-3 border-l-2 border-[var(--color-border-subtle)]">
                <p className="text-[11.5px] text-[var(--color-text-tertiary)] leading-relaxed">
                  {action.reasoning}
                </p>
              </div>
              {/* Confidence bar */}
              <div className="flex items-center gap-2 pl-3">
                <span className="text-[10px] text-[var(--color-text-muted)]">Confidence</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-tertiary)] max-w-[120px]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${Math.round(action.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                  {Math.round(action.confidence * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer: meta + actions */}
      <div className="flex items-center justify-between gap-2 ml-[18px]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source pills */}
          {action.sources.slice(0, 3).map((source) => (
            <span
              key={source}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
            >
              {source}
            </span>
          ))}
          {/* Origin badge */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
            {originIcon}
            {originLabel}
          </span>
          {/* Timestamp */}
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>

        {/* Approve / Dismiss buttons */}
        {action.status === 'pending' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => onDismiss?.(action.id)}>
              <X className="w-3 h-3 mr-1" />
              Dismiss
            </Button>
            <Button variant="primary" size="sm" onClick={() => onApprove?.(action.id)}>
              <Check className="w-3 h-3 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper ───

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
