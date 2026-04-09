import { cn } from '@/lib/utils';

// ─── StatusDot ──────────────────────────────────────────────────────────────
// Small colored indicator dot for health/status signals.
// Uses semantic CSS variables so it adapts to light/dark theme automatically.

type StatusLevel = 'healthy' | 'warning' | 'critical' | 'info' | 'neutral';

interface StatusDotProps {
  status: StatusLevel;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

const COLOR_MAP: Record<StatusLevel, string> = {
  healthy: 'bg-[var(--color-status-healthy)]',
  warning: 'bg-[var(--color-status-warning)]',
  critical: 'bg-[var(--color-status-critical)]',
  info: 'bg-[var(--color-status-info)]',
  neutral: 'bg-[var(--color-text-muted)]',
};

export function StatusDot({ status, pulse = false, size = 'md', className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'rounded-full shrink-0 inline-block',
        SIZE_MAP[size],
        COLOR_MAP[status],
        pulse && 'status-dot-pulse',
        className
      )}
      aria-label={`Status: ${status}`}
    />
  );
}
