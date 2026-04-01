'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Mail, CheckSquare, GitPullRequest, AlertTriangle, CornerUpRight, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare, email: Mail, task: CheckSquare, pr: GitPullRequest, alert: AlertTriangle,
};

const ACCENTS: Record<string, string> = {
  message: 'border-l-blue-500', email: 'border-l-purple-500', task: 'border-l-amber-500',
  pr: 'border-l-emerald-500', alert: 'border-l-red-500',
};

const ICON_BG: Record<string, string> = {
  message: 'bg-blue-500/10 text-blue-400', email: 'bg-purple-500/10 text-purple-400',
  task: 'bg-amber-500/10 text-amber-400', pr: 'bg-emerald-500/10 text-emerald-400',
  alert: 'bg-red-500/10 text-red-400',
};

export function PriorityListCard({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{
    id: string; type: string; title: string; summary: string; from?: string;
    time: string; urgency: number; action: string;
  }>) ?? [];

  const [expanded, setExpanded] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = items.filter(i => !dismissed.has(i.id));

  return (
    <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] overflow-hidden">
      {visible.map((item, i) => {
        const Icon = ICONS[item.type] ?? MessageSquare;
        const isOpen = expanded === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              'group border-l-2 transition-all duration-200',
              ACCENTS[item.type] ?? 'border-l-blue-500',
              i > 0 && 'border-t border-t-[var(--color-border-primary)]',
              isOpen ? 'bg-[var(--color-bg-elevated)]' : 'hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            <div
              className="flex items-start gap-3 px-4 py-3 cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : item.id)}
            >
              <div className={cn('flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5', ICON_BG[item.type])}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.from && (
                    <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{item.from}</span>
                  )}
                  <span className="text-[11px] text-[var(--color-text-muted)]">{item.time}</span>
                  {item.urgency > 0.8 && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      urgent
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                  {item.title}
                </p>
                {isOpen && (
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1.5 leading-relaxed">
                    {item.summary}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); setDismissed(prev => new Set([...prev, item.id])); }}
                  className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="flex items-center gap-2 px-4 pb-3 ml-10 animate-fade-in">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/20">
                  <CornerUpRight className="w-3 h-3" />
                  {item.action}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                  <Clock className="w-3 h-3" />
                  Snooze
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
