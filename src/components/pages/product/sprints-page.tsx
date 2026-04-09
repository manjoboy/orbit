'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GitBranch } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Inline Mock Data ────────────────────────────────────────────────────────

type Priority = 'P0' | 'P1' | 'P2';
type SprintItemStatus = 'Todo' | 'In Progress' | 'In Review' | 'Done';

const SPRINT_META = {
  name: 'Sprint 23',
  dates: 'Apr 1 – Apr 14',
  totalPoints: 42,
  completedPoints: 18,
};

const SPRINT_ITEMS: Array<{
  id: number; title: string; assignee: string; initials: string;
  priority: Priority; points: number; status: SprintItemStatus;
}> = [
  { id: 1, title: 'Agent Builder v2 — Multi-step flows', assignee: 'Elena R.', initials: 'ER', priority: 'P0', points: 8, status: 'In Progress' },
  { id: 2, title: 'SSO SAML config wizard', assignee: 'Sam K.', initials: 'SK', priority: 'P0', points: 5, status: 'In Progress' },
  { id: 3, title: 'Dashboard query optimization', assignee: 'Nina P.', initials: 'NP', priority: 'P1', points: 5, status: 'In Review' },
  { id: 4, title: 'Webhook retry logic', assignee: 'Jordan L.', initials: 'JL', priority: 'P1', points: 3, status: 'Done' },
  { id: 5, title: 'Rate limit headers in API', assignee: 'Nina P.', initials: 'NP', priority: 'P2', points: 2, status: 'Done' },
  { id: 6, title: 'Template library — 5 new templates', assignee: 'Elena R.', initials: 'ER', priority: 'P1', points: 5, status: 'Done' },
  { id: 7, title: 'Onboarding flow A/B test setup', assignee: 'Marcus T.', initials: 'MT', priority: 'P2', points: 3, status: 'Todo' },
  { id: 8, title: 'Fix: Agent builder state persistence', assignee: 'Jordan L.', initials: 'JL', priority: 'P0', points: 3, status: 'Done' },
  { id: 9, title: 'Enterprise SSO docs update', assignee: 'Sam K.', initials: 'SK', priority: 'P2', points: 2, status: 'Todo' },
  { id: 10, title: 'Multi-language — i18n scaffold', assignee: 'Marcus T.', initials: 'MT', priority: 'P1', points: 6, status: 'Todo' },
];

const VELOCITY_DATA = [
  { sprint: 'Sprint 20', planned: 38, completed: 35, carryover: 3 },
  { sprint: 'Sprint 21', planned: 42, completed: 36, carryover: 6 },
  { sprint: 'Sprint 22', planned: 45, completed: 34, carryover: 11 },
  { sprint: 'Sprint 23', planned: 42, completed: 18, carryover: 0 },
];

const RETRO_WELL = [
  'Template library shipped on time — customers already using 3 of 5 templates',
  'Webhook retry logic reduced failed deliveries by 40%',
  'Cross-team pairing sessions improved code review velocity',
];

const RETRO_IMPROVE = [
  'Enterprise SSO scope creep delayed the sprint by 2 days',
  'Dashboard perf regression shipped to prod — need better perf testing',
  'Too many P0 items pulled mid-sprint from stakeholders',
];

const RETRO_ACTIONS = [
  { id: 1, action: 'Add perf budget to CI pipeline', status: 'In Progress' as const },
  { id: 2, action: 'Strict mid-sprint scope freeze policy', status: 'Done' as const },
  { id: 3, action: 'Dedicate 20% capacity to tech debt each sprint', status: 'Todo' as const },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  P0: 'bg-red-500/10 text-red-400 border-red-500/20',
  P1: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  P2: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const STATUS_ORDER: SprintItemStatus[] = ['Todo', 'In Progress', 'In Review', 'Done'];

const STATUS_DOTS: Record<SprintItemStatus, 'neutral' | 'info' | 'warning' | 'healthy'> = {
  'Todo': 'neutral',
  'In Progress': 'info',
  'In Review': 'warning',
  'Done': 'healthy',
};

// ─── Component ───────────────────────────────────────────────────────────────

type SprintsTab = 'current' | 'velocity' | 'retro';

export function SprintsPage() {
  const [activeTab, setActiveTab] = useState<SprintsTab>('current');

  const tabs = [
    { id: 'current' as const, label: 'Current Sprint' },
    { id: 'velocity' as const, label: 'Velocity' },
    { id: 'retro' as const, label: 'Retrospective' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={GitBranch} title="Sprints" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'current' && <CurrentSprintTab />}
        {activeTab === 'velocity' && <VelocityTab />}
        {activeTab === 'retro' && <RetroTab />}
      </div>
    </div>
  );
}

// ─── Current Sprint Tab ──────────────────────────────────────────────────────

function CurrentSprintTab() {
  const progressPct = Math.round((SPRINT_META.completedPoints / SPRINT_META.totalPoints) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Sprint header */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[15px] font-bold text-[var(--color-text-primary)]">{SPRINT_META.name}</span>
            <span className="text-[12px] text-[var(--color-text-muted)] ml-2">{SPRINT_META.dates}</span>
          </div>
          <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">
            {SPRINT_META.completedPoints} / {SPRINT_META.totalPoints} pts
          </span>
        </div>
        <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-chart-1)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1 tabular-nums">{progressPct}% complete</p>
      </div>

      {/* Items grouped by status */}
      {STATUS_ORDER.map(status => {
        const items = SPRINT_ITEMS.filter(item => item.status === status);
        if (items.length === 0) return null;

        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <StatusDot status={STATUS_DOTS[status]} size="md" />
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{status}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">({items.length})</span>
            </div>
            <div className="space-y-1.5">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
                >
                  <span className="text-[12px] font-medium text-[var(--color-text-primary)] flex-1 min-w-0">{item.title}</span>
                  {/* Assignee avatar */}
                  <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-[var(--color-text-muted)]">{item.initials}</span>
                  </div>
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0', PRIORITY_COLORS[item.priority])}>
                    {item.priority}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums shrink-0 w-8 text-right">{item.points}pt</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Velocity Tab ────────────────────────────────────────────────────────────

function VelocityTab() {
  const maxVal = Math.max(...VELOCITY_DATA.map(d => Math.max(d.planned, d.completed + d.carryover)));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Chart */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Sprint Velocity (Story Points)</span>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-chart-1)]" />Completed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />Planned</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-status-critical)]" />Carryover</span>
          </div>
        </div>
        <div className="flex items-end gap-4 h-36">
          {VELOCITY_DATA.map((d, i) => {
            const plannedH = (d.planned / maxVal) * 100;
            const completedH = (d.completed / maxVal) * 100;
            const carryoverH = d.carryover > 0 ? (d.carryover / maxVal) * 100 : 0;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div
                    className="w-4 rounded-t-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]"
                    style={{ height: `${plannedH}%` }}
                  />
                  <div
                    className="w-4 rounded-t-sm bg-[var(--color-chart-1)]"
                    style={{ height: `${completedH}%` }}
                  />
                  {carryoverH > 0 && (
                    <div
                      className="w-4 rounded-t-sm bg-[var(--color-status-critical)]/60"
                      style={{ height: `${carryoverH}%` }}
                    />
                  )}
                </div>
                <span className="text-[9px] text-[var(--color-text-muted)]">{d.sprint.replace('Sprint ', 'S')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Sprint</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Planned</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Completed</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Carryover</span>
        </div>
        {VELOCITY_DATA.map((d, i) => (
          <div
            key={i}
            className={cn(
              'grid grid-cols-4 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0',
              i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
            )}
          >
            <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{d.sprint}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">{d.planned}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">{d.completed}</span>
            <span className={cn(
              'text-[12px] text-right tabular-nums',
              d.carryover > 5 ? 'text-[var(--color-status-critical)] font-semibold' : 'text-[var(--color-text-secondary)]'
            )}>{d.carryover}</span>
          </div>
        ))}
      </div>

      <OrbitInsight>
        Velocity has dropped 3 consecutive sprints. Carry-over items from enterprise features are the main driver.
      </OrbitInsight>
    </div>
  );
}

// ─── Retrospective Tab ───────────────────────────────────────────────────────

function RetroTab() {
  return (
    <div className="space-y-5 max-w-4xl">
      {/* What went well */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <StatusDot status="healthy" size="md" />
          <span className="text-[11px] font-medium text-[var(--color-status-healthy)] uppercase tracking-widest">What Went Well</span>
        </div>
        <div className="space-y-2 ml-5">
          {RETRO_WELL.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-[var(--color-status-healthy)] mt-1.5 shrink-0" />
              <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What could improve */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <StatusDot status="warning" size="md" />
          <span className="text-[11px] font-medium text-[var(--color-status-warning)] uppercase tracking-widest">What Could Improve</span>
        </div>
        <div className="space-y-2 ml-5">
          {RETRO_IMPROVE.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-[var(--color-status-warning)] mt-1.5 shrink-0" />
              <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action items */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3 block">Action Items from Last Retro</span>
        <div className="space-y-2">
          {RETRO_ACTIONS.map(action => {
            const dot: 'healthy' | 'info' | 'neutral' =
              action.status === 'Done' ? 'healthy' :
              action.status === 'In Progress' ? 'info' : 'neutral';
            const badge =
              action.status === 'Done'
                ? 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]'
                : action.status === 'In Progress'
                  ? 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]'
                  : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]';

            return (
              <div key={action.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                <StatusDot status={dot} size="md" />
                <span className="text-[12px] text-[var(--color-text-secondary)] flex-1">{action.action}</span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0', badge)}>
                  {action.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
