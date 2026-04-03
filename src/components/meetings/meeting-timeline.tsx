'use client';

import { useState } from 'react';
import { cn, formatTime, healthScoreColor } from '@/lib/utils';
import {
  Users,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  FileText,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface MeetingBrief {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{
    name: string;
    title?: string;
    relationshipHealth?: number;
    lastInteraction?: Date;
    recentContext?: string;
  }>;
  prepNotes: {
    lastMeetingSummary?: string;
    openActionItems: string[];
    relevantDecisions: string[];
    talkingPoints: string[];
    attendeeContext: string;
  };
  estimatedContextSwitchCost: number;
  anticipations?: Array<{
    type: string;
    title: string;
    body: string;
    confidence: number;
  }>;
}

export function MeetingTimeline({ meetings }: { meetings: MeetingBrief[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Use lazy initializer to avoid hydration mismatch from server/client time difference
  const [now] = useState(() => new Date());

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            Today&apos;s Meetings
          </h2>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-[var(--color-border-primary)]" />

        <div className="space-y-2">
          {meetings.map((meeting, index) => {
            const isExpanded = expandedId === meeting.id;
            const isUpcoming = meeting.startTime > now;
            const isHappening = meeting.startTime <= now && meeting.endTime > now;
            const durationMin = Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000);
            const minutesUntil = Math.round((meeting.startTime.getTime() - now.getTime()) / 60000);

            return (
              <div
                key={meeting.id}
                className={cn(
                  'relative pl-10',
                  'stagger-item animate-fade-in opacity-0'
                )}
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
              >
                {/* Timeline dot */}
                <div className={cn(
                  'absolute left-[13px] top-4 w-[11px] h-[11px] rounded-full border-2',
                  'bg-[var(--color-bg-primary)]',
                  isHappening
                    ? 'border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                    : isUpcoming
                      ? 'border-[var(--color-text-muted)]'
                      : 'border-[var(--color-border-secondary)]'
                )}>
                  {isHappening && (
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40" />
                  )}
                </div>

                {/* Meeting Card */}
                <div
                  className={cn(
                    'rounded-xl border transition-all duration-200 cursor-pointer',
                    isExpanded
                      ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-secondary)]'
                      : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)]',
                    isHappening && 'border-blue-500/30'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Time */}
                    <div className="flex flex-col items-center shrink-0 w-14">
                      <span className={cn(
                        'text-sm font-medium',
                        isHappening ? 'text-blue-400' : 'text-[var(--color-text-primary)]'
                      )}>
                        {formatTime(meeting.startTime)}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {durationMin}m
                      </span>
                    </div>

                    <div className="w-px h-8 bg-[var(--color-border-primary)]" />

                    {/* Title and metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {meeting.title}
                        </h3>
                        {isHappening && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-400">
                            <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                            NOW
                          </span>
                        )}
                        {isUpcoming && minutesUntil <= 30 && minutesUntil > 0 && (
                          <span className="text-[11px] text-amber-400">
                            in {minutesUntil}m
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Users className="w-3 h-3 text-[var(--color-text-muted)]" />
                        <span className="text-[12px] text-[var(--color-text-tertiary)] truncate">
                          {meeting.attendees.map(a => a.name.split(' ')[0]).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Prep indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {meeting.prepNotes.openActionItems.length > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-[11px] font-medium">
                            {meeting.prepNotes.openActionItems.length} open items
                          </span>
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded: Meeting Prep */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[var(--color-border-primary)] mt-1 animate-fade-in">
                      {/* Attendee Context */}
                      {meeting.attendees.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                            Attendees
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {meeting.attendees.map((attendee, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg',
                                  'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]'
                                )}
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)]">
                                  {attendee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <span className="text-xs text-[var(--color-text-primary)]">
                                    {attendee.name}
                                  </span>
                                  {attendee.relationshipHealth !== undefined && (
                                    <span className={cn('text-[10px] ml-1', healthScoreColor(attendee.relationshipHealth))}>
                                      ●
                                    </span>
                                  )}
                                  {attendee.title && (
                                    <p className="text-[10px] text-[var(--color-text-muted)]">
                                      {attendee.title}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Anticipations (AI-generated prep insights) */}
                      {meeting.anticipations && meeting.anticipations.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400 uppercase tracking-wider mb-2">
                            <Zap className="w-3 h-3" />
                            Heads Up
                          </h4>
                          <div className="space-y-1.5">
                            {meeting.anticipations.map((a, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'flex gap-2.5 px-3 py-2.5 rounded-lg',
                                  'bg-blue-500/5 border border-blue-500/10'
                                )}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-[var(--color-text-primary)]">
                                    {a.title}
                                  </p>
                                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
                                    {a.body}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Open action items */}
                      {meeting.prepNotes.openActionItems.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                            Open Action Items
                          </h4>
                          <ul className="space-y-1">
                            {meeting.prepNotes.openActionItems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                                <span className="text-amber-400 mt-0.5">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Last meeting summary */}
                      {meeting.prepNotes.lastMeetingSummary && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                            <FileText className="w-3 h-3" />
                            Last Meeting
                          </h4>
                          <p className="text-[13px] text-[var(--color-text-tertiary)] leading-relaxed">
                            {meeting.prepNotes.lastMeetingSummary}
                          </p>
                        </div>
                      )}

                      {/* Context switch cost */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-primary)]">
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          Est. context switch cost: ~{meeting.estimatedContextSwitchCost}min ramp-back
                        </span>
                        <button className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                          Open in Calendar
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
