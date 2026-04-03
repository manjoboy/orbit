import { cn } from '@/lib/utils';

// ─── Progress ────────────────────────────────────────────────────────────────
// LinearProgress: thin horizontal bar, color shifts by value (green/amber/red).
// RadialProgress: small SVG ring, ideal for compact health-score display.

// ─── Shared color logic ──────────────────────────────────────────────────────

function barColor(value: number): string {
  if (value >= 80) return 'bg-emerald-500/70';
  if (value >= 60) return 'bg-green-500/70';
  if (value >= 40) return 'bg-amber-500/70';
  if (value >= 20) return 'bg-orange-500/70';
  return 'bg-red-500/70';
}

function strokeColor(value: number): string {
  if (value >= 80) return '#34d399'; // emerald-400
  if (value >= 60) return '#4ade80'; // green-400
  if (value >= 40) return '#fbbf24'; // amber-400
  if (value >= 20) return '#fb923c'; // orange-400
  return '#f87171';                  // red-400
}

// ─── Linear Progress ─────────────────────────────────────────────────────────

interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0-100 */
  value: number;
  /** Height in pixels. Defaults to 4. */
  height?: number;
  /** Show value label to the right. */
  showValue?: boolean;
}

export function LinearProgress({
  value,
  height = 4,
  showValue = false,
  className,
  ...props
}: LinearProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <div
        className="flex-1 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden"
        style={{ height }}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor(clamped))}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showValue && (
        <span className="text-[10px] font-medium tabular-nums text-[var(--color-text-tertiary)] min-w-[2ch] text-right">
          {Math.round(clamped)}
        </span>
      )}
    </div>
  );
}

// ─── Radial Progress ─────────────────────────────────────────────────────────

interface RadialProgressProps extends React.SVGAttributes<SVGSVGElement> {
  /** 0-100 */
  value: number;
  /** Diameter in pixels. Defaults to 36. */
  size?: number;
  /** Stroke width. Defaults to 3. */
  strokeWidth?: number;
  /** Show value text in center. */
  showValue?: boolean;
}

export function RadialProgress({
  value,
  size = 36,
  strokeWidth = 3,
  showValue = true,
  className,
  ...props
}: RadialProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-bg-elevated)"
        strokeWidth={strokeWidth}
      />
      {/* Value arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor(clamped)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1), stroke 400ms ease' }}
      />
      {showValue && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-[var(--color-text-secondary)]"
          style={{ fontSize: size * 0.28, fontWeight: 600 }}
        >
          {Math.round(clamped)}
        </text>
      )}
    </svg>
  );
}
