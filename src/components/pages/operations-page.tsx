'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import {
  Target, CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown,
  Minus, ChevronRight, ArrowRight, RotateCcw
} from 'lucide-react';
import {
  OKRS, DECISION_LOG, ACTION_ITEMS, PROCESS_HEALTH, DEPENDENCIES,
  type OKR, type DecisionLogEntry, type ActionItem
} from '@/lib/ops-data';
import { PageHeader } from '../ui/page-header';
import { FlatTabs } from '../ui/tabs';
import { StatusDot } from '../ui/status-dot';
import { OrbitInsight } from '../ui/orbit-insight';

type OpsTab = 'okrs' | 'decisions' | 'actions' | 'processes';

export function OperationsPage() {
  const [activeTab, setActiveTab] = useState<OpsTab>('okrs');

  const tabs = [
    { id: 'okrs' as const, label: 'OKRs' },
    { id: 'actions' as const, label: 'Action Items', count: ACTION_ITEMS.filter(a => a.status === 'overdue').length, countColor: 'critical' as const },
    { id: 'decisions' as const, label: 'Decision Log' },
    { id: 'processes' as const, label: 'Processes' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Target} title="OKRs & Operations" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'okrs' && <OKRsTab />}
        {activeTab === 'actions' && <ActionsTab />}
        {activeTab === 'decisions' && <DecisionsTab />}
        {activeTab === 'processes' && <ProcessesTab />}
      </div>
    </div>
  );
}

// ─── OKRs Tab ───
function OKRsTab() {
  const [expanded, setExpanded] = useState<string | null>(OKRS[0]?.id ?? null);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Quarter summary */}
      <div className="grid grid-cols-4 gap-3">
        <MiniMetric label="OKRs" value={String(OKRS.length)} />
        <MiniMetric label="On Track" value={String(OKRS.filter(o => o.status === 'on-track').length)} status="healthy" />
        <MiniMetric label="At Risk" value={String(OKRS.filter(o => o.status === 'at-risk').length)} status="warning" />
        <MiniMetric label="Avg Progress" value={`${Math.round(OKRS.reduce((s, o) => s + o.progress, 0) / OKRS.length * 100)}%`} />
      </div>

      {/* OKR cards */}
      <div className="space-y-3">
        {OKRS.map((okr) => {
          const isExpanded = expanded === okr.id;
          const statusMap: Record<string, { dot: 'healthy' | 'warning' | 'critical' | 'info'; badge: string; bar: string }> = {
            'on-track': { dot: 'healthy', badge: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]', bar: 'bg-[var(--color-status-healthy)]/60' },
            'at-risk': { dot: 'warning', badge: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]', bar: 'bg-[var(--color-status-warning)]/60' },
            'behind': { dot: 'critical', badge: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]', bar: 'bg-[var(--color-status-critical)]/60' },
            'ahead': { dot: 'info', badge: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]', bar: 'bg-[var(--color-status-info)]/60' },
          };
          const st = statusMap[okr.status] ?? statusMap['on-track'];

          return (
            <div
              key={okr.id}
              className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : okr.id)}
                className="w-full text-left px-4 py-3.5 hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className={cn('w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform', isExpanded && 'rotate-90')} />
                    <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{okr.objective}</span>
                  </div>
                  <span className={cn('flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border', st.badge)}>
                    <StatusDot status={st.dot} size="sm" />
                    {okr.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 ml-5.5">
                  <div className="flex-1 h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-500', st.bar)} style={{ width: `${okr.progress * 100}%` }} />
                  </div>
                  <span className="text-[12px] font-bold text-[var(--color-text-secondary)] tabular-nums w-10 text-right">{Math.round(okr.progress * 100)}%</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1 ml-5.5">Owner: {okr.owner} · {okr.quarter}</p>
              </button>

              {/* Key Results */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[var(--color-border-subtle)]">
                  <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest block pt-3 pb-2">Key Results</span>
                  <div className="space-y-2.5">
                    {okr.keyResults.map((kr, i) => {
                      const pct = Math.min((kr.current / kr.target) * 100, 100);
                      const TrendIcon = kr.trend === 'up' ? TrendingUp : kr.trend === 'down' ? TrendingDown : Minus;
                      const trendColor = kr.trend === 'up' ? 'text-[var(--color-status-healthy)]' : kr.trend === 'down' ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-muted)]';
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] text-[var(--color-text-secondary)]">{kr.title}</span>
                            <div className="flex items-center gap-2">
                              <TrendIcon className={cn('w-3 h-3', trendColor)} />
                              <span className="text-[11px] font-medium text-[var(--color-text-primary)] tabular-nums">{kr.current} / {kr.target} {kr.unit}</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-accent)]/60 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Actions Tab ───
function ActionsTab() {
  const [filter, setFilter] = useState<'all' | 'mine' | 'overdue'>('all');
  const filtered = ACTION_ITEMS.filter(a => {
    if (filter === 'mine') return a.owner === 'You';
    if (filter === 'overdue') return a.status === 'overdue';
    return true;
  });

  const filterTabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'mine' as const, label: 'My Items' },
    { id: 'overdue' as const, label: 'Overdue', count: ACTION_ITEMS.filter(a => a.status === 'overdue').length, countColor: 'critical' as const },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <FlatTabs tabs={filterTabs} active={filter} onChange={setFilter} />

      {/* Action items */}
      <div className="space-y-1.5">
        {filtered.map((action) => {
          const statusDot: 'healthy' | 'warning' | 'critical' | 'info' = action.status === 'done' ? 'healthy'
            : action.status === 'overdue' ? 'critical'
            : action.status === 'in-progress' ? 'info'
            : 'warning';
          const priorityBadge = action.priority === 'high' ? 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]'
            : action.priority === 'medium' ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]'
            : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]';

          return (
            <div
              key={action.id}
              className={cn(
                'flex items-start gap-3 px-4 py-3 rounded-xl border transition-all',
                action.status === 'done'
                  ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] opacity-50'
                  : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
              )}
            >
              <StatusDot status={statusDot} size="md" className="mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-[13px] leading-relaxed',
                  action.status === 'done' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'
                )}>{action.item}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--color-text-muted)]">
                  <span className="font-medium">{action.owner}</span>
                  <span>·</span>
                  <span>{action.source}</span>
                  <span>·</span>
                  <span className={action.status === 'overdue' ? 'text-[var(--color-status-critical)] font-medium' : ''}>{action.dueDate}</span>
                </div>
              </div>
              <span className={cn('shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-md border', priorityBadge)}>
                {action.priority}
              </span>
            </div>
          );
        })}
      </div>

      <OrbitInsight label="Orbit Alert">
        You have <strong>3 overdue items</strong>, including a 6-week-old promise to Jordan about the platform team. The headcount submission due today and load test results are both blocking. Prioritize these before your 2pm Product Review.
      </OrbitInsight>
    </div>
  );
}

// ─── Decisions Tab ───
function DecisionsTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {DECISION_LOG.map((entry) => {
          const statusDot: 'healthy' | 'warning' | 'info' = entry.status === 'decided' ? 'healthy'
            : entry.status === 'pending' ? 'warning' : 'info';
          const statusLabel = entry.status === 'decided' ? 'Decided'
            : entry.status === 'pending' ? 'Pending' : 'Revisit';
          const statusBadge = entry.status === 'decided' ? 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]'
            : entry.status === 'pending' ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]'
            : 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]';

          return (
            <div
              key={entry.id}
              className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
            >
              <div className="flex items-start gap-3">
                <StatusDot status={statusDot} size="md" className="mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{entry.title}</span>
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-md border', statusBadge)}>{statusLabel}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-auto shrink-0">{entry.date}</span>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed mb-1.5">{entry.context}</p>
                  <div className="px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                    <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                      <span className="font-semibold text-[var(--color-text-primary)]">Decision:</span> {entry.decision}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-[var(--color-text-muted)]">Owner: {entry.owner}</span>
                    <div className="flex gap-1">
                      {entry.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Processes Tab ───
function ProcessesTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Process health */}
      <div>
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Process Health</span>
        <div className="mt-3 space-y-2">
          {PROCESS_HEALTH.map((proc, i) => {
            const status: 'healthy' | 'warning' | 'critical' = proc.score >= 80 ? 'healthy' : proc.score >= 60 ? 'warning' : 'critical';
            const barColor = proc.score >= 80 ? 'bg-[var(--color-status-healthy)]/60' : proc.score >= 60 ? 'bg-[var(--color-status-warning)]/60' : 'bg-[var(--color-status-critical)]/60';
            const TrendIcon = proc.trend === 'up' ? TrendingUp : proc.trend === 'down' ? TrendingDown : Minus;
            const trendColor = proc.trend === 'up' ? 'text-[var(--color-status-healthy)]' : proc.trend === 'down' ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-muted)]';

            return (
              <div key={i} className="px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusDot status={status} size="md" />
                    <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{proc.name}</span>
                    {proc.issues > 0 && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)]">{proc.issues} issues</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon className={cn('w-3 h-3', trendColor)} />
                    <span className={cn('text-[14px] font-bold tabular-nums', `text-[var(--color-status-${status})]`)}>{proc.score}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${proc.score}%` }} />
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Last reviewed {proc.lastReview}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dependencies */}
      <div>
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Cross-Team Dependencies</span>
        <div className="mt-3 space-y-2">
          {DEPENDENCIES.map((dep, i) => {
            const depStatus: 'healthy' | 'warning' | 'critical' = dep.status === 'healthy' ? 'healthy' : dep.status === 'blocked' ? 'critical' : 'warning';
            const statusBadge = dep.status === 'healthy'
              ? 'text-[var(--color-status-healthy)] bg-[var(--color-status-healthy-bg)]'
              : dep.status === 'blocked'
              ? 'text-[var(--color-status-critical)] bg-[var(--color-status-critical-bg)]'
              : 'text-[var(--color-status-warning)] bg-[var(--color-status-warning-bg)]';
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <StatusDot status={depStatus} size="md" pulse={dep.status === 'blocked'} className="mt-1.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{dep.from}</span>
                    <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)]" />
                    <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{dep.to}</span>
                    <span className={cn('ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-md', statusBadge)}>{dep.status}</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">{dep.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ───
function MiniMetric({ label, value, status }: { label: string; value: string; status?: 'healthy' | 'warning' | 'critical' }) {
  const textColor = status ? `text-[var(--color-status-${status})]` : 'text-[var(--color-text-primary)]';
  return (
    <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-3 py-2.5 text-center">
      <p className={cn('text-[20px] font-bold tabular-nums', textColor)}>{value}</p>
      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">{label}</p>
    </div>
  );
}
