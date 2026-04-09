'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getGreeting } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import { Phone, Mail, PlusCircle, Users, Clock, Calendar, ChevronRight } from 'lucide-react';
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
  SALES_DEALS,
  SALES_CONTACTS,
  DEMO_PREPS,
  AGENT_ACTIONS as SALES_AGENT_ACTIONS,
  SALES_SUMMARY,
  COMPETITOR_THREATS,
} from '@/lib/persona-data/sales-data';
import { useBriefingStream } from '@/lib/hooks/useBriefingStream';
import { useAgent } from '@/lib/agent-context';
import { createAgentAction } from '@/lib/agent-types';
import type { BriefingInsight } from '@/lib/agent-types';

// ─── Stage badge colors ───
const STAGE_COLORS: Record<string, string> = {
  'Discovery': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Proposal': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Negotiation': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Closed Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Closed Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Demo': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Qualification': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]';
}

export function SalesDashboard() {
  const { userName } = useOrbit();
  const { addAction } = useAgent();
  const briefing = useBriefingStream('sales', userName);
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
      persona: 'sales',
      origin: 'briefing',
    });
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Quota progress
  const quotaPercent = SALES_SUMMARY?.quotaAttainment ?? 62;
  const totalPipeline = SALES_SUMMARY?.pipelineValue ?? '$1.2M';
  const weightedPipeline = SALES_SUMMARY?.weightedPipeline ?? '$490K';

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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              3 deals need attention
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/15 text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              $490K in negotiation
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

            {/* Deal Pulse */}
            <DashboardSection title="Deal Pulse" count={SALES_DEALS?.length ?? 4}>
              <div className="space-y-2">
                {(SALES_DEALS ?? [
                  { company: 'Acme Corp', value: '$120K', stage: 'Negotiation', health: 'healthy' as const, daysInStage: 12, nextStep: 'Call with Lisa Huang (Thu)' },
                  { company: 'TechFlow Inc', value: '$85K', stage: 'Proposal', health: 'warning' as const, daysInStage: 8, nextStep: 'Follow up on pricing concerns' },
                  { company: 'DataPrime', value: '$200K', stage: 'Discovery', health: 'healthy' as const, daysInStage: 3, nextStep: 'Technical deep-dive (Mon)' },
                  { company: 'CloudBase', value: '$85K', stage: 'Negotiation', health: 'critical' as const, daysInStage: 21, nextStep: 'Legal review pending' },
                ]).slice(0, 4).map((deal, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150',
                      'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                      'hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer'
                    )}
                  >
                    <StatusDot status={deal.health === 'at-risk' ? 'warning' : deal.health} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{deal.company}</span>
                        <span className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                          getStageColor(deal.stage)
                        )}>
                          {deal.stage}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">{deal.nextStep}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[14px] font-bold text-[var(--color-text-primary)] tabular-nums">{deal.value}</span>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        <Clock className="w-3 h-3 inline mr-0.5" />{deal.daysInStage}d in stage
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardSection>

            {/* Colleague Intel */}
            <DashboardSection title="Colleague Intel" count={3}>
              <div className="space-y-2">
                {(SALES_CONTACTS ?? [
                  { name: 'Lisa Huang', insight: 'Recently promoted to VP Engineering at Acme Corp. Shared a post about scaling infrastructure challenges — strong opening for enterprise pitch.' },
                  { name: 'Marcus Chen', insight: 'TechFlow CTO mentioned budget cuts in Q2 all-hands. Your proposal may need a phased approach to land.' },
                  { name: 'Sarah Walsh', insight: 'DataPrime Head of Product liked your competitor analysis post on LinkedIn. Good signal for the discovery call Monday.' },
                ]).slice(0, 3).map((contact, i) => (
                  <OrbitInsight key={i} label="Orbit Insight" actionLabel="View details">
                    <strong className="text-[var(--color-text-primary)]">{contact.name}</strong>: {contact.notes}
                  </OrbitInsight>
                ))}
              </div>
            </DashboardSection>

            {/* Demo Prep */}
            <DashboardSection title="Demo Prep">
              {(() => {
                const demo = DEMO_PREPS?.[0] ?? {
                  company: 'DataPrime',
                  date: 'Monday at 2:00 PM',
                  attendees: ['Sarah Walsh (Head of Product)', 'James Liu (CTO)', 'Maria Garcia (VP Eng)'],
                  talkingPoints: [
                    'Focus on API-first architecture — key requirement from discovery call',
                    'Show enterprise SSO demo — they use Okta internally',
                    'Address data residency concerns (EU requirement)',
                  ],
                  objections: [
                    'Price: 40% higher than current vendor — emphasize TCO savings',
                    'Migration: Show automated migration tool, reference Acme case study',
                  ],
                };

                return (
                  <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{demo.company}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                          <Calendar className="w-3 h-3" />
                          <span>{demo.date}</span>
                        </div>
                      </div>
                      <Button variant="primary" size="sm">Open Prep</Button>
                    </div>

                    {/* Attendees */}
                    <div className="mb-3">
                      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">Attendees</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {demo.attendees.map((a: string) => (
                          <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                            <Users className="w-2.5 h-2.5" />{a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Talking Points */}
                    <div className="mb-3">
                      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">Talking Points</p>
                      <ul className="space-y-1">
                        {demo.talkingPoints.map((tp: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)]">
                            <ChevronRight className="w-3 h-3 text-[var(--color-accent)] shrink-0 mt-0.5" />
                            {tp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Objection Prep */}
                    <div>
                      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">Objection Prep</p>
                      <ul className="space-y-1">
                        {demo.objections.map((obj: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--color-text-tertiary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </DashboardSection>
          </div>

          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-5 w-[260px] shrink-0">
            {/* Pipeline Snapshot */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Pipeline Snapshot</span>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">Total Pipeline</span>
                    <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">{totalPipeline}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">Weighted</span>
                    <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums">{weightedPipeline}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">Quota Progress</p>
                  <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        quotaPercent >= 80 ? 'bg-[var(--color-status-healthy)]' :
                        quotaPercent >= 50 ? 'bg-[var(--color-status-warning)]' :
                        'bg-[var(--color-status-critical)]'
                      )}
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1 tabular-nums">{quotaPercent}% of quarterly target</p>
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Reminders</span>
              <div className="mt-3 space-y-2.5">
                {[
                  { text: 'Send Acme upsell proposal', done: false },
                  { text: 'Follow up with TechFlow on pricing', done: false },
                  { text: 'Update CRM notes for DataPrime', done: false },
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      defaultChecked={item.done}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-[var(--color-border-default)] bg-transparent accent-[var(--color-accent)]"
                    />
                    <span className={cn(
                      'text-[12px] leading-tight',
                      item.done ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
                    )}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest block mb-3">Quick Actions</span>
              <QuickActions actions={[
                { icon: Phone, label: 'Log Call' },
                { icon: Mail, label: 'Draft Email' },
                { icon: PlusCircle, label: 'Create Deal' },
              ]} />
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
