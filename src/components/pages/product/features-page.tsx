'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Inline Mock Data ────────────────────────────────────────────────────────

type FeatureStatus = 'In Progress' | 'Blocked' | 'Planned' | 'Shipped';
type Priority = 'P0' | 'P1' | 'P2';

const FEATURES = [
  {
    id: 1, title: 'Agent Builder v2', status: 'In Progress' as FeatureStatus, priority: 'P0' as Priority,
    owner: 'Elena R.', progress: 65, requestCount: 23, revenueImpact: '$420K ARR',
  },
  {
    id: 2, title: 'Dashboard Analytics', status: 'Planned' as FeatureStatus, priority: 'P1' as Priority,
    owner: 'Marcus T.', progress: 0, requestCount: 18, revenueImpact: '$280K ARR',
  },
  {
    id: 3, title: 'Custom Workflow Templates', status: 'In Progress' as FeatureStatus, priority: 'P1' as Priority,
    owner: 'Jordan L.', progress: 40, requestCount: 15, revenueImpact: '$195K ARR',
  },
  {
    id: 4, title: 'SSO / SAML Integration', status: 'Blocked' as FeatureStatus, priority: 'P0' as Priority,
    owner: 'Sam K.', progress: 30, requestCount: 12, revenueImpact: '$340K ARR',
  },
  {
    id: 5, title: 'API Rate Limit Overhaul', status: 'In Progress' as FeatureStatus, priority: 'P2' as Priority,
    owner: 'Nina P.', progress: 80, requestCount: 8, revenueImpact: '$65K ARR',
  },
  {
    id: 6, title: 'Multi-language Support', status: 'Planned' as FeatureStatus, priority: 'P2' as Priority,
    owner: 'Elena R.', progress: 0, requestCount: 11, revenueImpact: '$150K ARR',
  },
  {
    id: 7, title: 'Webhook Event System', status: 'Shipped' as FeatureStatus, priority: 'P1' as Priority,
    owner: 'Jordan L.', progress: 100, requestCount: 9, revenueImpact: '$110K ARR',
  },
];

const FEATURE_REQUESTS = [
  { id: 1, title: 'Agent Builder v2 — Custom logic blocks', count: 23, source: 'Sales', revenue: '$420K', priority: 'P0' as Priority },
  { id: 2, title: 'SSO / SAML for enterprise orgs', count: 18, source: 'Support', revenue: '$340K', priority: 'P0' as Priority },
  { id: 3, title: 'Dashboard Analytics — Real-time metrics', count: 18, source: 'Direct', revenue: '$280K', priority: 'P1' as Priority },
  { id: 4, title: 'Custom Workflow Templates library', count: 15, source: 'Sales', revenue: '$195K', priority: 'P1' as Priority },
  { id: 5, title: 'Multi-language agent responses', count: 11, source: 'Support', revenue: '$150K', priority: 'P2' as Priority },
  { id: 6, title: 'Webhook event subscriptions', count: 9, source: 'Direct', revenue: '$110K', priority: 'P1' as Priority },
];

const DEPENDENCIES = [
  { from: 'Agent Builder v2', to: 'Custom Workflow Templates', fromStatus: 'In Progress' as FeatureStatus, toStatus: 'In Progress' as FeatureStatus, blocked: false },
  { from: 'SSO / SAML Integration', to: 'Auth Service Migration', fromStatus: 'Blocked' as FeatureStatus, toStatus: 'In Progress' as FeatureStatus, blocked: true },
  { from: 'Dashboard Analytics', to: 'API Rate Limit Overhaul', fromStatus: 'Planned' as FeatureStatus, toStatus: 'In Progress' as FeatureStatus, blocked: false },
  { from: 'Multi-language Support', to: 'Agent Builder v2', fromStatus: 'Planned' as FeatureStatus, toStatus: 'In Progress' as FeatureStatus, blocked: false },
];

const STATUS_COLORS: Record<FeatureStatus, string> = {
  'In Progress': 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]',
  'Blocked': 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]',
  'Planned': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
  'Shipped': 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  P0: 'bg-red-500/10 text-red-400 border-red-500/20',
  P1: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  P2: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

// ─── Component ───────────────────────────────────────────────────────────────

type FeaturesTab = 'roadmap' | 'requests' | 'dependencies';

export function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<FeaturesTab>('roadmap');

  const tabs = [
    { id: 'roadmap' as const, label: 'Roadmap' },
    { id: 'requests' as const, label: 'Feature Requests' },
    { id: 'dependencies' as const, label: 'Dependencies' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Layers} title="Features" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'roadmap' && <RoadmapTab />}
        {activeTab === 'requests' && <RequestsTab />}
        {activeTab === 'dependencies' && <DependenciesTab />}
      </div>
    </div>
  );
}

// ─── Roadmap Tab ─────────────────────────────────────────────────────────────

function RoadmapTab() {
  const [statusFilter, setStatusFilter] = useState('All');
  const statuses = ['All', 'In Progress', 'Blocked', 'Planned', 'Shipped'];

  const filtered = statusFilter === 'All'
    ? FEATURES
    : FEATURES.filter(f => f.status === statusFilter);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status filter pills */}
      <div className="flex items-center gap-1.5">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
              statusFilter === status
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Feature cards */}
      <div className="space-y-2">
        {filtered.map(feature => (
          <div
            key={feature.id}
            className="px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{feature.title}</span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', STATUS_COLORS[feature.status])}>
                  {feature.status}
                </span>
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', PRIORITY_COLORS[feature.priority])}>
                  {feature.priority}
                </span>
              </div>
              <span className="text-[11px] font-medium text-[var(--color-accent)] shrink-0 ml-3">{feature.revenueImpact}</span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-1.5">
              <div className="flex-1 h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    feature.status === 'Blocked' ? 'bg-[var(--color-status-critical)]' :
                    feature.status === 'Shipped' ? 'bg-[var(--color-status-healthy)]' :
                    'bg-[var(--color-chart-1)]'
                  )}
                  style={{ width: `${feature.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums shrink-0">{feature.progress}%</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
              <span>{feature.owner}</span>
              <span>·</span>
              <span>{feature.requestCount} requests</span>
            </div>
          </div>
        ))}
      </div>

      <OrbitInsight>
        Agent Builder v2 is the highest-revenue feature ($420K ARR tied to 23 requests). Consider prioritizing over Dashboard Analytics.
      </OrbitInsight>
    </div>
  );
}

// ─── Feature Requests Tab ────────────────────────────────────────────────────

function RequestsTab() {
  return (
    <div className="space-y-2 max-w-4xl">
      {FEATURE_REQUESTS.map(req => (
        <div
          key={req.id}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{req.title}</span>
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', PRIORITY_COLORS[req.priority])}>
                {req.priority}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
              <span>Source: {req.source}</span>
              <span>·</span>
              <span>Revenue: {req.revenue}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] text-[12px] font-bold text-[var(--color-text-primary)] tabular-nums shrink-0">
            {req.count}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Dependencies Tab ────────────────────────────────────────────────────────

function DependenciesTab() {
  return (
    <div className="space-y-2 max-w-4xl">
      {DEPENDENCIES.map((dep, i) => {
        const fromDot: 'critical' | 'warning' | 'info' | 'healthy' =
          dep.fromStatus === 'Blocked' ? 'critical' :
          dep.fromStatus === 'In Progress' ? 'info' :
          dep.fromStatus === 'Shipped' ? 'healthy' : 'neutral' as 'info';
        const toDot: 'critical' | 'warning' | 'info' | 'healthy' =
          dep.toStatus === 'Blocked' ? 'critical' :
          dep.toStatus === 'In Progress' ? 'info' :
          dep.toStatus === 'Shipped' ? 'healthy' : 'neutral' as 'info';

        return (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all',
              dep.blocked
                ? 'bg-[var(--color-status-critical-bg)] border-[var(--color-status-critical-border)]'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)]'
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <StatusDot status={fromDot} size="md" />
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{dep.from}</span>
            </div>

            <span className="text-[11px] text-[var(--color-text-muted)] shrink-0 px-2">depends on</span>

            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{dep.to}</span>
              <StatusDot status={toDot} size="md" />
            </div>

            {dep.blocked && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border border-[var(--color-status-critical-border)] shrink-0">
                Blocked
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
