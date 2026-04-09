'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, Mail, Phone, Calendar, FileText } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Inline Mock Data ────────────────────────────────────────────────────────

type RelHealth = 'healthy' | 'warning' | 'critical' | 'info';

const CONTACTS = [
  { id: 1, name: 'Nina Patel', initials: 'NP', company: 'TechFlow', role: 'VP Engineering', lastInteraction: '8d ago', interactions: 12, health: 'critical' as RelHealth },
  { id: 2, name: 'James Chen', initials: 'JC', company: 'Acme Corp', role: 'CTO', lastInteraction: '1d ago', interactions: 24, health: 'healthy' as RelHealth },
  { id: 3, name: 'Maria Santos', initials: 'MS', company: 'Zenith Labs', role: 'VP Engineering', lastInteraction: '14d ago', interactions: 8, health: 'critical' as RelHealth },
  { id: 4, name: 'David Kim', initials: 'DK', company: 'TechFlow', role: 'CEO', lastInteraction: '3d ago', interactions: 15, health: 'healthy' as RelHealth },
  { id: 5, name: 'Rachel Green', initials: 'RG', company: 'DataNova', role: 'Head of Product', lastInteraction: '2d ago', interactions: 6, health: 'healthy' as RelHealth },
  { id: 6, name: 'Tom Wilson', initials: 'TW', company: 'Nexus AI', role: 'Director of Ops', lastInteraction: '5d ago', interactions: 9, health: 'warning' as RelHealth },
  { id: 7, name: 'Lisa Park', initials: 'LP', company: 'CloudShift', role: 'IT Director', lastInteraction: '4d ago', interactions: 11, health: 'healthy' as RelHealth },
  { id: 8, name: 'Alex Morgan', initials: 'AM', company: 'Zenith Labs', role: 'CTO', lastInteraction: '10d ago', interactions: 5, health: 'warning' as RelHealth },
];

const ACCOUNT_MAP = [
  { company: 'TechFlow', contacts: ['Nina Patel (VP Eng)', 'David Kim (CEO)', 'Sam Lee (Tech Lead)'], count: 3 },
  { company: 'Acme Corp', contacts: ['James Chen (CTO)', 'Karen Wu (VP Product)'], count: 2 },
  { company: 'Zenith Labs', contacts: ['Maria Santos (VP Eng)', 'Alex Morgan (CTO)'], count: 2 },
  { company: 'DataNova', contacts: ['Rachel Green (Head of Product)'], count: 1 },
  { company: 'Nexus AI', contacts: ['Tom Wilson (Dir Ops)', 'Priya Nair (CFO)'], count: 2 },
  { company: 'CloudShift', contacts: ['Lisa Park (IT Dir)'], count: 1 },
];

type ActivityType = 'email' | 'call' | 'meeting' | 'note';

const ACTIVITY_FEED: Array<{
  id: number; type: ActivityType; contact: string; company: string;
  description: string; time: string;
}> = [
  { id: 1, type: 'email', contact: 'James Chen', company: 'Acme Corp', description: 'Sent revised pricing proposal with volume discount tiers', time: '1h ago' },
  { id: 2, type: 'meeting', contact: 'David Kim', company: 'TechFlow', description: 'Product demo — focused on Agent Builder v2 capabilities', time: '3h ago' },
  { id: 3, type: 'call', contact: 'Lisa Park', company: 'CloudShift', description: 'Discovery call — discussed integration requirements and timeline', time: '5h ago' },
  { id: 4, type: 'note', contact: 'Tom Wilson', company: 'Nexus AI', description: 'Procurement review delayed — budget cycle pushed to next month', time: '1d ago' },
  { id: 5, type: 'email', contact: 'Rachel Green', company: 'DataNova', description: 'Shared case study and ROI calculator', time: '1d ago' },
  { id: 6, type: 'call', contact: 'Maria Santos', company: 'Zenith Labs', description: 'Left voicemail — no response yet', time: '3d ago' },
  { id: 7, type: 'meeting', contact: 'James Chen', company: 'Acme Corp', description: 'Technical deep-dive with their engineering team', time: '3d ago' },
];

const ACTIVITY_ICONS: Record<ActivityType, typeof Mail> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
};

const HEALTH_LABELS: Record<RelHealth, string> = {
  healthy: 'Strong',
  warning: 'Cooling',
  critical: 'Cold',
  info: 'New',
};

// ─── Component ───────────────────────────────────────────────────────────────

type RelTab = 'contacts' | 'accounts' | 'activity';

export function RelationshipsPage() {
  const [activeTab, setActiveTab] = useState<RelTab>('contacts');

  const tabs = [
    { id: 'contacts' as const, label: 'Key Contacts' },
    { id: 'accounts' as const, label: 'Account Map' },
    { id: 'activity' as const, label: 'Activity Feed' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Users} title="Relationships" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'contacts' && <KeyContactsTab />}
        {activeTab === 'accounts' && <AccountMapTab />}
        {activeTab === 'activity' && <ActivityFeedTab />}
      </div>
    </div>
  );
}

// ─── Key Contacts Tab ────────────────────────────────────────────────────────

function KeyContactsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        {CONTACTS.map(contact => (
          <div
            key={contact.id}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[var(--color-text-muted)]">{contact.initials}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{contact.name}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{contact.company}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                <span>{contact.role}</span>
                <span>·</span>
                <span>Last: {contact.lastInteraction}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[10px] font-medium text-[var(--color-text-muted)] tabular-nums">
                {contact.interactions} touches
              </span>
              <div className="flex items-center gap-1.5">
                <StatusDot status={contact.health} size="md" />
                <span className={cn(
                  'text-[10px] font-medium',
                  contact.health === 'healthy' ? 'text-[var(--color-status-healthy)]' :
                  contact.health === 'warning' ? 'text-[var(--color-status-warning)]' :
                  'text-[var(--color-status-critical)]'
                )}>
                  {HEALTH_LABELS[contact.health]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <OrbitInsight>
        You haven&apos;t spoken to Nina Patel (TechFlow) in 8 days &mdash; she&apos;s the technical decision maker. Consider reaching out before Thursday&apos;s demo.
      </OrbitInsight>
    </div>
  );
}

// ─── Account Map Tab ─────────────────────────────────────────────────────────

function AccountMapTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      {ACCOUNT_MAP.map(account => (
        <div
          key={account.company}
          className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{account.company}</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[10px] font-medium text-[var(--color-text-muted)] tabular-nums">
              {account.count} contacts
            </span>
          </div>
          <div className="space-y-1.5 ml-3">
            {account.contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
                <span className="text-[12px] text-[var(--color-text-secondary)]">{c}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity Feed Tab ───────────────────────────────────────────────────────

function ActivityFeedTab() {
  return (
    <div className="space-y-2 max-w-4xl">
      {ACTIVITY_FEED.map(activity => {
        const Icon = ACTIVITY_ICONS[activity.type];
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">{activity.contact}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{activity.company}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] ml-auto shrink-0">{activity.time}</span>
              </div>
              <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{activity.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
