'use client';

import { Settings } from 'lucide-react';

export function ConversationHeader() {
  return (
    <header className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-[var(--color-accent-subtle)] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L10.5 6.5L16 8L10.5 9.5L8 15L5.5 9.5L0 8L5.5 6.5L8 1Z" fill="currentColor" className="text-[var(--color-accent)]" /></svg>
        </div>
        <span className="text-[13px] font-medium text-[var(--color-text-primary)] tracking-tight">Chief of Staff</span>
        <span className="text-[11px] text-[var(--color-text-tertiary)]">Online</span>
      </div>
      <button className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors">
        <Settings className="w-3.5 h-3.5" />
      </button>
    </header>
  );
}
