'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Mail, CheckSquare, GitPullRequest, AlertTriangle, CornerUpRight, Clock, X } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare, email: Mail, task: CheckSquare, pr: GitPullRequest, alert: AlertTriangle,
};

export function PriorityListCard({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{
    id: string; type: string; title: string; summary: string; from?: string;
    time: string; urgency: number; action: string;
  }>) ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--color-border-subtle)]">
      {items.filter(i => !dismissed.has(i.id)).map((item, i) => {
        const Icon = ICONS[item.type] ?? MessageSquare;
        const isOpen = expanded === item.id;
        return (
          <div key={item.id}
            className={cn(
              'group transition-colors',
              i > 0 && 'border-t border-[var(--color-border-subtle)]',
              isOpen ? 'bg-[var(--color-bg-elevated)]' : 'hover:bg-[var(--color-bg-tertiary)]'
            )}>
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : item.id)}>
              <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.from && <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{item.from}</span>}
                  <span className="text-[11px] text-[var(--color-text-muted)]">{item.time}</span>
                  {item.urgency > 0.8 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                  )}
                </div>
                <p className="text-[12.5px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">{item.title}</p>
                {isOpen && <p className="text-[12px] text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{item.summary}</p>}
              </div>
              <button onClick={e => { e.stopPropagation(); setDismissed(prev => new Set([...prev, item.id])); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] transition-all">
                <X className="w-3 h-3" />
              </button>
            </div>
            {isOpen && (
              <div className="flex items-center gap-2 px-3.5 pb-2.5 ml-6 animate-fade-in">
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[var(--color-accent-strong)] text-white">
                  <CornerUpRight className="w-3 h-3" />{item.action}
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                  <Clock className="w-3 h-3" />Snooze
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
