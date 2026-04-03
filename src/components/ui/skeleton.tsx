import { cn } from '@/lib/utils';

// ─── Skeleton ────────────────────────────────────────────────────────────────
// Shimmer placeholder for loading states.
// Variants match common UI shapes: text lines, avatars, cards, and bars.
// Uses the shimmer keyframe already defined in globals.css.

const SHIMMER = 'shimmer rounded-md';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'avatar' | 'card' | 'bar';
  /** Width override (e.g. "120px", "60%"). Only applies to text and bar. */
  width?: string;
  /** Number of text lines. Only applies to variant="text". */
  lines?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  lines = 1,
  className,
  ...props
}: SkeletonProps) {
  switch (variant) {
    case 'avatar':
      return (
        <div
          className={cn(SHIMMER, 'w-8 h-8 !rounded-full', className)}
          {...props}
        />
      );

    case 'card':
      return (
        <div
          className={cn(SHIMMER, 'rounded-xl h-[120px] w-full', className)}
          {...props}
        />
      );

    case 'bar':
      return (
        <div
          className={cn(SHIMMER, 'rounded-full h-2', className)}
          style={{ width: width ?? '100%' }}
          {...props}
        />
      );

    case 'text':
    default:
      if (lines <= 1) {
        return (
          <div
            className={cn(SHIMMER, 'h-3', className)}
            style={{ width: width ?? '80%' }}
            {...props}
          />
        );
      }
      return (
        <div className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(SHIMMER, 'h-3')}
              style={{
                width: i === lines - 1 ? '55%' : width ?? '100%',
              }}
            />
          ))}
        </div>
      );
  }
}
