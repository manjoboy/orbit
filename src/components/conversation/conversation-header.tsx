'use client';

import { cn } from '@/lib/utils';
import { Zap, Wifi, Settings, Bell } from 'lucide-react';

export function ConversationHeader() {
  return (
    <header className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-[14px] font-semibold text-[var(--color-text-primary)] leading-none">
            Chief of Staff
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Wifi className="w-2.5 h-2.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-400">Watching 6 sources</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg',
          'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]',
          'transition-colors duration-150'
        )}>
          <Bell className="w-4 h-4" />
        </button>
        <button className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg',
          'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]',
          'transition-colors duration-150'
        )}>
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
