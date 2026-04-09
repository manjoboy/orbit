'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Globe, Megaphone, DollarSign } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Inline Mock Data ────────────────────────────────────────────────────────

type ThreatLevel = 'critical' | 'warning' | 'info';

const ACTIVE_THREATS = [
  {
    id: 1, competitor: 'Intercom', affectedDeal: 'TechFlow ($320K)',
    level: 'critical' as ThreatLevel,
    context: 'Intercom launched Agent platform last month. TechFlow CTO mentioned evaluating it during last call. Price-matching at enterprise tier.',
  },
  {
    id: 2, competitor: 'Zendesk', affectedDeal: 'Acme Corp ($240K)',
    level: 'warning' as ThreatLevel,
    context: 'Acme has existing Zendesk deployment. Migration cost concern may work in their favor. Champion is pushing for us but procurement prefers incumbent.',
  },
  {
    id: 3, competitor: 'Freshdesk', affectedDeal: 'DataNova ($92K)',
    level: 'info' as ThreatLevel,
    context: 'DataNova mentioned Freshdesk in initial discovery. Low threat — they need advanced automation Freshdesk lacks.',
  },
  {
    id: 4, competitor: 'Drift', affectedDeal: 'Nexus AI ($185K)',
    level: 'warning' as ThreatLevel,
    context: 'Drift is offering aggressive first-year discounts. Nexus AI procurement is cost-sensitive this quarter.',
  },
];

const BATTLECARDS = [
  {
    id: 1, name: 'Intercom',
    strengths: ['Strong brand recognition', 'New Agent platform', 'Large marketplace ecosystem'],
    weaknesses: ['Enterprise pricing opaque', 'Agent builder limited to templates', 'Slow support response times'],
    differentiators: ['Our custom workflow engine vs their template-only approach', 'Native analytics vs add-on', 'SOC 2 Type II certified'],
    talkTrack: 'Focus on customization depth. Their agent platform is template-only — show how our workflow builder handles their exact use case with a live demo.',
  },
  {
    id: 2, name: 'Zendesk',
    strengths: ['Market incumbent', 'Deep integration ecosystem', 'Brand trust in enterprise'],
    weaknesses: ['Slow innovation cycle', 'Complex pricing tiers', 'Poor AI/automation story'],
    differentiators: ['AI-first architecture vs bolted-on AI', '60% faster deployment', 'Transparent per-seat pricing'],
    talkTrack: 'Highlight migration ease and ROI timeline. Show the total-cost-of-ownership comparison — we consistently win on 3-year TCO.',
  },
  {
    id: 3, name: 'Freshdesk',
    strengths: ['Low entry price', 'Simple onboarding', 'Good for SMB'],
    weaknesses: ['Limited enterprise features', 'No advanced automation', 'Scaling issues above 50 agents'],
    differentiators: ['Enterprise-grade from day one', 'Advanced workflow automation', 'Unlimited agent scaling'],
    talkTrack: 'Acknowledge their simplicity but shift conversation to growth readiness. Ask: "What happens when you need X?" — they can\'t answer.',
  },
];

const MARKET_SIGNALS = [
  { id: 1, date: 'Apr 7', source: 'TechCrunch', title: 'Intercom raises $150M Series F', summary: 'Valued at $2.3B. Funds earmarked for Agent platform expansion and enterprise sales team growth.' },
  { id: 2, date: 'Apr 4', source: 'LinkedIn', title: 'Zendesk hires new VP of AI', summary: 'Former Google DeepMind researcher joins to lead AI product strategy. Signal they\'re doubling down on AI.' },
  { id: 3, date: 'Apr 1', source: 'Press Release', title: 'Freshdesk launches enterprise tier', summary: 'New pricing tier targets mid-market with advanced features. Aggressive introductory pricing at $49/seat.' },
  { id: 4, date: 'Mar 28', source: 'Glassdoor', title: 'Drift layoffs reported', summary: 'Approximately 15% reduction in workforce. Customer success team significantly impacted.' },
  { id: 5, date: 'Mar 25', source: 'Product Hunt', title: 'Intercom Agent platform public launch', summary: 'Public launch of AI agent builder. Early reviews cite limited customization compared to competitors.' },
];

// ─── Component ───────────────────────────────────────────────────────────────

type IntelTab = 'threats' | 'battlecards' | 'signals';

export function CompetitiveIntelPage() {
  const [activeTab, setActiveTab] = useState<IntelTab>('threats');

  const tabs = [
    { id: 'threats' as const, label: 'Active Threats' },
    { id: 'battlecards' as const, label: 'Battlecards' },
    { id: 'signals' as const, label: 'Market Signals' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={Shield} title="Competitive Intel" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'threats' && <ThreatsTab />}
        {activeTab === 'battlecards' && <BattlecardsTab />}
        {activeTab === 'signals' && <SignalsTab />}
      </div>
    </div>
  );
}

// ─── Active Threats Tab ──────────────────────────────────────────────────────

function ThreatsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        {ACTIVE_THREATS.map(threat => (
          <div
            key={threat.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
          >
            <StatusDot
              status={threat.level}
              pulse={threat.level === 'critical'}
              size="md"
              className="mt-2"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{threat.competitor}</span>
                  <span className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                    threat.level === 'critical'
                      ? 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]'
                      : threat.level === 'warning'
                        ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]'
                        : 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]'
                  )}>
                    {threat.level === 'critical' ? 'High' : threat.level === 'warning' ? 'Medium' : 'Low'}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)] shrink-0 ml-3">{threat.affectedDeal}</span>
              </div>
              <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{threat.context}</p>
            </div>
          </div>
        ))}
      </div>

      <OrbitInsight>
        Intercom is aggressive in the TechFlow deal &mdash; their new Agent platform launched last month. I&apos;ve updated the battlecard with technical differentiators.
      </OrbitInsight>
    </div>
  );
}

// ─── Battlecards Tab ─────────────────────────────────────────────────────────

function BattlecardsTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-3 max-w-4xl">
      {BATTLECARDS.map(card => {
        const isExpanded = expanded === card.id;
        return (
          <button
            key={card.id}
            onClick={() => setExpanded(isExpanded ? null : card.id)}
            className={cn(
              'w-full text-left rounded-xl border transition-all duration-150',
              isExpanded
                ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/25'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
            )}
          >
            <div className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{card.name}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{isExpanded ? 'Collapse' : 'Expand'}</span>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-3">
                  {/* Strengths */}
                  <div>
                    <span className="text-[10px] font-medium text-[var(--color-status-critical)] uppercase tracking-widest">Strengths (Their Advantage)</span>
                    <ul className="mt-1.5 space-y-1">
                      {card.strengths.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                          <StatusDot status="critical" size="sm" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <span className="text-[10px] font-medium text-[var(--color-status-healthy)] uppercase tracking-widest">Weaknesses (Our Opportunity)</span>
                    <ul className="mt-1.5 space-y-1">
                      {card.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                          <StatusDot status="healthy" size="sm" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Differentiators */}
                  <div>
                    <span className="text-[10px] font-medium text-[var(--color-accent)] uppercase tracking-widest">Key Differentiators</span>
                    <ul className="mt-1.5 space-y-1">
                      {card.differentiators.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                          <StatusDot status="info" size="sm" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Talk Track */}
                  <div className="mt-2 px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Recommended Talk Track</span>
                    <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mt-1">{card.talkTrack}</p>
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Market Signals Tab ──────────────────────────────────────────────────────

function SignalsTab() {
  const SOURCE_ICONS: Record<string, typeof Globe> = {
    TechCrunch: DollarSign,
    LinkedIn: Globe,
    'Press Release': Megaphone,
    Glassdoor: Globe,
    'Product Hunt': Globe,
  };

  return (
    <div className="space-y-2 max-w-4xl">
      {MARKET_SIGNALS.map(signal => {
        const Icon = SOURCE_ICONS[signal.source] || Globe;
        return (
          <div
            key={signal.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">{signal.title}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] ml-auto shrink-0">{signal.date}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)]">{signal.source}</span>
              </div>
              <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{signal.summary}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
