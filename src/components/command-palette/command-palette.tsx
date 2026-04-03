'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useOrbit, type ActivePanel, type Section } from '../orbit-app';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';
import {
  searchCommands,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  type CommandItem,
  type CommandCategory,
} from './command-data';

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActivePanel, setActiveSection } = useOrbit();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
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
    // Sort groups by predefined order
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
  const flatItems = useMemo(() => {
    return grouped.flatMap((g) => g.items);
  }, [grouped]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure the modal is rendered
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
      // Navigation item
      setActiveSection(item.section as Section);
      return;
    }

    if (item.panelType && item.data) {
      // Open detail panel
      setActivePanel({
        type: item.panelType as ActivePanel['type'],
        title: item.title,
        data: item.data,
      });

      // Also set the relevant section
      if (item.category === 'People') setActiveSection('people');
      else if (item.category === 'Projects') setActiveSection('projects');
      else if (item.category === 'Meetings') setActiveSection('meetings');
      return;
    }

    // Actions (placeholder — could trigger sendMessage or other flows)
    console.log('Command action:', item.id);
  }, [setCommandPaletteOpen, setActivePanel, setActiveSection]);

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
        if (flatItems[selectedIndex]) {
          selectItem(flatItems[selectedIndex]);
        }
        break;
    }
  }

  if (!commandPaletteOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-command-backdrop"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]',
          'shadow-2xl shadow-black/40',
          'animate-command-modal'
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, projects, meetings, actions..."
            className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)] shrink-0">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-[var(--color-text-muted)]">No results found</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Try a different search term</p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.category}>
              {/* Category header */}
              <div className="px-4 pt-2 pb-1">
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">
                  {group.category}
                </span>
              </div>

              {/* Items */}
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
                      isSelected
                        ? 'bg-[var(--color-bg-hover)]'
                        : 'hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isSelected ? 'bg-[var(--color-accent-subtle)]' : 'bg-[var(--color-bg-tertiary)]'
                    )}>
                      <item.icon className={cn(
                        'w-4 h-4',
                        isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                      )} />
                    </div>

                    {/* Title + subtitle */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-[13px] font-medium truncate',
                        isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                      )}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Category badge */}
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
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50">
          <div className="flex items-center gap-1.5">
            <kbd className="text-[9px] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">
              &uarr;&darr;
            </kbd>
            <span className="text-[10px] text-[var(--color-text-muted)]">navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="text-[9px] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">
              &crarr;
            </kbd>
            <span className="text-[10px] text-[var(--color-text-muted)]">select</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="text-[9px] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">
              esc
            </kbd>
            <span className="text-[10px] text-[var(--color-text-muted)]">close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
