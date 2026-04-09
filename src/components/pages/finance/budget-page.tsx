'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Types ──────────────────────────────────────────────────────────────────

type BudgetTab = 'overview' | 'by-category' | 'scenarios' | 'history';
type BudgetStatus = 'on-track' | 'over' | 'under' | 'at-risk';
type RiskLevel = 'low' | 'medium' | 'high';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const BURN_RATE = [
  { month: 'Nov', actual: 580, planned: 570 },
  { month: 'Dec', actual: 595, planned: 580 },
  { month: 'Jan', actual: 590, planned: 590 },
  { month: 'Feb', actual: 605, planned: 595 },
  { month: 'Mar', actual: 620, planned: 600 },
  { month: 'Apr', actual: 610, planned: 600 },
];

const BUDGET_CATEGORIES = [
  { category: 'Engineering Salaries', allocated: 1800000, spent: 1350000, forecast: 1810000, status: 'on-track' as BudgetStatus },
  { category: 'Cloud Infrastructure', allocated: 480000, spent: 400000, forecast: 520000, status: 'over' as BudgetStatus },
  { category: 'Software Licenses', allocated: 240000, spent: 165000, forecast: 235000, status: 'on-track' as BudgetStatus },
  { category: 'Recruiting', allocated: 360000, spent: 280000, forecast: 390000, status: 'at-risk' as BudgetStatus },
  { category: 'Contractors', allocated: 420000, spent: 290000, forecast: 400000, status: 'on-track' as BudgetStatus },
  { category: 'Travel & Events', allocated: 120000, spent: 72000, forecast: 105000, status: 'under' as BudgetStatus },
  { category: 'Training & Development', allocated: 96000, spent: 55000, forecast: 88000, status: 'on-track' as BudgetStatus },
  { category: 'Office & Equipment', allocated: 84000, spent: 48000, forecast: 80000, status: 'on-track' as BudgetStatus },
];

const SCENARIOS = [
  {
    label: 'Conservative',
    description: 'Backfill departures only. No new roles until Q3. Focus on operational efficiency and reducing cloud costs.',
    hires: 2,
    totalCost: 3520000,
    runwayImpact: '20 months',
    risk: 'low' as RiskLevel,
  },
  {
    label: 'Base Case',
    description: '4 strategic hires: 2 senior engineers, 1 DevOps, 1 PM. Balances growth targets with fiscal responsibility.',
    hires: 4,
    totalCost: 3720000,
    runwayImpact: '18 months',
    risk: 'medium' as RiskLevel,
  },
  {
    label: 'Aggressive',
    description: '7 hires across engineering and product. Accelerates Agent Builder v2 and Enterprise SSO timelines by 6 weeks.',
    hires: 7,
    totalCost: 4100000,
    runwayImpact: '14 months',
    risk: 'high' as RiskLevel,
  },
];

const MONTHLY_HISTORY = [
  { month: 'Oct 2025', spend: 565000, yoyChange: '+8%' },
  { month: 'Nov 2025', spend: 580000, yoyChange: '+10%' },
  { month: 'Dec 2025', spend: 595000, yoyChange: '+12%' },
  { month: 'Jan 2026', spend: 590000, yoyChange: '+9%' },
  { month: 'Feb 2026', spend: 605000, yoyChange: '+11%' },
  { month: 'Mar 2026', spend: 620000, yoyChange: '+14%' },
  { month: 'Apr 2026', spend: 610000, yoyChange: '+12%' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_BADGES: Record<BudgetStatus, { color: string; label: string }> = {
  'on-track': { color: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]', label: 'On Track' },
  'over': { color: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]', label: 'Over' },
  'under': { color: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]', label: 'Under' },
  'at-risk': { color: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]', label: 'At Risk' },
};

const RISK_STATUS: Record<RiskLevel, 'healthy' | 'warning' | 'critical'> = {
  low: 'healthy',
  medium: 'warning',
  high: 'critical',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function BudgetPage() {
  const [activeTab, setActiveTab] = useState<BudgetTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'by-category' as const, label: 'By Category' },
    { id: 'scenarios' as const, label: 'Scenarios' },
    { id: 'history' as const, label: 'History' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={DollarSign} title="Budget" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'by-category' && <ByCategoryTab />}
        {activeTab === 'scenarios' && <ScenariosTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}

// ─── Shared MetricCard ──────────────────────────────────────────────────────

function MetricCard({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3">
      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{label}</p>
      <p className={cn('text-[22px] font-bold tabular-nums leading-tight', warn ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-text-primary)]')}>{value}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Budget" value="$3.6M" sub="fiscal year 2026" />
        <MetricCard label="Monthly Burn" value="$610K" sub="trending up" warn />
        <MetricCard label="Team Size" value="24" sub="engineers" />
        <MetricCard label="Runway" value="18 mo" sub="at current burn" />
      </div>

      {/* Monthly burn chart */}
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
            const actualH = (entry.actual / maxVal) * 100;
            const plannedH = (entry.planned / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-0.5 h-24">
                  <div
                    className="w-3 rounded-t-sm bg-[var(--color-chart-1)]"
                    style={{ height: `${actualH}%` }}
                  />
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

      {/* Budget category bars */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Budget by Category</span>
        <div className="mt-3 space-y-3">
          {BUDGET_CATEGORIES.slice(0, 5).map((item, i) => {
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
                  <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums">${(item.spent / 1e3).toFixed(0)}K / ${(item.allocated / 1e3).toFixed(0)}K</span>
                </div>
                <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', statusColor)} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <OrbitInsight>
        Cloud Infrastructure is 8% over budget ($40K) due to auth migration load testing. Costs should normalize after migration completes in 2 weeks.
      </OrbitInsight>
    </div>
  );
}

// ─── By Category Tab ────────────────────────────────────────────────────────

function ByCategoryTab() {
  // Sort by variance (most over-budget first)
  const sorted = [...BUDGET_CATEGORIES].sort((a, b) => {
    const varianceA = a.forecast - a.allocated;
    const varianceB = b.forecast - b.allocated;
    return varianceB - varianceA;
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Category</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Allocated</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Spent</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Forecast</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Variance</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Status</span>
        </div>

        {/* Table rows */}
        {sorted.map((item, i) => {
          const variance = item.forecast - item.allocated;
          const badge = STATUS_BADGES[item.status];
          return (
            <div
              key={i}
              className={cn(
                'grid grid-cols-6 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors',
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
              <span className={cn(
                'text-[12px] text-right tabular-nums font-medium',
                variance > 0 ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-status-healthy)]'
              )}>
                {variance > 0 ? '+' : ''}{variance !== 0 ? `$${(variance / 1e3).toFixed(0)}K` : '$0'}
              </span>
              <div className="flex justify-end">
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', badge.color)}>{badge.label}</span>
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-[var(--color-bg-tertiary)]">
          <span className="text-[12px] font-bold text-[var(--color-text-primary)]">Total</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(BUDGET_CATEGORIES.reduce((s, c) => s + c.allocated, 0) / 1e6).toFixed(1)}M</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(BUDGET_CATEGORIES.reduce((s, c) => s + c.spent, 0) / 1e6).toFixed(2)}M</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(BUDGET_CATEGORIES.reduce((s, c) => s + c.forecast, 0) / 1e6).toFixed(2)}M</span>
          <span className="text-[12px] font-bold text-[var(--color-status-critical)] text-right tabular-nums">+${((BUDGET_CATEGORIES.reduce((s, c) => s + c.forecast, 0) - BUDGET_CATEGORIES.reduce((s, c) => s + c.allocated, 0)) / 1e3).toFixed(0)}K</span>
          <div />
        </div>
      </div>
    </div>
  );
}

// ─── Scenarios Tab ──────────────────────────────────────────────────────────

function ScenariosTab() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Budget Scenarios</h2>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">Compare hiring plans against budget and runway impact</p>
      </div>

      <div className="space-y-3">
        {SCENARIOS.map((scenario, i) => {
          const riskStatus = RISK_STATUS[scenario.risk];
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
                  <span className="text-[12px] font-medium text-[var(--color-text-secondary)] tabular-nums">${(scenario.totalCost / 1e6).toFixed(1)}M</span>
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
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 ml-8">Runway: {scenario.runwayImpact}</p>
            </button>
          );
        })}
      </div>

      <OrbitInsight label="Orbit Recommendation">
        Base Case (4 hires, $720K) balances growth and runway. Aggressive hiring drops runway to 14 months — requires board approval.
      </OrbitInsight>
    </div>
  );
}

// ─── History Tab ────────────────────────────────────────────────────────────

function HistoryTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Monthly Spend History</h2>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">Year-over-year comparison included</p>
      </div>

      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-3 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Month</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Spend</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">YoY Change</span>
        </div>

        {MONTHLY_HISTORY.map((entry, i) => (
          <div
            key={entry.month}
            className={cn(
              'grid grid-cols-3 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors',
              i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
            )}
          >
            <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{entry.month}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">${(entry.spend / 1e3).toFixed(0)}K</span>
            <span className={cn(
              'text-[12px] text-right tabular-nums font-medium',
              entry.yoyChange.startsWith('+') ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-status-healthy)]'
            )}>{entry.yoyChange}</span>
          </div>
        ))}

        {/* Total row */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-[var(--color-bg-tertiary)]">
          <span className="text-[12px] font-bold text-[var(--color-text-primary)]">Total (7 mo)</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(MONTHLY_HISTORY.reduce((s, e) => s + e.spend, 0) / 1e6).toFixed(2)}M</span>
          <span className="text-[12px] font-bold text-[var(--color-status-warning)] text-right tabular-nums">+11% avg</span>
        </div>
      </div>
    </div>
  );
}
