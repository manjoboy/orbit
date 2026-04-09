import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Inbox, AlertCircle, Search } from 'lucide-react';
import { Button } from './button';

// ─── EmptyState ─────────────────────────────────────────────────────────────
// Standardized empty, no-data, and error state component.
// Three variants: empty (default), search (no results), error.

type EmptyVariant = 'empty' | 'search' | 'error';

interface EmptyStateProps {
  variant?: EmptyVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const DEFAULT_ICONS: Record<EmptyVariant, LucideIcon> = {
  empty: Inbox,
  search: Search,
  error: AlertCircle,
};

export function EmptyState({
  variant = 'empty',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = icon ?? DEFAULT_ICONS[variant];
  const isError = variant === 'error';

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className={cn(
        'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
        isError
          ? 'bg-[var(--color-status-critical-bg)] border border-[var(--color-status-critical-border)]'
          : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]'
      )}>
        <Icon className={cn(
          'w-5 h-5',
          isError ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-muted)]'
        )} />
      </div>
      <p className={cn(
        'text-[14px] font-semibold mb-1',
        isError ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-primary)]'
      )}>
        {title}
      </p>
      {description && (
        <p className="text-[12px] text-[var(--color-text-tertiary)] max-w-[280px] leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant={isError ? 'secondary' : 'secondary'}
          size="sm"
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
