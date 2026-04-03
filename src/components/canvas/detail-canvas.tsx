'use client';

import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import { X, Calendar, Users, Zap, TrendingUp, TrendingDown, Minus, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';

// ─── Canvas data types ───

interface MeetingData {
  time?: string;
  duration?: string;
  attendeeCount?: number;
  attendees?: Array<{ name: string; title?: string; health?: number }>;
  anticipations?: Array<{ emoji: string; title: string; body: string }>;
  openItems?: string[];
  lastSummary?: string;
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
}

export function DetailCanvas() {
  const { activePanel, setActivePanel } = useOrbit();
  if (!activePanel.type) return null;

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Canvas header */}
      <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-[var(--color-border-subtle)]">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{activePanel.title}</span>
        <button
          onClick={() => setActivePanel({ type: null })}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {activePanel.type === 'meeting' && <MeetingCanvas data={activePanel.data ?? {}} />}
        {activePanel.type === 'project' && <ProjectCanvas data={activePanel.data ?? {}} />}
        {activePanel.type === 'intel' && <IntelCanvas data={activePanel.data ?? {}} />}
        {activePanel.type === 'person' && <PersonCanvas data={activePanel.data ?? {}} />}
      </div>
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

      {/* Last meeting */}
      {m.lastSummary && (
        <div>
          <SectionLabel>Last meeting</SectionLabel>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1.5 leading-relaxed">{m.lastSummary}</p>
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
function IntelCanvas({ data }: { data: Record<string, unknown> }) {
  const s = data as unknown as IntelData;
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
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium bg-[var(--color-accent-strong)] text-white hover:opacity-90 transition-opacity">
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
function PersonCanvas({ data }: { data: Record<string, unknown> }) {
  const p = data as unknown as PersonData;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[15px] font-bold text-[var(--color-text-secondary)]">
          {p.name?.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div>
          <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{p.name}</p>
          {p.role && <p className="text-[12px] text-[var(--color-text-tertiary)]">{p.role}</p>}
        </div>
      </div>
      <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{p.subtitle}</p>
      <div>
        <SectionLabel>Suggested action</SectionLabel>
        <button className="mt-2 flex items-center gap-1.5 text-[12px] text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] transition-colors">
          <MessageSquare className="w-3 h-3" />{p.action ?? 'Reach out'}
        </button>
      </div>
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
