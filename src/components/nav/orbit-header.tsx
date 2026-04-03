'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Search, Settings, Bell, X } from 'lucide-react';
import { NotificationPanel } from '../notifications/notification-panel';
import { useNotifications } from '../notifications/notification-store';
import { useOrbit } from '../orbit-app';

export function OrbitHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { activePanel, setActivePanel, setCommandPaletteOpen } = useOrbit();

  const toggleNotifications = useCallback(() => {
    setNotificationsOpen(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setNotificationsOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-40 shrink-0 flex items-center gap-3 px-3 md:px-4 h-12 border-b border-[var(--color-border-subtle)] backdrop-blur-xl bg-[var(--color-bg-primary)]/80 relative">
      {/* Logo — hidden when mobile search is expanded */}
      <div className={cn(
        'flex items-center gap-2 shrink-0',
        mobileSearchOpen && 'hidden md:flex'
      )}>
        <div className="w-6 h-6 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
        </div>
        <span className="text-[13px] font-semibold text-[var(--color-text-primary)] tracking-tight">
          Orbit
        </span>
      </div>

      {/* Mobile search icon button — only shown on mobile when search is collapsed */}
      {!mobileSearchOpen && (
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="md:hidden w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors ml-auto"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Search — always visible on md+, expandable full-width on mobile */}
      <div className={cn(
        'items-center flex-1 max-w-md mx-auto gap-2 px-3 h-8 rounded-lg transition-all duration-200',
        searchFocused
          ? 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)] shadow-sm'
          : 'bg-[var(--color-bg-tertiary)] border border-transparent',
        mobileSearchOpen ? 'flex' : 'hidden md:flex'
      )}>
        <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onFocus={(e) => {
            e.target.blur();
            setCommandPaletteOpen(true);
          }}
          onBlur={() => {
            setSearchFocused(false);
            if (!searchValue) setMobileSearchOpen(false);
          }}
          placeholder="Search people, projects, decisions..."
          className="flex-1 bg-transparent text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          autoFocus={mobileSearchOpen}
        />
        {(searchValue || mobileSearchOpen) && (
          <button onClick={() => { setSearchValue(''); setMobileSearchOpen(false); }} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)]">
            <X className="w-3 h-3" />
          </button>
        )}
        {!searchFocused && !searchValue && !mobileSearchOpen && (
          <kbd className="hidden md:inline text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">
            &#8984;K
          </kbd>
        )}
      </div>

      {/* Actions — hidden when mobile search is expanded */}
      <div className={cn(
        'flex items-center gap-1 shrink-0',
        mobileSearchOpen && 'hidden md:flex'
      )}>
        {/* Bell / Notifications */}
        <button
          data-notification-bell
          onClick={toggleNotifications}
          className={cn(
            'relative w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0',
            notificationsOpen
              ? 'text-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)]'
          )}
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center tabular-nums leading-none">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            if (activePanel.type === 'settings') {
              setActivePanel({ type: null });
            } else {
              setActivePanel({ type: 'settings', title: 'Settings' });
            }
          }}
          className={cn(
            'w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0',
            activePanel.type === 'settings'
              ? 'text-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)]'
          )}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={closeNotifications}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </header>
  );
}
