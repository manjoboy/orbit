'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export function MeetingPrepCard({ data }: { data: Record<string, unknown> }) {
  const [isOpen, setIsOpen] = useState(false);
  const m = data as {
    title: string; time: string; duration: string;
    attendees: Array<{ name: string; title?: string; health?: number }>;
    anticipations: Array<{ emoji: string; title: string; body: string }>;
    openItems: string[]; lastMeetingSummary?: string;
  };

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden transition-colors',
      isOpen ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)]' : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
    )}>
      <div className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{m.title}</span>
            {m.openItems.length > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-400/80">
                <AlertCircle className="w-2.5 h-2.5" />{m.openItems.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
            <span className="text-[var(--color-accent)]">{m.time}</span>
            <span>·</span><span>{m.duration}</span>
            <span>·</span><Users className="w-2.5 h-2.5" /><span>{m.attendees.length}</span>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />}
      </div>

      {isOpen && (
        <div className="px-3.5 pb-3 space-y-3 border-t border-[var(--color-border-subtle)] pt-2.5 animate-fade-in">
          <div className="flex flex-wrap gap-1">
            {m.attendees.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-bg-tertiary)] text-[11px] text-[var(--color-text-secondary)]">
                {a.name}{a.health !== undefined && a.health < 0.6 && <span className="w-1 h-1 rounded-full bg-amber-400/70" />}
              </span>
            ))}
          </div>

          {m.anticipations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-medium text-[var(--color-accent)] uppercase tracking-widest">Heads up</span>
              {m.anticipations.map((a, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-[var(--color-accent-subtle)] border border-[rgba(129,140,248,0.08)]">
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{a.emoji} {a.title}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">{a.body}</p>
                </div>
              ))}
            </div>
          )}

          {m.openItems.length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Open items</span>
              <ul className="mt-1 space-y-0.5">
                {m.openItems.map((item, i) => (
                  <li key={i} className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-[var(--color-text-muted)]">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
