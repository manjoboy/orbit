'use client';

import { cn, healthScoreColor } from '@/lib/utils';
import { UserMinus, TrendingDown, Eye, MessageSquare } from 'lucide-react';

interface RelationshipAlert {
  personId: string;
  personName: string;
  personTitle?: string;
  alertType: 'decay' | 'sentiment_shift' | 'visibility_gap' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedAction: string;
  daysSinceContact: number;
}

const ALERT_TYPE_CONFIG = {
  decay: { icon: UserMinus, accent: 'text-amber-400', label: 'Fading' },
  sentiment_shift: { icon: TrendingDown, accent: 'text-red-400', label: 'Sentiment shift' },
  visibility_gap: { icon: Eye, accent: 'text-purple-400', label: 'Low visibility' },
  milestone: { icon: MessageSquare, accent: 'text-blue-400', label: 'Milestone' },
};

export function RelationshipAlerts({ alerts }: { alerts: RelationshipAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className={cn(
      'rounded-xl border border-[var(--color-border-primary)]',
      'bg-[var(--color-bg-secondary)]'
    )}>
      <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            Relationship Alerts
          </h3>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {alerts.length} need attention
          </span>
        </div>
      </div>

      <div className="divide-y divide-[var(--color-border-primary)]">
        {alerts.map((alert, index) => {
          const config = ALERT_TYPE_CONFIG[alert.alertType];
          const Icon = config.icon;

          return (
            <div
              key={alert.personId}
              className={cn(
                'flex items-start gap-3 px-4 py-3',
                'hover:bg-[var(--color-bg-hover)] transition-colors duration-150',
                'stagger-item animate-fade-in opacity-0'
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              {/* Avatar placeholder */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-[11px] font-medium text-[var(--color-text-secondary)]">
                  {alert.personName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-bg-secondary)] flex items-center justify-center',
                  alert.severity === 'high' ? 'bg-red-500' :
                  alert.severity === 'medium' ? 'bg-amber-500' :
                  'bg-yellow-500'
                )}>
                  <Icon className="w-2 h-2 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">
                    {alert.personName}
                  </span>
                  <span className={cn('text-[10px]', config.accent)}>
                    {config.label}
                  </span>
                </div>
                {alert.personTitle && (
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {alert.personTitle}
                  </p>
                )}
                <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1 leading-relaxed">
                  {alert.daysSinceContact}d since last contact
                </p>

                {/* Quick action */}
                <button className={cn(
                  'mt-2 flex items-center gap-1 text-[11px] font-medium',
                  'text-blue-400 hover:text-blue-300 transition-colors'
                )}>
                  <MessageSquare className="w-3 h-3" />
                  {alert.suggestedAction.length > 40
                    ? 'Reach out'
                    : alert.suggestedAction}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
