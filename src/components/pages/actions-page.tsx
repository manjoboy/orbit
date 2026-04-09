'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { FlatTabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { ActionQueueCard } from '@/components/cards/action-queue-card';
import { useAgent } from '@/lib/agent-context';
import type { AgentActionStatus } from '@/lib/agent-types';

type TabId = 'all' | 'pending' | 'approved' | 'dismissed';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Completed' },
  { id: 'dismissed', label: 'Dismissed' },
];

export function ActionsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const { actions, approveAction, dismissAction, pendingCount } = useAgent();

  const filteredActions = actions.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'approved') return a.status === 'completed' || a.status === 'approved';
    if (activeTab === 'dismissed') return a.status === 'dismissed';
    return true;
  });

  // Sort: pending first, then by date
  const sortedActions = [...filteredActions].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Build tab data with counts
  const tabsWithBadges = TABS.map((tab) => {
    let count: number | undefined;
    if (tab.id === 'pending') count = pendingCount;
    else if (tab.id === 'all') count = actions.length;
    return { ...tab, count };
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-5 py-6">
        <PageHeader
          icon={Zap}
          title="Agent Actions"
          subtitle="Review, approve, or dismiss actions proposed by Orbit"
        />

        <div className="mt-5 mb-4">
          <FlatTabs
            tabs={tabsWithBadges}
            active={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
          />
        </div>

        {sortedActions.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No actions yet"
            description={
              activeTab === 'all'
                ? 'Orbit will propose actions as insights emerge from your briefing and chat.'
                : `No ${activeTab} actions right now.`
            }
          />
        ) : (
          <div className="space-y-3">
            {sortedActions.map((action) => (
              <ActionQueueCard
                key={action.id}
                action={action}
                onApprove={approveAction}
                onDismiss={dismissAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
