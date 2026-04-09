'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import { X, Calendar, Users, Zap, TrendingUp, TrendingDown, Minus, MessageSquare, ExternalLink, ArrowRight, CheckCircle2, Clock, AlertCircle, ChevronRight, Lightbulb, FileText, ListChecks } from 'lucide-react';
import { NetworkGraph } from '../network/network-graph';
import { DraftComposer } from './draft-composer';
import { SettingsPanel } from '../settings/settings-panel';

// ─── Canvas data types ───

interface MeetingData {
  time?: string;
  duration?: string;
  attendeeCount?: number;
  attendees?: Array<{ name: string; title?: string; health?: number }>;
  anticipations?: Array<{ emoji: string; title: string; body: string }>;
  openItems?: string[];
  lastSummary?: string;
  lastMeetingNotes?: string[];
  lastMeetingActions?: Array<{ owner: string; item: string; status: 'done' | 'overdue' | 'pending' }>;
}

interface ProjectData {
  name?: string;
  health: number;
  trend?: 'up' | 'down' | 'stable';
  velocity: number;
  blockers?: number;
  deadline?: number;
  status?: string;
}

interface IntelData {
  type?: string;
  company?: string;
  relevance?: number;
  summary?: string;
  impact?: string;
  action?: string;
  sourceUrl?: string;
}

interface PersonData {
  name?: string;
  role?: string;
  subtitle?: string;
  action?: string;
  situation?: string;
  nextSteps?: Array<{ label: string; description: string }>;
  actionPlan?: string[];
  threadHistory?: Array<{ from: string; time: string; message: string }>;
  title?: string;
  urgency?: boolean;
}

export function DetailCanvas() {
  const { activePanel, setActivePanel } = useOrbit();
  if (!activePanel.type) return null;

  // Draft composer gets its own full layout
  if (activePanel.type === 'draft') {
    return <DraftComposer />;
  }

  // Settings panel gets its own full layout
  if (activePanel.type === 'settings') {
    return <SettingsPanel />;
  }

  return (
    <div className="flex flex-col h-full md:animate-slide-in-right">
      {/* Canvas header — top padding on mobile to clear parent close button */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-5 h-12 mt-10 md:mt-0 border-b border-[var(--color-border-subtle)]">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{activePanel.title}</span>
        {/* Desktop close button (mobile uses parent overlay close) */}
        <button
          onClick={() => setActivePanel({ type: null })}
          className="hidden md:flex w-7 h-7 rounded-md items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas content */}
      {activePanel.type === 'person' && (activePanel.data as Record<string, unknown>)?.__view === 'network-graph' ? (
        <div className="flex-1 overflow-hidden">
          <NetworkGraph />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 md:py-5">
          {activePanel.type === 'meeting' && <MeetingCanvas data={activePanel.data ?? {}} />}
          {activePanel.type === 'project' && <ProjectCanvas data={activePanel.data ?? {}} />}
          {activePanel.type === 'intel' && <IntelCanvas data={activePanel.data ?? {}} />}
          {activePanel.type === 'person' && <PersonCanvas data={activePanel.data ?? {}} />}
          {activePanel.type === 'budget' && <BudgetCanvas data={activePanel.data ?? {}} />}
          {activePanel.type === 'okr' && <OKRCanvas data={activePanel.data ?? {}} />}
          {activePanel.type === 'deal' && <DealCanvas data={activePanel.data ?? {}} />}
          {activePanel.type === 'roadmap-detail' && <RoadmapDetailCanvas data={activePanel.data ?? {}} />}
        </div>
      )}
    </div>
  );
}

// ─── Meeting Canvas ───
function MeetingCanvas({ data }: { data: Record<string, unknown> }) {
  const m = data as unknown as MeetingData;
  return (
    <div className="space-y-5">
      {/* Time & attendees */}
      <div className="flex items-center gap-4 text-[12px] text-[var(--color-text-tertiary)]">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />{m.time} &middot; {m.duration}</span>
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{m.attendeeCount} attendees</span>
      </div>

      {/* Attendees */}
      {m.attendees && m.attendees.length > 0 && (
        <div>
          <SectionLabel>Attendees</SectionLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {m.attendees.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[9px] font-bold text-[var(--color-text-secondary)]">
                  {a.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[var(--color-text-primary)]">{a.name}</p>
                  {a.title && <p className="text-[10px] text-[var(--color-text-muted)]">{a.title}</p>}
                </div>
                {a.health !== undefined && a.health < 0.6 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anticipations */}
      {m.anticipations && m.anticipations.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-[var(--color-accent)]" />
            <SectionLabel>Heads up</SectionLabel>
          </div>
          <div className="space-y-2">
            {m.anticipations.map((a, i) => (
              <div key={i} className="px-3.5 py-3 rounded-xl bg-[var(--color-accent-subtle)] border border-[rgba(129,140,248,0.06)]">
                <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{a.emoji} {a.title}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open items */}
      {m.openItems && m.openItems.length > 0 && (
        <div>
          <SectionLabel>Open from last time</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {m.openItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--color-text-tertiary)]">
                <span className="w-1 h-1 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last meeting — rich notes + action items */}
      {(m.lastMeetingNotes || m.lastSummary) && (
        <div className="space-y-3">
          <SectionLabel>Last meeting</SectionLabel>

          {/* Summary fallback if no notes */}
          {!m.lastMeetingNotes && m.lastSummary && (
            <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{m.lastSummary}</p>
          )}

          {/* Detailed notes */}
          {m.lastMeetingNotes && m.lastMeetingNotes.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Notes</span>
              </div>
              <ul className="space-y-1.5">
                {m.lastMeetingNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] mt-1.5 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action items with status */}
          {m.lastMeetingActions && m.lastMeetingActions.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ListChecks className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Action items</span>
              </div>
              <ul className="space-y-1.5">
                {m.lastMeetingActions.map((action, i) => {
                  const icon = action.status === 'done'
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    : action.status === 'overdue'
                    ? <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    : <Clock className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      {icon}
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          'text-[12px] leading-relaxed',
                          action.status === 'done' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-secondary)]'
                        )}>{action.item}</span>
                        <span className={cn(
                          'ml-1.5 text-[10px] font-medium',
                          action.status === 'overdue' ? 'text-red-400' : 'text-[var(--color-text-muted)]'
                        )}>— {action.owner}{action.status === 'overdue' ? ' · overdue' : ''}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Project Canvas ───
function ProjectCanvas({ data }: { data: Record<string, unknown> }) {
  const p = data as unknown as ProjectData;
  const health = p.health ?? 0;
  const hc = health >= 0.7 ? 'text-emerald-400' : health >= 0.4 ? 'text-amber-400' : 'text-red-400';
  const bc = health >= 0.7 ? 'bg-emerald-500/50' : health >= 0.4 ? 'bg-amber-500/50' : 'bg-red-500/50';
  const T = p.trend === 'up' ? TrendingUp : p.trend === 'down' ? TrendingDown : Minus;
  const tc = p.trend === 'up' ? 'text-emerald-400/70' : p.trend === 'down' ? 'text-red-400/70' : 'text-[var(--color-text-muted)]';

  return (
    <div className="space-y-5">
      {/* Health score hero */}
      <div className="flex items-center gap-4">
        <span className={cn('text-[42px] font-bold tabular-nums leading-none', hc)}>{Math.round(health * 100)}</span>
        <div>
          <p className="text-[13px] text-[var(--color-text-secondary)]">Health score</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('flex items-center gap-0.5 text-[12px]', tc)}><T className="w-3.5 h-3.5" />{p.velocity > 0 ? '+' : ''}{p.velocity}% velocity</span>
          </div>
        </div>
      </div>
      <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', bc)} style={{ width: `${Math.round(health * 100)}%` }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Blockers" value={String(p.blockers ?? 0)} warn={(p.blockers ?? 0) > 0} />
        <StatBox label="Deadline" value={p.deadline ? `${p.deadline}d` : '\u2014'} warn={p.deadline !== undefined && p.deadline < 14} />
        <StatBox label="Status" value={p.status ?? 'Active'} warn={p.status === 'AT_RISK'} />
      </div>

      {/* Description placeholder */}
      <div>
        <SectionLabel>Overview</SectionLabel>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1.5 leading-relaxed">
          Detailed project timeline, team members, dependencies, and risk analysis would appear here — pulled live from Linear, GitHub, and your professional graph.
        </p>
      </div>
    </div>
  );
}

// ─── Intel Canvas ───

// Map intel actions to draft keys
const INTEL_DRAFT_MAP: Record<string, string> = {
  'Draft battlecard': 'intercom-battlecard',
};

function IntelCanvas({ data }: { data: Record<string, unknown> }) {
  const s = data as unknown as IntelData;
  const { activePanel, setActivePanel } = useOrbit();
  const draftKey = s.action ? INTEL_DRAFT_MAP[s.action] : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{s.type}</span>
        {s.company && <><span className="text-[var(--color-text-muted)]">&middot;</span><span className="text-[11px] text-[var(--color-text-tertiary)]">{s.company}</span></>}
        <span className="ml-auto text-[11px] font-medium text-[var(--color-accent)]">{s.relevance}% relevant</span>
      </div>

      <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">{s.summary}</p>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3 h-3 text-[var(--color-accent)]" />
          <SectionLabel>Impact on you</SectionLabel>
        </div>
        <div className="px-4 py-3 rounded-xl bg-[var(--color-accent-subtle)] border border-[rgba(129,140,248,0.06)]">
          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{s.impact}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {s.action && (
          <button
            onClick={() => {
              if (draftKey) {
                setActivePanel({
                  type: 'draft',
                  title: s.action!,
                  data: {
                    draftKey,
                    previousPanel: { type: 'intel', title: activePanel.title, data },
                  },
                });
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium bg-[var(--color-accent-strong)] text-white hover:opacity-90 transition-opacity"
          >
            <ArrowRight className="w-3 h-3" />{s.action}
          </button>
        )}
        {s.sourceUrl && (
          <button className="flex items-center gap-1 text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
            <ExternalLink className="w-3 h-3" />Source
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Person Canvas ───

// Map person names (from inbox `from` field) to draft keys
const PERSON_DRAFT_MAP: Record<string, string> = {
  'Sarah Chen': 'sarah-auth',
  'David Park (CFO)': 'david-budget',
  'Jordan Liu': 'jordan-sso',
};

function PersonCanvas({ data }: { data: Record<string, unknown> }) {
  const p = data as unknown as PersonData;
  const { activePanel, setActivePanel } = useOrbit();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Check if this person came from an inbox item that has a `from` field
  const fromName = (data as Record<string, unknown>).from as string | undefined;
  const personName = fromName ?? p.name ?? '';
  const draftKey = PERSON_DRAFT_MAP[personName];

  const hasRichContext = !!(p.situation || p.nextSteps?.length || p.actionPlan?.length);

  return (
    <div className="space-y-5">
      {/* Person header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[15px] font-bold text-[var(--color-text-secondary)]">
          {(p.name ?? personName)?.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{p.name ?? personName}</p>
          {p.role && <p className="text-[12px] text-[var(--color-text-tertiary)]">{p.role}</p>}
        </div>
        {p.urgency && (
          <span className="ml-auto px-2 py-1 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400">Urgent</span>
        )}
      </div>

      {/* Subject line */}
      {p.title && (
        <div className="px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{p.title}</p>
        </div>
      )}

      {/* Situation */}
      {p.situation && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3 h-3 text-[var(--color-accent)]" />
            <SectionLabel>Situation</SectionLabel>
          </div>
          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{p.situation}</p>
        </div>
      )}

      {/* Thread history */}
      {p.threadHistory && p.threadHistory.length > 0 && (
        <div>
          <SectionLabel>Thread</SectionLabel>
          <div className="mt-2 space-y-2">
            {p.threadHistory.map((msg, i) => (
              <div key={i} className="px-3 py-2.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-[var(--color-text-primary)]">{msg.from}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{msg.time}</span>
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next steps — choose your path */}
      {p.nextSteps && p.nextSteps.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ChevronRight className="w-3 h-3 text-[var(--color-accent)]" />
            <SectionLabel>Options</SectionLabel>
          </div>
          <div className="space-y-2">
            {p.nextSteps.map((step, i) => (
              <button
                key={i}
                onClick={() => setSelectedStep(selectedStep === i ? null : i)}
                className={cn(
                  'w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-150',
                  selectedStep === i
                    ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/30'
                    : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                    selectedStep === i ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[12px] font-semibold leading-tight',
                      selectedStep === i ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'
                    )}>{step.label}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action plan */}
      {p.actionPlan && p.actionPlan.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ListChecks className="w-3 h-3 text-[var(--color-accent)]" />
            <SectionLabel>Action plan</SectionLabel>
          </div>
          <ol className="space-y-1.5">
            {p.actionPlan.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center text-[9px] font-bold text-[var(--color-text-muted)] shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Suggested action — if no rich context fall back to simple */}
      {!hasRichContext && (
        <div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed mb-3">{p.subtitle}</p>
          <SectionLabel>Suggested action</SectionLabel>
          <div className="flex items-center gap-2 mt-2">
            {draftKey ? (
              <button
                onClick={() => {
                  setActivePanel({
                    type: 'draft',
                    title: `Reply to ${personName}`,
                    data: {
                      draftKey,
                      previousPanel: { type: 'person', title: activePanel.title, data },
                    },
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[var(--color-accent-strong)] text-white hover:opacity-90 transition-opacity"
              >
                <MessageSquare className="w-3 h-3" />Draft reply
              </button>
            ) : (
              <button className="flex items-center gap-1.5 text-[12px] text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] transition-colors">
                <MessageSquare className="w-3 h-3" />{p.action ?? 'Reach out'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Draft reply CTA when rich context present */}
      {hasRichContext && draftKey && (
        <div className="pt-1">
          <button
            onClick={() => {
              setActivePanel({
                type: 'draft',
                title: `Reply to ${personName}`,
                data: {
                  draftKey,
                  previousPanel: { type: 'person', title: activePanel.title, data },
                },
              });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all duration-150"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Draft reply to {personName.split(' ')[0]}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Budget Canvas ───
function BudgetCanvas({ data }: { data: Record<string, unknown> }) {
  const category = data.category as string ?? 'Budget Item';
  const allocated = data.allocated as number ?? 0;
  const spent = data.spent as number ?? 0;
  const forecast = data.forecast as number ?? 0;
  const status = data.status as string ?? 'on-track';
  const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

  const statusColor = status === 'over' || status === 'at-risk' ? 'text-red-400' : status === 'under' ? 'text-blue-400' : 'text-emerald-400';
  const barColor = status === 'over' || status === 'at-risk' ? 'bg-red-500/60' : status === 'under' ? 'bg-blue-500/60' : 'bg-emerald-500/60';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className={cn('text-[12px] font-medium capitalize px-2 py-0.5 rounded-full', statusColor, status === 'over' ? 'bg-red-500/10' : status === 'at-risk' ? 'bg-amber-500/10' : 'bg-emerald-500/10')}>
          {status.replace('-', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Allocated" value={`$${(allocated / 1e3).toFixed(0)}K`} />
        <StatBox label="Spent" value={`$${(spent / 1e3).toFixed(0)}K`} warn={pct > 80} />
        <StatBox label="Forecast" value={`$${(forecast / 1e3).toFixed(0)}K`} warn={forecast > allocated} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>Budget utilization</SectionLabel>
          <span className="text-[12px] font-bold text-[var(--color-text-primary)] tabular-nums">{pct}%</span>
        </div>
        <div className="h-3 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>

      <div>
        <SectionLabel>Analysis</SectionLabel>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1.5 leading-relaxed">
          {forecast > allocated
            ? `Forecasted to exceed allocation by $${((forecast - allocated) / 1e3).toFixed(0)}K. Review spending or request a budget adjustment.`
            : `Tracking within budget. $${((allocated - forecast) / 1e3).toFixed(0)}K expected to remain at end of quarter.`
          }
        </p>
      </div>
    </div>
  );
}

// ─── OKR Canvas ───
function OKRCanvas({ data }: { data: Record<string, unknown> }) {
  const objective = data.objective as string ?? 'Objective';
  const owner = data.owner as string ?? '';
  const progress = data.progress as number ?? 0;
  const status = data.status as string ?? 'on-track';
  const keyResults = data.keyResults as Array<{ title: string; current: number; target: number; unit: string }> ?? [];

  const statusColor = status === 'on-track' ? 'text-emerald-400 bg-emerald-500/10'
    : status === 'at-risk' ? 'text-amber-400 bg-amber-500/10'
    : 'text-red-400 bg-red-500/10';
  const barColor = status === 'on-track' ? 'bg-emerald-500/60' : status === 'at-risk' ? 'bg-amber-500/60' : 'bg-red-500/60';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className={cn('text-[12px] font-medium capitalize px-2 py-0.5 rounded-full', statusColor)}>
          {status.replace('-', ' ')}
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)]">Owner: {owner}</span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>Overall Progress</SectionLabel>
          <span className="text-[22px] font-bold text-[var(--color-text-primary)] tabular-nums">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-3 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Key Results */}
      {keyResults.length > 0 && (
        <div>
          <SectionLabel>Key Results</SectionLabel>
          <div className="mt-2 space-y-3">
            {keyResults.map((kr, i) => {
              const krPct = Math.min((kr.current / kr.target) * 100, 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">{kr.title}</span>
                    <span className="text-[11px] font-medium text-[var(--color-text-primary)] tabular-nums">{kr.current} / {kr.target} {kr.unit}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-accent)]/60 transition-all" style={{ width: `${krPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Deal Canvas ───
function DealCanvas({ data }: { data: Record<string, unknown> }) {
  const company = data.company as string ?? 'Deal';
  const value = data.value as number ?? 0;
  const stage = data.stage as string ?? '';
  const probability = data.probability as number ?? 0;
  const owner = data.owner as string ?? '';
  const health = data.health as string ?? 'healthy';
  const nextStep = data.nextStep as string ?? '';
  const contacts = data.contacts as string[] ?? [];
  const daysInStage = data.daysInStage as number ?? 0;

  const healthColor = health === 'healthy' ? 'text-emerald-400 bg-emerald-500/10'
    : health === 'at-risk' ? 'text-amber-400 bg-amber-500/10'
    : 'text-red-400 bg-red-500/10';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="capitalize text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{stage}</span>
        <span className={cn('text-[12px] font-medium px-2 py-0.5 rounded-full', healthColor)}>{health}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Value" value={`$${(value / 1e3).toFixed(0)}K`} />
        <StatBox label="Probability" value={`${probability}%`} />
        <StatBox label="Days in Stage" value={String(daysInStage)} warn={daysInStage > 14} />
      </div>

      {nextStep && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowRight className="w-3 h-3 text-[var(--color-accent)]" />
            <SectionLabel>Next step</SectionLabel>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/10">
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{nextStep}</p>
          </div>
        </div>
      )}

      {contacts.length > 0 && (
        <div>
          <SectionLabel>Key contacts</SectionLabel>
          <div className="mt-2 space-y-1.5">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[9px] font-bold text-[var(--color-text-secondary)]">
                  {c.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[12px] text-[var(--color-text-secondary)]">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-[var(--color-text-muted)]">Owner: {owner}</p>
    </div>
  );
}

// ─── Roadmap Detail Canvas ───
function RoadmapDetailCanvas({ data }: { data: Record<string, unknown> }) {
  const name = data.name as string ?? 'Item';
  const description = data.description as string ?? '';
  const status = data.status as string ?? '';
  const progress = data.progress as number ?? 0;
  const priority = data.priority as string ?? '';
  const owner = data.owner as string ?? '';
  const team = data.team as string ?? '';
  const effort = data.effort as string ?? '';
  const dependencies = data.dependencies as string[] ?? [];
  const customerRequests = data.customerRequests as number ?? 0;

  const statusColor = status === 'in-progress' ? 'text-blue-400 bg-blue-500/10'
    : status === 'blocked' ? 'text-red-400 bg-red-500/10'
    : status === 'shipped' ? 'text-emerald-400 bg-emerald-500/10'
    : 'text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)]';
  const barColor = status === 'blocked' ? 'bg-red-500/60' : status === 'in-progress' ? 'bg-blue-500/60' : 'bg-emerald-500/60';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('text-[12px] font-medium capitalize px-2 py-0.5 rounded-full', statusColor)}>{status.replace('-', ' ')}</span>
        {priority && <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)]">{priority}</span>}
        {effort && <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)]">Effort: {effort}</span>}
      </div>

      {description && (
        <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
      )}

      {progress > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <SectionLabel>Progress</SectionLabel>
            <span className="text-[12px] font-bold text-[var(--color-text-primary)] tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Owner" value={owner} />
        <StatBox label="Team" value={team} />
      </div>

      {customerRequests > 0 && (
        <StatBox label="Customer Requests" value={String(customerRequests)} />
      )}

      {dependencies.length > 0 && (
        <div>
          <SectionLabel>Dependencies</SectionLabel>
          <div className="mt-2 space-y-1">
            {dependencies.map((dep, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[12px] text-[var(--color-text-secondary)]">{dep}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared components ───
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{children}</span>;
}

function StatBox({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="py-2.5 px-3 rounded-lg bg-[var(--color-bg-tertiary)] text-center">
      <div className={cn('text-[14px] font-semibold tabular-nums', warn ? 'text-amber-400/80' : 'text-[var(--color-text-primary)]')}>{value}</div>
      <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
