'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Users, AlertTriangle,
  ChevronRight, Clock, ArrowRight, Shield, ExternalLink
} from 'lucide-react';
import {
  DEALS, PIPELINE_STAGES, SALES_METRICS, COMPETITOR_THREATS,
  PIPELINE_SUMMARY, type Deal
} from '@/lib/pipeline-data';
import { PageHeader } from '../ui/page-header';
import { FlatTabs } from '../ui/tabs';
import { StatusDot } from '../ui/status-dot';
import { OrbitInsight } from '../ui/orbit-insight';

type PipelineTab = 'overview' | 'deals' | 'threats';

const STAGE_COLORS: Record<string, string> = {
  prospect: 'bg-gray-500/60',
  discovery: 'bg-[var(--color-chart-2)]/60',
  proposal: 'bg-[var(--color-chart-4)]/60',
  negotiation: 'bg-[var(--color-status-warning)]/60',
  'closed-won': 'bg-[var(--color-status-healthy)]/60',
  'closed-lost': 'bg-[var(--color-status-critical)]/60',
};

const STAGE_BADGE_COLORS: Record<string, string> = {
  prospect: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  discovery: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]',
  proposal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  negotiation: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]',
  'closed-won': 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]',
  'closed-lost': 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]',
};

const HEALTH_COLORS: Record<string, string> = {
  healthy: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]',
  'at-risk': 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]',
  stalled: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]',
};

export function PipelinePage() {
  const [activeTab, setActiveTab] = useState<PipelineTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'deals' as const, label: 'Deals' },
    { id: 'threats' as const, label: 'Competitive Intel' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={TrendingUp} title="Pipeline" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'deals' && <DealsTab />}
        {activeTab === 'threats' && <ThreatsTab />}
      </div>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab() {
  const s = PIPELINE_SUMMARY;
  const quotaPct = Math.round(s.quotaAttainment * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SALES_METRICS.map((metric, i) => {
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
          const trendColor = (metric.label === 'Avg Sales Cycle' ? metric.change < 0 : metric.change > 0)
            ? 'text-[var(--color-status-healthy)]' : 'text-[var(--color-status-critical)]';
          return (
            <div key={i} className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3">
              <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{metric.label}</p>
              <p className="text-[22px] font-bold text-[var(--color-text-primary)] tabular-nums leading-tight">{metric.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendIcon className={cn('w-3 h-3', trendColor)} />
                <span className={cn('text-[11px] tabular-nums', trendColor)}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quota attainment */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Q2 Quota Attainment</span>
          <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">${(s.closedThisQuarter / 1e3).toFixed(0)}K / ${(s.quarterTarget / 1e6).toFixed(1)}M</span>
        </div>
        <div className="h-3 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-orange-400 transition-all" style={{ width: `${quotaPct}%` }} />
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{quotaPct}% of target · {s.dealsAtRisk} deals at risk</p>
      </div>

      {/* Pipeline funnel */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest block mb-3">Pipeline Funnel</span>
        <div className="space-y-2">
          {PIPELINE_STAGES.map((stage, i) => {
            const maxValue = Math.max(...PIPELINE_STAGES.map(s => s.value));
            const width = (stage.value / maxValue) * 100;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--color-text-secondary)] w-24 shrink-0">{stage.name}</span>
                <div className="flex-1 h-7 bg-[var(--color-bg-elevated)] rounded-lg overflow-hidden relative">
                  <div
                    className={cn('h-full rounded-lg transition-all flex items-center px-2', STAGE_COLORS[stage.name.toLowerCase()] ?? 'bg-[var(--color-accent)]/40')}
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{stage.count} deals · ${(stage.value / 1e3).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <OrbitInsight>
        Acme Corp&apos;s recent $50M Series C makes them a strong upsell candidate — their contract renews in 60 days. Meanwhile, Zenith Labs has gone silent (14 days). Recommend Tom re-engage with a new use case angle or consider moving to closed-lost.
      </OrbitInsight>
    </div>
  );
}

// ─── Deals Tab ───
function DealsTab() {
  const [stageFilter, setStageFilter] = useState<string>('all');
  const filtered = stageFilter === 'all' ? DEALS : DEALS.filter(d => d.stage === stageFilter);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Stage filters */}
      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => setStageFilter('all')}
          className={cn(
            'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
            stageFilter === 'all'
              ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
          )}
        >All ({DEALS.length})</button>
        {['prospect', 'discovery', 'proposal', 'negotiation'].map(stage => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize',
              stageFilter === stage
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >{stage} ({DEALS.filter(d => d.stage === stage).length})</button>
        ))}
      </div>

      {/* Deal cards */}
      <div className="space-y-2">
        {filtered.map((deal) => {
          const healthDot: 'healthy' | 'warning' | 'critical' = deal.health === 'healthy' ? 'healthy' : deal.health === 'at-risk' ? 'warning' : 'critical';
          return (
            <div
              key={deal.id}
              className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{deal.company}</span>
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-md border capitalize', STAGE_BADGE_COLORS[deal.stage])}>{deal.stage}</span>
                    <span className={cn('flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md border', HEALTH_COLORS[deal.health])}>
                      <StatusDot status={healthDot} size="sm" />
                      {deal.health}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{deal.owner} · {deal.contacts[0]}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[16px] font-bold text-[var(--color-text-primary)] tabular-nums">${(deal.value / 1e3).toFixed(0)}K</span>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{deal.probability}% probability</p>
                </div>
              </div>

              {/* Next step */}
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                <ArrowRight className="w-3 h-3 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{deal.nextStep}</p>
              </div>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{deal.daysInStage}d in stage</span>
                <span>Last activity: {deal.lastActivity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Threats Tab ───
function ThreatsTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">Competitive Threats</h2>
        <span className="text-[11px] text-[var(--color-text-muted)]">{COMPETITOR_THREATS.length} active threats</span>
      </div>

      <div className="space-y-2">
        {COMPETITOR_THREATS.map((threat, i) => {
          const threatDot: 'critical' | 'warning' | 'neutral' = threat.threat === 'high' ? 'critical'
            : threat.threat === 'medium' ? 'warning' : 'neutral';
          const threatColor = threat.threat === 'high' ? 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]'
            : threat.threat === 'medium' ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]'
            : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]';

          return (
            <div
              key={i}
              className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{threat.competitor}</span>
                <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-[13px] text-[var(--color-text-secondary)]">{threat.deal}</span>
                <span className={cn('ml-auto flex items-center gap-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-md border', threatColor)}>
                  <StatusDot status={threatDot} size="sm" />
                  {threat.threat} threat
                </span>
              </div>
              <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed ml-6">{threat.context}</p>
            </div>
          );
        })}
      </div>

      <OrbitInsight label="Battlecard Available">
        Orbit has drafted an Intercom competitive battlecard based on their recent AI Agent Builder launch. Covers feature comparison, pricing gaps, and talk tracks for the sales team.
      </OrbitInsight>
    </div>
  );
}
