'use client';

import { useState, useRef, useEffect } from 'react';
import { ConversationHeader } from './conversation-header';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { CONVERSATION_MESSAGES } from '@/lib/conversation-data';

export type Message = {
  id: string;
  role: 'ai' | 'user';
  content?: string;
  cards?: CardData[];
  toolResults?: import('@/lib/agent-types').ToolResultCard[];
  timestamp: Date;
  isStreaming?: boolean;
};

export type CardData = {
  type: 'priority-list' | 'meeting-prep' | 'intel-brief' | 'relationship-alert' | 'project-health' | 'stat-row' | 'wellbeing' | 'action-prompt';
  data: Record<string, unknown>;
};

export function ConversationView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const msgs = CONVERSATION_MESSAGES;
    let i = 0;
    let cancelled = false;

    function showNext() {
      if (cancelled || i >= msgs.length) return;
      const msg = msgs[i];
      if (msg.role === 'ai') {
        setIsTyping(true);
        const delay = msg.cards ? 900 : 500;
        setTimeout(() => {
          if (cancelled) return;
          setIsTyping(false);
          setMessages(prev => [...prev, msg]);
          i++;
          setTimeout(showNext, 200);
        }, delay);
      } else {
        setMessages(prev => [...prev, msg]);
        i++;
        setTimeout(showNext, 600);
      }
    }

    setTimeout(showNext, 600);

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const replyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleSend(text: string) {
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: new Date() }]);
    setIsTyping(true);
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`, role: 'ai',
        content: "Looking into that now. Based on your recent activity and professional graph, here\u2019s what I found\u2026",
        timestamp: new Date(),
      }]);
    }, 1800);
  }

  return (
    <div className="flex flex-col h-screen">
      <ConversationHeader />
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-0.5">
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} isLatest={i === messages.length - 1} />
          ))}
          {isTyping && (
            <div className="flex items-center gap-1 py-3 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div className="h-2" />
        </div>
      </div>
      <ChatInput onSend={handleSend} isDisabled={isTyping} />
    </div>
  );
}
