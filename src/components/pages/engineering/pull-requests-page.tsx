'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Code } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Types ──────────────────────────────────────────────────────────────────

type PRTab = 'needs-review' | 'my-prs' | 'merged';
type CIStatus = 'passing' | 'failing' | 'pending';
type ReviewState = 'approved' | 'changes' | 'pending';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const NEEDS_REVIEW = [
  {
    number: 852,
    title: 'Enterprise SSO — SAML provider integration',
    author: 'Alex Chen',
    authorInitials: 'AC',
    age: '2 days',
    linesAdded: 482,
    linesRemoved: 91,
    ci: 'passing' as CIStatus,
    linkedTicket: 'ENG-152',
    reviewers: ['PS', 'JL'],
    urgent: true,
    urgentTag: 'Blocks Enterprise SSO',
  },
  {
    number: 849,
    title: 'Fix auth token refresh race condition',
    author: 'Priya Sharma',
    authorInitials: 'PS',
    age: '3 days',
    linesAdded: 127,
    linesRemoved: 43,
    ci: 'passing' as CIStatus,
    linkedTicket: 'ENG-149',
    reviewers: ['AC'],
    urgent: false,
    urgentTag: null,
  },
  {
    number: 847,
    title: 'Add rate limiting to public API endpoints',
    author: 'Priya Sharma',
    authorInitials: 'PS',
    age: '4 days',
    linesAdded: 234,
    linesRemoved: 12,
    ci: 'failing' as CIStatus,
    linkedTicket: 'ENG-147',
    reviewers: ['AC', 'SR'],
    urgent: false,
    urgentTag: null,
  },
  {
    number: 844,
    title: 'Dashboard analytics data pipeline v3',
    author: 'Alex Chen',
    authorInitials: 'AC',
    age: '1 day',
    linesAdded: 891,
    linesRemoved: 156,
    ci: 'pending' as CIStatus,
    linkedTicket: 'ENG-151',
    reviewers: ['PS'],
    urgent: false,
    urgentTag: null,
  },
];

const MY_PRS = [
  {
    number: 850,
    title: 'Migrate user settings to new schema',
    author: 'You',
    authorInitials: 'ME',
    age: '1 day',
    linesAdded: 312,
    linesRemoved: 188,
    ci: 'passing' as CIStatus,
    linkedTicket: 'ENG-150',
    reviewState: 'approved' as ReviewState,
    reviewers: ['AC', 'PS'],
  },
  {
    number: 846,
    title: 'Refactor notification service layer',
    author: 'You',
    authorInitials: 'ME',
    age: '3 days',
    linesAdded: 567,
    linesRemoved: 401,
    ci: 'passing' as CIStatus,
    linkedTicket: 'ENG-144',
    reviewState: 'changes' as ReviewState,
    reviewers: ['JL'],
  },
  {
    number: 841,
    title: 'Add webhook event payload validation',
    author: 'You',
    authorInitials: 'ME',
    age: '5 days',
    linesAdded: 89,
    linesRemoved: 12,
    ci: 'passing' as CIStatus,
    linkedTicket: 'ENG-140',
    reviewState: 'pending' as ReviewState,
    reviewers: ['PS'],
  },
];

const MERGED_PRS = [
  { number: 843, title: 'Onboarding flow redesign', author: 'Alex Chen', linesAdded: 1204, linesRemoved: 876, mergedDate: 'Apr 7', timeToMerge: '1.2 days' },
  { number: 840, title: 'Fix CSV export encoding issues', author: 'Sam Rivera', linesAdded: 45, linesRemoved: 12, mergedDate: 'Apr 6', timeToMerge: '0.5 days' },
  { number: 839, title: 'Add audit log API endpoints', author: 'Priya Sharma', linesAdded: 378, linesRemoved: 23, mergedDate: 'Apr 5', timeToMerge: '1.8 days' },
  { number: 837, title: 'Billing page performance optimization', author: 'Jordan Lee', linesAdded: 156, linesRemoved: 234, mergedDate: 'Apr 4', timeToMerge: '2.1 days' },
  { number: 835, title: 'Update Stripe SDK to v14', author: 'Sam Rivera', linesAdded: 89, linesRemoved: 67, mergedDate: 'Apr 3', timeToMerge: '0.8 days' },
  { number: 833, title: 'Implement feature flag context provider', author: 'Alex Chen', linesAdded: 234, linesRemoved: 45, mergedDate: 'Apr 2', timeToMerge: '1.5 days' },
  { number: 831, title: 'Fix timezone handling in scheduler', author: 'Priya Sharma', linesAdded: 67, linesRemoved: 34, mergedDate: 'Apr 1', timeToMerge: '1.0 days' },
  { number: 829, title: 'Database connection pool tuning', author: 'Jordan Lee', linesAdded: 23, linesRemoved: 8, mergedDate: 'Mar 31', timeToMerge: '2.5 days' },
  { number: 827, title: 'Add E2E tests for checkout flow', author: 'Sam Rivera', linesAdded: 456, linesRemoved: 12, mergedDate: 'Mar 30', timeToMerge: '1.3 days' },
  { number: 825, title: 'Refactor auth middleware', author: 'Alex Chen', linesAdded: 189, linesRemoved: 312, mergedDate: 'Mar 29', timeToMerge: '1.7 days' },
  { number: 823, title: 'Fix memory leak in WebSocket handler', author: 'Priya Sharma', linesAdded: 34, linesRemoved: 56, mergedDate: 'Mar 28', timeToMerge: '0.9 days' },
  { number: 821, title: 'Update CI pipeline for monorepo', author: 'Jordan Lee', linesAdded: 78, linesRemoved: 45, mergedDate: 'Mar 27', timeToMerge: '2.0 days' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const CI_DOT: Record<CIStatus, { status: 'healthy' | 'critical' | 'warning'; label: string }> = {
  passing: { status: 'healthy', label: 'Passing' },
  failing: { status: 'critical', label: 'Failing' },
  pending: { status: 'warning', label: 'Pending' },
};

const REVIEW_STATE_DOT: Record<ReviewState, { status: 'healthy' | 'warning' | 'info'; label: string }> = {
  approved: { status: 'healthy', label: 'Approved' },
  changes: { status: 'warning', label: 'Changes Requested' },
  pending: { status: 'info', label: 'Pending Review' },
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function PullRequestsPage() {
  const [activeTab, setActiveTab] = useState<PRTab>('needs-review');

  const tabs = [
    { id: 'needs-review' as const, label: 'Needs Review', count: NEEDS_REVIEW.length },
    { id: 'my-prs' as const, label: 'My PRs' },
    { id: 'merged' as const, label: 'Merged' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Code} title="Pull Requests" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'needs-review' && <NeedsReviewTab />}
        {activeTab === 'my-prs' && <MyPRsTab />}
        {activeTab === 'merged' && <MergedTab />}
      </div>
    </div>
  );
}

// ─── Needs Review Tab ───────────────────────────────────────────────────────

function NeedsReviewTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {NEEDS_REVIEW.map(pr => {
          const ci = CI_DOT[pr.ci];
          return (
            <div
              key={pr.number}
              className={cn(
                'px-4 py-3.5 rounded-xl border transition-all hover:border-[var(--color-border-default)] cursor-pointer',
                pr.urgent
                  ? 'bg-[var(--color-bg-secondary)] border-[var(--color-accent)]/30'
                  : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)]'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Author avatar */}
                <div className="w-7 h-7 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)] shrink-0 mt-0.5">
                  {pr.authorInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-mono text-[var(--color-accent)] shrink-0">#{pr.number}</span>
                    <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{pr.title}</span>
                    {pr.urgent && pr.urgentTag && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 shrink-0">
                        {pr.urgentTag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                    <span>{pr.author}</span>
                    <span className="text-[var(--color-text-muted)]">&middot;</span>
                    <span>{pr.age}</span>
                    <span className="text-[var(--color-text-muted)]">&middot;</span>
                    <span className="tabular-nums">
                      <span className="text-emerald-400">+{pr.linesAdded}</span>
                      <span className="mx-0.5">/</span>
                      <span className="text-red-400">-{pr.linesRemoved}</span>
                    </span>
                    <span className="text-[var(--color-text-muted)]">&middot;</span>
                    <span className="flex items-center gap-1">
                      <StatusDot status={ci.status} size="sm" />
                      {ci.label}
                    </span>
                    <span className="text-[var(--color-text-muted)]">&middot;</span>
                    <span className="font-mono text-[10px]">{pr.linkedTicket}</span>
                  </div>
                </div>

                {/* Reviewers */}
                <div className="flex items-center -space-x-1 shrink-0">
                  {pr.reviewers.map(r => (
                    <div key={r} className="w-5 h-5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[8px] font-bold text-[var(--color-text-muted)]">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <OrbitInsight>
        PR #852 (Enterprise SSO) has 2 cosmetic comments — architecture looks solid. Safe to approve. This unblocks the Enterprise Onboarding redesign.
      </OrbitInsight>
    </div>
  );
}

// ─── My PRs Tab ─────────────────────────────────────────────────────────────

function MyPRsTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        {MY_PRS.map(pr => {
          const review = REVIEW_STATE_DOT[pr.reviewState];
          const ci = CI_DOT[pr.ci];
          return (
            <div
              key={pr.number}
              className="px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] transition-all hover:border-[var(--color-border-default)] cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <StatusDot status={review.status} size="md" className="mt-2" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-mono text-[var(--color-accent)] shrink-0">#{pr.number}</span>
                    <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{pr.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                    <span>{pr.age}</span>
                    <span>&middot;</span>
                    <span className="tabular-nums">
                      <span className="text-emerald-400">+{pr.linesAdded}</span>
                      <span className="mx-0.5">/</span>
                      <span className="text-red-400">-{pr.linesRemoved}</span>
                    </span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1">
                      <StatusDot status={ci.status} size="sm" />
                      CI {ci.label}
                    </span>
                    <span>&middot;</span>
                    <span className="font-mono text-[10px]">{pr.linkedTicket}</span>
                  </div>
                </div>

                <span className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0',
                  pr.reviewState === 'approved' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
                  pr.reviewState === 'changes' && 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]',
                  pr.reviewState === 'pending' && 'bg-blue-500/15 text-blue-400 border-blue-500/25',
                )}>
                  {review.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Merged Tab ─────────────────────────────────────────────────────────────

function MergedTab() {
  const avgReviewTime = (MERGED_PRS.reduce((sum, pr) => sum + parseFloat(pr.timeToMerge), 0) / MERGED_PRS.length).toFixed(1);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3">
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Merged This Sprint</p>
          <p className="text-[22px] font-bold text-[var(--color-text-primary)] tabular-nums leading-tight">{MERGED_PRS.length}</p>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">pull requests</p>
        </div>
        <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] px-4 py-3">
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Avg Review Time</p>
          <p className="text-[22px] font-bold text-[var(--color-text-primary)] tabular-nums leading-tight">{avgReviewTime} days</p>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">time to merge</p>
        </div>
      </div>

      {/* Merged list */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-6 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">PR</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest col-span-2">Title</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Author</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Lines</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Merged</span>
        </div>

        {MERGED_PRS.map((pr, i) => (
          <div
            key={pr.number}
            className={cn(
              'grid grid-cols-6 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors',
              i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
            )}
          >
            <span className="text-[12px] font-mono text-[var(--color-text-muted)]">#{pr.number}</span>
            <span className="text-[12px] font-medium text-[var(--color-text-primary)] col-span-2 truncate">{pr.title}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">{pr.author}</span>
            <span className="text-[11px] text-right tabular-nums">
              <span className="text-emerald-400">+{pr.linesAdded}</span>
              <span className="text-[var(--color-text-muted)] mx-0.5">/</span>
              <span className="text-red-400">-{pr.linesRemoved}</span>
            </span>
            <div className="text-right">
              <span className="text-[11px] text-[var(--color-text-secondary)]">{pr.mergedDate}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5 tabular-nums">{pr.timeToMerge}d</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
