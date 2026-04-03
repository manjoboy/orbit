'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { OrbitHeader } from './nav/orbit-header';
import { SectionNav } from './nav/section-nav';
import { ChatInput } from './conversation/chat-input';
import { BriefingStream } from './conversation/briefing-stream';
import { DetailCanvas } from './canvas/detail-canvas';

// ─── Shared State ───
export type ActivePanel = {
  type: 'meeting' | 'project' | 'person' | 'intel' | 'wellbeing' | null;
  id?: string;
  title?: string;
  data?: Record<string, unknown>;
};

export type Section = 'inbox' | 'meetings' | 'projects' | 'intel' | 'people' | 'wellbeing';

interface OrbitContextType {
  activePanel: ActivePanel;
  setActivePanel: (p: ActivePanel) => void;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
}

export const OrbitContext = createContext<OrbitContextType>({
  activePanel: { type: null },
  setActivePanel: () => {},
  activeSection: 'inbox',
  setActiveSection: () => {},
});

export const useOrbit = () => useContext(OrbitContext);

// ─── Main App ───
export function OrbitApp() {
  const [activePanel, setActivePanel] = useState<ActivePanel>({ type: null });
  const [activeSection, setActiveSection] = useState<Section>('inbox');
  const isPanelOpen = activePanel.type !== null;

  return (
    <OrbitContext.Provider value={{ activePanel, setActivePanel, activeSection, setActiveSection }}>
      <div className="flex flex-col h-screen">
        <OrbitHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Conversation Stream */}
          <div className={cn(
            'flex flex-col transition-all duration-300 ease-[var(--ease-out)]',
            isPanelOpen ? 'w-[480px] min-w-[480px]' : 'flex-1'
          )}>
            <BriefingStream />
            <ChatInput
              onSend={(text) => console.log('send:', text)}
              isDisabled={false}
            />
          </div>

          {/* Right: Detail Canvas */}
          {isPanelOpen && (
            <div className="flex-1 border-l border-[var(--color-border-subtle)] animate-fade-in">
              <DetailCanvas />
            </div>
          )}

          {/* Far right: Section Nav dots */}
          <SectionNav />
        </div>
      </div>
    </OrbitContext.Provider>
  );
}
