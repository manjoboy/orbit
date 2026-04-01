'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

export function ActionPromptCard({ data }: { data: Record<string, unknown> }) {
  const actions = (data.actions as Array<{ label: string; description: string }>) ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => (
        <button
          key={i}
          className={cn(
            'group flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]',
            'hover:border-blue-500/30 hover:bg-blue-500/5',
            'transition-all duration-200'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <div className="text-left">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)] group-hover:text-blue-400 transition-colors">
              {action.label}
            </span>
            {action.description && (
              <p className="text-[11px] text-[var(--color-text-muted)]">{action.description}</p>
            )}
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-blue-400 ml-1 transition-colors" />
        </button>
      ))}
    </div>
  );
}
