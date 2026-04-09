'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LineChart } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Types ──────────────────────────────────────────────────────────────────

type ForecastTab = 'revenue' | 'expenses' | 'scenarios' | 'board-prep';
type DeckStatus = 'Complete' | 'In Progress' | 'Not Started';
type RiskLevel = 'low' | 'medium' | 'high';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const PIPELINE_DEALS = [
  { name: 'Acme Corp — Enterprise upsell', expectedClose: 'Apr 2026', weightedValue: 200000, probability: 80 },
  { name: 'TechFlow — New logo', expectedClose: 'Apr 2026', weightedValue: 85000, probability: 65 },
  { name: 'GlobalHealth — Platform deal', expectedClose: 'May 2026', weightedValue: 320000, probability: 45 },
  { name: 'Meridian Systems — Expansion', expectedClose: 'May 2026', weightedValue: 110000, probability: 70 },
  { name: 'DataPrime — Renewal + upsell', expectedClose: 'Jun 2026', weightedValue: 95000, probability: 90 },
  { name: 'CloudNova — New logo', expectedClose: 'Jun 2026', weightedValue: 150000, probability: 35 },
];

const EXPENSE_CATEGORIES = [
  { category: 'Engineering', monthly: 280000, trend: 'up', yearEnd: 3420000 },
  { category: 'Cloud & Infra', monthly: 120000, trend: 'up', yearEnd: 1480000 },
  { category: 'Sales & Marketing', monthly: 95000, trend: 'flat', yearEnd: 1140000 },
  { category: 'G&A', monthly: 65000, trend: 'flat', yearEnd: 780000 },
  { category: 'Contractors', monthly: 50000, trend: 'down', yearEnd: 560000 },
];

const MONTHLY_EXPENSES = [
  { month: 'Jan', actual: 590 },
  { month: 'Feb', actual: 605 },
  { month: 'Mar', actual: 620 },
  { month: 'Apr', actual: 610 },
  { month: 'May', projected: 615 },
  { month: 'Jun', projected: 625 },
];

const SCENARIOS = [
  {
    label: 'Conservative',
    description: 'Freeze hiring. Reduce contractor spend 20%. Optimize cloud costs. Revenue at 90% of target.',
    runwayMonths: 22,
    yearEndCash: 2800000,
    risk: 'low' as RiskLevel,
  },
  {
    label: 'Base Case',
    description: '4 strategic hires. Current contractor levels. Revenue at target. Cloud optimization saves $60K.',
    runwayMonths: 18,
    yearEndCash: 2100000,
    risk: 'medium' as RiskLevel,
  },
  {
    label: 'Aggressive',
    description: '7 hires. New market push adds $200K marketing. Revenue 110% of target with Enterprise wins.',
    runwayMonths: 14,
    yearEndCash: 1200000,
    risk: 'high' as RiskLevel,
  },
];

const BOARD_DECK_SECTIONS = [
  { section: 'Financial Summary', status: 'Complete' as DeckStatus, owner: 'David Park', dueDate: 'Apr 14', agentNote: 'Financial summary is complete. All metrics updated through Q1.' },
  { section: 'Revenue Deep Dive', status: 'Complete' as DeckStatus, owner: 'Sarah Kim', dueDate: 'Apr 14', agentNote: null },
  { section: 'Headcount Plan', status: 'In Progress' as DeckStatus, owner: 'You', dueDate: 'Apr 12', agentNote: 'Headcount section needs your scenario selection by today.' },
  { section: 'Product Roadmap', status: 'In Progress' as DeckStatus, owner: 'Lisa Chen', dueDate: 'Apr 13', agentNote: null },
  { section: 'Engineering Velocity', status: 'Complete' as DeckStatus, owner: 'You', dueDate: 'Apr 14', agentNote: null },
  { section: 'Risk Assessment', status: 'Not Started' as DeckStatus, owner: 'David Park', dueDate: 'Apr 15', agentNote: 'Dependencies: financial summary + headcount plan finalized.' },
  { section: 'Go-to-Market Update', status: 'In Progress' as DeckStatus, owner: 'Sarah Kim', dueDate: 'Apr 13', agentNote: null },
  { section: 'Appendix — Metrics', status: 'Not Started' as DeckStatus, owner: 'You', dueDate: 'Apr 16', agentNote: null },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const DECK_STATUS_BADGE: Record<DeckStatus, string> = {
  'Complete': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'In Progress': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Not Started': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
};

const DECK_STATUS_DOT: Record<DeckStatus, 'healthy' | 'info' | 'neutral'> = {
  'Complete': 'healthy',
  'In Progress': 'info',
  'Not Started': 'neutral',
};

const RISK_STATUS: Record<RiskLevel, 'healthy' | 'warning' | 'critical'> = {
  low: 'healthy',
  medium: 'warning',
  high: 'critical',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function ForecastingPage() {
  const [activeTab, setActiveTab] = useState<ForecastTab>('revenue');

  const tabs = [
    { id: 'revenue' as const, label: 'Revenue' },
    { id: 'expenses' as const, label: 'Expenses' },
    { id: 'scenarios' as const, label: 'Scenarios' },
    { id: 'board-prep' as const, label: 'Board Prep' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={LineChart} title="Forecasting" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'revenue' && <RevenueTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
        {activeTab === 'scenarios' && <ScenariosTab />}
        {activeTab === 'board-prep' && <BoardPrepTab />}
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

// ─── Revenue Tab ────────────────────────────────────────────────────────────

function RevenueTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Revenue metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Current ARR" value="$4.2M" sub="annual recurring revenue" />
        <MetricCard label="Quarterly Growth" value="12%" sub="Q1 2026" />
        <MetricCard label="Net Revenue Retention" value="108%" sub="trailing 12 months" />
      </div>

      {/* Pipeline deals */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Pipeline-to-Revenue</span>
        <div className="mt-3 space-y-2">
          {PIPELINE_DEALS.map((deal, i) => {
            const barWidth = (deal.probability / 100) * 100;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--color-text-secondary)] w-48 truncate shrink-0">{deal.name}</span>
                <div className="flex-1 h-6 bg-[var(--color-bg-elevated)] rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg bg-[var(--color-chart-1)]/60 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-[var(--color-text-primary)]">
                    ${(deal.weightedValue / 1e3).toFixed(0)}K &middot; {deal.probability}%
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] w-16 shrink-0 text-right">{deal.expectedClose}</span>
              </div>
            );
          })}
        </div>
      </div>

      <OrbitInsight>
        Based on current pipeline, Q2 revenue is projected at $1.15M — 96% of target. Closing the Acme upsell adds $200K.
      </OrbitInsight>
    </div>
  );
}

// ─── Expenses Tab ───────────────────────────────────────────────────────────

function ExpensesTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Expense breakdown */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Category</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Monthly</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-center">Trend</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Year-End Proj.</span>
        </div>

        {EXPENSE_CATEGORIES.map((cat, i) => (
          <div
            key={cat.category}
            className={cn(
              'grid grid-cols-4 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors',
              i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
            )}
          >
            <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{cat.category}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">${(cat.monthly / 1e3).toFixed(0)}K</span>
            <div className="flex justify-center">
              <span className={cn(
                'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                cat.trend === 'up' && 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]',
                cat.trend === 'flat' && 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
                cat.trend === 'down' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
              )}>
                {cat.trend === 'up' ? 'Trending Up' : cat.trend === 'down' ? 'Trending Down' : 'Flat'}
              </span>
            </div>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">${(cat.yearEnd / 1e6).toFixed(2)}M</span>
          </div>
        ))}

        {/* Total */}
        <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-[var(--color-bg-tertiary)]">
          <span className="text-[12px] font-bold text-[var(--color-text-primary)]">Total</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(EXPENSE_CATEGORIES.reduce((s, c) => s + c.monthly, 0) / 1e3).toFixed(0)}K</span>
          <div />
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(EXPENSE_CATEGORIES.reduce((s, c) => s + c.yearEnd, 0) / 1e6).toFixed(2)}M</span>
        </div>
      </div>

      {/* Monthly trend chart */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Monthly Expense Trend ($K)</span>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-chart-1)]" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-dashed border-[var(--color-text-muted)]" />Projected</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-32">
          {MONTHLY_EXPENSES.map((entry, i) => {
            const maxVal = 650;
            const val = entry.actual || entry.projected || 0;
            const h = (val / maxVal) * 100;
            const isProjected = !entry.actual;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className={cn(
                      'w-4 rounded-t-sm transition-all',
                      isProjected
                        ? 'bg-[var(--color-bg-elevated)] border border-dashed border-[var(--color-text-muted)]'
                        : 'bg-[var(--color-chart-1)]'
                    )}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="text-[9px] text-[var(--color-text-muted)]">{entry.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3">
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Year-end projection: <span className="font-bold text-[var(--color-text-primary)] tabular-nums">$3.72M</span>
          <span className="text-[var(--color-status-warning)] ml-1">(3.3% over budget)</span> if base hiring proceeds.
        </p>
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
        <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Financial Scenarios</h2>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">Runway projection per scenario</p>
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
                  <span className="text-[12px] font-medium text-[var(--color-text-secondary)] tabular-nums">{scenario.runwayMonths} mo runway</span>
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
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 ml-8">Year-end cash: ${(scenario.yearEndCash / 1e6).toFixed(1)}M</p>
            </button>
          );
        })}
      </div>

      {/* Runway comparison bar */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-3 block">Runway Comparison (months)</span>
        <div className="space-y-2">
          {SCENARIOS.map((s, i) => {
            const maxRunway = 24;
            const pct = (s.runwayMonths / maxRunway) * 100;
            const riskStatus = RISK_STATUS[s.risk];
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--color-text-secondary)] w-28 shrink-0">{s.label}</span>
                <div className="flex-1 h-5 bg-[var(--color-bg-elevated)] rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-lg transition-all',
                      riskStatus === 'healthy' ? 'bg-emerald-500/50' : riskStatus === 'warning' ? 'bg-[var(--color-chart-1)]' : 'bg-red-500/50'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[12px] font-bold text-[var(--color-text-primary)] tabular-nums w-12 text-right">{s.runwayMonths} mo</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Board Prep Tab ─────────────────────────────────────────────────────────

function BoardPrepTab() {
  const completed = BOARD_DECK_SECTIONS.filter(s => s.status === 'Complete').length;
  const total = BOARD_DECK_SECTIONS.length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Q1 Board Deck Preparation</h2>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">Board meeting: April 18, 2026</p>
        </div>
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] tabular-nums">{completed}/{total} sections complete</span>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Overall Progress</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] tabular-nums">{Math.round((completed / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </div>

      {/* Section checklist */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest col-span-2">Section</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Status</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Owner</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Due</span>
        </div>

        {BOARD_DECK_SECTIONS.map((section, i) => (
          <div key={i}>
            <div
              className={cn(
                'grid grid-cols-5 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)] transition-colors',
                i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
              )}
            >
              <div className="flex items-center gap-2 col-span-2">
                <StatusDot status={DECK_STATUS_DOT[section.status]} size="sm" />
                <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{section.section}</span>
              </div>
              <div>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', DECK_STATUS_BADGE[section.status])}>{section.status}</span>
              </div>
              <span className={cn(
                'text-[12px]',
                section.owner === 'You' ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-secondary)]'
              )}>{section.owner}</span>
              <span className="text-[12px] text-[var(--color-text-muted)] text-right tabular-nums">{section.dueDate}</span>
            </div>
            {section.agentNote && (
              <div className="px-4 py-2 bg-[var(--color-accent-subtle)]/50 border-b border-[var(--color-border-subtle)]">
                <span className="text-[11px] text-[var(--color-accent)] ml-5">{section.agentNote}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <OrbitInsight>
        Based on Q1 miss (67% vs 80% target), the board will focus on cost efficiency. I&apos;ve prepared talking points emphasizing the 20% operational overhead reduction OKR progress (currently at 48%).
      </OrbitInsight>
    </div>
  );
}
