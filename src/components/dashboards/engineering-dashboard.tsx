'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getGreeting } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import { Target, Rocket, FlaskConical, GitPullRequest, Clock, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
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
  TICKETS,
  PULL_REQUESTS,
  DEPLOYMENTS,
  ENGINEERING_AGENT_ACTIONS,
  ENGINEERING_SUMMARY,
} from '@/lib/persona-data/engineering-data';
import { useBriefingStream } from '@/lib/hooks/useBriefingStream';
import { useAgent } from '@/lib/agent-context';
import type { BriefingInsight } from '@/lib/agent-types';

// ─── Priority badge colors ───
const PRIORITY_COLORS: Record<string, string> = {
  'critical': 'bg-red-500/10 text-red-400 border-red-500/20',
  'high': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'medium': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'low': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]',
};

// ─── CI status badges ───
const CI_COLORS: Record<string, string> = {
  'passing': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'failing': 'bg-red-500/10 text-red-400 border-red-500/20',
  'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'running': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

// ─── Deploy status badges ───
const DEPLOY_COLORS: Record<string, string> = {
  'success': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'failed': 'bg-red-500/10 text-red-400 border-red-500/20',
  'rolling': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'rolled-back': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'scheduled': 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]',
};

export function EngineeringDashboard() {
  const { userName } = useOrbit();
  const { addAction } = useAgent();
  const briefing = useBriefingStream('engineering', userName);
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
      persona: 'engineering',
      origin: 'briefing',
    });
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Ticket groups
  const allTickets = TICKETS ?? [
    { id: 'ENG-847', title: 'Payment pipeline refactor', status: 'In Review', priority: 'critical', assignee: 'Jordan Liu', daysOpen: 4 },
    { id: 'ENG-852', title: 'Auth migration — phase 2', status: 'In Progress', priority: 'high', assignee: 'Sarah Chen', daysOpen: 6 },
    { id: 'ENG-855', title: 'Rate limiter middleware', status: 'In Progress', priority: 'medium', assignee: 'Alex Rivera', daysOpen: 2 },
    { id: 'ENG-860', title: 'Enterprise SSO — Okta connector', status: 'Blocked', priority: 'high', assignee: 'Jordan Liu', daysOpen: 8 },
    { id: 'ENG-863', title: 'Dashboard caching layer', status: 'In Review', priority: 'medium', assignee: 'You', daysOpen: 1 },
    { id: 'ENG-841', title: 'Webhook retry with exponential backoff', status: 'In Progress', priority: 'low', assignee: 'Maria Garcia', daysOpen: 3 },
  ];

  const allPRs = PULL_REQUESTS ?? [
    { id: '#847', title: 'refactor: payment pipeline batch processing', author: 'Jordan Liu', age: '2d', additions: 342, deletions: 128, ciStatus: 'passing', summary: 'Fixes customer-reported bug in batch payment processing. Adds retry logic.' },
    { id: '#851', title: 'feat: enterprise SSO SAML flow', author: 'Sarah Chen', age: '1d', additions: 567, deletions: 89, ciStatus: 'failing', summary: 'SAML assertion validation failing on edge case — needs test fixture update.' },
    { id: '#853', title: 'fix: rate limiter token bucket overflow', author: 'Alex Rivera', age: '4h', additions: 45, deletions: 12, ciStatus: 'passing', summary: 'Small but critical fix — prevents 429 storm under burst traffic.' },
    { id: '#855', title: 'chore: upgrade Next.js to 15.2', author: 'Maria Garcia', age: '3d', additions: 23, deletions: 18, ciStatus: 'pending', summary: 'Dependency update. Waiting on CI cache rebuild.' },
  ];

  const allDeploys = DEPLOYMENTS ?? [
    { id: 'deploy-294', service: 'api-gateway', version: 'v2.14.1', status: 'success', time: '2h ago', riskNote: null },
    { id: 'deploy-293', service: 'payment-service', version: 'v1.8.0', status: 'success', time: '6h ago', riskNote: 'Contains payment pipeline refactor — monitor error rates closely.' },
    { id: 'deploy-292', service: 'auth-service', version: 'v3.2.0-rc1', status: 'scheduled', time: 'Tomorrow 6am', riskNote: 'Auth migration phase 2 — rollback plan ready. Coordinate with Sarah.' },
  ];

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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              4 PRs need review
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/15 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              1 blocked ticket
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

            {/* Sprint Board */}
            <DashboardSection title="Sprint Board" count={allTickets.length}>
              <div className="space-y-4">
                {['In Progress', 'In Review', 'Blocked'].map((status) => {
                  const tickets = allTickets.filter((t) => t.status === status);
                  if (tickets.length === 0) return null;

                  const statusDot = status === 'Blocked' ? 'critical' : status === 'In Review' ? 'warning' : 'info';

                  return (
                    <div key={status}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <StatusDot status={statusDot as 'critical' | 'warning' | 'info'} size="sm" />
                        <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{status}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{tickets.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {tickets.map((ticket, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150',
                              'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                              'hover:border-[var(--color-border-default)] cursor-pointer',
                              status === 'Blocked' && 'border-l-2 border-l-red-500'
                            )}
                          >
                            <span className={cn(
                              'text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0',
                              PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS['low']
                            )}>
                              {ticket.priority}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{ticket.id}</span>
                                <span className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">{ticket.title}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-[var(--color-text-muted)]">{ticket.assignee}</span>
                              <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{ticket.storyPoints}sp</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DashboardSection>

            {/* PR Review Queue */}
            <DashboardSection title="PR Review Queue" count={allPRs.length}>
              <div className="space-y-2">
                {allPRs.map((pr, i) => (
                  <div
                    key={i}
                    className={cn(
                      'px-4 py-3 rounded-xl transition-all duration-150',
                      'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                      'hover:border-[var(--color-border-default)] cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-mono text-[var(--color-accent)] shrink-0">{pr.id}</span>
                        <span className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">{pr.title}</span>
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ml-2',
                        CI_COLORS[pr.ciStatus] || CI_COLORS['pending']
                      )}>
                        CI {pr.ciStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                      <span>{pr.author}</span>
                      <span>&middot;</span>
                      <span className="tabular-nums">{pr.age}</span>
                      <span>&middot;</span>
                      <span className="tabular-nums">
                        <span className="text-emerald-400">+{pr.linesAdded}</span>
                        {' '}
                        <span className="text-red-400">-{pr.linesRemoved}</span>
                      </span>
                    </div>
                    {pr.agentSummary && (
                      <div className="flex items-start gap-1.5 mt-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1 h-1 rounded-full bg-white/90" />
                        </div>
                        <p className="text-[11px] text-[var(--color-accent)] leading-relaxed">{pr.agentSummary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DashboardSection>

            {/* Deploy Pipeline */}
            <DashboardSection title="Deploy Pipeline" count={allDeploys.length}>
              <div className="space-y-2">
                {allDeploys.map((deploy, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl',
                      'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]'
                    )}
                  >
                    <StatusDot
                      status={deploy.status === 'success' ? 'healthy' : deploy.status === 'failed' ? 'critical' : deploy.status === 'rolling' ? 'warning' : 'info'}
                      size="md"
                      pulse={deploy.status === 'rolling'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">{deploy.service}</span>
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{deploy.version}</span>
                        <span className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                          DEPLOY_COLORS[deploy.status] || DEPLOY_COLORS['scheduled']
                        )}>
                          {deploy.status}
                        </span>
                      </div>
                      {deploy.agentNote && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-1 h-1 rounded-full bg-white/90" />
                          </div>
                          <p className="text-[11px] text-[var(--color-accent)] leading-relaxed">{deploy.agentNote}</p>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{deploy.timestamp}</span>
                  </div>
                ))}
              </div>
            </DashboardSection>
          </div>

          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-5 w-[260px] shrink-0">
            {/* Workstream Priorities */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Workstream Priorities</span>
              <div className="mt-3 space-y-2.5">
                {([
                  { rank: 1, name: 'Auth Migration', status: 'healthy' },
                  { rank: 2, name: 'Enterprise SSO', status: 'warning' },
                  { rank: 3, name: 'Payment Pipeline', status: 'critical' },
                  { rank: 4, name: 'API v3 Rollout', status: 'healthy' },
                ] as const).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                      i === 0 ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                    )}>
                      {item.rank}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-secondary)] flex-1">{item.name}</span>
                    <StatusDot status={item.status as 'healthy' | 'warning' | 'critical'} size="sm" />
                  </div>
                ))}
              </div>
              <OrbitInsight className="mt-3" label="Orbit Ranking">
                Ranked by customer impact, dependency chain depth, and team velocity signals.
              </OrbitInsight>
            </div>

            {/* On-Call Status */}
            <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">On-Call Status</span>
              <div className="mt-3">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{'Alex Rivera'}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">On-call this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <StatusDot status="healthy" size="sm" pulse />
                  <span className="text-[11px] font-medium text-emerald-400">0 active incidents</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest block mb-3">Quick Actions</span>
              <QuickActions actions={[
                { icon: Target, label: 'Create Ticket' },
                { icon: Rocket, label: 'Start Deploy' },
                { icon: FlaskConical, label: 'Run Tests' },
              ]} />
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
