'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import {
  DollarSign, AlertTriangle, CheckCircle2,
  Clock, Zap
} from 'lucide-react';
import {
  BUDGET_ITEMS, BURN_RATE, HEADCOUNT_SCENARIOS, FINANCE_ALERTS,
  APPROVAL_ITEMS, FINANCE_SUMMARY
} from '@/lib/finance-data';
import { PageHeader } from '../ui/page-header';
import { FlatTabs } from '../ui/tabs';
import { StatusDot } from '../ui/status-dot';
import { OrbitInsight } from '../ui/orbit-insight';
import { Button } from '../ui/button';

type FinanceTab = 'overview' | 'budget' | 'headcount' | 'approvals';

export function FinancePage() {
  const { setActivePanel } = useOrbit();
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'budget' as const, label: 'Budget' },
    { id: 'headcount' as const, label: 'Headcount' },
    { id: 'approvals' as const, label: 'Approvals' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={DollarSign} title="Finance" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'headcount' && <HeadcountTab />}
        {activeTab === 'approvals' && <ApprovalsTab />}
      </div>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab() {
  const s = FINANCE_SUMMARY;
  const spentPercent = Math.round((s.totalSpent / s.totalBudget) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Alerts */}
      {FINANCE_ALERTS.filter(a => a.urgency === 'critical' || a.urgency === 'warning').length > 0 && (
        <div className="space-y-2">
          {FINANCE_ALERTS.filter(a => a.urgency === 'critical' || a.urgency === 'warning').map(alert => (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 px-4 py-3 rounded-xl border',
                alert.urgency === 'critical'
                  ? 'bg-[var(--color-status-critical-bg)] border-[var(--color-status-critical-border)]'
                  : 'bg-[var(--color-status-warning-bg)] border-[var(--color-status-warning-border)]'
              )}
            >
              <StatusDot
                status={alert.urgency === 'critical' ? 'critical' : 'warning'}
                pulse
                size="md"
                className="mt-1.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{alert.title}</p>
                  <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{alert.time}</span>
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Budget" value={`$${(s.totalBudget / 1e6).toFixed(1)}M`} sub={`${spentPercent}% spent`} />
        <MetricCard label="Monthly Burn" value={`$${s.burnRate / 1e3}K`} sub="trending up" warn />
        <MetricCard label="Team Size" value={String(s.teamSize)} sub={`${s.openReqs} open reqs`} />
        <MetricCard label="Runway" value={s.runway} sub="at current burn" />
      </div>

      {/* Burn rate chart (simplified) */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Monthly Burn Rate ($K)</span>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-chart-1)]" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />Planned</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-32">
          {BURN_RATE.map((entry, i) => {
            const maxVal = 650;
            const actualH = entry.actual ? (entry.actual / maxVal) * 100 : 0;
            const plannedH = (entry.planned / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-0.5 h-24">
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

      {/* Budget overview bars */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Budget by Category</span>
        <div className="mt-3 space-y-3">
          {BUDGET_ITEMS.slice(0, 4).map((item, i) => {
            const pct = Math.round((item.spent / item.allocated) * 100);
            const statusColor = item.status === 'over' || item.status === 'at-risk'
              ? 'bg-[var(--color-status-critical)]/60' : item.status === 'under' ? 'bg-[var(--color-status-healthy)]/60' : 'bg-[var(--color-chart-1)]';
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={item.status === 'over' || item.status === 'at-risk' ? 'critical' : item.status === 'under' ? 'healthy' : 'info'} size="sm" />
                    <span className="text-[12px] text-[var(--color-text-secondary)]">{item.category}</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-muted)]">${(item.spent / 1e3).toFixed(0)}K / ${(item.allocated / 1e3).toFixed(0)}K</span>
                </div>
                <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', statusColor)} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Budget Tab ───
function BudgetTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Category</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Allocated</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Spent</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Forecast</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Status</span>
        </div>

        {/* Table rows */}
        {BUDGET_ITEMS.map((item, i) => {
          const statusBadge = {
            'on-track': { color: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]', label: 'On Track' },
            'over': { color: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]', label: 'Over' },
            'under': { color: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]', label: 'Under' },
            'at-risk': { color: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]', label: 'At Risk' },
          }[item.status];

          return (
            <div
              key={i}
              className={cn(
                'grid grid-cols-5 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors',
                i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
              )}
            >
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{item.category}</span>
              <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">${(item.allocated / 1e3).toFixed(0)}K</span>
              <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">${(item.spent / 1e3).toFixed(0)}K</span>
              <span className={cn(
                'text-[12px] text-right tabular-nums',
                item.forecast > item.allocated ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-secondary)]'
              )}>${(item.forecast / 1e3).toFixed(0)}K</span>
              <div className="flex justify-end">
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', statusBadge.color)}>{statusBadge.label}</span>
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-[var(--color-bg-tertiary)]">
          <span className="text-[12px] font-bold text-[var(--color-text-primary)]">Total</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(FINANCE_SUMMARY.totalBudget / 1e6).toFixed(1)}M</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(FINANCE_SUMMARY.totalSpent / 1e6).toFixed(2)}M</span>
          <span className={cn(
            'text-[12px] font-bold text-right tabular-nums',
            FINANCE_SUMMARY.totalForecast > FINANCE_SUMMARY.totalBudget ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-primary)]'
          )}>${(FINANCE_SUMMARY.totalForecast / 1e6).toFixed(2)}M</span>
          <div />
        </div>
      </div>

      <OrbitInsight>
        Cloud Infrastructure is tracking 8% over budget ($40K) due to auth migration load tests. Recruiting spend will exceed allocation if base-case hiring proceeds. Recommend flagging both to David in today&apos;s headcount submission.
      </OrbitInsight>
    </div>
  );
}

// ─── Headcount Tab ───
function HeadcountTab() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Q2 Headcount Scenarios</h2>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">Due to David Park (CFO) by 5pm today</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] text-[11px] font-semibold border border-[var(--color-status-critical-border)]">Due Today</span>
      </div>

      {/* Current state */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Current Team" value="24" sub="engineers" />
        <MetricCard label="Capacity" value="73%" sub="across 3 projects" warn />
        <MetricCard label="Likely Departures" value="2" sub="senior engineers" warn />
      </div>

      {/* Scenarios */}
      <div className="space-y-3">
        {HEADCOUNT_SCENARIOS.map((scenario, i) => {
          const riskStatus = scenario.risk === 'low' ? 'healthy' : scenario.risk === 'medium' ? 'warning' : 'critical';
          return (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={cn(
                'w-full text-left px-4 py-4 rounded-xl border transition-all duration-150',
                selected === i
                  ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/25'
                  : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold',
                    selected === i ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                  )}>{i + 1}</span>
                  <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{scenario.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">+{scenario.hires} hires</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `var(--color-status-${riskStatus}-bg)`,
                      color: `var(--color-status-${riskStatus})`,
                      borderWidth: '1px',
                      borderColor: `var(--color-status-${riskStatus}-border)`,
                    }}
                  >
                    <StatusDot status={riskStatus} size="sm" />
                    {scenario.risk} risk
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed ml-8">{scenario.description}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 ml-8">Annual cost: ${(scenario.cost / 1e3).toFixed(0)}K</p>
            </button>
          );
        })}
      </div>

      <OrbitInsight label="Orbit Recommendation">
        Based on the 2 likely departures, Agent Builder v2 timeline, and David&apos;s 15% headcount cap, the <strong>Base Case (4 hires, $720K)</strong> has the strongest ROI narrative. Submit all 3 scenarios but lead with this one.
      </OrbitInsight>
    </div>
  );
}

// ─── Approvals Tab ───
function ApprovalsTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Pending Approvals</h2>
        <span className="px-2.5 py-1 rounded-full bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] text-[11px] font-semibold border border-[var(--color-status-warning-border)]">
          {APPROVAL_ITEMS.filter(a => a.status === 'pending').length} pending
        </span>
      </div>

      <div className="space-y-2">
        {APPROVAL_ITEMS.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all',
              item.status === 'pending'
                ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] cursor-pointer'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] opacity-60'
            )}
          >
            <div className="mt-1.5">
              <StatusDot status={item.status === 'approved' ? 'healthy' : 'warning'} size="md" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{item.description}</span>
                <span className="text-[14px] font-bold text-[var(--color-text-primary)] tabular-nums shrink-0 ml-3">${(item.amount / 1e3).toFixed(item.amount >= 10000 ? 0 : 1)}K</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <span>{item.requester}</span>
                <span>·</span>
                <span>{item.type}</span>
                <span>·</span>
                <span>{item.submitted}</span>
              </div>
            </div>
            {item.status === 'pending' && (
              <div className="flex items-center gap-1.5 shrink-0 mt-1">
                <Button variant="primary" size="sm">Approve</Button>
                <Button variant="ghost" size="sm">Review</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Components ───
function MetricCard({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3">
      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{label}</p>
      <p className={cn('text-[22px] font-bold tabular-nums leading-tight', warn ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-text-primary)]')}>{value}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
    </div>
  );
}
