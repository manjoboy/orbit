'use client';

import { useState } from 'react';
import { cn, formatRelativeTime, sourceIcon, truncate } from '@/lib/utils';
import {
  MessageSquare,
  Mail,
  CheckSquare,
  GitPullRequest,
  AlertTriangle,
  ArrowRight,
  Clock,
  X,
  Send,
  CornerUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PriorityItem {
  id: string;
  type: 'message' | 'email' | 'task' | 'pr' | 'decision' | 'alert';
  source: string;
  title: string;
  summary: string;
  urgencyScore: number;
  importanceScore: number;
  compositeScore: number;
  suggestedAction: string;
  deepLink: string;
  from?: string;
  timestamp: Date;
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<any>; accent: string; bgAccent: string }> = {
  message: { icon: MessageSquare, accent: 'text-blue-400', bgAccent: 'bg-blue-500/10' },
  email: { icon: Mail, accent: 'text-purple-400', bgAccent: 'bg-purple-500/10' },
  task: { icon: CheckSquare, accent: 'text-amber-400', bgAccent: 'bg-amber-500/10' },
  pr: { icon: GitPullRequest, accent: 'text-emerald-400', bgAccent: 'bg-emerald-500/10' },
  alert: { icon: AlertTriangle, accent: 'text-red-400', bgAccent: 'bg-red-500/10' },
  decision: { icon: AlertTriangle, accent: 'text-orange-400', bgAccent: 'bg-orange-500/10' },
};

export function PriorityInbox({ items }: { items: PriorityItem[] }) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = items
    .filter(item => !dismissedIds.has(item.id))
    .slice(0, showAll ? undefined : 5);

  const hasMore = items.filter(item => !dismissedIds.has(item.id)).length > 5;

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            Priority Inbox
          </h2>
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-400">
            {items.filter(i => !dismissedIds.has(i.id)).length}
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          Ranked by urgency × importance
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {visibleItems.map((item, index) => {
          const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.message;
          const Icon = config.icon;
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                'group relative rounded-xl border transition-all duration-200',
                'stagger-item animate-fade-in opacity-0',
                isExpanded
                  ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-secondary)]'
                  : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-elevated)]'
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              {/* Main Row */}
              <div
                className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                {/* Urgency indicator */}
                <div className="flex flex-col items-center gap-1.5 pt-0.5">
                  <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg', config.bgAccent)}>
                    <Icon className={cn('w-4 h-4', config.accent)} />
                  </div>
                  {item.urgencyScore > 0.7 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">
                      {sourceIcon(item.source)} {item.source}
                    </span>
                    {item.from && (
                      <>
                        <span className="text-[var(--color-text-muted)]">·</span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">
                          {item.from}
                        </span>
                      </>
                    )}
                    <span className="text-[var(--color-text-muted)]">·</span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
                    {truncate(item.summary, isExpanded ? 500 : 120)}
                  </p>
                </div>

                {/* Actions (visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <ActionButton
                    icon={isExpanded ? ChevronUp : ChevronDown}
                    tooltip={isExpanded ? 'Collapse' : 'Expand'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : item.id);
                    }}
                  />
                  <ActionButton
                    icon={Clock}
                    tooltip="Snooze"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                  <ActionButton
                    icon={X}
                    tooltip="Dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissedIds(prev => new Set([...prev, item.id]));
                    }}
                  />
                </div>
              </div>

              {/* Expanded Actions */}
              {isExpanded && (
                <div className="px-4 pb-3 pt-0 flex items-center gap-2 ml-11 animate-fade-in">
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'bg-blue-500 text-white hover:bg-blue-600',
                    'transition-colors duration-150'
                  )}>
                    <CornerUpRight className="w-3 h-3" />
                    {item.suggestedAction}
                  </button>
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
                    'border border-[var(--color-border-primary)]',
                    'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
                    'transition-colors duration-150'
                  )}>
                    <Send className="w-3 h-3" />
                    Draft response
                  </button>
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'text-[var(--color-text-tertiary)]',
                    'hover:text-[var(--color-text-secondary)]',
                    'transition-colors duration-150'
                  )}>
                    <ArrowRight className="w-3 h-3" />
                    Open in {item.source}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn(
            'flex items-center justify-center w-full py-2 rounded-lg',
            'text-xs text-[var(--color-text-tertiary)]',
            'hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]',
            'transition-colors duration-150'
          )}
        >
          {showAll ? 'Show less' : `Show ${items.length - 5} more`}
        </button>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  tooltip,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded-lg',
        'text-[var(--color-text-muted)]',
        'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]',
        'transition-colors duration-100'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
