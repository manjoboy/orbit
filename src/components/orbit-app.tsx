'use client';

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { OrbitHeader } from './nav/orbit-header';
import { SectionNav } from './nav/section-nav';
import { ChatInput } from './conversation/chat-input';
import { BriefingStream } from './conversation/briefing-stream';
import { DetailCanvas } from './canvas/detail-canvas';
import { CommandPalette } from './command-palette/command-palette';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';

// ─── Shared State ───
export type ActivePanel = {
  type: 'meeting' | 'project' | 'person' | 'intel' | 'wellbeing' | 'draft' | 'settings' | null;
  id?: string;
  title?: string;
  data?: Record<string, unknown>;
};

export type Section = 'inbox' | 'meetings' | 'projects' | 'intel' | 'people' | 'wellbeing';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface OrbitContextType {
  activePanel: ActivePanel;
  setActivePanel: (p: ActivePanel) => void;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const OrbitContext = createContext<OrbitContextType>({
  activePanel: { type: null },
  setActivePanel: () => {},
  activeSection: 'inbox',
  setActiveSection: () => {},
  messages: [],
  isStreaming: false,
  sendMessage: () => {},
  commandPaletteOpen: false,
  setCommandPaletteOpen: () => {},
});

export const useOrbit = () => useContext(OrbitContext);

// ─── Main App ───
export function OrbitApp() {
  const [activePanel, setActivePanel] = useState<ActivePanel>({ type: null });
  const [activeSection, setActiveSection] = useState<Section>('inbox');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const isPanelOpen = activePanel.type !== null;

  // Abort controller for cancelling in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    // Create placeholder AI message
    const aiMsgId = `ai-${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);

    // Call API
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const content = accumulated;

        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content } : m))
        );
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: m.content || 'Sorry, something went wrong. Please try again.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming]);

  // Keyboard shortcut: Cmd+K to open command palette
  useKeyboardShortcut('cmd+k', () => {
    setCommandPaletteOpen((prev) => !prev);
  }, { allowInInput: true });

  return (
    <OrbitContext.Provider
      value={{
        activePanel,
        setActivePanel,
        activeSection,
        setActiveSection,
        messages,
        isStreaming,
        sendMessage,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      <div className="flex flex-col h-screen">
        <OrbitHeader />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Left: Conversation Stream — full-width on mobile, constrained on desktop when panel open */}
          <div className={cn(
            'flex flex-col transition-all duration-300 ease-[var(--ease-out)]',
            'w-full',
            isPanelOpen ? 'md:w-[480px] md:min-w-[480px]' : 'md:flex-1'
          )}>
            {/* Add bottom padding on mobile for the bottom nav bar */}
            <div className="flex flex-col flex-1 overflow-hidden pb-14 md:pb-0">
              <BriefingStream />
              <ChatInput
                onSend={(text) => sendMessage(text)}
                isDisabled={isStreaming}
              />
            </div>
          </div>

          {/* Right: Detail Canvas — overlay on mobile, side-by-side on md+ */}
          {isPanelOpen && (
            <>
              {/* Mobile backdrop */}
              <div
                className="md:hidden fixed inset-0 z-40 bg-black/60 animate-fade-in-backdrop"
                onClick={() => setActivePanel({ type: null })}
              />
              {/* Panel */}
              <div className={cn(
                // Mobile: fixed full-screen overlay
                'fixed inset-0 z-50 bg-[var(--color-bg-primary)] animate-slide-up-overlay',
                // Desktop: side-by-side
                'md:relative md:inset-auto md:z-auto md:flex-1 md:border-l md:border-[var(--color-border-subtle)] md:animate-fade-in md:bg-transparent'
              )}>
                {/* Mobile close button */}
                <button
                  onClick={() => setActivePanel({ type: null })}
                  className="md:hidden absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                  aria-label="Close panel"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
                </button>
                <DetailCanvas />
              </div>
            </>
          )}

          {/* Far right: Section Nav dots — hidden on mobile (replaced by bottom bar) */}
          <SectionNav />
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette />
    </OrbitContext.Provider>
  );
}
