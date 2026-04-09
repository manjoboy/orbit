'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, Zap, Clock, ArrowRight, Hash, Calendar, User, FolderKanban, Inbox, BarChart3, DollarSign, Target, TrendingUp, Map as MapIcon } from 'lucide-react';
import { useOrbit, type ActivePanel, type Section, type ActivePage } from '../orbit-app';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';
import {
  searchCommands,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  type CommandItem,
  type CommandCategory,
} from './command-data';

// ─── Recent items (simulated) ───
const RECENT_ITEMS: CommandItem[] = [
  { id: 'recent-sarah', title: 'Sarah Chen', subtitle: 'Staff Engineer · viewed 2h ago', category: 'People', icon: User, panelType: 'person', data: { name: 'Sarah Chen', role: 'Staff Engineer', subtitle: 'Critical auth dependency', days: 0, action: 'Respond' } },
  { id: 'recent-standup', title: 'Engineering Standup', subtitle: 'Meeting · 9:00 AM today', category: 'Meetings', icon: Calendar, panelType: 'meeting', data: { title: 'Engineering Standup', time: '9:00 AM', duration: '15m', attendeeCount: 4, alertCount: 1, attendees: [{ name: 'Sarah Chen', title: 'Staff Engineer' }, { name: 'Alex Rivera', title: 'Senior Engineer' }, { name: 'Jordan Liu', title: 'Engineer II' }], anticipations: [{ emoji: '⚠️', title: 'CTO discussed phased rollout', body: 'James and Sarah discussed auth migration.' }], openItems: ['Share load test results'], lastSummary: 'Discussed auth migration.' } },
  { id: 'recent-auth', title: 'Auth Migration', subtitle: 'Project · Health 58%', category: 'Projects', icon: FolderKanban, panelType: 'project', data: { name: 'Auth Service Migration', health: 0.58, trend: 'down', velocity: -15, blockers: 1, deadline: 10, status: 'ACTIVE' } },
];

// ─── Quick AI prompts ───
const AI_PROMPTS = [
  'What should I prioritize today?',
  'Prep me for my 2pm meeting',
  'Draft a reply to Sarah Chen',
  'Summarize my open action items',
  'What\'s at risk this week?',
  'Who needs a follow-up?',
];

// ─── Page navigation items ───
const PAGE_ITEMS: Array<{ id: ActivePage; label: string; subtitle: string; icon: typeof Inbox }> = [
  { id: 'home', label: 'Home', subtitle: 'Dashboard overview', icon: Hash },
  { id: 'inbox', label: 'Inbox', subtitle: '4 priority items', icon: Inbox },
  { id: 'calendar', label: 'Calendar', subtitle: '3 meetings today', icon: Calendar },
  { id: 'analytics', label: 'Analytics', subtitle: 'Metrics & insights', icon: BarChart3 },
  { id: 'finance', label: 'Finance', subtitle: 'Budget & approvals', icon: DollarSign },
  { id: 'operations', label: 'OKRs & Ops', subtitle: 'Goals & decisions', icon: Target },
  { id: 'pipeline', label: 'Pipeline', subtitle: 'Deals & revenue', icon: TrendingUp },
  { id: 'roadmap', label: 'Roadmap', subtitle: 'Product roadmap', icon: MapIcon },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActivePanel, setActiveSection, setActivePage, sendMessage } = useOrbit();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'default' | 'ai'>('default');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter results
  const results = useMemo(() => searchCommands(query), [query]);

  // Group results by category
  const grouped = useMemo(() => {
    const groups = new Map<CommandCategory, CommandItem[]>();
    for (const item of results) {
      const existing = groups.get(item.category) ?? [];
      existing.push(item);
      groups.set(item.category, existing);
    }
    const sorted: Array<{ category: CommandCategory; items: CommandItem[] }> = [];
    for (const cat of CATEGORY_ORDER) {
      const items = groups.get(cat);
      if (items && items.length > 0) {
        sorted.push({ category: cat, items });
      }
    }
    return sorted;
  }, [results]);

  // Flat list of all visible items (for keyboard navigation)
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setMode('default');
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [commandPaletteOpen]);

  // Close on Escape
  useKeyboardShortcut('Escape', () => {
    if (commandPaletteOpen) {
      setCommandPaletteOpen(false);
    }
  }, { enabled: commandPaletteOpen, allowInInput: true });

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const selectItem = useCallback((item: CommandItem) => {
    setCommandPaletteOpen(false);

    if (item.section) {
      setActiveSection(item.section as Section);
      return;
    }

    if (item.panelType && item.data) {
      setActivePanel({
        type: item.panelType as ActivePanel['type'],
        title: item.title,
        data: item.data,
      });
      if (item.category === 'People') setActiveSection('people');
      else if (item.category === 'Projects') setActiveSection('projects');
      else if (item.category === 'Meetings') setActiveSection('meetings');
      return;
    }

    console.log('Command action:', item.id);
  }, [setCommandPaletteOpen, setActivePanel, setActiveSection]);

  const handleAskOrbit = useCallback((prompt: string) => {
    setCommandPaletteOpen(false);
    setActivePage('home');
    setTimeout(() => sendMessage(prompt), 100);
  }, [setCommandPaletteOpen, setActivePage, sendMessage]);

  const navigateTo = useCallback((page: ActivePage) => {
    setCommandPaletteOpen(false);
    setActivePage(page);
  }, [setCommandPaletteOpen, setActivePage]);

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (mode === 'ai' && query.trim()) {
          handleAskOrbit(query.trim());
        } else if (flatItems[selectedIndex]) {
          selectItem(flatItems[selectedIndex]);
        }
        break;
    }
  }

  if (!commandPaletteOpen) return null;

  const isEmptyQuery = !query.trim();
  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-command-backdrop"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]',
          'shadow-2xl shadow-black/40',
          'animate-command-modal'
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)]">
          {mode === 'ai' ? (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
          ) : (
            <Search className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'ai' ? 'Ask Orbit anything...' : 'Search people, projects, meetings, pages...'}
            className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          {/* Mode toggle */}
          <button
            onClick={() => setMode(mode === 'ai' ? 'default' : 'ai')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0',
              mode === 'ai'
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]'
            )}
          >
            <Zap className="w-3 h-3" />
            {mode === 'ai' ? 'Ask Orbit' : 'Ask AI'}
          </button>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)] shrink-0">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[420px] overflow-y-auto">
          {/* AI mode */}
          {mode === 'ai' && (
            <div className="py-2">
              {query.trim() ? (
                <button
                  onClick={() => handleAskOrbit(query.trim())}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-hover)] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-white/90" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">&ldquo;{query}&rdquo;</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Ask Orbit · press Enter to send</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                </button>
              ) : (
                <>
                  <div className="px-4 pt-2 pb-1">
                    <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Suggested prompts</span>
                  </div>
                  {AI_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskOrbit(prompt)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-bg-hover)] transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center shrink-0">
                        <Zap className="w-3 h-3 text-[var(--color-accent)]" />
                      </div>
                      <p className="flex-1 text-left text-[13px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{prompt}</p>
                      <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Default search mode */}
          {mode === 'default' && (
            <>
              {/* Empty state — show recents + page nav */}
              {isEmptyQuery && (
                <>
                  {/* Recent items */}
                  <div className="py-2">
                    <div className="px-4 pt-2 pb-1">
                      <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />Recent
                      </span>
                    </div>
                    {RECENT_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectItem(item)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--color-bg-hover)] transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0">
                          <item.icon className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[13px] font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate transition-colors">{item.title}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)] truncate">{item.subtitle}</p>
                        </div>
                        <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-md border shrink-0', CATEGORY_COLORS[item.category])}>
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Pages section */}
                  <div className="py-2 border-t border-[var(--color-border-subtle)]">
                    <div className="px-4 pt-2 pb-1">
                      <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Navigate to</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 px-3 pb-2">
                      {PAGE_ITEMS.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => navigateTo(page.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)] transition-all group"
                        >
                          <page.icon className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                          <div className="text-left">
                            <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{page.label}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">{page.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Search results */}
              {!isEmptyQuery && (
                <>
                  {flatItems.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-[13px] text-[var(--color-text-muted)]">No results for &ldquo;{query}&rdquo;</p>
                      <button
                        onClick={() => handleAskOrbit(query)}
                        className="mt-3 flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-[12px] font-medium text-[var(--color-accent)] bg-[var(--color-accent-subtle)] hover:opacity-90 transition-opacity"
                      >
                        <Zap className="w-3 h-3" />
                        Ask Orbit about &ldquo;{query}&rdquo;
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      {grouped.map((group) => (
                        <div key={group.category}>
                          <div className="px-4 pt-2 pb-1">
                            <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">
                              {group.category}
                            </span>
                          </div>
                          {group.items.map((item) => {
                            flatIndex++;
                            const isSelected = flatIndex === selectedIndex;
                            const currentFlatIndex = flatIndex;

                            return (
                              <button
                                key={item.id}
                                data-selected={isSelected}
                                onClick={() => selectItem(item)}
                                onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                                  isSelected ? 'bg-[var(--color-bg-hover)]' : 'hover:bg-[var(--color-bg-tertiary)]'
                                )}
                              >
                                <div className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                  isSelected ? 'bg-[var(--color-accent-subtle)]' : 'bg-[var(--color-bg-tertiary)]'
                                )}>
                                  <item.icon className={cn(
                                    'w-4 h-4',
                                    isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                                  )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    'text-[13px] font-medium truncate',
                                    isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                                  )}>
                                    {item.title}
                                  </p>
                                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">{item.subtitle}</p>
                                </div>
                                <span className={cn(
                                  'text-[9px] font-medium px-1.5 py-0.5 rounded-md border shrink-0',
                                  CATEGORY_COLORS[item.category]
                                )}>
                                  {item.category}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}

                      {/* Ask Orbit CTA at the bottom */}
                      <div className="px-3 pb-2 pt-2 border-t border-[var(--color-border-subtle)]">
                        <button
                          onClick={() => handleAskOrbit(query)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/15 hover:border-[var(--color-accent)]/30 transition-colors group"
                        >
                          <Zap className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                          <p className="text-[12px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                            Ask Orbit: &ldquo;{query}&rdquo;
                          </p>
                          <ArrowRight className="w-3 h-3 text-[var(--color-accent)] ml-auto" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="text-[9px] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">&uarr;&darr;</kbd>
              <span className="text-[10px] text-[var(--color-text-muted)]">navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[9px] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">&crarr;</kbd>
              <span className="text-[10px] text-[var(--color-text-muted)]">select</span>
            </div>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">Orbit Search · <kbd className="bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">⌘K</kbd></div>
        </div>
      </div>
    </div>
  );
}
