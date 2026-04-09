'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileCheck, Users, Briefcase, Monitor, Plane } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';
import { Button } from '../../ui/button';

// ─── Types ──────────────────────────────────────────────────────────────────

type ApprovalTab = 'pending' | 'approved' | 'rejected';
type ApprovalType = 'Headcount' | 'Contractor' | 'Software' | 'Travel';
type AgentPriority = 'high' | 'medium' | 'low';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const PENDING_APPROVALS = [
  {
    id: 'APR-001',
    requester: 'Alex Chen',
    type: 'Contractor' as ApprovalType,
    amount: 45000,
    description: 'Kira Novak — contractor renewal (auth migration specialist)',
    submitted: 'Apr 7',
    agentNote: 'Approve — critical path for auth migration timeline. Approving today avoids a 2-week gap in coverage.',
    priority: 'high' as AgentPriority,
  },
  {
    id: 'APR-002',
    requester: 'Jordan Lee',
    type: 'Headcount' as ApprovalType,
    amount: 185000,
    description: 'Senior Backend Engineer — payments team backfill',
    submitted: 'Apr 5',
    agentNote: 'Approve — payment webhook reliability has dropped 2.3% without dedicated coverage. High customer impact.',
    priority: 'high' as AgentPriority,
  },
  {
    id: 'APR-003',
    requester: 'Priya Sharma',
    type: 'Software' as ApprovalType,
    amount: 24000,
    description: 'Datadog Enterprise upgrade — APM + infrastructure monitoring',
    submitted: 'Apr 4',
    agentNote: 'Approve — current plan hits 90% usage cap. Without upgrade, observability gaps during auth migration.',
    priority: 'medium' as AgentPriority,
  },
  {
    id: 'APR-004',
    requester: 'Sam Rivera',
    type: 'Travel' as ApprovalType,
    amount: 8500,
    description: 'Team offsite — Q2 planning workshop (Portland, 3 days)',
    submitted: 'Apr 3',
    agentNote: 'Hold — travel budget is under, so room exists. But consider virtual option to preserve runway.',
    priority: 'low' as AgentPriority,
  },
  {
    id: 'APR-005',
    requester: 'Alex Chen',
    type: 'Software' as ApprovalType,
    amount: 12000,
    description: 'Linear Enterprise — project management tooling upgrade',
    submitted: 'Apr 2',
    agentNote: 'Hold — missing ROI documentation. Current plan covers team needs through Q3.',
    priority: 'low' as AgentPriority,
  },
];

const APPROVED_ITEMS = [
  { id: 'APR-100', requester: 'Jordan Lee', type: 'Headcount' as ApprovalType, amount: 175000, description: 'DevOps Engineer — platform reliability', approvedDate: 'Apr 1', approver: 'You' },
  { id: 'APR-099', requester: 'Priya Sharma', type: 'Software' as ApprovalType, amount: 36000, description: 'GitHub Enterprise — advanced security features', approvedDate: 'Mar 28', approver: 'You' },
  { id: 'APR-098', requester: 'Sam Rivera', type: 'Contractor' as ApprovalType, amount: 28000, description: 'QA automation contractor (8 weeks)', approvedDate: 'Mar 25', approver: 'David Park' },
  { id: 'APR-097', requester: 'Alex Chen', type: 'Travel' as ApprovalType, amount: 4200, description: 'AWS re:Invent conference (2 attendees)', approvedDate: 'Mar 20', approver: 'You' },
];

const REJECTED_ITEMS = [
  { id: 'APR-090', requester: 'Sam Rivera', type: 'Software' as ApprovalType, amount: 18000, description: 'Figma Enterprise — design tooling upgrade', rejectedDate: 'Mar 22', reason: 'Current plan sufficient for team size. Revisit in Q3 if design team grows.' },
  { id: 'APR-089', requester: 'Jordan Lee', type: 'Headcount' as ApprovalType, amount: 160000, description: 'Junior Frontend Engineer — dashboard team', rejectedDate: 'Mar 18', reason: 'Headcount cap reached for Q1. Resubmit as part of Q2 planning scenarios.' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<ApprovalType, typeof Users> = {
  Headcount: Users,
  Contractor: Briefcase,
  Software: Monitor,
  Travel: Plane,
};

const TYPE_BADGE_COLORS: Record<ApprovalType, string> = {
  Headcount: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  Contractor: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Software: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Travel: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
};

const PRIORITY_BORDER: Record<AgentPriority, string> = {
  high: 'border-[var(--color-accent)]/30',
  medium: 'border-[var(--color-border-subtle)]',
  low: 'border-[var(--color-border-subtle)]',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<ApprovalTab>('pending');

  const tabs = [
    { id: 'pending' as const, label: 'Pending', count: PENDING_APPROVALS.length, countColor: 'critical' as const },
    { id: 'approved' as const, label: 'Approved' },
    { id: 'rejected' as const, label: 'Rejected' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={FileCheck} title="Approvals" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'pending' && <PendingTab />}
        {activeTab === 'approved' && <ApprovedTab />}
        {activeTab === 'rejected' && <RejectedTab />}
      </div>
    </div>
  );
}

// ─── Pending Tab ────────────────────────────────────────────────────────────

function PendingTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {PENDING_APPROVALS.map(item => {
          const TypeIcon = TYPE_ICONS[item.type];
          return (
            <div
              key={item.id}
              className={cn(
                'px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] transition-all hover:border-[var(--color-border-default)]',
                'border',
                PRIORITY_BORDER[item.priority]
              )}
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  <TypeIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{item.description}</span>
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0', TYPE_BADGE_COLORS[item.type])}>{item.type}</span>
                    </div>
                    <span className="text-[16px] font-bold text-[var(--color-text-primary)] tabular-nums shrink-0 ml-3">
                      ${item.amount >= 1000 ? `${(item.amount / 1e3).toFixed(item.amount >= 10000 ? 0 : 1)}K` : item.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mb-2">
                    <span>{item.requester}</span>
                    <span>&middot;</span>
                    <span>Submitted {item.submitted}</span>
                  </div>

                  {/* Agent recommendation */}
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/15">
                    <span className="text-[11px] text-[var(--color-accent)] leading-relaxed">{item.agentNote}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <Button variant="primary" size="sm">Approve</Button>
                  <Button variant="ghost" size="sm">Reject</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <OrbitInsight>
        The Kira Novak contractor renewal ($45K) is critical for auth migration timeline. Approving today avoids a 2-week gap in coverage.
      </OrbitInsight>
    </div>
  );
}

// ─── Approved Tab ───────────────────────────────────────────────────────────

function ApprovedTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {APPROVED_ITEMS.map(item => (
          <div
            key={item.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]"
          >
            <StatusDot status="healthy" size="md" className="mt-2" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{item.description}</span>
                <span className="text-[14px] font-bold text-[var(--color-text-primary)] tabular-nums shrink-0 ml-3">
                  ${item.amount >= 1000 ? `${(item.amount / 1e3).toFixed(item.amount >= 10000 ? 0 : 1)}K` : item.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <span>{item.requester}</span>
                <span>&middot;</span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', TYPE_BADGE_COLORS[item.type])}>{item.type}</span>
                <span>&middot;</span>
                <span>Approved {item.approvedDate}</span>
                <span>&middot;</span>
                <span>By {item.approver}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rejected Tab ───────────────────────────────────────────────────────────

function RejectedTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {REJECTED_ITEMS.map(item => (
          <div
            key={item.id}
            className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]"
          >
            <div className="flex items-start gap-3">
              <StatusDot status="critical" size="md" className="mt-2" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{item.description}</span>
                  <span className="text-[14px] font-bold text-[var(--color-text-muted)] tabular-nums shrink-0 ml-3 line-through">
                    ${item.amount >= 1000 ? `${(item.amount / 1e3).toFixed(item.amount >= 10000 ? 0 : 1)}K` : item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mb-1.5">
                  <span>{item.requester}</span>
                  <span>&middot;</span>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', TYPE_BADGE_COLORS[item.type])}>{item.type}</span>
                  <span>&middot;</span>
                  <span>Rejected {item.rejectedDate}</span>
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{item.reason}</p>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 mt-0.5">Reconsider</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
