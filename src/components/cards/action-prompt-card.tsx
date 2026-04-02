'use client';

import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function ActionPromptCard({ data }: { data: Record<string, unknown> }) {
  const actions = (data.actions as Array<{ label: string; description: string }>) ?? [];
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((a, i) => (
        <button key={i} className={cn(
          'group flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]',
          'hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]',
          'transition-all'
        )}>
          <div className="text-left">
            <span className="text-[12px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">{a.label}</span>
            {a.description && <p className="text-[10px] text-[var(--color-text-muted)]">{a.description}</p>}
          </div>
          <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
        </button>
      ))}
    </div>
  );
}
