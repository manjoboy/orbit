'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Rocket } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Types ──────────────────────────────────────────────────────────────────

type DeployTab = 'recent' | 'scheduled' | 'rollbacks';
type Environment = 'production' | 'staging' | 'preview';
type DeployStatus = 'success' | 'failed' | 'rolling';
type RiskLevel = 'Low' | 'Medium' | 'High';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const RECENT_DEPLOYS = [
  {
    service: 'Auth Service',
    version: 'v2.14.0',
    environment: 'staging' as Environment,
    status: 'success' as DeployStatus,
    author: 'Alex Chen',
    timestamp: 'Apr 9, 2:14 PM',
    commits: 8,
    risk: 'High' as RiskLevel,
    riskNote: 'Auth migration in progress',
  },
  {
    service: 'Dashboard API',
    version: 'v3.1.2',
    environment: 'production' as Environment,
    status: 'success' as DeployStatus,
    author: 'Priya Sharma',
    timestamp: 'Apr 9, 11:30 AM',
    commits: 3,
    risk: 'Low' as RiskLevel,
    riskNote: 'Minor bug fixes only',
  },
  {
    service: 'Payment Service',
    version: 'v1.8.1',
    environment: 'production' as Environment,
    status: 'rolling' as DeployStatus,
    author: 'Jordan Lee',
    timestamp: 'Apr 9, 10:45 AM',
    commits: 5,
    risk: 'Medium' as RiskLevel,
    riskNote: 'Touches payment pipeline',
  },
  {
    service: 'Notification Worker',
    version: 'v2.3.0',
    environment: 'production' as Environment,
    status: 'success' as DeployStatus,
    author: 'Sam Rivera',
    timestamp: 'Apr 8, 4:20 PM',
    commits: 2,
    risk: 'Low' as RiskLevel,
    riskNote: 'Template changes only',
  },
  {
    service: 'Auth Service',
    version: 'v2.13.5',
    environment: 'preview' as Environment,
    status: 'failed' as DeployStatus,
    author: 'Alex Chen',
    timestamp: 'Apr 8, 2:00 PM',
    commits: 12,
    risk: 'High' as RiskLevel,
    riskNote: 'Auth migration — load test failure',
  },
  {
    service: 'Analytics Pipeline',
    version: 'v1.5.0',
    environment: 'staging' as Environment,
    status: 'success' as DeployStatus,
    author: 'Priya Sharma',
    timestamp: 'Apr 8, 11:15 AM',
    commits: 6,
    risk: 'Low' as RiskLevel,
    riskNote: 'New event tracking pipeline',
  },
];

const SCHEDULED_DEPLOYS = [
  {
    service: 'Auth Service',
    version: 'v2.14.0',
    targetTime: 'Apr 10, 6:00 AM',
    environment: 'production' as Environment,
    author: 'Alex Chen',
    dependencies: ['Load test suite passing', 'p99 latency < 100ms'],
    agentNote: 'Hold — p99 latency is 180ms. Recommend running full load test suite first.',
  },
  {
    service: 'Dashboard Analytics',
    version: 'v3.1.0',
    targetTime: 'Apr 10, 10:00 AM',
    environment: 'production' as Environment,
    author: 'Priya Sharma',
    dependencies: ['Auth migration completing first'],
    agentNote: 'Dashboard Analytics v3.1 depends on auth migration completing first.',
  },
  {
    service: 'Billing Service',
    version: 'v2.0.1',
    targetTime: 'Apr 11, 9:00 AM',
    environment: 'staging' as Environment,
    author: 'Jordan Lee',
    dependencies: [],
    agentNote: null,
  },
  {
    service: 'Email Service',
    version: 'v1.4.0',
    targetTime: 'Apr 12, 2:00 PM',
    environment: 'production' as Environment,
    author: 'Sam Rivera',
    dependencies: ['Notification Worker v2.3.0 deployed'],
    agentNote: null,
  },
];

const ROLLBACK_HISTORY = [
  {
    service: 'Payment Service',
    rolledBackVersion: 'v1.7.3',
    restoredVersion: 'v1.7.2',
    reason: 'Webhook timeout errors after deploy — 5xx rate spiked to 2.3%',
    initiatedBy: 'Jordan Lee',
    timestamp: 'Apr 5, 3:45 PM',
    resolutionTime: '12 min',
  },
  {
    service: 'Auth Service',
    rolledBackVersion: 'v2.12.0',
    restoredVersion: 'v2.11.4',
    reason: 'Session invalidation bug — users logged out unexpectedly',
    initiatedBy: 'Alex Chen',
    timestamp: 'Mar 28, 11:20 AM',
    resolutionTime: '8 min',
  },
  {
    service: 'Dashboard API',
    rolledBackVersion: 'v3.0.0',
    restoredVersion: 'v2.9.8',
    reason: 'Memory leak in new caching layer — OOM killed after 2h',
    initiatedBy: 'Priya Sharma',
    timestamp: 'Mar 15, 9:30 AM',
    resolutionTime: '22 min',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const ENV_BADGE: Record<Environment, string> = {
  production: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  staging: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  preview: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
};

const STATUS_BADGE: Record<DeployStatus, { color: string; label: string }> = {
  success: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', label: 'Success' },
  failed: { color: 'bg-red-500/15 text-red-400 border-red-500/25', label: 'Failed' },
  rolling: { color: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]', label: 'Rolling' },
};

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: 'text-emerald-400',
  Medium: 'text-[var(--color-status-warning)]',
  High: 'text-red-400',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function DeploymentsPage() {
  const [activeTab, setActiveTab] = useState<DeployTab>('recent');

  const tabs = [
    { id: 'recent' as const, label: 'Recent' },
    { id: 'scheduled' as const, label: 'Scheduled', count: SCHEDULED_DEPLOYS.length },
    { id: 'rollbacks' as const, label: 'Rollbacks' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Rocket} title="Deployments" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'recent' && <RecentTab />}
        {activeTab === 'scheduled' && <ScheduledTab />}
        {activeTab === 'rollbacks' && <RollbacksTab />}
      </div>
    </div>
  );
}

// ─── Recent Tab ─────────────────────────────────────────────────────────────

function RecentTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {RECENT_DEPLOYS.map((deploy, i) => {
          const statusBadge = STATUS_BADGE[deploy.status];
          return (
            <div
              key={i}
              className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] transition-all hover:border-[var(--color-border-default)] cursor-pointer"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{deploy.service}</span>
                  <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{deploy.version}</span>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', ENV_BADGE[deploy.environment])}>{deploy.environment}</span>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', statusBadge.color)}>
                    {deploy.status === 'rolling' && <StatusDot status="warning" pulse size="sm" className="inline-block mr-1 -mt-px" />}
                    {statusBadge.label}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">{deploy.timestamp}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                  <span>{deploy.author}</span>
                  <span>&middot;</span>
                  <span className="tabular-nums">{deploy.commits} commits</span>
                  <span>&middot;</span>
                  <span className={cn('font-medium', RISK_COLORS[deploy.risk])}>{deploy.risk} risk</span>
                  <span className="text-[var(--color-text-muted)]">— {deploy.riskNote}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <OrbitInsight>
        Auth migration deploy should wait — p99 latency is 180ms (target: 100ms). I recommend running the full load test suite before proceeding.
      </OrbitInsight>
    </div>
  );
}

// ─── Scheduled Tab ──────────────────────────────────────────────────────────

function ScheduledTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {SCHEDULED_DEPLOYS.map((deploy, i) => (
          <div
            key={i}
            className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] transition-all hover:border-[var(--color-border-default)]"
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{deploy.service}</span>
                <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{deploy.version}</span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', ENV_BADGE[deploy.environment])}>{deploy.environment}</span>
              </div>
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)] shrink-0">{deploy.targetTime}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] mb-2">
              <span>By {deploy.author}</span>
              {deploy.dependencies.length > 0 && (
                <>
                  <span>&middot;</span>
                  <span className="text-[var(--color-status-warning)]">{deploy.dependencies.length} {deploy.dependencies.length === 1 ? 'dependency' : 'dependencies'}</span>
                </>
              )}
            </div>

            {deploy.dependencies.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {deploy.dependencies.map((dep, j) => (
                  <span key={j} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                    {dep}
                  </span>
                ))}
              </div>
            )}

            {deploy.agentNote && (
              <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/15">
                <span className="text-[11px] text-[var(--color-accent)] leading-relaxed">{deploy.agentNote}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rollbacks Tab ──────────────────────────────────────────────────────────

function RollbacksTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {ROLLBACK_HISTORY.map((rollback, i) => (
          <div
            key={i}
            className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] transition-all hover:border-[var(--color-border-default)]"
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <StatusDot status="critical" size="md" className="mt-0.5" />
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{rollback.service}</span>
                <span className="text-[11px] font-mono text-red-400 line-through">{rollback.rolledBackVersion}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">&rarr;</span>
                <span className="text-[11px] font-mono text-emerald-400">{rollback.restoredVersion}</span>
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">{rollback.timestamp}</span>
            </div>

            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-1.5 ml-5">{rollback.reason}</p>

            <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] ml-5">
              <span>Initiated by {rollback.initiatedBy}</span>
              <span>&middot;</span>
              <span>Resolved in <span className="font-medium text-[var(--color-text-secondary)] tabular-nums">{rollback.resolutionTime}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
