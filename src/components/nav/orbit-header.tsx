'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, Settings, X } from 'lucide-react';

export function OrbitHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="shrink-0 flex items-center gap-3 px-4 h-12 border-b border-[var(--color-border-subtle)]">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
        </div>
        <span className="text-[13px] font-semibold text-[var(--color-text-primary)] tracking-tight">
          Orbit
        </span>
      </div>

      {/* Search */}
      <div className={cn(
        'flex items-center flex-1 max-w-md mx-auto gap-2 px-3 h-8 rounded-lg transition-all duration-200',
        searchFocused
          ? 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)] shadow-sm'
          : 'bg-[var(--color-bg-tertiary)] border border-transparent'
      )}>
        <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search people, projects, decisions..."
          className="flex-1 bg-transparent text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
        />
        {searchValue && (
          <button onClick={() => setSearchValue('')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)]">
            <X className="w-3 h-3" />
          </button>
        )}
        {!searchFocused && !searchValue && (
          <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">
            /
          </kbd>
        )}
      </div>

      {/* Actions */}
      <button className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors shrink-0">
        <Settings className="w-3.5 h-3.5" />
      </button>
    </header>
  );
}
