'use client';

import { cn } from '@/lib/utils';
import { useOrbit, type Section } from '../orbit-app';
import { Inbox, Calendar, FolderKanban, Newspaper, Users, Heart } from 'lucide-react';

const SECTIONS: Array<{ id: Section; icon: React.ComponentType<{ className?: string }>; label: string }> = [
  { id: 'inbox', icon: Inbox, label: 'Inbox' },
  { id: 'meetings', icon: Calendar, label: 'Meetings' },
  { id: 'projects', icon: FolderKanban, label: 'Projects' },
  { id: 'intel', icon: Newspaper, label: 'Intel' },
  { id: 'people', icon: Users, label: 'People' },
  { id: 'wellbeing', icon: Heart, label: 'Wellbeing' },
];

export function SectionNav() {
  const { activeSection, setActiveSection } = useOrbit();

  return (
    <>
      {/* Desktop: vertical right bar (hidden on mobile) */}
      <nav className="hidden md:flex shrink-0 flex-col items-center justify-center gap-1 w-12 border-l border-[var(--color-border-subtle)]">
        {SECTIONS.map(({ id, icon: Icon, label }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              title={label}
              className={cn(
                'relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
                isActive
                  ? 'text-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[3px] w-[3px] h-3.5 rounded-full bg-[var(--color-accent)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile: horizontal bottom bar (hidden on md+) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-14 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/95 backdrop-blur-xl">
        {SECTIONS.map(({ id, icon: Icon, label }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              aria-label={label}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg transition-all duration-150',
                isActive
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)]'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium tracking-wide">{label}</span>
              {/* Active indicator: horizontal line under the icon */}
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[var(--color-accent)]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
