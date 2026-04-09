'use client';

// ============================================================================
// Agent Context — Action Queue state management
// Provides: addAction, approveAction, dismissAction, pendingCount
// ============================================================================

import { createContext, useContext, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { toast } from 'sonner';
import type { AgentAction, AgentActionStatus } from './agent-types';
import { createAgentAction } from './agent-types';

// ─── Seed actions per persona (shown when queue is empty on first mount) ───

const SEED_ACTIONS: Record<string, Array<Omit<AgentAction, 'id' | 'createdAt' | 'status'>>> = {
  sales: [
    {
      type: 'escalate',
      title: 'Follow up with Acme Corp — deal stalling',
      description: 'The Acme Corp deal ($420K) has been in negotiation for 14 days with no activity. Their champion Sarah Kim hasn\'t responded to your last two emails.',
      reasoning: 'Deals that stall in negotiation for >10 days close at 23% lower rates. Recommend a direct phone call or executive sponsor introduction.',
      confidence: 0.85,
      sources: ['CRM Activity Log', 'Deal Analytics'],
      persona: 'sales',
      origin: 'briefing' as const,
    },
    {
      type: 'draft',
      title: 'Draft competitive battle card for Intercom',
      description: 'Three prospects mentioned Intercom\'s new AI Agent Builder in discovery calls this week. Your current battle card is 6 weeks old.',
      confidence: 0.78,
      sources: ['Call Transcripts', 'Competitive Intel'],
      persona: 'sales',
      origin: 'briefing' as const,
    },
  ],
  product: [
    {
      type: 'create',
      title: 'Synthesize feedback on export feature',
      description: '47 customers requested CSV/PDF export in the last 30 days, making it the #1 feature request. Consider adding to Sprint 25 scope.',
      reasoning: 'Export feature requests correlate with churn risk — 3 of your top-10 accounts mentioned this in QBRs.',
      confidence: 0.92,
      sources: ['Customer Feedback', 'Support Tickets'],
      persona: 'product',
      origin: 'briefing' as const,
    },
    {
      type: 'escalate',
      title: 'Sprint 24 at risk — 2 blockers unresolved',
      description: 'API rate limiting and SSO integration are blocking 3 stories (8 story points). Sprint ends in 4 days.',
      confidence: 0.88,
      sources: ['Sprint Board', 'Daily Standup Notes'],
      persona: 'product',
      origin: 'briefing' as const,
    },
  ],
  engineering: [
    {
      type: 'escalate',
      title: 'Critical: Auth service memory leak in staging',
      description: 'Memory usage on auth-service pods has grown 340% over the last 12 hours in staging. If promoted to production, expect OOM kills.',
      reasoning: 'Pattern matches a known issue with session cache not evicting expired tokens. Similar to incident INC-234 from March.',
      confidence: 0.94,
      sources: ['Datadog Alerts', 'Deploy Pipeline'],
      persona: 'engineering',
      origin: 'briefing' as const,
    },
    {
      type: 'create',
      title: 'Create ticket: Flaky test in payments module',
      description: 'The payments integration test has failed 4 of the last 7 CI runs on main. It\'s blocking PRs for 3 engineers.',
      confidence: 0.87,
      sources: ['CI/CD Dashboard', 'Slack #engineering'],
      persona: 'engineering',
      origin: 'briefing' as const,
    },
  ],
  finance: [
    {
      type: 'escalate',
      title: 'Engineering budget 12% over forecast',
      description: 'Cloud infrastructure costs exceeded forecast by $34K this month due to unplanned GPU usage for ML training jobs.',
      reasoning: 'If trend continues, Q2 engineering budget will be $102K over. Recommend reviewing ML compute allocation policy.',
      confidence: 0.91,
      sources: ['AWS Cost Explorer', 'Budget Tracker'],
      persona: 'finance',
      origin: 'briefing' as const,
    },
    {
      type: 'draft',
      title: 'Prepare board deck financial summary',
      description: 'Board meeting in 5 days. Revenue section is complete but operating expense breakdown and runway projections need updating.',
      confidence: 0.82,
      sources: ['Board Prep Tracker', 'Financial Model'],
      persona: 'finance',
      origin: 'briefing' as const,
    },
  ],
};

// ─── Serialization helpers (dates stored as ISO strings) ───

interface SerializedAction extends Omit<AgentAction, 'createdAt'> {
  createdAt: string;
}

function serializeActions(actions: AgentAction[]): SerializedAction[] {
  return actions.map((a) => ({ ...a, createdAt: a.createdAt.toISOString ? a.createdAt.toISOString() : String(a.createdAt) }));
}

function deserializeActions(raw: SerializedAction[]): AgentAction[] {
  return raw.map((a) => ({ ...a, createdAt: new Date(a.createdAt) }));
}

// ─── Context ───

interface AgentContextType {
  actions: AgentAction[];
  addAction: (partial: Omit<AgentAction, 'id' | 'createdAt' | 'status'>) => AgentAction;
  approveAction: (id: string) => void;
  dismissAction: (id: string) => void;
  pendingCount: number;
}

const AgentContext = createContext<AgentContextType>({
  actions: [],
  addAction: () => ({} as AgentAction),
  approveAction: () => {},
  dismissAction: () => {},
  pendingCount: 0,
});

export const useAgent = () => useContext(AgentContext);

// ─── Provider ───

export function AgentProvider({ persona, children }: { persona: string; children: ReactNode }) {
  const [serialized, setSerialized] = useLocalStorage<SerializedAction[]>('orbit-agent-actions', []);
  const seeded = useRef(false);

  const actions = deserializeActions(serialized);

  // Seed initial actions for the persona when queue is empty
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    if (serialized.length === 0) {
      const seeds = SEED_ACTIONS[persona] ?? SEED_ACTIONS.sales;
      const created = seeds.map((s) => createAgentAction(s));
      setSerialized(serializeActions(created));
    }
  }, [persona, serialized.length, setSerialized]);

  const setActions = useCallback(
    (updater: (prev: AgentAction[]) => AgentAction[]) => {
      setSerialized((prev) => {
        const current = deserializeActions(prev);
        const next = updater(current);
        return serializeActions(next);
      });
    },
    [setSerialized]
  );

  const addAction = useCallback(
    (partial: Omit<AgentAction, 'id' | 'createdAt' | 'status'>) => {
      const action = createAgentAction(partial);
      setActions((prev) => [action, ...prev]);
      toast('New action proposed', {
        description: action.title,
        duration: 4000,
      });
      return action;
    },
    [setActions]
  );

  const updateStatus = useCallback(
    (id: string, status: AgentActionStatus, toastMsg?: string) => {
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      if (toastMsg) {
        toast.success(toastMsg, { duration: 3000 });
      }
    },
    [setActions]
  );

  const approveAction = useCallback(
    (id: string) => updateStatus(id, 'completed', 'Action approved'),
    [updateStatus]
  );

  const dismissAction = useCallback(
    (id: string) => updateStatus(id, 'dismissed'),
    [updateStatus]
  );

  const pendingCount = actions.filter((a) => a.status === 'pending').length;

  return (
    <AgentContext.Provider value={{ actions, addAction, approveAction, dismissAction, pendingCount }}>
      {children}
    </AgentContext.Provider>
  );
}
