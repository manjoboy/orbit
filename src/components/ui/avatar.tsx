import { cn } from '@/lib/utils';

// ─── Avatar ──────────────────────────────────────────────────────────────────
// Displays a user avatar with image or initials fallback.
// Supports three sizes and an optional status indicator dot.

const SIZE_MAP = {
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-12 h-12 text-[15px]',
} as const;

const STATUS_DOT_SIZE = {
  sm: 'w-1.5 h-1.5 border',
  md: 'w-2 h-2 border-[1.5px]',
  lg: 'w-3 h-3 border-2',
} as const;

const STATUS_COLOR = {
  online: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-red-400',
} as const;

// Deterministic gradient from name — keeps the same color across renders.
const GRADIENTS = [
  'from-indigo-500/60 to-purple-500/60',
  'from-sky-500/60 to-cyan-500/60',
  'from-emerald-500/60 to-teal-500/60',
  'from-amber-500/60 to-orange-500/60',
  'from-pink-500/60 to-rose-500/60',
  'from-violet-500/60 to-fuchsia-500/60',
  'from-blue-500/60 to-indigo-500/60',
  'from-teal-500/60 to-green-500/60',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  status?: 'online' | 'away' | 'busy';
}

export function Avatar({ name, size = 'md', src, status, className, ...props }: AvatarProps) {
  const initials = getInitials(name);
  const gradient = getGradient(name);

  return (
    <div className={cn('relative shrink-0', className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            SIZE_MAP[size],
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white/90 select-none',
            SIZE_MAP[size],
            gradient,
          )}
          aria-label={name}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-[var(--color-bg-primary)]',
            STATUS_DOT_SIZE[size],
            STATUS_COLOR[status],
          )}
        />
      )}
    </div>
  );
}
