'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import {
  Map as MapIcon, ChevronRight, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle2, Clock, XCircle, Scissors, Circle,
  ArrowRight, MessageSquare, BarChart3, Users
} from 'lucide-react';
import {
  ROADMAP_ITEMS, FEATURE_REQUESTS, SPRINT_METRICS, FEEDBACK_THEMES,
  ROADMAP_SUMMARY, type RoadmapItem
} from '@/lib/roadmap-data';
import { PageHeader } from '../ui/page-header';
import { FlatTabs } from '../ui/tabs';
import { StatusDot } from '../ui/status-dot';
import { OrbitInsight } from '../ui/orbit-insight';

type RoadmapTab = 'roadmap' | 'requests' | 'velocity' | 'feedback';

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; badge: string; label: string; dot: 'healthy' | 'warning' | 'critical' | 'info' | 'neutral' }> = {
  'in-progress': { icon: ArrowRight, color: 'text-[var(--color-status-info)]', badge: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]', label: 'In Progress', dot: 'info' },
  'planned': { icon: Circle, color: 'text-[var(--color-text-muted)]', badge: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]', label: 'Planned', dot: 'neutral' },
  'blocked': { icon: AlertTriangle, color: 'text-[var(--color-status-critical)]', badge: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]', label: 'Blocked', dot: 'critical' },
  'shipped': { icon: CheckCircle2, color: 'text-[var(--color-status-healthy)]', badge: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]', label: 'Shipped', dot: 'healthy' },
  'cut': { icon: Scissors, color: 'text-[var(--color-text-muted)]', badge: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]', label: 'Cut', dot: 'neutral' },
};

const PRIORITY_COLORS: Record<string, string> = {
  'P0': 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]',
  'P1': 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]',
  'P2': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
};

export function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<RoadmapTab>('roadmap');

  const tabs = [
    { id: 'roadmap' as const, label: 'Roadmap' },
    { id: 'requests' as const, label: 'Feature Requests' },
    { id: 'velocity' as const, label: 'Sprint Velocity' },
    { id: 'feedback' as const, label: 'Feedback' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={MapIcon} title="Roadmap" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'roadmap' && <RoadmapTab />}
        {activeTab === 'requests' && <RequestsTab />}
        {activeTab === 'velocity' && <VelocityTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
      </div>
    </div>
  );
}

// ─── Roadmap Tab ───
function RoadmapTab() {
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const filtered = statusFilter === 'active'
    ? ROADMAP_ITEMS.filter(r => r.status !== 'cut' && r.status !== 'shipped')
    : statusFilter === 'all' ? ROADMAP_ITEMS
    : ROADMAP_ITEMS.filter(r => r.status === statusFilter);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Summary */}
      <div className="grid grid-cols-5 gap-3">
        <MiniMetric label="In Progress" value={String(ROADMAP_SUMMARY.inProgress)} status="info" />
        <MiniMetric label="Blocked" value={String(ROADMAP_SUMMARY.blocked)} status="critical" />
        <MiniMetric label="Planned" value={String(ROADMAP_SUMMARY.planned)} />
        <MiniMetric label="Cut" value={String(ROADMAP_SUMMARY.cut)} />
        <MiniMetric label="Velocity" value={`${ROADMAP_SUMMARY.sprintVelocity}%`} status={ROADMAP_SUMMARY.sprintVelocityTrend === 'down' ? 'warning' : 'healthy'} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1">
        {['active', 'all', 'in-progress', 'blocked', 'planned', 'cut'].map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize',
              statusFilter === f
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >{f}</button>
        ))}
      </div>

      {/* Roadmap items */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const barColor = item.status === 'blocked' ? 'bg-[var(--color-status-critical)]/60'
            : item.status === 'in-progress' ? 'bg-[var(--color-status-info)]/60'
            : item.status === 'shipped' ? 'bg-[var(--color-status-healthy)]/60' : 'bg-[var(--color-bg-elevated)]';

          return (
            <div
              key={item.id}
              className={cn(
                'px-4 py-4 rounded-xl border transition-all',
                item.status === 'cut' ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] opacity-50' : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <StatusDot status={config.dot} size="md" pulse={item.status === 'blocked'} className="mt-1.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={cn('text-[14px] font-semibold', item.status === 'cut' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]')}>{item.name}</span>
                      <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-md border', config.badge)}>{config.label}</span>
                      <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-md border', PRIORITY_COLORS[item.priority])}>{item.priority}</span>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">{item.effort}</span>
                    </div>
                    <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {item.progress > 0 && (
                <div className="flex items-center gap-2 mt-2 ml-6">
                  <div className="flex-1 h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${item.progress * 100}%` }} />
                  </div>
                  <span className="text-[11px] font-medium text-[var(--color-text-secondary)] tabular-nums">{Math.round(item.progress * 100)}%</span>
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 mt-2 ml-6 text-[10px] text-[var(--color-text-muted)] flex-wrap">
                <span>{item.owner} · {item.team}</span>
                {item.customerRequests > 0 && (
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{item.customerRequests} requests</span>
                )}
                {item.dependencies.length > 0 && (
                  <span className="text-[var(--color-status-warning)]">Depends on: {item.dependencies.join(', ')}</span>
                )}
                {item.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Feature Requests Tab ───
function RequestsTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Feature Requests</h2>
        <span className="text-[11px] text-[var(--color-text-muted)]">Sorted by revenue impact</span>
      </div>

      <div className="space-y-2">
        {FEATURE_REQUESTS.map((req) => {
          const priorityColor = req.priority === 'critical' ? 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]'
            : req.priority === 'high' ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]'
            : req.priority === 'medium' ? 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]'
            : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]';
          const statusDot: 'healthy' | 'info' | 'warning' | 'neutral' = req.status === 'shipped' ? 'healthy'
            : req.status === 'in-progress' ? 'info'
            : req.status === 'planned' ? 'warning' : 'neutral';

          return (
            <div
              key={req.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
            >
              <StatusDot status={statusDot} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{req.title}</span>
                  <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-md border', priorityColor)}>{req.priority}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{req.requestCount} requests</span>
                  <span>{req.source}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[14px] font-bold text-[var(--color-text-primary)] tabular-nums">${(req.revenue / 1e3).toFixed(0)}K</span>
                <p className="text-[10px] text-[var(--color-text-muted)]">revenue tied</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sprint Velocity Tab ───
function VelocityTab() {
  const maxPlanned = Math.max(...SPRINT_METRICS.map(s => s.planned));

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="grid grid-cols-3 gap-3">
        <MiniMetric label="Avg Velocity" value={`${ROADMAP_SUMMARY.sprintVelocity}%`} status={ROADMAP_SUMMARY.sprintVelocityTrend === 'down' ? 'warning' : 'healthy'} />
        <MiniMetric label="Current Sprint" value={`${Math.round(14/33*100)}%`} status="info" />
        <MiniMetric label="Carryover Trend" value={SPRINT_METRICS[SPRINT_METRICS.length - 2]?.carryover > 5 ? 'High' : 'Normal'} status={SPRINT_METRICS[SPRINT_METRICS.length - 2]?.carryover > 5 ? 'critical' : 'healthy'} />
      </div>

      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Sprint Performance</span>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-chart-1)]" />Completed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]" />Planned</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-status-critical)]/60" />Carryover</span>
          </div>
        </div>

        <div className="space-y-3">
          {SPRINT_METRICS.map((sprint, i) => {
            const completedPct = (sprint.completed / maxPlanned) * 100;
            const velocity = sprint.planned > 0 ? Math.round((sprint.completed / sprint.planned) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[var(--color-text-secondary)] w-32">{sprint.sprint}</span>
                  <span className={cn(
                    'text-[11px] font-medium tabular-nums',
                    velocity >= 85 ? 'text-[var(--color-status-healthy)]' : velocity >= 70 ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-status-critical)]'
                  )}>{velocity}%</span>
                </div>
                <div className="h-5 bg-[var(--color-bg-elevated)] rounded-lg overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-[var(--color-chart-1)]/40 rounded-lg" style={{ width: `${completedPct}%` }} />
                  {sprint.carryover > 0 && (
                    <div className="absolute inset-y-0 bg-[var(--color-status-critical)]/30 rounded-r-lg" style={{ left: `${completedPct}%`, width: `${(sprint.carryover / maxPlanned) * 100}%` }} />
                  )}
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-[9px] font-medium text-[var(--color-text-primary)]">{sprint.completed}/{sprint.planned} pts{sprint.carryover > 0 ? ` · ${sprint.carryover} carried` : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <OrbitInsight label="Orbit Analysis">
        Sprint 22 had an 11-point carryover spike — coincides with the auth migration blocker. Current sprint is on pace but the two blocked roadmap items (Auth Migration, Enterprise Onboarding) are dragging overall velocity. Unblocking the SSO PR review would cascade into 3 downstream items.
      </OrbitInsight>
    </div>
  );
}

// ─── Feedback Tab ───
function FeedbackTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Customer Feedback Themes</h2>
        <span className="text-[11px] text-[var(--color-text-muted)]">Last 30 days</span>
      </div>

      <div className="space-y-3">
        {FEEDBACK_THEMES.map((theme, i) => {
          const sentimentIcon = theme.sentiment === 'positive' ? '😊'
            : theme.sentiment === 'negative' ? '😟' : '🤔';
          const TrendIcon = theme.trend === 'up' ? TrendingUp : theme.trend === 'down' ? TrendingDown : Minus;
          const trendColor = theme.sentiment === 'positive'
            ? (theme.trend === 'up' ? 'text-[var(--color-status-healthy)]' : 'text-[var(--color-status-critical)]')
            : (theme.trend === 'up' ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-status-healthy)]');

          return (
            <div key={i} className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">{sentimentIcon}</span>
                  <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{theme.theme}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon className={cn('w-3 h-3', trendColor)} />
                  <span className="text-[12px] font-medium text-[var(--color-text-secondary)] tabular-nums">{theme.mentions} mentions</span>
                </div>
              </div>
              <div className="space-y-1.5 ml-7">
                {theme.topQuotes.map((quote, j) => (
                  <p key={j} className="text-[12px] text-[var(--color-text-tertiary)] italic">&ldquo;{quote}&rdquo;</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared Components ───
function MiniMetric({ label, value, status }: { label: string; value: string; status?: 'healthy' | 'warning' | 'critical' | 'info' }) {
  const textColor = status ? `text-[var(--color-status-${status})]` : 'text-[var(--color-text-primary)]';
  return (
    <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-3 py-2.5 text-center">
      <p className={cn('text-[20px] font-bold tabular-nums', textColor)}>{value}</p>
      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">{label}</p>
    </div>
  );
}
