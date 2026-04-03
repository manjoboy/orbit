'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit, type Section, type ActivePanel } from '../orbit-app';
import { Calendar, TrendingUp, TrendingDown, Minus, Users, Newspaper, ChevronRight, Network, Pen, Bot, User } from 'lucide-react';
import { BRIEFING_SECTIONS } from '@/lib/briefing-data';

// ─── Typing indicator dots ───
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-typing-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-typing-dot" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

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

// ─── Draft key mapping: maps inbox `from` field to a draft template key ───
const DRAFT_KEY_MAP: Record<string, string> = {
  'Sarah Chen': 'sarah-auth',
  'David Park (CFO)': 'david-budget',
  'Jordan Liu': 'jordan-sso',
};

export function BriefingStream() {
  const { setActivePanel, setActiveSection, messages, isStreaming } = useOrbit();
  const [visibleSections, setVisibleSections] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Stream sections in one by one
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let i = 0;
    let cancelled = false;
    function showNext() {
      if (cancelled || i >= BRIEFING_SECTIONS.length) return;
      setVisibleSections(prev => prev + 1);
      i++;
      setTimeout(showNext, 400);
    }
    setTimeout(showNext, 500);

    return () => { cancelled = true; };
  }, []);

  // Auto-scroll on new sections
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleSections]);

  // Auto-scroll on new messages or streaming content
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMsgContent = lastMsg?.content ?? '';
  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, lastMsgContent]);

  const sections = BRIEFING_SECTIONS.slice(0, visibleSections);
  const allSectionsLoaded = visibleSections >= BRIEFING_SECTIONS.length;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="px-4 md:px-5 py-5 md:py-6 space-y-4 md:space-y-5">
        {/* Greeting */}
        {visibleSections > 0 && (
          <div className="animate-slide-up">
            <p className="text-[20px] font-semibold text-[var(--color-text-primary)] tracking-tight leading-tight">
              Good morning, Manoj
            </p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">
              Tuesday, April 1 &middot; 3 items need action, 1 project at risk
            </p>
          </div>
        )}

        {/* Sections */}
        {sections.map((section, sIdx) => (
          <div key={section.id} className="animate-slide-up" style={{ opacity: 0, animationDelay: `${sIdx * 60}ms` }}>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-2">
              <section.icon className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{section.label}</span>
              {section.count !== undefined && (
                <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{section.count}</span>
              )}
            </div>

            {/* Section content */}
            {section.type === 'ai-message' && (
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6]">{section.message}</p>
            )}

            {section.type === 'item-list' && (
              <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
                {section.items?.map((item, i) => {
                  const draftKey = item.from ? DRAFT_KEY_MAP[item.from] : undefined;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors',
                        'hover:bg-[var(--color-bg-tertiary)]',
                        i > 0 && 'border-t border-[var(--color-border-subtle)]'
                      )}
                    >
                      <button
                        onClick={() => {
                          setActivePanel({ type: item.panelType as ActivePanel['type'], title: item.title, data: item as unknown as Record<string, unknown> });
                          setActiveSection(section.id as Section);
                        }}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <item.icon className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {item.from && <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{item.from}</span>}
                            {item.time && <span className="text-[10px] text-[var(--color-text-muted)]">{item.time}</span>}
                            {item.urgency && <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />}
                          </div>
                          <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">{item.title}</p>
                        </div>
                      </button>
                      {draftKey && (
                        <button
                          onClick={() => {
                            setActivePanel({
                              type: 'draft',
                              title: `Reply to ${item.from}`,
                              data: {
                                draftKey,
                                previousPanel: { type: item.panelType, title: item.title, data: item },
                              },
                            });
                            setActiveSection(section.id as Section);
                          }}
                          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-[var(--color-accent)] bg-[var(--color-accent-subtle)] hover:bg-[rgba(129,140,248,0.18)] transition-colors"
                          title="Draft reply"
                        >
                          <Pen className="w-2.5 h-2.5" />
                          Reply
                        </button>
                      )}
                      {!draftKey && (
                        <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {section.type === 'meeting-list' && (
              <div className="space-y-1.5">
                {section.meetings?.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActivePanel({ type: 'meeting', title: m.title, data: m as unknown as Record<string, unknown> });
                      setActiveSection('meetings');
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors',
                      'border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    <Calendar className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[12.5px] font-medium text-[var(--color-text-primary)]">{m.title}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                        <span className="text-[var(--color-accent)]">{m.time}</span>
                        <span>&middot;</span>
                        <span>{m.duration}</span>
                        <span>&middot;</span>
                        <Users className="w-2.5 h-2.5" />
                        <span>{m.attendeeCount}</span>
                      </div>
                    </div>
                    {m.alertCount > 0 && (
                      <span className="text-[10px] font-medium text-amber-400/80 tabular-nums">{m.alertCount} heads up</span>
                    )}
                    <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {section.type === 'project-list' && (
              <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
                {section.projects?.map((p, i) => {
                  const hc = p.health >= 0.7 ? 'text-emerald-400/80' : p.health >= 0.4 ? 'text-amber-400/80' : 'text-red-400/80';
                  const bc = p.health >= 0.7 ? 'bg-emerald-500/50' : p.health >= 0.4 ? 'bg-amber-500/50' : 'bg-red-500/50';
                  const T = p.trend === 'up' ? TrendingUp : p.trend === 'down' ? TrendingDown : Minus;
                  const tc = p.trend === 'up' ? 'text-emerald-400/70' : p.trend === 'down' ? 'text-red-400/70' : 'text-[var(--color-text-muted)]';
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setActivePanel({ type: 'project', title: p.name, data: p as unknown as Record<string, unknown> });
                        setActiveSection('projects');
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--color-bg-tertiary)]',
                        i > 0 && 'border-t border-[var(--color-border-subtle)]'
                      )}
                    >
                      <span className={cn('text-[13px] font-semibold tabular-nums w-7 text-right shrink-0', hc)}>{Math.round(p.health * 100)}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{p.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn('flex items-center gap-0.5 text-[10px]', tc)}><T className="w-2.5 h-2.5" />{p.velocity > 0 ? '+' : ''}{p.velocity}%</span>
                          {p.blockers > 0 && <span className="text-[10px] text-amber-400/70">{p.blockers} blocked</span>}
                          {p.deadline != null && <span className="text-[10px] text-[var(--color-text-muted)]">{p.deadline}d</span>}
                        </div>
                      </div>
                      <div className="w-16 h-[3px] bg-[var(--color-bg-elevated)] rounded-full overflow-hidden shrink-0">
                        <div className={cn('h-full rounded-full', bc)} style={{ width: `${Math.round(p.health * 100)}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {section.type === 'intel-list' && (
              <div className="space-y-1.5">
                {section.signals?.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActivePanel({ type: 'intel', title: s.title, data: s as unknown as Record<string, unknown> });
                      setActiveSection('intel');
                    }}
                    className={cn(
                      'w-full flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-colors',
                      'border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    <Newspaper className="w-3.5 h-3.5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{s.type}</span>
                        {s.company && <><span className="text-[var(--color-text-muted)]">&middot;</span><span className="text-[10px] text-[var(--color-text-tertiary)]">{s.company}</span></>}
                        <span className="ml-auto text-[10px] text-[var(--color-accent)]">{s.relevance}%</span>
                      </div>
                      <p className="text-[12px] font-medium text-[var(--color-text-primary)] mt-0.5">{s.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {section.type === 'people-list' && (
              <div className="space-y-2">
                <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
                  {section.people?.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActivePanel({ type: 'person', title: p.name, data: p as unknown as Record<string, unknown> });
                        setActiveSection('people');
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--color-bg-tertiary)]',
                        i > 0 && 'border-t border-[var(--color-border-subtle)]'
                      )}
                    >
                      <div className="w-7 h-7 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)] shrink-0">
                        {p.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-medium text-[var(--color-text-primary)]">{p.name}</span>
                        <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{p.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{p.days}d</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setActivePanel({ type: 'person', title: 'Relationship Map', data: { __view: 'network-graph' } as Record<string, unknown> });
                    setActiveSection('people');
                  }}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-left transition-colors',
                    'border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  <Network className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span className="text-[12px] font-medium text-[var(--color-accent)]">View Relationship Map</span>
                </button>
              </div>
            )}

            {section.type === 'wellbeing' && (
              <div className="rounded-xl border border-[var(--color-border-subtle)] px-3.5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[var(--color-text-secondary)]">Sustainability</span>
                  <span className={cn('text-[15px] font-semibold tabular-nums',
                    (section.score ?? 0) >= 70 ? 'text-emerald-400/80' : (section.score ?? 0) >= 50 ? 'text-amber-400/80' : 'text-red-400/80'
                  )}>{section.score ?? 0}/100</span>
                </div>
                <div className="h-[3px] bg-[var(--color-bg-elevated)] rounded-full overflow-hidden mb-2">
                  <div className={cn('h-full rounded-full',
                    (section.score ?? 0) >= 70 ? 'bg-emerald-500/50' : (section.score ?? 0) >= 50 ? 'bg-amber-500/50' : 'bg-red-500/50'
                  )} style={{ width: `${section.score ?? 0}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {section.metrics?.map((m, i) => (
                    <div key={i} className="py-1 rounded-md bg-[var(--color-bg-tertiary)]">
                      <div className={cn('text-[12px] font-semibold tabular-nums', m.warn ? 'text-amber-400/80' : 'text-[var(--color-text-primary)]')}>{m.value}</div>
                      <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ─── Conversation Messages ─── */}
        {allSectionsLoaded && messages.length > 0 && (
          <div className="pt-3 border-t border-[var(--color-border-subtle)]">
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
                        {msg.content ? (
                          renderMessageContent(msg.content)
                        ) : (
                          <TypingIndicator />
                        )}
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

              {/* Streaming indicator */}
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
