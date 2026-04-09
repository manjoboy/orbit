'use client';

import { cn } from '@/lib/utils';
import { Home, Search, Sun, Moon, ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useOrbit, type ActivePage } from '../orbit-app';
import { getNavGroups, PERSONA_CONFIGS } from '@/lib/persona';

interface NavItem {
  id: ActivePage;
  icon: typeof Home;
  label: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

export function LeftSidebar() {
  const { setCommandPaletteOpen, activePage, setActivePage, theme, toggleTheme, persona, userName } = useOrbit();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const navGroups = getNavGroups(persona) as NavGroup[];

  const isGroupOpen = (label: string) => {
    if (collapsed[label] !== undefined) return !collapsed[label];
    return navGroups.find(g => g.label === label)?.defaultOpen ?? true;
  };

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: isGroupOpen(label) }));
  };

  const handleSwitchRole = () => {
    window.localStorage.removeItem('orbit-onboarded');
    window.location.reload();
  };

  const roleConfig = PERSONA_CONFIGS[persona];
  const displayName = userName || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-[200px] min-w-[200px] shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white/90" />
        </div>
        <span className="text-[15px] font-semibold text-[var(--color-text-primary)] tracking-tight">
          Orbit
        </span>
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 h-8 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-border-default)] transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[12px]">Search...</span>
          <kbd className="ml-auto text-[9px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">⌘K</kbd>
        </button>
      </div>

      {/* Grouped Navigation */}
      <div className="flex-1 overflow-y-auto">
        {navGroups.map((group) => {
          const open = isGroupOpen(group.label);
          const hasActivePage = group.items.some(i => i.id === activePage);

          return (
            <div key={group.label} className="mb-1">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 pt-3 pb-1.5 group"
              >
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">
                  {group.label}
                  {!open && hasActivePage && (
                    <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] inline-block" />
                  )}
                </span>
                <ChevronDown className={cn(
                  'w-3 h-3 text-[var(--color-text-muted)] transition-transform duration-200 opacity-0 group-hover:opacity-100',
                  !open && '-rotate-90'
                )} />
              </button>

              {/* Group items */}
              {open && (
                <nav className="flex flex-col gap-0.5 px-2">
                  {group.items.map(({ id, icon: Icon, label, badge }) => {
                    const isActive = id === activePage;
                    return (
                      <button
                        key={id}
                        onClick={() => setActivePage(id)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150',
                          isActive
                            ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className={cn('text-[13px]', isActive ? 'font-semibold' : 'font-medium')}>{label}</span>
                        {badge !== undefined && (
                          <span className="ml-auto w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center bg-[var(--color-accent)]">
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* Theme toggle */}
      <div className="px-3 pb-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-[13px] font-medium">Light mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-[13px] font-medium">Dark mode</span>
            </>
          )}
        </button>

        {/* Switch role button */}
        <button
          onClick={handleSwitchRole}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[12px] font-medium">Switch role</span>
        </button>
      </div>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{displayName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate">{roleConfig.roleTitle}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
