import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ─── Button ──────────────────────────────────────────────────────────────────
// Versatile button primitive with CVA variants for the Orbit design system.
// Supports primary / secondary / ghost / danger styles, three sizes, and a
// loading state with an inline spinner.

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 font-medium transition-all select-none',
    'focus-visible:outline-1.5 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-accent-strong)] text-white',
          'hover:bg-[var(--color-accent)] active:brightness-90',
        ].join(' '),
        secondary: [
          'border border-[var(--color-border-default)] bg-transparent text-[var(--color-text-secondary)]',
          'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[var(--color-text-secondary)]',
          'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
        ].join(' '),
        danger: [
          'bg-red-500/10 text-red-400 border border-red-500/20',
          'hover:bg-red-500/20 hover:text-red-300',
        ].join(' '),
      },
      size: {
        sm: 'h-7 px-2.5 text-[11px] rounded-md',
        md: 'h-8 px-3.5 text-[12px] rounded-lg',
        lg: 'h-10 px-5 text-[13px] rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { Button, buttonVariants };
