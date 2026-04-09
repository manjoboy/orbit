'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getGreeting } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import { FileCheck, FileSpreadsheet, CalendarCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { StatusDot } from '@/components/ui/status-dot';
import { OrbitInsight } from '@/components/ui/orbit-insight';
import { Button } from '@/components/ui/button';
import {
  AgentActionCard,
  DashboardMetric,
  QuickActions,
  DashboardSection,
} from './shared-cards';
import {
  BUDGET_CATEGORIES,
  APPROVAL_ITEMS,
  FORECAST_SCENARIOS,
  BOARD_PREP_ITEMS,
  BURN_RATE_DATA,
  FINANCE_AGENT_ACTIONS,
  FINANCE_SUMMARY,
} from '@/lib/persona-data/finance-persona-data';

// ─── Approval status colors ───
const APPROVAL_STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'rejected': 'bg-red-500/10 text-red-400 border-red-500/20',
  'needs-info': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

// ─── Board prep status colors ───
const BOARD_STATUS_COLORS: Record<string, string> = {
  'complete': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'not-started': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]',
  'blocked': 'bg-red-500/10 text-red-400 border-red-500/20',
  'review': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export function FinanceDashboard() {
  const { userName } = useOrbit();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Summary data
  const summary = FINANCE_SUMMARY ?? {
    totalBudget: 4200000,
    totalSpent: 2850000,
    burnRate: 475000,
    runway: '14 months',
    pendingApprovals: 3,
    yearEndProjection: '$4.8M',
  };

  const budgetCategories = BUDGET_CATEGORIES ?? [
    { category: 'Engineering', allocated: 1800000, spent: 1250000, status: 'on-track' },
    { category: 'Sales & Marketing', allocated: 900000, spent: 720000, status: 'at-risk' },
    { category: 'Cloud Infrastructure', allocated: 600000, spent: 480000, status: 'over' },
    { category: 'Recruiting', allocated: 400000, spent: 200000, status: 'under' },
    { category: 'Office & Operations', allocated: 300000, spent: 150000, status: 'on-track' },
  ];

  const approvals = APPROVAL_ITEMS ?? [
    { id: 'APR-1', description: 'AWS Reserved Instance (3yr)', amount: 180000, requester: 'Sarah Chen', status: 'pending', agentRec: 'Recommend approval — 42% savings vs on-demand. ROI in 14 months.' },
    { id: 'APR-2', description: 'Recruiting Agency Contract', amount: 45000, requester: 'HR Team', status: 'pending', agentRec: 'Consider deferring — 2 of 4 open roles can be filled via referral pipeline.' },
    { id: 'APR-3', description: 'Sales Enablement Platform', amount: 24000, requester: 'Marcus Chen', status: 'pending', agentRec: 'Approve with negotiation — competitor pricing suggests 15% discount possible.' },
  ];

  const boardPrepItems = BOARD_PREP_ITEMS ?? [
    { item: 'Financial Summary Deck', status: 'complete', owner: 'You' },
    { item: 'Revenue Projections', status: 'in-progress', owner: 'You' },
    { item: 'Headcount Plan', status: 'in-progress', owner: 'David Park' },
    { item: 'Product Roadmap Timeline', status: 'not-started', owner: 'Product Team' },
    { item: 'Competitive Landscape Update', status: 'not-started', owner: 'Sales Team' },
    { item: 'Risk Register', status: 'blocked', owner: 'You' },
  ];

  const burnRateData = BURN_RATE_DATA ?? [
    { month: 'Nov', actual: 420, planned: 440 },
    { month: 'Dec', actual: 445, planned: 450 },
    { month: 'Jan', actual: 460, planned: 455 },
    { month: 'Feb', actual: 475, planned: 460 },
    { month: 'Mar', actual: 490, planned: 465 },
    { month: 'Apr', actual: 0, planned: 470 },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={cn(
        'px-5 md:px-7 py-6 transition-all duration-500',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            {getGreeting(userName)}
          </h1>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">{dateStr}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/15 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Headcount due today
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {approvals.filter((a) => a.status === 'pending').length} approvals pending
            </span>
          </div>
        </div>

        {/* Two column layout */}
        <div className="flex gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Agent Action Card */}
            <AgentActionCard
              message="Q2 headcount projections are due to David by 5pm today. I've drafted 3 scenarios: Conservative (2 hires, $380K), Base (4, $720K), Aggressive (7, $1.26M). Base Case has the strongest ROI narrative."
              reasoning="Based on Q1 actuals, 2 likely senior engineer departures (exit signals from 1:1 notes), Agent Builder v2 timeline requiring 2 additional engineers, and David's stated 15% headcount growth cap. Conservative covers attrition only. Base adds growth hires for highest-ROI project. Aggressive adds speculative hires for H2 initiatives."
              actions={[
                { label: 'Review Scenarios', variant: 'primary' },
                { label: 'Send to David', variant: 'secondary' },
              ]}
              sources={['Gmail', 'Google Sheets', 'Linear', 'Slack']}
            />

            {/* Budget Overview */}
            <DashboardSection title="Budget Overview">
              {/* Summary metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <DashboardMetric
                  label="Total Budget"
                  value={`$${((summary.totalBudget ?? 4200000) / 1e6).toFixed(1)}M`}
                  change={`${Math.round(((summary.totalSpent ?? 2850000) / (summary.totalBudget ?? 4200000)) * 100)}% spent`}
                />
                <DashboardMetric
                  label="Monthly Burn"
                  value={`$${((summary.burnRate ?? 475000) / 1e3).toFixed(0)}K`}
                  change="Trending up"
                  trend="up"
                  status="warning"
                />
                <DashboardMetric
                  label="Pending Approvals"
                  value={String(summary.pendingApprovals ?? 3)}
                  change="$249K total"
                />
                <DashboardMetric
                  label="Runway"
                  value={summary.runway ?? '14 months'}
                  change="At current burn"
                  status="healthy"
                />
              </div>

              {/* Budget category bars */}
              <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Budget by Category</span>
                <div className="mt-3 space-y-3">
                  {budgetCategories.map((item, i) => {
                    const pct = Math.round((item.spent / item.allocated) * 100);
                    const statusColor =
                      item.status === 'over' || item.status === 'at-risk'
                        ? 'bg-[var(--color-status-critical)]/60'
                        : item.status === 'under'
                        ? 'bg-[var(--color-status-healthy)]/60'
                        : 'bg-[var(--color-chart-1)]';
                    const dotStatus =
                      item.status === 'over' || item.status === 'at-risk'
                        ? 'critical'
                        : item.status === 'under'
                        ? 'healthy'
                        : 'info';

                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <StatusDot status={dotStatus as 'critical' | 'healthy' | 'info'} size="sm" />
                            <span className="text-[12px] text-[var(--color-text-secondary)]">{item.category}</span>
                          </div>
                          <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums">
                            ${(item.spent / 1e3).toFixed(0)}K / ${(item.allocated / 1e3).toFixed(0)}K
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', statusColor)}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DashboardSection>

            {/* Approval Queue */}
            <DashboardSection title="Approval Queue" count={approvals.filter((a) => a.status === 'pending').length}>
              <div className="space-y-2">
                {approvals.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      'px-4 py-3.5 rounded-xl transition-all duration-150',
                      'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                      'hover:border-[var(--color-border-default)] cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <StatusDot status={item.status === 'pending' ? 'warning' : 'healthy'} size="md" />
                        <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{item.description}</span>
                      </div>
                      <span className="text-[14px] font-bold text-[var(--color-text-primary)] tabular-nums shrink-0 ml-3">
                        ${item.amount >= 1000000
                          ? `${(item.amount / 1e6).toFixed(1)}M`
                          : item.amount >= 1000
                          ? `${(item.amount / 1e3).toFixed(0)}K`
                          : item.amount
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mb-1.5">
                      <span>{item.requester}</span>
                      <span>&middot;</span>
                      <span className={cn(
                        'font-medium px-1.5 py-0 rounded-full border text-[10px]',
                        APPROVAL_STATUS_COLORS[item.status] || APPROVAL_STATUS_COLORS['pending']
                      )}>
                        {item.status}
                      </span>
                    </div>
                    {item.agentRec && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1 h-1 rounded-full bg-white/90" />
                        </div>
                        <p className="text-[11px] text-[var(--color-accent)] leading-relaxed">{item.agentRec}</p>
                      </div>
                    )}
                    {item.status === 'pending' && (
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <Button variant="primary" size="sm">Approve</Button>
                        <Button variant="ghost" size="sm">Review</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DashboardSection>

            {/* Board Prep */}
            <DashboardSection title="Board Prep" count={boardPrepItems.filter((b) => b.status !== 'complete').length}>
              <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
                {boardPrepItems.map((item, i) => {
                  const statusBadge = BOARD_STATUS_COLORS[item.status] || BOARD_STATUS_COLORS['not-started'];
                  const statusLabel = item.status === 'in-progress' ? 'In Progress' :
                    item.status === 'not-started' ? 'Not Started' :
                    item.status.charAt(0).toUpperCase() + item.status.slice(1);

                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0',
                        'hover:bg-[var(--color-bg-hover)] transition-colors'
                      )}
                    >
                      {item.status === 'complete' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : item.status === 'blocked' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : item.status === 'in-progress' ? (
                        <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[var(--color-border-default)] shrink-0" />
                      )}
                      <span className={cn(
                        'text-[12px] flex-1',
                        item.status === 'complete'
                          ? 'text-[var(--color-text-muted)] line-through'
                          : 'text-[var(--color-text-primary)] font-medium'
                      )}>
                        {item.item}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{item.owner}</span>
                      <span className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0',
                        statusBadge
                      )}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DashboardSection>
          </div>

          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-5 w-[260px] shrink-0">
            {/* Burn Rate Chart */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Burn Rate ($K)</span>
                <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-chart-1)]" />Actual</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />Planned</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-28">
                {burnRateData.map((entry, i) => {
                  const maxVal = 550;
                  const actualH = entry.actual > 0 ? (entry.actual / maxVal) * 100 : 0;
                  const plannedH = (entry.planned / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-0.5 h-20">
                        {entry.actual > 0 && (
                          <div
                            className="w-3 rounded-t-sm bg-[var(--color-chart-1)]"
                            style={{ height: `${actualH}%` }}
                          />
                        )}
                        <div
                          className="w-3 rounded-t-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]"
                          style={{ height: `${plannedH}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-[var(--color-text-muted)]">{entry.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Forecast */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Forecast</span>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">Year-end Projection</span>
                    <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">
                      {summary.yearEndProjection ?? '$4.8M'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">Runway</span>
                    <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">
                      {summary.runway ?? '14 months'}
                    </span>
                  </div>
                </div>
                {(FORECAST_SCENARIOS ?? [
                  { label: 'Conservative', spend: '$4.2M', confidence: 90 },
                  { label: 'Base', spend: '$4.8M', confidence: 70 },
                  { label: 'Aggressive', spend: '$5.4M', confidence: 40 },
                ]).map((scenario, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{scenario.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[var(--color-text-secondary)] tabular-nums">{scenario.spend}</span>
                      <span className={cn(
                        'text-[9px] font-bold tabular-nums',
                        scenario.confidence >= 70 ? 'text-[var(--color-status-healthy)]' :
                        scenario.confidence >= 50 ? 'text-[var(--color-status-warning)]' :
                        'text-[var(--color-text-muted)]'
                      )}>
                        {scenario.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest block mb-3">Quick Actions</span>
              <QuickActions actions={[
                { icon: FileCheck, label: 'Create Approval' },
                { icon: FileSpreadsheet, label: 'Export Report' },
                { icon: CalendarCheck, label: 'Schedule Review' },
              ]} />
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
