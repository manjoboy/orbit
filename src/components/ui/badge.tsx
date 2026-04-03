import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ─── Badge ───────────────────────────────────────────────────────────────────
// Small, subtle labels for severity, status, and integration sources.
// Uses the Orbit design tokens for muted, dark-theme coloring.

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none transition-colors select-none',
  {
    variants: {
      severity: {
        critical: 'bg-red-500/10 text-red-400 border-red-500/20',
        high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        low: 'bg-green-500/10 text-green-400 border-green-500/20',
      },
      status: {
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        inactive: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      },
      source: {
        slack: 'bg-[#4A154B]/15 text-[#E9A8EC] border-[#4A154B]/30',
        email: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        github: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]',
        linear: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      },
    },
    defaultVariants: {},
  }
);

const SOURCE_ICONS: Record<string, string> = {
  slack: '\u{1F4AC}',
  email: '\u{2709}\u{FE0F}',
  github: '\u{1F500}',
  linear: '\u{1F4CB}',
};

type BadgeVariantProps = VariantProps<typeof badgeVariants>;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, BadgeVariantProps {
  children: React.ReactNode;
}

export function Badge({ className, severity, status, source, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ severity, status, source }), className)}
      {...props}
    >
      {source && SOURCE_ICONS[source] && (
        <span className="text-[9px] leading-none">{SOURCE_ICONS[source]}</span>
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
