'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import { BRIEFING_SECTIONS, type BriefingSection } from '@/lib/briefing-data';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Zap, Plus, Video, MapPin } from 'lucide-react';
import { DetailCanvas } from '../canvas/detail-canvas';
import { PageHeader } from '../ui/page-header';
import { SegmentedControl } from '../ui/tabs';
import { Button } from '../ui/button';

type CalendarView = 'day' | 'week';

// ─── Full week of events for display ───
const WEEK_EVENTS = [
  // Monday Apr 7
  { id: 1, day: 0, title: 'Leadership Sync', time: '10:00 AM', duration: '30m', startHour: 10, endHour: 10.5, attendees: 5, color: 'bg-blue-500', type: 'recurring' },
  { id: 2, day: 0, title: 'Auth Migration Review', time: '2:00 PM', duration: '60m', startHour: 14, endHour: 15, attendees: 3, color: 'bg-amber-500', type: 'ad-hoc' },

  // Tuesday Apr 8 (today)
  { id: 3, day: 1, title: 'Engineering Standup', time: '9:00 AM', duration: '15m', startHour: 9, endHour: 9.25, attendees: 4, color: 'bg-orange-500', type: 'daily', headsUp: 1 },
  { id: 4, day: 1, title: 'Product Review — Q2 Roadmap', time: '2:00 PM', duration: '60m', startHour: 14, endHour: 15, attendees: 4, color: 'bg-blue-500', type: 'recurring', headsUp: 3 },
  { id: 5, day: 1, title: '1:1 with Jordan', time: '4:00 PM', duration: '30m', startHour: 16, endHour: 16.5, attendees: 1, color: 'bg-emerald-500', type: '1:1', headsUp: 1 },

  // Wednesday Apr 9
  { id: 6, day: 2, title: 'Board Prep Call', time: '9:30 AM', duration: '60m', startHour: 9.5, endHour: 10.5, attendees: 6, color: 'bg-purple-500', type: 'ad-hoc' },
  { id: 7, day: 2, title: '1:1 with Mei Zhang', time: '1:00 PM', duration: '30m', startHour: 13, endHour: 13.5, attendees: 1, color: 'bg-pink-500', type: '1:1' },
  { id: 8, day: 2, title: 'Team Retro', time: '4:00 PM', duration: '60m', startHour: 16, endHour: 17, attendees: 8, color: 'bg-teal-500', type: 'recurring' },

  // Thursday Apr 10
  { id: 9, day: 3, title: '1:1 with Tom Baker', time: '11:00 AM', duration: '30m', startHour: 11, endHour: 11.5, attendees: 1, color: 'bg-cyan-500', type: '1:1' },
  { id: 10, day: 3, title: 'Sales Pipeline Review', time: '2:00 PM', duration: '60m', startHour: 14, endHour: 15, attendees: 4, color: 'bg-blue-500', type: 'recurring' },

  // Friday Apr 11
  { id: 11, day: 4, title: 'Deep Work Block', time: '9:00 AM', duration: '120m', startHour: 9, endHour: 11, attendees: 0, color: 'bg-[var(--color-bg-elevated)]', type: 'block' },
  { id: 12, day: 4, title: 'Weekly Wrap-Up', time: '4:00 PM', duration: '30m', startHour: 16, endHour: 16.5, attendees: 2, color: 'bg-orange-500', type: 'recurring' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_DATES = ['Apr 7', 'Apr 8', 'Apr 9', 'Apr 10', 'Apr 11'];
const TODAY_INDEX = 1; // Tuesday

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am–6pm

// Meeting prep cards for today's meetings
const PREP_CARDS = [
  {
    time: '9:00 AM', title: 'Engineering Standup', prep: [
      'Load test results are due today — have them ready',
      'Expect auth dependency question from Sarah',
      'CTO discussed phased rollout — you may need to weigh in',
    ],
    urgent: true,
  },
  {
    time: '2:00 PM', title: 'Product Review — Q2 Roadmap', prep: [
      'Headcount projections are due — bring the doc',
      'Mei\'s been critical in recent interactions — read the room',
      'Tom will push on Intercom competitive response',
      '3 open items from last meeting (2 overdue)',
    ],
    urgent: true,
  },
  {
    time: '4:00 PM', title: '1:1 with Jordan', prep: [
      'Platform team opening is 6 weeks overdue — address it',
      'Jordan wants more complex work — have something lined up',
      'Opportunity to discuss growth plan for next 12 months',
    ],
    urgent: false,
  },
];

export function CalendarPage() {
  const { setActivePanel, activePanel } = useOrbit();
  const [view, setView] = useState<CalendarView>('week');
  const [showPrep, setShowPrep] = useState(true);
  const isPanelOpen = activePanel.type !== null;

  const meetingsSection = BRIEFING_SECTIONS.find(s => s.id === 'meetings') as Extract<BriefingSection, { type: 'meeting-list' }> | undefined;

  const handleEventClick = (eventId: number) => {
    const todayMeetings = WEEK_EVENTS.filter(e => e.day === TODAY_INDEX);
    const event = WEEK_EVENTS.find(e => e.id === eventId);
    if (!event || !meetingsSection) return;

    // Map to meeting data
    const idx = todayMeetings.findIndex(e => e.id === eventId);
    const meetingData = meetingsSection.meetings[idx];
    if (meetingData) {
      setActivePanel({ type: 'meeting', title: meetingData.title, data: meetingData as unknown as Record<string, unknown> });
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className={cn(
        'flex flex-col transition-all duration-300',
        isPanelOpen ? 'w-[620px] min-w-[620px]' : 'flex-1'
      )}>
        {/* Calendar header */}
        <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <PageHeader icon={Calendar} title="Calendar" />
              <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                <button className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[13px] font-medium text-[var(--color-text-secondary)] px-1">Apr 7 – 11, 2026</span>
                <button className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrep(!showPrep)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors',
                  showPrep
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                    : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
                )}
              >
                <Zap className="w-3 h-3" />Meeting Prep
              </button>
              <SegmentedControl
                options={[{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }]}
                active={view}
                onChange={setView}
              />
              <Button variant="primary" size="sm"><Plus className="w-3 h-3" />New event</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Meeting prep strip */}
          {showPrep && (
            <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-1.5 mb-3">
                <Zap className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Today&apos;s meeting prep</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PREP_CARDS.map((card, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3.5 rounded-xl border',
                      card.urgent
                        ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/20'
                        : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)]'
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock className="w-3 h-3 text-[var(--color-accent)]" />
                      <span className="text-[11px] font-medium text-[var(--color-accent)]">{card.time}</span>
                    </div>
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] mb-2">{card.title}</p>
                    <ul className="space-y-1">
                      {card.prep.map((point, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                          <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] mt-1.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week grid */}
          <div className="px-4 py-4">
            {/* Day headers */}
            <div className="grid gap-0" style={{ gridTemplateColumns: '52px repeat(5, 1fr)' }}>
              <div /> {/* time gutter */}
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    'text-center py-2 mb-1',
                  )}
                >
                  <div className={cn(
                    'flex flex-col items-center gap-1',
                  )}>
                    <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{day}</span>
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      i === TODAY_INDEX ? 'bg-[var(--color-accent)] text-white' : ''
                    )}>
                      <span className={cn(
                        'text-[14px] font-semibold',
                        i === TODAY_INDEX ? 'text-white' : 'text-[var(--color-text-primary)]'
                      )}>{8 + i}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="relative" style={{ gridTemplateColumns: '52px repeat(5, 1fr)' }}>
              {HOURS.map(hour => (
                <div key={hour} className="grid gap-0 border-t border-[var(--color-border-subtle)]" style={{ gridTemplateColumns: '52px repeat(5, 1fr)', minHeight: '52px' }}>
                  {/* Hour label */}
                  <div className="pr-3 pt-1">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                      {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                    </span>
                  </div>
                  {/* Day columns */}
                  {DAYS.map((_, dayIdx) => {
                    const events = WEEK_EVENTS.filter(e => e.day === dayIdx && Math.floor(e.startHour) === hour);
                    return (
                      <div key={dayIdx} className={cn(
                        'relative border-l border-[var(--color-border-subtle)] min-h-[52px]',
                        dayIdx === TODAY_INDEX ? 'bg-[var(--color-accent)]/[0.015]' : ''
                      )}>
                        {events.map(event => (
                          <button
                            key={event.id}
                            onClick={() => dayIdx === TODAY_INDEX && handleEventClick(event.id)}
                            className={cn(
                              'absolute inset-x-0.5 rounded-md px-2 py-1 text-left transition-all duration-150 overflow-hidden',
                              event.type === 'block'
                                ? 'bg-[var(--color-bg-tertiary)] border border-dashed border-[var(--color-border-default)]'
                                : cn(event.color, 'text-white opacity-90 hover:opacity-100'),
                              dayIdx === TODAY_INDEX ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
                            )}
                            style={{
                              top: `${(event.startHour - Math.floor(event.startHour)) * 52}px`,
                              height: `${(event.endHour - event.startHour) * 52 - 2}px`,
                            }}
                          >
                            <p className={cn(
                              'text-[10px] font-semibold truncate leading-tight',
                              event.type === 'block' ? 'text-[var(--color-text-muted)]' : 'text-white'
                            )}>{event.title}</p>
                            <p className={cn(
                              'text-[9px] mt-0.5 truncate',
                              event.type === 'block' ? 'text-[var(--color-text-muted)]' : 'text-white/80'
                            )}>{event.time} · {event.duration}</p>
                            {event.headsUp && (
                              <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/30 flex items-center justify-center">
                                <span className="text-[7px] font-bold text-white">{event.headsUp}</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming section */}
          <div className="px-6 py-4 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Upcoming this week</span>
            </div>
            <div className="space-y-2">
              {[
                { day: 'Wednesday', event: 'Board Prep Call', time: '9:30 AM', type: 'High priority', attendees: 6, icon: Video },
                { day: 'Thursday', event: 'Sales Pipeline Review', time: '2:00 PM', type: 'Recurring', attendees: 4, icon: Users },
                { day: 'Friday', event: 'Deep Work Block', time: '9:00 AM', type: 'Blocked time', attendees: 0, icon: Clock },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">{item.event}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded-md bg-[var(--color-bg-elevated)]">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                      <span>{item.day}</span>
                      <span>·</span>
                      <Clock className="w-2.5 h-2.5" />
                      <span>{item.time}</span>
                      {item.attendees > 0 && (
                        <>
                          <span>·</span>
                          <Users className="w-2.5 h-2.5" />
                          <span>{item.attendees}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail canvas */}
      {isPanelOpen && (
        <div className="flex-1 border-l border-[var(--color-border-subtle)] overflow-hidden">
          <DetailCanvas />
        </div>
      )}
    </div>
  );
}
