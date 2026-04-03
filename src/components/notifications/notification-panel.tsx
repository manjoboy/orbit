'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  TrendingDown,
  Rocket,
  Calendar,
  CheckCircle2,
  CheckCheck,
  X,
} from 'lucide-react';
import { type Notification } from './notification-store';

// ─── Icon Mapping ───

const ICON_MAP: Record<Notification['icon'], React.ComponentType<{ className?: string }>> = {
  message: MessageSquare,
  chart: TrendingDown,
  launch: Rocket,
  calendar: Calendar,
  check: CheckCircle2,
};

const ICON_COLOR: Record<Notification['icon'], string> = {
  message: 'text-blue-400',
  chart: 'text-red-400',
  launch: 'text-amber-400',
  calendar: 'text-[var(--color-accent)]',
  check: 'text-emerald-400',
};

// ─── Time helpers ───

function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Group Labels ───

const GROUP_LABELS: Record<string, string> = {
  now: 'Now',
  earlier: 'Earlier today',
  yesterday: 'Yesterday',
};

// ─── Panel Component ───

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Check if clicking on the bell button itself (handled by toggle)
        const bellButton = document.querySelector('[data-notification-bell]');
        if (bellButton?.contains(e.target as Node)) return;
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group notifications
  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    if (!acc[n.group]) acc[n.group] = [];
    acc[n.group].push(n);
    return acc;
  }, {});

  const groupOrder = ['now', 'earlier', 'yesterday'];

  return (
    <div
      ref={panelRef}
      className="absolute top-12 right-3 z-50 w-[380px] max-h-[520px] rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] shadow-2xl shadow-black/40 animate-slide-down overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-medium text-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-1.5 py-0.5 rounded-full tabular-nums">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {groupOrder.map(groupKey => {
          const items = grouped[groupKey];
          if (!items || items.length === 0) return null;

          return (
            <div key={groupKey}>
              {/* Group label */}
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">
                  {GROUP_LABELS[groupKey]}
                </span>
              </div>

              {/* Items */}
              {items.map(notification => {
                const Icon = ICON_MAP[notification.icon];
                const iconColor = ICON_COLOR[notification.icon];

                return (
                  <button
                    key={notification.id}
                    onClick={() => {
                      onMarkAsRead(notification.id);
                      notification.clickAction?.();
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-hover)]',
                      !notification.read && 'border-l-2 border-l-[var(--color-accent)]',
                      notification.read && 'border-l-2 border-l-transparent'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      !notification.read ? 'bg-[var(--color-accent-subtle)]' : 'bg-[var(--color-bg-tertiary)]'
                    )}>
                      <Icon className={cn('w-3.5 h-3.5', iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-[12px] leading-tight truncate',
                          !notification.read
                            ? 'font-medium text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-secondary)]'
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.body}
                      </p>
                      <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">
                        {formatNotificationTime(notification.timestamp)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
