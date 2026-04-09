'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { FlatTabs } from '../../ui/tabs';
import { StatusDot } from '../../ui/status-dot';
import { OrbitInsight } from '../../ui/orbit-insight';

// ─── Inline Mock Data ────────────────────────────────────────────────────────

type Sentiment = 'positive' | 'negative' | 'mixed';

const THEMES = [
  {
    id: 1, name: 'Agent Builder Complexity', mentions: 47, sentiment: 'negative' as Sentiment,
    trend: 'down' as const, synthesis: 'Users find the multi-step agent configuration confusing. Template library helped — complaints dropped 23% post-launch.',
  },
  {
    id: 2, name: 'Dashboard Speed', mentions: 38, sentiment: 'negative' as Sentiment,
    trend: 'up' as const, synthesis: 'Growing complaints about dashboard load times, especially with 90-day views. Performance regression likely tied to analytics v3 rollout.',
  },
  {
    id: 3, name: 'API Reliability', mentions: 31, sentiment: 'positive' as Sentiment,
    trend: 'up' as const, synthesis: 'Positive sentiment increasing after the rate limit overhaul. Uptime has been at 99.97% for 60 days.',
  },
  {
    id: 4, name: 'Onboarding Experience', mentions: 26, sentiment: 'mixed' as Sentiment,
    trend: 'down' as const, synthesis: 'Mixed — SMBs love the quick start guide, but enterprise users need more guided setup for complex configurations.',
  },
  {
    id: 5, name: 'Pricing Transparency', mentions: 19, sentiment: 'negative' as Sentiment,
    trend: 'up' as const, synthesis: 'Recurring ask for public pricing page. Sales team reports this slows down deal cycles by ~5 days on average.',
  },
];

const VERBATIMS = [
  { id: 1, customer: 'Sarah Lin', company: 'TechFlow', date: 'Apr 7', sentiment: 'negative' as Sentiment, quote: 'The dashboard takes 12 seconds to load on the 90-day view. This is unusable for our daily standups.' },
  { id: 2, customer: 'James Park', company: 'Acme Corp', date: 'Apr 6', sentiment: 'positive' as Sentiment, quote: 'Agent Builder templates are a game-changer. We set up 3 new workflows in under an hour.' },
  { id: 3, customer: 'Anika Patel', company: 'DataNova', date: 'Apr 5', sentiment: 'negative' as Sentiment, quote: 'Why can\'t I see pricing on your website? I had to schedule a call just to get a ballpark.' },
  { id: 4, customer: 'Mike Torres', company: 'Nexus AI', date: 'Apr 4', sentiment: 'positive' as Sentiment, quote: 'API uptime has been rock solid. We processed 2M events last week with zero drops.' },
  { id: 5, customer: 'Rachel Kim', company: 'CloudShift', date: 'Apr 3', sentiment: 'mixed' as Sentiment, quote: 'Onboarding was smooth for basic setup, but we needed 3 support calls to configure SSO properly.' },
  { id: 6, customer: 'Dan Ortiz', company: 'Bright Systems', date: 'Apr 2', sentiment: 'negative' as Sentiment, quote: 'The agent configuration wizard keeps losing my progress if I navigate away. Extremely frustrating.' },
];

const TRENDS_DATA = [
  {
    theme: 'Agent Builder Complexity',
    weeks: [{ label: 'W1', count: 18 }, { label: 'W2', count: 15 }, { label: 'W3', count: 8 }, { label: 'W4', count: 6 }],
  },
  {
    theme: 'Dashboard Speed',
    weeks: [{ label: 'W1', count: 5 }, { label: 'W2', count: 9 }, { label: 'W3', count: 12 }, { label: 'W4', count: 12 }],
  },
  {
    theme: 'API Reliability',
    weeks: [{ label: 'W1', count: 6 }, { label: 'W2', count: 8 }, { label: 'W3', count: 9 }, { label: 'W4', count: 8 }],
  },
  {
    theme: 'Onboarding Experience',
    weeks: [{ label: 'W1', count: 9 }, { label: 'W2', count: 8 }, { label: 'W3', count: 5 }, { label: 'W4', count: 4 }],
  },
];

const SENTIMENT_BADGE: Record<Sentiment, { color: string; label: string }> = {
  positive: {
    color: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy)] border-[var(--color-status-healthy-border)]',
    label: 'Positive',
  },
  negative: {
    color: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)] border-[var(--color-status-critical-border)]',
    label: 'Negative',
  },
  mixed: {
    color: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]',
    label: 'Mixed',
  },
};

const SENTIMENT_DOT: Record<Sentiment, 'healthy' | 'critical' | 'warning'> = {
  positive: 'healthy',
  negative: 'critical',
  mixed: 'warning',
};

// ─── Component ───────────────────────────────────────────────────────────────

type FeedbackTab = 'themes' | 'verbatims' | 'trends';

export function CustomerFeedbackPage() {
  const [activeTab, setActiveTab] = useState<FeedbackTab>('themes');

  const tabs = [
    { id: 'themes' as const, label: 'Themes' },
    { id: 'verbatims' as const, label: 'Verbatims' },
    { id: 'trends' as const, label: 'Trends' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
        <PageHeader icon={MessageSquare} title="Customer Feedback" className="mb-4" />
        <FlatTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'themes' && <ThemesTab />}
        {activeTab === 'verbatims' && <VerbatimsTab />}
        {activeTab === 'trends' && <TrendsTab />}
      </div>
    </div>
  );
}

// ─── Themes Tab ──────────────────────────────────────────────────────────────

function ThemesTab() {
  const maxMentions = Math.max(...THEMES.map(t => t.mentions));

  return (
    <div className="space-y-3 max-w-4xl">
      {THEMES.map(theme => {
        const badge = SENTIMENT_BADGE[theme.sentiment];
        const TrendIcon = theme.trend === 'up' ? TrendingUp : theme.trend === 'down' ? TrendingDown : Minus;
        const trendColor = theme.sentiment === 'negative'
          ? (theme.trend === 'up' ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-status-healthy)]')
          : (theme.trend === 'up' ? 'text-[var(--color-status-healthy)]' : 'text-[var(--color-status-warning)]');

        return (
          <div
            key={theme.id}
            className="px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{theme.name}</span>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', badge.color)}>
                  {badge.label}
                </span>
                <TrendIcon className={cn('w-3.5 h-3.5', trendColor)} />
              </div>
              <span className="text-[20px] font-bold text-[var(--color-text-primary)] tabular-nums">{theme.mentions}</span>
            </div>

            {/* Mention volume bar */}
            <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-[var(--color-chart-1)] transition-all"
                style={{ width: `${(theme.mentions / maxMentions) * 100}%` }}
              />
            </div>

            <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed italic">&ldquo;{theme.synthesis}&rdquo;</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Verbatims Tab ───────────────────────────────────────────────────────────

function VerbatimsTab() {
  const [sentimentFilter, setSentimentFilter] = useState<'all' | Sentiment>('all');
  const sentiments: Array<'all' | Sentiment> = ['all', 'positive', 'negative', 'mixed'];

  const filtered = sentimentFilter === 'all'
    ? VERBATIMS
    : VERBATIMS.filter(v => v.sentiment === sentimentFilter);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Sentiment filter */}
      <div className="flex items-center gap-1.5">
        {sentiments.map(s => (
          <button
            key={s}
            onClick={() => setSentimentFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all capitalize',
              sentimentFilter === s
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Verbatim cards */}
      <div className="space-y-2">
        {filtered.map(v => (
          <div
            key={v.id}
            className="px-4 py-3.5 rounded-xl border bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <StatusDot status={SENTIMENT_DOT[v.sentiment]} size="md" />
              <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">{v.customer}</span>
              <span className="text-[11px] text-[var(--color-text-muted)]">{v.company}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{v.date}</span>
            </div>
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed pl-5">&ldquo;{v.quote}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Trends Tab ──────────────────────────────────────────────────────────────

function TrendsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-4">
        {TRENDS_DATA.map(trend => {
          const maxCount = Math.max(...trend.weeks.map(w => w.count));
          return (
            <div
              key={trend.theme}
              className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4"
            >
              <span className="text-[12px] font-semibold text-[var(--color-text-primary)] mb-3 block">{trend.theme}</span>
              <div className="flex items-end gap-3 h-16">
                {trend.weeks.map((week, i) => {
                  const heightPct = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{week.count}</span>
                      <div className="w-full flex justify-center h-10">
                        <div
                          className="w-6 rounded-t-sm bg-[var(--color-chart-1)] transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-[var(--color-text-muted)]">{week.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <OrbitInsight>
        Agent Builder complexity complaints dropped 23% after the template library shipped. Dashboard speed is now the #1 emerging theme.
      </OrbitInsight>
    </div>
  );
}
