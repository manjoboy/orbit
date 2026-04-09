'use client';

import { useState, useRef, useCallback, createContext, useContext, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { OrbitHeader } from './nav/orbit-header';
import { LeftSidebar } from './nav/left-sidebar';
import { ChatInput } from './conversation/chat-input';
import { DashboardContent } from './conversation/dashboard-content';
import { DetailCanvas } from './canvas/detail-canvas';
import { CommandPalette } from './command-palette/command-palette';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { InboxPage } from './pages/inbox-page';
import { CalendarPage } from './pages/calendar-page';
import { AnalyticsPage } from './pages/analytics-page';
// Legacy pages (kept for backwards compat, hidden from new persona nav)
import { FinancePage } from './pages/finance-page';
import { OperationsPage } from './pages/operations-page';
import { PipelinePage } from './pages/pipeline-page';
import { RoadmapPage } from './pages/roadmap-page';
// Persona-specific pages — Sales
import { DealsPage } from './pages/sales/deals-page';
import { RelationshipsPage } from './pages/sales/relationships-page';
import { CompetitiveIntelPage } from './pages/sales/competitive-intel-page';
// Persona-specific pages — Product
import { FeaturesPage } from './pages/product/features-page';
import { CustomerFeedbackPage } from './pages/product/customer-feedback-page';
import { SprintsPage } from './pages/product/sprints-page';
// Persona-specific pages — Engineering
import { TicketsPage } from './pages/engineering/tickets-page';
import { PullRequestsPage } from './pages/engineering/pull-requests-page';
import { DeploymentsPage } from './pages/engineering/deployments-page';
// Persona-specific pages — Finance
import { BudgetPage } from './pages/finance/budget-page';
import { ApprovalsPage } from './pages/finance/approvals-page';
import { ForecastingPage } from './pages/finance/forecasting-page';

import type { Persona } from '@/lib/persona';

// ─── Shared State ───
export type ActivePanel = {
  type: 'meeting' | 'project' | 'person' | 'intel' | 'wellbeing' | 'draft' | 'settings' | 'budget' | 'okr' | 'deal' | 'roadmap-detail' | null;
  id?: string;
  title?: string;
  data?: Record<string, unknown>;
};

export type Section = 'inbox' | 'meetings' | 'projects' | 'intel' | 'people' | 'wellbeing';

export type ActivePage =
  // Shared pages
  | 'home' | 'inbox' | 'calendar' | 'analytics'
  // Legacy pages (kept for backward compat)
  | 'finance' | 'operations' | 'pipeline' | 'roadmap'
  // Sales persona
  | 'deals' | 'relationships' | 'competitive-intel'
  // Product persona
  | 'features' | 'customer-feedback' | 'sprints'
  // Engineering persona
  | 'tickets' | 'pull-requests' | 'deployments'
  // Finance persona
  | 'budget' | 'approvals' | 'forecasting';

export type Theme = 'dark' | 'light';

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
  activePage: ActivePage;
  setActivePage: (p: ActivePage) => void;
  theme: Theme;
  toggleTheme: () => void;
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
  userName: string;
}

export const OrbitContext = createContext<OrbitContextType>({
  activePanel: { type: null },
  setActivePanel: () => {},
  activeSection: 'inbox',
  setActiveSection: () => {},
  activePage: 'home',
  setActivePage: () => {},
  theme: 'dark',
  toggleTheme: () => {},
  messages: [],
  isStreaming: false,
  sendMessage: () => {},
  commandPaletteOpen: false,
  setCommandPaletteOpen: () => {},
  persona: 'sales',
  setPersona: () => {},
  userName: 'Manoj',
});

export const useOrbit = () => useContext(OrbitContext);

// ─── Page Renderer ───
function PageContent({ activePage, isPanelOpen, setActivePanel, sendMessage, isStreaming }: {
  activePage: ActivePage;
  isPanelOpen: boolean;
  setActivePanel: (p: ActivePanel) => void;
  sendMessage: (text: string) => void;
  isStreaming: boolean;
}) {
  if (activePage === 'home') {
    return (
      <>
        <div className={cn(
          'flex flex-col transition-all duration-300 ease-[var(--ease-out)]',
          'w-full',
          isPanelOpen ? 'md:w-[520px] md:min-w-[520px]' : 'md:flex-1'
        )}>
          <div className="flex flex-col flex-1 overflow-hidden pb-14 md:pb-0">
            <DashboardContent />
            <ChatInput
              onSend={(text) => sendMessage(text)}
              isDisabled={isStreaming}
            />
          </div>
        </div>

        {/* Right: Detail Canvas */}
        {isPanelOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/60 animate-fade-in-backdrop"
              onClick={() => setActivePanel({ type: null })}
            />
            <div className={cn(
              'fixed inset-0 z-50 bg-[var(--color-bg-primary)] animate-slide-up-overlay',
              'md:relative md:inset-auto md:z-auto md:flex-1 md:border-l md:border-[var(--color-border-subtle)] md:animate-fade-in md:bg-transparent'
            )}>
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
      </>
    );
  }

  // Page routing
  switch (activePage) {
    case 'inbox': return <InboxPage />;
    case 'calendar': return <CalendarPage />;
    case 'analytics': return <AnalyticsPage />;
    // Legacy pages
    case 'finance': return <FinancePage />;
    case 'operations': return <OperationsPage />;
    case 'pipeline': return <PipelinePage />;
    case 'roadmap': return <RoadmapPage />;
    // Sales persona
    case 'deals': return <DealsPage />;
    case 'relationships': return <RelationshipsPage />;
    case 'competitive-intel': return <CompetitiveIntelPage />;
    // Product persona
    case 'features': return <FeaturesPage />;
    case 'customer-feedback': return <CustomerFeedbackPage />;
    case 'sprints': return <SprintsPage />;
    // Engineering persona
    case 'tickets': return <TicketsPage />;
    case 'pull-requests': return <PullRequestsPage />;
    case 'deployments': return <DeploymentsPage />;
    // Finance persona
    case 'budget': return <BudgetPage />;
    case 'approvals': return <ApprovalsPage />;
    case 'forecasting': return <ForecastingPage />;
    default: return null;
  }
}

// ─── Main App ───
export function OrbitApp() {
  const [activePanel, setActivePanel] = useState<ActivePanel>({ type: null });
  const [activeSection, setActiveSection] = useState<Section>('inbox');
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [theme, setTheme] = useState<Theme>('dark');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [persona, setPersona] = useLocalStorage<Persona>('orbit-persona', 'sales');
  const [userName] = useLocalStorage<string>('orbit-user-name', 'Manoj');
  const isPanelOpen = activePanel.type !== null;

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Apply theme to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Abort controller for cancelling in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const aiMsgId = `ai-${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

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

  useKeyboardShortcut('cmd+k', () => {
    setCommandPaletteOpen((prev) => !prev);
  }, { allowInInput: true });

  return (
    <OrbitContext.Provider
      value={{
        activePanel, setActivePanel,
        activeSection, setActiveSection,
        activePage, setActivePage,
        theme, toggleTheme,
        messages, isStreaming, sendMessage,
        commandPaletteOpen, setCommandPaletteOpen,
        persona, setPersona,
        userName,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0">
          <OrbitHeader />

          <div className="flex flex-1 overflow-hidden relative">
            <PageContent
              activePage={activePage}
              isPanelOpen={isPanelOpen}
              setActivePanel={setActivePanel}
              sendMessage={sendMessage}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>

      <CommandPalette />
    </OrbitContext.Provider>
  );
}
