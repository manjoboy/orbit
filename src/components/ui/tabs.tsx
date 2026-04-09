'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ─── Pill Tabs (Pattern A) ─────────────────────────────────────────────────
// Elevated pill-in-container style for page-level view switching.
// Based on the analytics-page pattern — the strongest tab implementation.

interface PillTab<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface PillTabsProps<T extends string> {
  tabs: PillTab<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function PillTabs<T extends string>({ tabs, active, onChange, className }: PillTabsProps<T>) {
  return (
    <div className={cn(
      'flex items-center gap-1 p-1 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] w-fit',
      className
    )}>
      {tabs.map(tab => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
              isActive
                ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center',
                isActive ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
              )}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Flat Tabs (Pattern B) ──────────────────────────────────────────────────
// Subtle flat style for in-page sub-navigation. Accent-subtle active state.

interface FlatTab<T extends string> {
  id: T;
  label: string;
  count?: number;
  countColor?: 'accent' | 'critical';
}

interface FlatTabsProps<T extends string> {
  tabs: FlatTab<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function FlatTabs<T extends string>({ tabs, active, onChange, className }: FlatTabsProps<T>) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
              isActive
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center',
                tab.countColor === 'critical'
                  ? 'bg-red-500 text-white'
                  : isActive
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
              )}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Segmented Control (Pattern C) ──────────────────────────────────────────
// Binary/ternary view mode toggle (e.g., day/week, list/grid).

interface SegmentedControlProps<T extends string> {
  options: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, active, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex rounded-lg overflow-hidden border border-[var(--color-border-subtle)]', className)}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            'px-3 py-1.5 text-[12px] font-medium capitalize transition-colors',
            active === opt.id
              ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >{opt.label}</button>
      ))}
    </div>
  );
}
