'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ConversationHeader } from './conversation-header';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { CONVERSATION_MESSAGES } from '@/lib/conversation-data';

export type Message = {
  id: string;
  role: 'ai' | 'user';
  content?: string;
  cards?: CardData[];
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
  const [streamedCount, setStreamedCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Stream in the morning briefing messages on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const briefingMessages = CONVERSATION_MESSAGES;
    let i = 0;

    function showNext() {
      if (i >= briefingMessages.length) return;

      const msg = briefingMessages[i];
      if (msg.role === 'ai') {
        setIsTyping(true);
        // Simulate thinking time proportional to message complexity
        const delay = msg.cards ? 1200 : 600;
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, msg]);
          setStreamedCount(prev => prev + 1);
          i++;
          setTimeout(showNext, 300);
        }, delay);
      } else {
        setMessages(prev => [...prev, msg]);
        i++;
        setTimeout(showNext, 800);
      }
    }

    // Small initial delay before the AI "starts talking"
    setTimeout(showNext, 800);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  function handleSend(text: string) {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: "I'm looking into that. Based on your professional graph and recent activity, here's what I found...",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 2000);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <ConversationHeader />

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-1">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLatest={index === messages.length - 1}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 py-3 animate-fade-in">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shrink-0 shadow-lg shadow-blue-500/20">
                <span className="text-[11px] font-bold text-white">CS</span>
              </div>
              <div className="flex items-center gap-1.5 pt-2.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div className="h-4" />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSend} isDisabled={isTyping} />
    </div>
  );
}
