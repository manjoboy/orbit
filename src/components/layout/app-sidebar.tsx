'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Network,
  Newspaper,
  Target,
  Heart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Search,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'briefing', label: 'Briefing', icon: LayoutDashboard, href: '/', badge: null },
  { id: 'meetings', label: 'Meetings', icon: Calendar, href: '/meetings', badge: '3' },
  { id: 'graph', label: 'Network', icon: Network, href: '/graph', badge: null },
  { id: 'intelligence', label: 'Intelligence', icon: Newspaper, href: '/intelligence', badge: '2' },
  { id: 'goals', label: 'Goals', icon: Target, href: '/goals', badge: null },
  { id: 'wellbeing', label: 'Wellbeing', icon: Heart, href: '/wellbeing', badge: null },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('briefing');

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-[var(--color-border-primary)]',
        'bg-[var(--color-bg-secondary)] transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[var(--color-border-primary)]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-[var(--color-text-primary)] whitespace-nowrap animate-fade-in">
              Chief of Staff
            </span>
          )}
        </div>
      </div>

      {/* Search trigger */}
      <div className="px-3 pt-3">
        <button
          className={cn(
            'flex items-center w-full gap-2 px-2.5 py-1.5 rounded-lg',
            'text-[var(--color-text-tertiary)] text-xs',
            'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]',
            'hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-secondary)]',
            'transition-all duration-150'
          )}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Ask anything...</span>
              <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border-primary)]">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={cn(
              'flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg',
              'text-sm transition-all duration-150',
              activeItem === item.id
                ? 'bg-[var(--color-bg-active)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
            )}
          >
            <item.icon className={cn(
              'w-4 h-4 shrink-0',
              activeItem === item.id ? 'text-blue-400' : ''
            )} />
            {!collapsed && (
              <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
            )}
            {!collapsed && item.badge && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-medium bg-blue-500/15 text-blue-400">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-1">
        <button
          className={cn(
            'flex items-center w-full gap-2.5 px-2.5 py-2 rounded-lg',
            'text-sm text-[var(--color-text-tertiary)]',
            'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]',
            'transition-all duration-150'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center w-full py-1.5 rounded-lg',
            'text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)]',
            'hover:bg-[var(--color-bg-hover)] transition-all duration-150'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
