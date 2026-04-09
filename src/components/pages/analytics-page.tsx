'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BarChart3, Clock, Users, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, ArrowRight, Activity, Target, Brain, Heart } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { PillTabs } from '../ui/tabs';
import { StatusDot } from '../ui/status-dot';
import { OrbitInsight } from '../ui/orbit-insight';

type AnalyticsTab = 'overview' | 'projects' | 'relationships' | 'wellbeing';

// ─── Metric card component ───
function MetricCard({ label, value, subtext, trend, warn }: {
  label: string; value: string; subtext?: string; trend?: 'up' | 'down' | 'flat'; warn?: boolean;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-[var(--color-status-healthy)]' : trend === 'down' ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-muted)]';

  return (
    <div className={cn(
      'px-4 py-4 rounded-xl border',
      warn ? 'bg-[var(--color-status-critical-bg)] border-[var(--color-status-critical-border)]' : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)]'
    )}>
      <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">{label}</p>
      <p className={cn('text-[28px] font-bold tabular-nums leading-none', warn ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-primary)]')}>{value}</p>
      {subtext && (
        <div className="flex items-center gap-1.5 mt-1.5">
          {trend && <TrendIcon className={cn('w-3 h-3', trendColor)} />}
          <span className={cn('text-[11px]', trendColor)}>{subtext}</span>
        </div>
      )}
    </div>
  );
}

// ─── Mini bar chart ───
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((val, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-sm opacity-80', color)}
          style={{ height: `${(val / max) * 100}%`, minHeight: '2px' }}
        />
      ))}
    </div>
  );
}

// ─── Progress bar ───
function HealthBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
    </div>
  );
}

const WEEKLY_MEETING_HOURS = [4.2, 5.8, 3.9, 6.1, 5.2, 4.8, 5.5];
const WEEKLY_FOCUS_HOURS = [3.8, 2.1, 4.2, 1.8, 1.8, 2.5, 2.2];
const WEEKLY_MESSAGES = [23, 34, 18, 42, 31, 28, 35];

const PROJECTS = [
  { name: 'Enterprise Onboarding', health: 38, trend: 'down' as const, velocity: -42, blockers: 3, deadline: 18, status: 'AT_RISK', owner: 'Sarah Chen' },
  { name: 'Agent Builder v2', health: 72, trend: 'stable' as const, velocity: 5, blockers: 0, deadline: 45, status: 'ACTIVE', owner: 'Jordan Liu' },
  { name: 'Auth Service Migration', health: 58, trend: 'down' as const, velocity: -15, blockers: 1, deadline: 10, status: 'ACTIVE', owner: 'Sarah Chen' },
  { name: 'Dashboard Analytics v3', health: 89, trend: 'up' as const, velocity: 20, blockers: 0, deadline: 30, status: 'ACTIVE', owner: 'Alex Rivera' },
];

const RELATIONSHIPS = [
  { name: 'Sarah Chen', role: 'Staff Engineer', health: 'strong', lastContact: '2h', sentiment: 'neutral', interactions: 14 },
  { name: 'David Park (CFO)', role: 'CFO', health: 'good', lastContact: '4h', sentiment: 'positive', interactions: 8 },
  { name: 'Mei Zhang', role: 'VP Product', health: 'at-risk', lastContact: '12d', sentiment: 'negative', interactions: 3 },
  { name: 'James (CTO)', role: 'CTO', health: 'drifting', lastContact: '5d', sentiment: 'neutral', interactions: 5 },
  { name: 'Tom Baker', role: 'Head of Sales', health: 'at-risk', lastContact: '21d', sentiment: 'neutral', interactions: 2 },
  { name: 'Jordan Liu', role: 'Engineer II', health: 'strong', lastContact: '8h', sentiment: 'positive', interactions: 18 },
  { name: 'Alex Rivera', role: 'Sr. Engineer', health: 'good', lastContact: '2d', sentiment: 'neutral', interactions: 9 },
];

const HEALTH_DOT_MAP: Record<string, 'healthy' | 'info' | 'warning' | 'critical'> = {
  strong: 'healthy',
  good: 'info',
  drifting: 'warning',
  'at-risk': 'critical',
};
const HEALTH_BG: Record<string, string> = {
  strong: 'bg-[var(--color-status-healthy-bg)] border-[var(--color-status-healthy-border)]',
  good: 'bg-[var(--color-status-info-bg)] border-[var(--color-status-info-border)]',
  drifting: 'bg-[var(--color-status-warning-bg)] border-[var(--color-status-warning-border)]',
  'at-risk': 'bg-[var(--color-status-critical-bg)] border-[var(--color-status-critical-border)]',
};
const SENTIMENT_ICON: Record<string, { icon: typeof TrendingUp; color: string }> = {
  positive: { icon: TrendingUp, color: 'text-[var(--color-status-healthy)]' },
  neutral: { icon: Minus, color: 'text-[var(--color-text-muted)]' },
  negative: { icon: TrendingDown, color: 'text-[var(--color-status-critical)]' },
};

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'projects' as const, label: 'Projects', icon: Target },
    { id: 'relationships' as const, label: 'Relationships', icon: Users },
    { id: 'wellbeing' as const, label: 'Wellbeing', icon: Heart },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <PageHeader icon={BarChart3} title="Analytics" subtitle="Week of Apr 7 – 11, 2026" className="mb-6">
          <select className="px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] outline-none">
            <option>This week</option>
            <option>Last week</option>
            <option>Last month</option>
          </select>
        </PageHeader>

        {/* Tabs */}
        <PillTabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-6" />

        {/* ─── Overview tab ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key metrics row */}
            <div className="grid grid-cols-4 gap-3">
              <MetricCard label="Meeting hours" value="5.2h" subtext="↑ 0.8h vs last week" trend="down" warn />
              <MetricCard label="Focus time" value="1.8h" subtext="↓ 1.2h vs last week" trend="down" warn />
              <MetricCard label="Context switches" value="14" subtext="↑ 3 vs last week" trend="down" warn />
              <MetricCard label="Msgs responded" value="87%" subtext="↑ 4% vs last week" trend="up" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="px-4 py-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold text-[var(--color-text-primary)]">Meeting Load</p>
                  <span className="text-[10px] text-[var(--color-text-muted)]">7 days</span>
                </div>
                <MiniBarChart data={WEEKLY_MEETING_HOURS} color="bg-[var(--color-chart-1)]" />
                <div className="flex justify-between mt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <span key={i} className="text-[9px] text-[var(--color-text-muted)]">{d}</span>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold text-[var(--color-text-primary)]">Focus Time</p>
                  <span className="text-[10px] text-[var(--color-text-muted)]">7 days</span>
                </div>
                <MiniBarChart data={WEEKLY_FOCUS_HOURS} color="bg-[var(--color-chart-2)]" />
                <div className="flex justify-between mt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <span key={i} className="text-[9px] text-[var(--color-text-muted)]">{d}</span>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold text-[var(--color-text-primary)]">Messages</p>
                  <span className="text-[10px] text-[var(--color-text-muted)]">7 days</span>
                </div>
                <MiniBarChart data={WEEKLY_MESSAGES} color="bg-[var(--color-chart-3)]" />
                <div className="flex justify-between mt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <span key={i} className="text-[9px] text-[var(--color-text-muted)]">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Time breakdown */}
            <div className="px-5 py-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
              <p className="text-[12px] font-semibold text-[var(--color-text-primary)] mb-3">Time breakdown this week</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Recurring meetings', hours: 3.5, pct: 44, color: 'bg-[var(--color-chart-1)]' },
                  { label: '1:1 meetings', hours: 1.5, pct: 19, color: 'bg-[var(--color-chart-2)]' },
                  { label: 'Ad-hoc meetings', hours: 0.7, pct: 9, color: 'bg-[var(--color-chart-4)]' },
                  { label: 'Deep focus work', hours: 1.8, pct: 23, color: 'bg-[var(--color-chart-3)]' },
                  { label: 'Admin / email', hours: 0.4, pct: 5, color: 'bg-[var(--color-bg-elevated)]' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-[160px] shrink-0 text-[12px] text-[var(--color-text-secondary)]">{row.label}</span>
                    <div className="flex-1">
                      <HealthBar value={row.pct} color={row.color} />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)] w-8 text-right">{row.hours}h</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] w-6 text-right">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <OrbitInsight variant="branded" actionLabel="Review meeting audit suggestions">
              You&apos;re spending 44% of your time in recurring meetings — 18% above your stated goal of &lt;30%. Consider auditing 2-3 recurring meetings for necessity. Your focus time has dropped 40% this week, likely driven by the auth migration escalation.
            </OrbitInsight>
          </div>
        )}

        {/* ─── Projects tab ─── */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            {PROJECTS.map((p, i) => {
              const healthStatus: 'healthy' | 'warning' | 'critical' = p.health >= 70 ? 'healthy' : p.health >= 45 ? 'warning' : 'critical';
              const bc = p.health >= 70 ? 'bg-[var(--color-status-healthy)]/60' : p.health >= 45 ? 'bg-[var(--color-status-warning)]/60' : 'bg-[var(--color-status-critical)]/60';
              const TrendIcon = p.trend === 'up' ? TrendingUp : p.trend === 'down' ? TrendingDown : Minus;
              const tc = p.trend === 'up' ? 'text-[var(--color-status-healthy)]' : p.trend === 'down' ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-text-muted)]';

              return (
                <div key={i} className="px-5 py-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{p.name}</span>
                        {p.status === 'AT_RISK' && (
                          <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border border-[var(--color-status-critical-border)]">
                            <StatusDot status="critical" size="sm" pulse />
                            AT RISK
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--color-text-muted)]">Owner: {p.owner}</span>
                    </div>
                    <div className="text-right">
                      <span className={cn('text-[24px] font-bold tabular-nums leading-none', `text-[var(--color-status-${healthStatus})]`)}>{p.health}</span>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">health score</p>
                    </div>
                  </div>

                  <HealthBar value={p.health} color={bc} />

                  <div className="flex items-center gap-4 mt-3">
                    <div className={cn('flex items-center gap-1 text-[11px]', tc)}>
                      <TrendIcon className="w-3 h-3" />
                      <span>{p.velocity > 0 ? '+' : ''}{p.velocity}% velocity</span>
                    </div>
                    <div className={cn('flex items-center gap-1 text-[11px]', p.blockers > 0 ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-text-muted)]')}>
                      {p.blockers > 0 ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>{p.blockers} blocker{p.blockers !== 1 ? 's' : ''}</span>
                    </div>
                    <div className={cn('flex items-center gap-1 text-[11px]', p.deadline <= 14 ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-text-muted)]')}>
                      <Clock className="w-3 h-3" />
                      <span>{p.deadline} days to deadline</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <OrbitInsight className="mt-4">
              <p className="font-semibold text-[var(--color-text-primary)] mb-1">Portfolio health: 64%</p>
              1 project at critical risk (Enterprise Onboarding), 2 on declining trajectories. Auth Migration deadline in 10 days is the most time-sensitive risk. Recommend a focused review this week.
            </OrbitInsight>
          </div>
        )}

        {/* ─── Relationships tab ─── */}
        {activeTab === 'relationships' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <MetricCard label="Strong ties" value="2" subtext="Sarah, Jordan" trend="flat" />
              <MetricCard label="At risk" value="2" subtext="Mei, Tom" trend="down" warn />
              <MetricCard label="Avg response time" value="2.4h" subtext="↓ 0.6h this week" trend="up" />
            </div>

            {RELATIONSHIPS.map((rel, i) => {
              const SentimentIcon = SENTIMENT_ICON[rel.sentiment]?.icon ?? Minus;
              const sentimentColor = SENTIMENT_ICON[rel.sentiment]?.color ?? 'text-[var(--color-text-muted)]';
              const healthDot = HEALTH_DOT_MAP[rel.health] ?? 'neutral';
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[11px] font-bold text-[var(--color-text-secondary)] shrink-0">
                    {rel.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{rel.name}</span>
                      <span className={cn('flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md border capitalize', HEALTH_BG[rel.health])}>
                        <StatusDot status={healthDot} size="sm" />
                        {rel.health === 'at-risk' ? 'At risk' : rel.health.charAt(0).toUpperCase() + rel.health.slice(1)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{rel.role}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">{rel.interactions}</p>
                      <p className="text-[9px] text-[var(--color-text-muted)]">interactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">{rel.lastContact}</p>
                      <p className="text-[9px] text-[var(--color-text-muted)]">last contact</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <SentimentIcon className={cn('w-4 h-4', sentimentColor)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Wellbeing tab ─── */}
        {activeTab === 'wellbeing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <MetricCard label="Wellbeing score" value="58" subtext="↓ 4pts this week" trend="down" warn />
              <MetricCard label="Meeting load" value="5.2h" subtext="Goal: <4h daily" trend="down" warn />
              <MetricCard label="Focus blocks" value="1.8h" subtext="Goal: >3h daily" trend="down" warn />
              <MetricCard label="Overdue items" value="4" subtext="↑ 2 this week" trend="down" warn />
            </div>

            {/* Wellbeing dimensions */}
            <div className="px-5 py-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
              <p className="text-[12px] font-semibold text-[var(--color-text-primary)] mb-4">Wellbeing dimensions</p>
              <div className="space-y-4">
                {[
                  { label: 'Cognitive load', score: 42, icon: Brain, note: 'High meeting density + 14 context switches daily' },
                  { label: 'Relationship health', score: 61, icon: Heart, note: '2 at-risk relationships need attention soon' },
                  { label: 'Work/life balance', score: 55, icon: Clock, note: 'Avg work day: 10.2h vs 8h target' },
                  { label: 'Autonomy & focus', score: 38, icon: Target, note: 'Only 23% of time in self-directed deep work' },
                  { label: 'Team energy', score: 72, icon: Activity, note: 'Team morale indicators are healthy' },
                ].map((dim, i) => {
                  const status: 'healthy' | 'warning' | 'critical' = dim.score >= 70 ? 'healthy' : dim.score >= 50 ? 'warning' : 'critical';
                  const barColor = dim.score >= 70 ? 'bg-[var(--color-status-healthy)]/60' : dim.score >= 50 ? 'bg-[var(--color-status-warning)]/60' : 'bg-[var(--color-status-critical)]/60';
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <dim.icon className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                          <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{dim.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={status} size="sm" />
                          <span className={cn('text-[13px] font-bold tabular-nums', `text-[var(--color-status-${status})]`)}>{dim.score}</span>
                        </div>
                      </div>
                      <HealthBar value={dim.score} color={barColor} />
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{dim.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <OrbitInsight variant="branded" label="Orbit recommendation" actionLabel="Generate wellbeing plan">
              Your wellbeing score has dropped 8 points over the last 3 weeks — primarily driven by meeting overload and cognitive fragmentation. Consider blocking 2h of protected focus time each morning and auditing your recurring meetings. Your auth migration escalation has added ~1.5h/day of reactive work this week.
            </OrbitInsight>
          </div>
        )}
      </div>
    </div>
  );
}
