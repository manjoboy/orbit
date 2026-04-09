'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getGreeting } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import { Layers, MessageSquare, Map, GitBranch, ChevronRight } from 'lucide-react';
import { StatusDot } from '@/components/ui/status-dot';
import { OrbitInsight } from '@/components/ui/orbit-insight';
import { Button } from '@/components/ui/button';
import {
  AgentActionCard,
  DashboardMetric,
  QuickActions,
  DashboardSection,
} from './shared-cards';
import {
  PRD_ITEMS,
  FEEDBACK_THEMES,
  SPRINT_ITEMS,
  SPRINT_METRICS,
  PRODUCT_AGENT_ACTIONS,
  PRODUCT_SUMMARY,
} from '@/lib/persona-data/product-data';
import { useBriefingStream } from '@/lib/hooks/useBriefingStream';
import { useAgent } from '@/lib/agent-context';
import type { BriefingInsight } from '@/lib/agent-types';

// ─── Status badge colors ───
const STATUS_COLORS: Record<string, string> = {
  'Draft': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]',
  'In Review': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Blocked': 'bg-red-500/10 text-red-400 border-red-500/20',
  'In Progress': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Done': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'To Do': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]',
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]';
}

// ─── Sentiment colors ───
function getSentimentColor(sentiment: string): 'healthy' | 'warning' | 'critical' {
  if (sentiment === 'positive') return 'healthy';
  if (sentiment === 'mixed' || sentiment === 'neutral') return 'warning';
  return 'critical';
}

export function ProductDashboard() {
  const { userName } = useOrbit();
  const { addAction } = useAgent();
  const briefing = useBriefingStream('product', userName);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    briefing.startBriefing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInsightAction = (insight: BriefingInsight, action: BriefingInsight['proposedActions'][number]) => {
    addAction({
      type: action.type,
      title: insight.headline,
      description: action.description,
      reasoning: insight.reasoning,
      confidence: insight.urgency === 'high' ? 0.9 : insight.urgency === 'medium' ? 0.75 : 0.6,
      sources: insight.sources,
      persona: 'product',
      origin: 'briefing',
    });
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Sprint metrics (derive from latest sprint entry)
  const latestSprint = SPRINT_METRICS?.[SPRINT_METRICS.length - 1];
  const velocity = latestSprint?.completed ?? 34;
  const sprintDone = latestSprint?.completed ?? 12;
  const sprintTotal = latestSprint?.planned ?? 18;
  const carryOver = latestSprint?.carryover ?? 3;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={cn(
        'px-5 md:px-7 py-6 transition-all duration-500',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            {getGreeting(userName)}
          </h1>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">{dateStr}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/15 text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              2 PRDs need review
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              34 feedback signals
            </span>
          </div>
        </div>

        {/* Two column layout */}
        <div className="flex gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Agent Action Card */}
            <AgentActionCard
              isStreaming={briefing.state.status === 'streaming'}
              briefingState={briefing.state}
              onInsightAction={handleInsightAction}
            />

            {/* PRD Action Items */}
            <DashboardSection title="PRD Action Items" count={(PRD_ITEMS ?? []).length || 3}>
              <div className="space-y-2">
                {(PRD_ITEMS ?? [
                  { title: 'Agent Builder v2 — Visual Flow Editor', status: 'In Review', blocker: null, insight: 'Engineering approved technical feasibility. Design needs final sign-off.', owner: 'You' },
                  { title: 'Enterprise SSO & Permissions', status: 'Draft', blocker: 'Awaiting security audit results', insight: 'Blocker expected to clear by Friday — security team confirmed timeline.', owner: 'You' },
                  { title: 'API Rate Limiting Overhaul', status: 'Approved', blocker: null, insight: 'Sprint-ready. Jordan has bandwidth starting next week.', owner: 'Jordan Liu' },
                ]).slice(0, 4).map((prd, i) => (
                  <div
                    key={i}
                    className={cn(
                      'px-4 py-3.5 rounded-xl transition-all duration-150',
                      'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                      'hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{prd.title}</span>
                      <span className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ml-2',
                        getStatusColor(prd.status)
                      )}>
                        {prd.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mb-1.5">
                      <span>{prd.owner}</span>
                      {prd.blockers && prd.blockers.length > 0 && (
                        <>
                          <span>&middot;</span>
                          <span className="text-[var(--color-status-critical)] font-medium flex items-center gap-1">
                            <StatusDot status="critical" size="sm" />
                            {prd.blockers[0]}
                          </span>
                        </>
                      )}
                    </div>
                    {prd.agentInsight && (
                      <div className="flex items-start gap-1.5 mt-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1 h-1 rounded-full bg-white/90" />
                        </div>
                        <p className="text-[11px] text-[var(--color-accent)] leading-relaxed">{prd.agentInsight}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DashboardSection>

            {/* Feedback Synthesis */}
            <DashboardSection title="Feedback Synthesis" count={(FEEDBACK_THEMES ?? []).length || 4}>
              <div className="space-y-2">
                {(FEEDBACK_THEMES ?? [
                  { theme: 'Agent Builder Complexity', mentions: 34, trend: '+42%', sentiment: 'negative' },
                  { theme: 'API Documentation Gaps', mentions: 21, trend: '+12%', sentiment: 'negative' },
                  { theme: 'Dashboard Performance', mentions: 15, trend: '-8%', sentiment: 'mixed' },
                  { theme: 'SSO Support', mentions: 12, trend: '+25%', sentiment: 'neutral' },
                ]).slice(0, 5).map((theme, i) => {
                  const maxMentions = 40;
                  const barWidth = Math.min((theme.mentions / maxMentions) * 100, 100);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]"
                    >
                      <StatusDot status={getSentimentColor(theme.sentiment)} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{theme.theme}</span>
                          <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums shrink-0 ml-2">{theme.mentions} mentions</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              theme.sentiment === 'negative' ? 'bg-[var(--color-status-critical)]/60' :
                              theme.sentiment === 'mixed' ? 'bg-[var(--color-status-warning)]/60' :
                              'bg-[var(--color-chart-1)]'
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium tabular-nums shrink-0',
                        theme.trend.startsWith('+') ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-status-healthy)]'
                      )}>
                        {theme.trend}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DashboardSection>

            {/* Sprint Board Mini */}
            <DashboardSection title="Current Sprint">
              <div className="grid grid-cols-3 gap-3">
                {['To Do', 'In Progress', 'Done'].map((status) => {
                  const items = (SPRINT_ITEMS ?? [
                    { title: 'Flow editor drag-drop', status: 'In Progress', priority: 'high' },
                    { title: 'SSO Okta integration', status: 'In Progress', priority: 'high' },
                    { title: 'API rate limit headers', status: 'To Do', priority: 'medium' },
                    { title: 'Dashboard cache layer', status: 'To Do', priority: 'low' },
                    { title: 'Onboarding wizard v2', status: 'Done', priority: 'high' },
                    { title: 'Webhook retry logic', status: 'Done', priority: 'medium' },
                    { title: 'Billing page redesign', status: 'Done', priority: 'low' },
                  ]).filter((item) => item.status === status);

                  return (
                    <div key={status} className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-3">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <StatusDot
                          status={status === 'Done' ? 'healthy' : status === 'In Progress' ? 'info' : 'neutral'}
                          size="sm"
                        />
                        <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{status}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{items.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {items.slice(0, 3).map((item, j) => (
                          <div key={j} className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                            <p className="text-[11px] text-[var(--color-text-secondary)] leading-tight">{item.title}</p>
                            <span className={cn(
                              'text-[9px] font-medium mt-0.5 inline-block',
                              item.priority === 'p0' ? 'text-[var(--color-status-critical)]' :
                              item.priority === 'p1' ? 'text-[var(--color-status-warning)]' :
                              'text-[var(--color-text-muted)]'
                            )}>
                              {item.priority.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DashboardSection>
          </div>

          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-5 w-[260px] shrink-0">
            {/* Sprint Health */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Sprint Health</span>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">Velocity</span>
                    <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">{velocity} pts</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">Progress</span>
                    <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums">{sprintDone}/{sprintTotal} items</span>
                  </div>
                  <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-status-healthy)] transition-all"
                      style={{ width: `${Math.round((sprintDone / sprintTotal) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--color-text-secondary)]">Carry-over</span>
                  <span className={cn(
                    'text-[13px] font-bold tabular-nums',
                    carryOver > 2 ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-text-primary)]'
                  )}>
                    {carryOver} items
                  </span>
                </div>
              </div>
            </div>

            {/* Roadmap Status */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Roadmap Status</span>
              <div className="mt-3 space-y-3">
                {([
                  { name: 'Agent Builder v2', progress: 65 },
                  { name: 'Enterprise SSO', progress: 30 },
                  { name: 'API v3', progress: 10 },
                ] as const).map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[var(--color-text-secondary)]">{item.name}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-chart-1)] transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest block mb-3">Quick Actions</span>
              <QuickActions actions={[
                { icon: Layers, label: 'Create Feature' },
                { icon: MessageSquare, label: 'Schedule Interview' },
                { icon: Map, label: 'Update Roadmap' },
              ]} />
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
