'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Briefcase } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Inline Mock Data ────────────────────────────────────────────────────────

const DEALS_ACTIVE = [
  {
    id: 1, company: 'Zenith Labs', value: 185000, stage: 'Negotiation',
    health: 'critical' as const, daysInStage: 14, nextStep: 'Follow up with VP Eng — went silent',
    owner: 'Sarah K.', lastActivity: '14d ago',
  },
  {
    id: 2, company: 'Acme Corp', value: 240000, stage: 'Proposal',
    health: 'healthy' as const, daysInStage: 5, nextStep: 'Send revised pricing by Friday',
    owner: 'Marcus T.', lastActivity: '1d ago',
  },
  {
    id: 3, company: 'TechFlow', value: 320000, stage: 'Discovery',
    health: 'warning' as const, daysInStage: 9, nextStep: 'Schedule technical deep-dive with CTO',
    owner: 'Sarah K.', lastActivity: '3d ago',
  },
  {
    id: 4, company: 'DataNova', value: 92000, stage: 'Prospect',
    health: 'healthy' as const, daysInStage: 2, nextStep: 'Initial qualification call booked',
    owner: 'Jordan L.', lastActivity: '2d ago',
  },
  {
    id: 5, company: 'CloudShift', value: 148000, stage: 'Discovery',
    health: 'healthy' as const, daysInStage: 7, nextStep: 'Share case study with IT director',
    owner: 'Marcus T.', lastActivity: '1d ago',
  },
  {
    id: 6, company: 'Nexus AI', value: 185000, stage: 'Negotiation',
    health: 'warning' as const, daysInStage: 11, nextStep: 'Procurement review pending — push for sign-off',
    owner: 'Jordan L.', lastActivity: '4d ago',
  },
];

const DEALS_CLOSED = [
  { id: 10, company: 'Bright Systems', value: 175000, outcome: 'Won' as const, closeDate: 'Mar 28', reason: 'Strong ROI case' },
  { id: 11, company: 'Pinnacle Inc', value: 95000, outcome: 'Lost' as const, closeDate: 'Mar 22', reason: 'Went with competitor — pricing' },
  { id: 12, company: 'Orion Health', value: 210000, outcome: 'Won' as const, closeDate: 'Mar 15', reason: 'Expanded from pilot' },
  { id: 13, company: 'Volt Energy', value: 130000, outcome: 'Lost' as const, closeDate: 'Mar 10', reason: 'Budget frozen' },
  { id: 14, company: 'Relay Labs', value: 88000, outcome: 'Won' as const, closeDate: 'Mar 5', reason: 'Champion drove internal buy-in' },
];

const FORECAST_STAGES = [
  { stage: 'Negotiation', count: 2, value: 370000, probability: 70, weighted: 259000 },
  { stage: 'Proposal', count: 1, value: 240000, probability: 45, weighted: 108000 },
  { stage: 'Discovery', count: 2, value: 468000, probability: 25, weighted: 117000 },
  { stage: 'Prospect', count: 1, value: 92000, probability: 10, weighted: 9200 },
];

const STAGE_COLORS: Record<string, string> = {
  Prospect: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]',
  Discovery: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]',
  Proposal: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]',
  Negotiation: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]',
};

// ─── Component ───────────────────────────────────────────────────────────────

type DealsTab = 'active' | 'wonlost' | 'forecast';

export function DealsPage() {
  const [activeTab, setActiveTab] = useState<DealsTab>('active');

  const tabs = [
    { id: 'active' as const, label: 'Active' },
    { id: 'wonlost' as const, label: 'Won/Lost' },
    { id: 'forecast' as const, label: 'Forecast' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Briefcase} title="Deals" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'active' && <ActiveTab />}
        {activeTab === 'wonlost' && <WonLostTab />}
        {activeTab === 'forecast' && <ForecastTab />}
      </div>
    </div>
  );
}

// ─── Active Tab ──────────────────────────────────────────────────────────────

function ActiveTab() {
  const [stageFilter, setStageFilter] = useState('All');
  const stages = ['All', 'Prospect', 'Discovery', 'Proposal', 'Negotiation'];

  const filtered = stageFilter === 'All'
    ? DEALS_ACTIVE
    : DEALS_ACTIVE.filter(d => d.stage === stageFilter);

  const totalPipeline = DEALS_ACTIVE.reduce((sum, d) => sum + d.value, 0);
  const avgDeal = Math.round(totalPipeline / DEALS_ACTIVE.length);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Pipeline Value" value={`$${(totalPipeline / 1e6).toFixed(2)}M`} sub={`${DEALS_ACTIVE.length} active deals`} />
        <MetricCard label="Avg Deal Size" value={`$${(avgDeal / 1e3).toFixed(0)}K`} sub="across pipeline" />
        <MetricCard label="Win Rate" value="32%" sub="last 90 days" />
        <MetricCard label="Avg Cycle" value="45d" sub="prospect to close" />
      </div>

      {/* Stage filter pills */}
      <div className="flex items-center gap-1.5">
        {stages.map(stage => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
              stageFilter === stage
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Deal cards */}
      <div className="space-y-2">
        {filtered.map(deal => (
          <div
            key={deal.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all cursor-pointer"
          >
            <StatusDot status={deal.health} pulse={deal.health === 'critical'} size="md" className="mt-2" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{deal.company}</span>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', STAGE_COLORS[deal.stage])}>
                    {deal.stage}
                  </span>
                </div>
                <span className="text-[16px] font-bold text-[var(--color-text-primary)] tabular-nums shrink-0 ml-3">
                  ${(deal.value / 1e3).toFixed(0)}K
                </span>
              </div>
              <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-1">{deal.nextStep}</p>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <span>{deal.owner}</span>
                <span>·</span>
                <span>{deal.daysInStage}d in stage</span>
                <span>·</span>
                <span>{deal.lastActivity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <OrbitInsight>
        Zenith Labs has gone silent for 14 days. Their VP Engineering posted about scaling challenges on LinkedIn &mdash; recommend a new angle.
      </OrbitInsight>
    </div>
  );
}

// ─── Won/Lost Tab ────────────────────────────────────────────────────────────

function WonLostTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Company</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Value</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-center">Outcome</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Close Date</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Reason</span>
        </div>

        {DEALS_CLOSED.map((deal, i) => (
          <div
            key={deal.id}
            className={cn(
              'grid grid-cols-5 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors',
              i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
            )}
          >
            <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{deal.company}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">${(deal.value / 1e3).toFixed(0)}K</span>
            <div className="flex justify-center">
              <span className={cn(
                'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                deal.outcome === 'Won'
                  ? 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]'
                  : 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]'
              )}>
                {deal.outcome}
              </span>
            </div>
            <span className="text-[12px] text-[var(--color-text-muted)] text-right">{deal.closeDate}</span>
            <span className="text-[12px] text-[var(--color-text-tertiary)]">{deal.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Forecast Tab ────────────────────────────────────────────────────────────

function ForecastTab() {
  const quotaTarget = 750000;
  const totalWeighted = FORECAST_STAGES.reduce((sum, s) => sum + s.weighted, 0);
  const attainmentPct = Math.round((totalWeighted / quotaTarget) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Quota attainment */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Quota Attainment</span>
          <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">
            ${(totalWeighted / 1e3).toFixed(0)}K / ${(quotaTarget / 1e3).toFixed(0)}K
          </span>
        </div>
        <div className="h-3 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              attainmentPct >= 90 ? 'bg-[var(--color-status-healthy)]' : attainmentPct >= 70 ? 'bg-[var(--color-status-warning)]' : 'bg-[var(--color-status-critical)]'
            )}
            style={{ width: `${Math.min(attainmentPct, 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1 tabular-nums">{attainmentPct}% of quota (weighted pipeline)</p>
      </div>

      {/* Weighted pipeline by stage */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Weighted Pipeline by Stage</span>
        </div>
        {FORECAST_STAGES.map((s, i) => (
          <div
            key={s.stage}
            className={cn(
              'grid grid-cols-5 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0',
              i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
            )}
          >
            <div className="flex items-center gap-1.5">
              <StatusDot status={s.probability >= 60 ? 'healthy' : s.probability >= 30 ? 'warning' : 'info'} size="sm" />
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{s.stage}</span>
            </div>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">{s.count} deals</span>
            <span className="text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">${(s.value / 1e3).toFixed(0)}K</span>
            <span className="text-[12px] text-[var(--color-text-muted)] text-right tabular-nums">{s.probability}%</span>
            <span className="text-[12px] font-semibold text-[var(--color-text-primary)] text-right tabular-nums">${(s.weighted / 1e3).toFixed(0)}K</span>
          </div>
        ))}
        <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-[var(--color-bg-tertiary)]">
          <span className="text-[12px] font-bold text-[var(--color-text-primary)]">Total</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">{FORECAST_STAGES.reduce((a, s) => a + s.count, 0)} deals</span>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(FORECAST_STAGES.reduce((a, s) => a + s.value, 0) / 1e3).toFixed(0)}K</span>
          <span />
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] text-right tabular-nums">${(totalWeighted / 1e3).toFixed(0)}K</span>
        </div>
      </div>

      <OrbitInsight>
        At current win rates, you&apos;ll close ~$630K by quarter end &mdash; 84% of quota. Moving Acme to Negotiation would add $200K weighted.
      </OrbitInsight>
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function MetricCard({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3">
      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{label}</p>
      <p className={cn('text-[22px] font-bold tabular-nums leading-tight', warn ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-text-primary)]')}>{value}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
    </div>
  );
}
