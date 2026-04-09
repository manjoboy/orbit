'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Types ──────────────────────────────────────────────────────────────────

type TicketsTab = 'my-tickets' | 'sprint-board' | 'backlog';
type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
type TicketStatus = 'In Progress' | 'In Review' | 'Blocked' | 'Todo' | 'Done';
type FilterOption = 'All' | 'In Progress' | 'In Review' | 'Blocked';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const TICKETS = [
  { key: 'ENG-152', title: 'Enterprise SSO — SAML integration', priority: 'Urgent' as Priority, status: 'In Progress' as TicketStatus, points: 8, assignee: 'Alex Chen' },
  { key: 'ENG-149', title: 'Fix auth token refresh race condition', priority: 'High' as Priority, status: 'In Review' as TicketStatus, points: 5, assignee: 'Priya Sharma' },
  { key: 'ENG-151', title: 'Dashboard analytics v3 data pipeline', priority: 'High' as Priority, status: 'In Progress' as TicketStatus, points: 8, assignee: 'Alex Chen' },
  { key: 'ENG-148', title: 'Payment webhook retry logic', priority: 'High' as Priority, status: 'Blocked' as TicketStatus, points: 5, assignee: 'Jordan Lee' },
  { key: 'ENG-150', title: 'Migrate user settings to new schema', priority: 'Medium' as Priority, status: 'In Progress' as TicketStatus, points: 3, assignee: 'Sam Rivera' },
  { key: 'ENG-147', title: 'Add rate limiting to public API', priority: 'Medium' as Priority, status: 'In Review' as TicketStatus, points: 3, assignee: 'Priya Sharma' },
  { key: 'ENG-145', title: 'API documentation updates', priority: 'Low' as Priority, status: 'Todo' as TicketStatus, points: 2, assignee: 'Sam Rivera' },
  { key: 'ENG-144', title: 'Refactor notification service', priority: 'Low' as Priority, status: 'Todo' as TicketStatus, points: 3, assignee: 'Jordan Lee' },
];

const SPRINT_COLUMNS: { label: string; status: TicketStatus }[] = [
  { label: 'Todo', status: 'Todo' },
  { label: 'In Progress', status: 'In Progress' },
  { label: 'In Review', status: 'In Review' },
  { label: 'Done', status: 'Done' },
];

const SPRINT_BOARD_ITEMS = [
  { key: 'ENG-152', title: 'Enterprise SSO — SAML integration', priority: 'Urgent' as Priority, assignee: 'AC', points: 8, status: 'In Progress' as TicketStatus },
  { key: 'ENG-151', title: 'Dashboard analytics v3 pipeline', priority: 'High' as Priority, assignee: 'AC', points: 8, status: 'In Progress' as TicketStatus },
  { key: 'ENG-150', title: 'Migrate user settings schema', priority: 'Medium' as Priority, assignee: 'SR', points: 3, status: 'In Progress' as TicketStatus },
  { key: 'ENG-149', title: 'Auth token refresh fix', priority: 'High' as Priority, assignee: 'PS', points: 5, status: 'In Review' as TicketStatus },
  { key: 'ENG-147', title: 'Public API rate limiting', priority: 'Medium' as Priority, assignee: 'PS', points: 3, status: 'In Review' as TicketStatus },
  { key: 'ENG-148', title: 'Payment webhook retry', priority: 'High' as Priority, assignee: 'JL', points: 5, status: 'Todo' as TicketStatus },
  { key: 'ENG-145', title: 'API documentation updates', priority: 'Low' as Priority, assignee: 'SR', points: 2, status: 'Todo' as TicketStatus },
  { key: 'ENG-144', title: 'Refactor notification service', priority: 'Low' as Priority, assignee: 'JL', points: 3, status: 'Todo' as TicketStatus },
  { key: 'ENG-139', title: 'Onboarding flow redesign', priority: 'High' as Priority, assignee: 'AC', points: 5, status: 'Done' as TicketStatus },
  { key: 'ENG-138', title: 'Fix CSV export encoding', priority: 'Medium' as Priority, assignee: 'SR', points: 2, status: 'Done' as TicketStatus },
  { key: 'ENG-136', title: 'Add audit log endpoints', priority: 'Medium' as Priority, assignee: 'PS', points: 3, status: 'Done' as TicketStatus },
];

const BACKLOG = [
  { key: 'ENG-160', title: 'Multi-tenant data isolation audit', priority: 'Urgent' as Priority, labels: ['Security', 'Compliance'], points: 13, created: 'Mar 28' },
  { key: 'ENG-158', title: 'GraphQL subscription layer', priority: 'High' as Priority, labels: ['Platform', 'API'], points: 8, created: 'Mar 25' },
  { key: 'ENG-157', title: 'Automated regression test suite', priority: 'High' as Priority, labels: ['QA', 'CI/CD'], points: 8, created: 'Mar 24' },
  { key: 'ENG-155', title: 'Implement feature flag service', priority: 'Medium' as Priority, labels: ['Platform'], points: 5, created: 'Mar 20' },
  { key: 'ENG-154', title: 'Email template builder v2', priority: 'Medium' as Priority, labels: ['Frontend', 'UX'], points: 5, created: 'Mar 18' },
  { key: 'ENG-153', title: 'Database query optimizer', priority: 'Medium' as Priority, labels: ['Backend', 'Performance'], points: 5, created: 'Mar 15' },
  { key: 'ENG-146', title: 'Dark mode support', priority: 'Low' as Priority, labels: ['Frontend', 'UX'], points: 3, created: 'Mar 10' },
  { key: 'ENG-143', title: 'Update third-party SDK versions', priority: 'Low' as Priority, labels: ['Maintenance'], points: 2, created: 'Mar 8' },
];

// ─── Priority / Status helpers ──────────────────────────────────────────────

const PRIORITY_COLORS: Record<Priority, string> = {
  Urgent: 'bg-red-500/15 text-red-400 border-red-500/25',
  High: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  Medium: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Low: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
};

const PRIORITY_DOT: Record<Priority, string> = {
  Urgent: 'bg-red-400',
  High: 'bg-orange-400',
  Medium: 'bg-blue-400',
  Low: 'bg-[var(--color-text-muted)]',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  'In Progress': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'In Review': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'Blocked': 'bg-red-500/15 text-red-400 border-red-500/25',
  'Todo': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
  'Done': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TicketsTab>('my-tickets');

  const tabs = [
    { id: 'my-tickets' as const, label: 'My Tickets' },
    { id: 'sprint-board' as const, label: 'Sprint Board' },
    { id: 'backlog' as const, label: 'Backlog' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Target} title="Tickets" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'my-tickets' && <MyTicketsTab />}
        {activeTab === 'sprint-board' && <SprintBoardTab />}
        {activeTab === 'backlog' && <BacklogTab />}
      </div>
    </div>
  );
}

// ─── My Tickets Tab ─────────────────────────────────────────────────────────

function MyTicketsTab() {
  const [filter, setFilter] = useState<FilterOption>('All');
  const filters: FilterOption[] = ['All', 'In Progress', 'In Review', 'Blocked'];

  const filtered = filter === 'All'
    ? TICKETS
    : TICKETS.filter(t => t.status === filter);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Filter pills */}
      <div className="flex items-center gap-1.5">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
              filter === f
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ticket cards */}
      <div className="space-y-2">
        {filtered.map(ticket => (
          <div
            key={ticket.key}
            className={cn(
              'flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all hover:border-[var(--color-border-default)] cursor-pointer',
              ticket.status === 'Blocked'
                ? 'bg-[var(--color-bg-secondary)] border-red-500/30'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)]'
            )}
          >
            {ticket.status === 'Blocked' && (
              <StatusDot status="critical" pulse size="md" />
            )}
            <span className="text-[12px] font-mono text-[var(--color-text-muted)] shrink-0 w-16">{ticket.key}</span>
            <span className="text-[13px] font-semibold text-[var(--color-text-primary)] flex-1 min-w-0 truncate">{ticket.title}</span>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0', PRIORITY_COLORS[ticket.priority])}>{ticket.priority}</span>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0', STATUS_COLORS[ticket.status])}>{ticket.status}</span>
            <span className="text-[11px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)] shrink-0 tabular-nums">{ticket.points} pts</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)] shrink-0 w-24 text-right truncate">{ticket.assignee}</span>
          </div>
        ))}
      </div>

      <OrbitInsight>
        Based on sprint velocity, you&apos;ll carry over 5 items to Sprint 24. Consider cutting ENG-145 (API docs) — it&apos;s low priority and not customer-facing.
      </OrbitInsight>
    </div>
  );
}

// ─── Sprint Board Tab ───────────────────────────────────────────────────────

function SprintBoardTab() {
  const doneCount = SPRINT_BOARD_ITEMS.filter(i => i.status === 'Done').length;
  const totalCount = SPRINT_BOARD_ITEMS.length;
  const progressPercent = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      {/* Sprint progress */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Sprint 23 Progress</span>
          <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">{doneCount} of {totalCount} items &middot; {progressPercent}% complete</span>
        </div>
        <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `73%` }} />
        </div>
      </div>

      {/* Board columns */}
      <div className="grid grid-cols-4 gap-3">
        {SPRINT_COLUMNS.map(col => {
          const items = SPRINT_BOARD_ITEMS.filter(i => i.status === col.status);
          return (
            <div key={col.label} className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{col.label}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{items.length}</span>
              </div>
              {items.map(item => (
                <div
                  key={item.key}
                  className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-3 hover:border-[var(--color-border-default)] transition-all cursor-pointer"
                >
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)] mb-2 leading-snug">{item.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-full', PRIORITY_DOT[item.priority])} />
                      <span className="text-[10px] text-[var(--color-text-muted)]">{item.priority}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{item.points} pts</span>
                      <span className="w-5 h-5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[9px] font-bold text-[var(--color-text-muted)]">{item.assignee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Backlog Tab ────────────────────────────────────────────────────────────

function BacklogTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 gap-2 px-4 py-2.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Key</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest col-span-2">Title</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Priority</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Labels</span>
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest text-right">Points / Created</span>
        </div>

        {/* Rows */}
        {BACKLOG.map((item, i) => (
          <div
            key={item.key}
            className={cn(
              'grid grid-cols-6 gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors',
              i % 2 === 1 && 'bg-[var(--color-bg-stripe)]'
            )}
          >
            <span className="text-[12px] font-mono text-[var(--color-text-muted)]">{item.key}</span>
            <span className="text-[12px] font-medium text-[var(--color-text-primary)] col-span-2 truncate">{item.title}</span>
            <div>
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', PRIORITY_COLORS[item.priority])}>{item.priority}</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {item.labels.map(label => (
                <span key={label} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">{label}</span>
              ))}
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)] tabular-nums">{item.points} pts</span>
              <span className="text-[10px] text-[var(--color-text-muted)] ml-2">{item.created}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
