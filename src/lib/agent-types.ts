// ============================================================================
// Agent Harness — Shared Type System
// Used by: Streaming Briefing, Action Queue, Tool-Use Chat
// ============================================================================

// ─── Agent Action Types ───

export type AgentActionStatus = 'pending' | 'approved' | 'dismissed' | 'executing' | 'completed';

export type AgentActionType = 'navigate' | 'draft' | 'search' | 'create' | 'escalate' | 'schedule';

export interface AgentAction {
  id: string;
  type: AgentActionType;
  title: string;
  description: string;
  reasoning?: string;
  confidence: number; // 0–1
  sources: string[];
  status: AgentActionStatus;
  persona: string;
  createdAt: Date;
  origin: 'briefing' | 'chat' | 'dashboard';
  payload?: Record<string, unknown>;
}

// ─── Briefing Types ───

export interface BriefingInsight {
  id: string;
  headline: string;
  body: string;
  reasoning?: string;
  urgency: 'high' | 'medium' | 'low';
  proposedActions: Array<{ label: string; type: AgentActionType; description: string }>;
  sources: string[];
}

export interface BriefingStreamState {
  status: 'idle' | 'streaming' | 'complete' | 'error';
  greeting: string;
  insights: BriefingInsight[];
  rawText: string;
  error?: string;
}

// ─── Tool Result Card Types (for chat) ───

export type ToolResultCardType =
  | 'deal-list'
  | 'ticket-list'
  | 'draft-preview'
  | 'action-proposed'
  | 'summary'
  | 'navigation'
  | 'search-results'
  | 'detail-view';

export interface ToolResultCard {
  type: ToolResultCardType;
  title: string;
  data: Record<string, unknown>;
}

// ─── Helpers ───

let _actionCounter = 0;

export function createAgentAction(
  partial: Omit<AgentAction, 'id' | 'createdAt' | 'status'> & { status?: AgentActionStatus }
): AgentAction {
  _actionCounter++;
  return {
    ...partial,
    id: `action-${Date.now()}-${_actionCounter}`,
    createdAt: new Date(),
    status: partial.status ?? 'pending',
  };
}
