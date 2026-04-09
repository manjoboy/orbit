import { cn } from '@/lib/utils';
import { Zap, ArrowRight } from 'lucide-react';

// ─── OrbitInsight ───────────────────────────────────────────────────────────
// Shared AI insight/recommendation card used throughout all persona pages.
// Standardizes the "Orbit Insight" / "Orbit Recommendation" / "Orbit Alert"
// pattern into a single reusable component.

interface OrbitInsightProps {
  label?: string;         // e.g., "Orbit Insight", "Orbit Alert", "Orbit Recommendation"
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'branded';  // 'branded' uses the larger Orbit logo
  className?: string;
}

export function OrbitInsight({
  label = 'Orbit Insight',
  children,
  actionLabel,
  onAction,
  variant = 'default',
  className,
}: OrbitInsightProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3.5 rounded-xl border',
      'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/20',
      className
    )}>
      {variant === 'branded' ? (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
        </div>
      ) : (
        <Zap className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className={cn(
          'text-[12px] font-semibold mb-0.5',
          variant === 'branded' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-accent)]'
        )}>
          {label}
        </p>
        <div className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
          {children}
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-1 mt-2 text-[11px] font-medium text-[var(--color-accent)] hover:underline"
          >
            {actionLabel} <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
