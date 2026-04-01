'use client';

import { cn } from '@/lib/utils';
import { MessageSquare, UserMinus, TrendingDown, Eye } from 'lucide-react';

const ALERT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  decay: UserMinus, sentiment_shift: TrendingDown, visibility_gap: Eye,
};

const ALERT_COLORS: Record<string, string> = {
  decay: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
  sentiment_shift: 'bg-red-500/10 text-red-400 border-red-500/15',
  visibility_gap: 'bg-purple-500/10 text-purple-400 border-purple-500/15',
};

export function RelationshipAlertCard({ data }: { data: Record<string, unknown> }) {
  const alerts = (data.alerts as Array<{
    name: string; title?: string; type: string; days: number; description: string; action: string;
  }>) ?? [];

  return (
    <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] divide-y divide-[var(--color-border-primary)] overflow-hidden">
      {alerts.map((alert, i) => {
        const Icon = ALERT_ICONS[alert.type] ?? UserMinus;

        return (
          <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-bg-tertiary)] transition-colors">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-[11px] font-bold text-[var(--color-text-secondary)]">
                {alert.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[var(--color-bg-secondary)] flex items-center justify-center',
                ALERT_COLORS[alert.type]
              )}>
                <Icon className="w-2 h-2" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{alert.name}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{alert.days}d ago</span>
              </div>
              {alert.title && (
                <p className="text-[11px] text-[var(--color-text-muted)]">{alert.title}</p>
              )}
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{alert.description}</p>
              <button className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
                <MessageSquare className="w-3 h-3" />
                {alert.action}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
