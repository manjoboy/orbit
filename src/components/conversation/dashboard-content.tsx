'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit, type Section, type ActivePanel } from '../orbit-app';
import { Calendar, Users, ChevronRight, Pen, Bot, User, CalendarDays, Play, BarChart3 } from 'lucide-react';
import { BRIEFING_SECTIONS, type BriefingSection } from '@/lib/briefing-data';

// ─── Avatar colors for inbox items ───
const AVATAR_COLORS: Record<string, string> = {
  'Sarah Chen': 'bg-pink-500',
  'David Park (CFO)': 'bg-blue-500',
  'Jordan Liu': 'bg-teal-500',
  'Alex Rivera': 'bg-purple-500',
};

// ─── Draft key mapping ───
const DRAFT_KEY_MAP: Record<string, string> = {
  'Sarah Chen': 'sarah-auth',
  'David Park (CFO)': 'david-budget',
  'Jordan Liu': 'jordan-sso',
};

// ─── Meeting color bars ───
const MEETING_COLORS = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];

// ─── Render markdown-like bold text ───
function renderMessageContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[var(--color-text-primary)]">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Typing indicator ───
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-typing-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-typing-dot" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export function DashboardContent() {
  const { setActivePanel, setActiveSection, messages, isStreaming } = useOrbit();
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll on messages
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMsgContent = lastMsg?.content ?? '';
  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, lastMsgContent]);

  const inboxSection = BRIEFING_SECTIONS.find(s => s.id === 'inbox') as Extract<BriefingSection, { type: 'item-list' }> | undefined;
  const meetingsSection = BRIEFING_SECTIONS.find(s => s.id === 'meetings') as Extract<BriefingSection, { type: 'meeting-list' }> | undefined;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className={cn(
        'px-5 md:px-7 py-6 transition-all duration-500',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            Good morning, Manoj
          </h1>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">
            Tuesday, April 1
          </p>
          {/* Status badges */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              3 items need action
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-orange-500/15 text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              1 project at risk
            </span>
          </div>
        </div>

        {/* Two column layout */}
        <div className="flex gap-6">
          {/* Left column: Priority Inbox */}
          <div className="flex-1 min-w-0">
            {inboxSection && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Priority Inbox</span>
                    <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center">
                      {inboxSection.count}
                    </span>
                  </div>
                  <button className="text-[11px] font-medium text-[var(--color-accent)] hover:underline">View all</button>
                </div>

                <div className="space-y-2">
                  {inboxSection.items.map((item, i) => {
                    const avatarColor = item.from ? AVATAR_COLORS[item.from] || 'bg-gray-500' : 'bg-gray-500';
                    const draftKey = item.from ? DRAFT_KEY_MAP[item.from] : undefined;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150',
                          'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                          'hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)]',
                          item.urgency && 'border-l-2 border-l-orange-500'
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn('w-8 h-8 rounded-full shrink-0 flex items-center justify-center', avatarColor)}>
                          <span className="text-[10px] font-bold text-white">
                            {item.from?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>

                        {/* Content */}
                        <button
                          onClick={() => {
                            setActivePanel({ type: item.panelType as ActivePanel['type'], title: item.title, data: item as unknown as Record<string, unknown> });
                            setActiveSection(inboxSection.id as Section);
                          }}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{item.from}</span>
                            <span className="text-[11px] text-[var(--color-text-muted)]">{item.time} ago</span>
                            {item.urgency && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                          </div>
                          <p className="text-[12px] text-[var(--color-text-tertiary)] truncate mt-0.5">{item.title}</p>
                        </button>

                        {/* Reply button */}
                        <button
                          onClick={() => {
                            if (draftKey) {
                              setActivePanel({
                                type: 'draft',
                                title: `Reply to ${item.from}`,
                                data: { draftKey, previousPanel: { type: item.panelType, title: item.title, data: item } },
                              });
                            } else {
                              setActivePanel({ type: item.panelType as ActivePanel['type'], title: item.title, data: item as unknown as Record<string, unknown> });
                            }
                            setActiveSection(inboxSection.id as Section);
                          }}
                          className={cn(
                            'shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150',
                            'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
                            'hover:from-orange-600 hover:to-orange-700',
                            'active:scale-95'
                          )}
                        >
                          Reply
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right column: Meetings + Quick Actions */}
          <div className="hidden md:flex flex-col gap-5 w-[260px] shrink-0">
            {/* Today's Meetings */}
            {meetingsSection && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Today&apos;s Meetings</span>
                  <span className="w-5 h-5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] text-[10px] font-bold flex items-center justify-center">
                    {meetingsSection.count}
                  </span>
                </div>

                <div className="space-y-2">
                  {meetingsSection.meetings.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActivePanel({ type: 'meeting', title: m.title, data: m as unknown as Record<string, unknown> });
                        setActiveSection('meetings');
                      }}
                      className={cn(
                        'w-full flex items-stretch gap-0 rounded-xl text-left transition-all duration-150 overflow-hidden',
                        'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                        'hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      {/* Color bar */}
                      <div className={cn('w-1 shrink-0', MEETING_COLORS[i % MEETING_COLORS.length])} />
                      <div className="flex-1 px-3 py-2.5">
                        <span className="text-[12px] font-semibold text-[var(--color-text-primary)] leading-tight block">{m.title}</span>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                          <span className="text-[var(--color-accent)] font-medium">{m.time}</span>
                          <span>&middot;</span>
                          <span>{m.duration}</span>
                          <span>&middot;</span>
                          <Users className="w-2.5 h-2.5" />
                          <span>{m.attendeeCount}</span>
                        </div>
                      </div>
                      {m.alertCount > 0 && (
                        <div className="flex items-center pr-3">
                          <span className="text-[10px] font-medium text-amber-400/80 whitespace-nowrap">{m.alertCount} heads up</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Quick Actions</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: CalendarDays, label: 'Schedule' },
                  { icon: Play, label: 'Delegate' },
                  { icon: BarChart3, label: 'Reports' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className={cn(
                      'flex flex-col items-center gap-2 py-3.5 rounded-xl transition-all duration-150',
                      'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]',
                      'hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]',
                      'active:scale-95'
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Conversation Messages ─── */}
        {messages.length > 0 && (
          <div className="pt-5 mt-5 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Conversation</span>
            </div>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'animate-slide-up flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center shrink-0 mt-0.5 mr-2">
                      <Bot className="w-3 h-3 text-[var(--color-accent)]" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3.5 py-2.5',
                      msg.role === 'user'
                        ? 'bg-[var(--color-accent-strong)] text-white'
                        : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-[13px] leading-[1.6] whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6] whitespace-pre-wrap">
                        {msg.content ? renderMessageContent(msg.content) : <TypingIndicator />}
                      </div>
                    )}
                    <p className={cn(
                      'text-[10px] mt-1.5',
                      msg.role === 'user' ? 'text-white/50' : 'text-[var(--color-text-muted)]'
                    )}>
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0 mt-0.5 ml-2">
                      <User className="w-3 h-3 text-[var(--color-text-secondary)]" />
                    </div>
                  )}
                </div>
              ))}

              {isStreaming && messages.length > 0 && lastMsg?.role === 'ai' && lastMsg?.content && (
                <div className="flex items-center gap-2 pl-8">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] animate-typing-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] animate-typing-dot" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] animate-typing-dot" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Orbit is thinking...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
