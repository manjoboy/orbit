'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit, type ActivePanel, type Section } from '../orbit-app';
import { BRIEFING_SECTIONS, type BriefingSection } from '@/lib/briefing-data';
import { Search, Filter, CheckSquare, Archive, Star, Reply, Tag, Clock, AlertCircle, Mail, MessageSquare, GitPullRequest, ChevronRight, Inbox } from 'lucide-react';
import { DetailCanvas } from '../canvas/detail-canvas';
import { PageHeader } from '../ui/page-header';
import { FlatTabs } from '../ui/tabs';
import { StatusDot } from '../ui/status-dot';
import { EmptyState } from '../ui/empty-state';
import { Button } from '../ui/button';

type InboxTab = 'priority' | 'all' | 'flagged' | 'done';

const AVATAR_COLORS: Record<string, string> = {
  'Sarah Chen': 'bg-pink-500',
  'David Park (CFO)': 'bg-blue-500',
  'Jordan Liu': 'bg-teal-500',
  'Alex Rivera': 'bg-purple-500',
};

const ALL_INBOX_ITEMS = [
  { id: 1, from: 'Sarah Chen', role: 'Staff Engineer', time: '2h', subject: 'Critical auth dependency — workaround vs. 2-day delay', preview: 'I\'ve hit a blocker on the auth migration. The OAuth lib v4.x changed their token refresh API...', urgency: true, unread: true, tag: 'Engineering', panelType: 'person' as const },
  { id: 2, from: 'David Park (CFO)', role: 'CFO', time: '4h', subject: 'Q2 budget — headcount projections due EOD', preview: 'Q2 budget cycle closes at 5pm today. I need engineering headcount projections for the board...', urgency: true, unread: true, tag: 'Finance', panelType: 'person' as const },
  { id: 3, from: 'Jordan Liu', role: 'Engineer II', time: '8h', subject: 'Enterprise SSO architecture — waiting on your approval', preview: 'PR #852 is up for the Enterprise SSO architecture. Went with SAML 2.0 — covered the rationale...', urgency: false, unread: true, tag: 'Engineering', panelType: 'person' as const },
  { id: 4, from: 'Alex Rivera', role: 'Senior Engineer', time: '2d', subject: 'PR #847: Payment pipeline refactor — 2 days waiting', preview: 'PR #847 is ready for review — payment pipeline refactor. This also fixes the Acme bug (#1203)...', urgency: false, unread: false, tag: 'Engineering', panelType: 'person' as const },
  { id: 5, from: 'Mei Zhang', role: 'VP Product', time: '3d', subject: 'Q2 roadmap reprioritization — your input needed', preview: 'Following up on our product review. I\'ve drafted the Q2 roadmap doc. Need your sign-off before...', urgency: false, unread: false, tag: 'Product', panelType: 'person' as const },
  { id: 6, from: 'James (CTO)', role: 'CTO', time: '5d', subject: 'Auth migration: leaning toward phased rollout', preview: 'Wanted to share my thinking on the auth migration. After talking with Sarah I\'m leaning toward...', urgency: false, unread: false, tag: 'Leadership', panelType: 'person' as const },
];

const SENT_ITEMS = [
  { id: 10, to: 'Sarah Chen', time: '1d', subject: 'Re: Auth dependency — evaluating options', preview: 'Thanks for flagging this early. I\'m reviewing the adapter proposal with James before deciding...' },
  { id: 11, to: 'David Park (CFO)', time: '1w', subject: 'Q1 headcount recap', preview: 'As discussed, here\'s the summary of Q1 headcount spend vs. plan...' },
  { id: 12, to: 'Mei Zhang', time: '1w', subject: 'Re: Product roadmap sync', preview: 'I\'ll have my input on the Q2 priorities to you by Friday. A few thoughts on the Agent Builder...' },
];

const TAG_COLORS: Record<string, string> = {
  Engineering: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Finance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Product: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Leadership: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function InboxPage() {
  const { setActivePanel, setActiveSection, activePanel } = useOrbit();
  const [activeTab, setActiveTab] = useState<InboxTab>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const isPanelOpen = activePanel.type !== null;

  const inboxSection = BRIEFING_SECTIONS.find(s => s.id === 'inbox') as Extract<BriefingSection, { type: 'item-list' }> | undefined;

  const filteredItems = ALL_INBOX_ITEMS.filter(item => {
    if (activeTab === 'priority') return item.urgency || item.unread;
    if (activeTab === 'flagged') return item.urgency;
    if (activeTab === 'done') return !item.unread;
    return true;
  }).filter(item =>
    searchQuery ? item.subject.toLowerCase().includes(searchQuery.toLowerCase()) || item.from.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const tabs: Array<{ id: InboxTab; label: string; count?: number }> = [
    { id: 'priority', label: 'Priority', count: ALL_INBOX_ITEMS.filter(i => i.urgency || i.unread).length },
    { id: 'all', label: 'All', count: ALL_INBOX_ITEMS.length },
    { id: 'flagged', label: 'Flagged', count: ALL_INBOX_ITEMS.filter(i => i.urgency).length },
    { id: 'done', label: 'Done' },
  ];

  const handleSelectItem = (item: typeof ALL_INBOX_ITEMS[0]) => {
    setSelectedId(item.id);
    // Find matching briefing data for rich context
    const briefingItem = inboxSection?.items.find(b => b.from === item.from);
    setActivePanel({
      type: item.panelType,
      title: item.subject,
      data: {
        ...(briefingItem ?? {}),
        name: item.from,
        role: item.role,
        from: item.from,
        title: item.subject,
      },
    });
    setActiveSection('inbox' as Section);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main inbox list */}
      <div className={cn(
        'flex flex-col transition-all duration-300',
        isPanelOpen ? 'w-[420px] min-w-[420px]' : 'flex-1'
      )}>
        {/* Inbox header */}
        <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PageHeader icon={Inbox} title="Inbox" />
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-[11px] font-bold flex items-center justify-center">4</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm"><Filter className="w-3 h-3" />Filter</Button>
              <Button variant="primary" size="sm"><CheckSquare className="w-3 h-3" />Mark all read</Button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-border-strong)] transition-colors">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search inbox..."
              className="flex-1 bg-transparent text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center',
                    activeTab === tab.id ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                  )}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Inbox items */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'done' ? (
            /* Sent view */
            <div className="px-3 py-3 space-y-1">
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Sent</span>
              </div>
              {SENT_ITEMS.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">{item.to.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">To: {item.to}</span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">{item.time} ago</span>
                    </div>
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{item.subject}</p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)] truncate mt-0.5">{item.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              variant="search"
              title="No items found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          ) : (
            <div className="px-3 py-3 space-y-1">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150',
                    selectedId === item.id
                      ? 'bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/25'
                      : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)]',
                    item.urgency && 'border-l-2 border-l-orange-500',
                  )}
                >
                  {/* Avatar */}
                  <div className={cn('w-9 h-9 rounded-full shrink-0 flex items-center justify-center mt-0.5', AVATAR_COLORS[item.from] ?? 'bg-gray-500')}>
                    <span className="text-[10px] font-bold text-white">{item.from.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Row 1: name + time + unread dot */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('text-[13px] font-semibold', item.unread ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]')}>
                        {item.from}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{item.role}</span>
                      <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        {item.urgency && <AlertCircle className="w-3 h-3 text-red-400" />}
                        {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                        <span className="text-[11px] text-[var(--color-text-muted)]">{item.time}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <p className={cn('text-[12px] truncate', item.unread ? 'font-medium text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]')}>
                      {item.subject}
                    </p>

                    {/* Preview + tag */}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] text-[var(--color-text-tertiary)] truncate flex-1">{item.preview}</p>
                      {item.tag && (
                        <span className={cn('shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-md border', TAG_COLORS[item.tag] ?? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]')}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail canvas */}
      {isPanelOpen && (
        <div className="flex-1 border-l border-[var(--color-border-subtle)] overflow-hidden">
          <DetailCanvas />
        </div>
      )}
    </div>
  );
}
