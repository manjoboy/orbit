'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Users, Zap, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from 'lucide-react';

export function MeetingPrepCard({ data }: { data: Record<string, unknown> }) {
  const [isOpen, setIsOpen] = useState(false);
  const meeting = data as {
    title: string; time: string; duration: string; attendees: Array<{ name: string; title?: string; health?: number }>;
    anticipations: Array<{ emoji: string; title: string; body: string }>;
    openItems: string[]; lastMeetingSummary?: string;
  };

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden transition-all duration-300',
      'border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]',
      isOpen && 'border-blue-500/20 shadow-lg shadow-blue-500/5'
    )}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 shrink-0">
          <Calendar className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">{meeting.title}</h3>
            {meeting.openItems.length > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400">
                <AlertCircle className="w-2.5 h-2.5" />
                {meeting.openItems.length} open
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-blue-400 font-medium">{meeting.time}</span>
            <span className="text-[12px] text-[var(--color-text-muted)]">&middot; {meeting.duration}</span>
            <span className="text-[12px] text-[var(--color-text-muted)]">&middot;</span>
            <Users className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span className="text-[12px] text-[var(--color-text-muted)]">{meeting.attendees.length}</span>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />}
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border-primary)] pt-3 animate-fade-in">
          {/* Attendees */}
          <div className="flex flex-wrap gap-1.5">
            {meeting.attendees.map((a, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-[9px] font-bold text-[var(--color-text-secondary)]">
                  {a.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[11px] text-[var(--color-text-secondary)]">{a.name}</span>
                {a.health !== undefined && a.health < 0.6 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Relationship needs attention" />
                )}
              </div>
            ))}
          </div>

          {/* Anticipation insights */}
          {meeting.anticipations.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Heads up</span>
              </div>
              {meeting.anticipations.map((a, i) => (
                <div key={i} className="flex gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <span className="text-[14px] shrink-0 mt-0.5">{a.emoji}</span>
                  <div>
                    <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{a.title}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open items */}
          {meeting.openItems.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Open from last time</span>
              <ul className="mt-1.5 space-y-1">
                {meeting.openItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--color-text-tertiary)]">
                    <span className="text-amber-400 mt-0.5">○</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
