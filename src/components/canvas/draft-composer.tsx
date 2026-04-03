'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useOrbit } from '../orbit-app';
import {
  X,
  Send,
  Trash2,
  RefreshCw,
  Check,
  Sparkles,
  ArrowLeft,
  User,
} from 'lucide-react';

// ─── Draft Templates ───

interface DraftTemplate {
  /** match key used from data.draftKey */
  key: string;
  recipient: string;
  subject: string;
  body: string;
}

const DRAFT_TEMPLATES: DraftTemplate[] = [
  {
    key: 'sarah-auth',
    recipient: 'Sarah Chen',
    subject: 'Re: Critical auth dependency',
    body: `Hey Sarah,

I've been reviewing the auth dependency issue and I think the phased approach James mentioned makes the most sense given the timeline. Here's what I'm thinking:

1. Phase 1 (this week): Implement the workaround for the 3rd-party auth service to unblock the current sprint
2. Phase 2 (next sprint): Full migration to the new auth provider with proper load testing

I can share the load test results by EOD today as planned. Can you update the migration runbook on your end so we're aligned before standup tomorrow?

Let me know if you see any gaps in this approach.`,
  },
  {
    key: 'david-budget',
    recipient: 'David Park',
    subject: 'Re: Q2 headcount projections',
    body: `David,

Attaching the updated headcount projections for Q2. Key highlights:

- Engineering: Requesting 3 additional hires (2 senior, 1 staff) to support Agent Builder v2 and the auth migration
- Timeline: Staggered start dates across April-June to manage onboarding load
- Budget impact: ~$180K incremental quarterly cost, offset by $95K from the contractor wind-down

I've factored in the budget constraints you raised in last week's product review. Happy to walk through the numbers in the 2pm meeting today or schedule a separate deep-dive.

The Enterprise Onboarding project is the main risk area -- the -42% velocity drop is largely a staffing issue that these hires would address.`,
  },
  {
    key: 'intercom-battlecard',
    recipient: 'Sales Team',
    subject: 'Competitive Brief: Intercom AI Agent Builder',
    body: `## Competitive Brief: Intercom AI Agent Builder

### Key Differentiators (Us vs. Intercom)

**Where we win:**
- Deep workflow customization -- our agent builder supports multi-step, conditional logic that Intercom's v1 cannot match
- Native integration with existing support stack (Zendesk, Salesforce, HubSpot)
- On-premise deployment option for regulated industries
- 3x faster agent training with our proprietary fine-tuning pipeline

**Where Intercom wins:**
- Brand recognition in SMB/mid-market segment
- Simpler onboarding experience (lower time-to-value for basic use cases)
- Bundled with their existing chat product at no additional cost

### Recommended Talk Track
Lead with our enterprise-grade customization story. For the 3 prospects currently evaluating Intercom, emphasize our compliance certifications and data residency options -- these are table stakes for enterprise buyers that Intercom lacks.

### Action Items
- [ ] Schedule competitive demo for Acme Corp (renewal in 60 days)
- [ ] Update pitch deck with latest benchmarks
- [ ] Arm SE team with objection-handling guide`,
  },
  {
    key: 'jordan-sso',
    recipient: 'Jordan Liu',
    subject: 'Re: Enterprise SSO architecture review',
    body: `Jordan,

Just reviewed the SSO architecture doc -- excellent work. The federated identity approach is solid, and I particularly like the fallback mechanism for IdP outages.

A few minor comments I left inline:
1. Consider adding rate limiting on the token refresh endpoint
2. The session timeout values should be configurable per-tenant
3. Let's add a section on key rotation strategy

I'm approving this with those minor additions. Great job taking ownership of this -- it's exactly the kind of systems thinking that the platform team needs. Speaking of which, I owe you an update on the API redesign opening. Let's discuss in our 4pm 1:1 today.`,
  },
];

const ALTERNATE_DRAFTS: Record<string, string[]> = {
  'sarah-auth': [
    `Sarah,

Thanks for flagging the auth dependency risk. After thinking about it more, I'd like to propose we go with the 2-day delay rather than the workaround. Here's my reasoning:

The workaround introduces technical debt that will cost us 3x more to unwind later. Given that the migration deadline is in 10 days, a 2-day delay still gives us an 8-day buffer.

I'll bring this up at standup tomorrow. Can you prepare a brief risk assessment comparing both options so we have data to back the decision?`,
    `Hi Sarah,

Quick thought on the auth situation -- what if we split the team? You and Alex take the workaround path while Jordan explores the clean migration in parallel. We can decision-gate on Thursday based on progress.

I'll clear your calendar for focused work this week. Let me know what you need from me to make this work.`,
  ],
  'david-budget': [
    `David,

Here are the Q2 projections. I've prepared two scenarios:

Scenario A (Conservative): 2 hires, $120K incremental
Scenario B (Growth): 4 hires, $240K incremental, but accelerates Agent Builder v2 by 6 weeks

My recommendation is Scenario B given the Intercom competitive pressure, but I understand if the board wants a more conservative approach. Happy to discuss the tradeoffs at 2pm.`,
  ],
  'intercom-battlecard': [
    `## Competitive Brief: Intercom AI Agent Builder

### Executive Summary
Intercom's new AI Agent Builder targets the same enterprise segment we're pursuing with Agent Builder v2. While their brand is strong in SMB, we have significant advantages in enterprise customization, compliance, and integration depth.

### Win Strategy
Focus on three pillars:
1. **Customization depth** -- our conditional logic engine is 2 generations ahead
2. **Enterprise readiness** -- SOC 2 Type II, HIPAA, on-prem options
3. **Integration ecosystem** -- 40+ native connectors vs. their 12

### Immediate Actions
Tom's team should schedule competitive demos for all 3 at-risk prospects this week. I'll provide updated benchmark data by Wednesday.`,
  ],
};

// ─── Helper: find template ───

function findTemplate(draftKey?: string): DraftTemplate {
  if (draftKey) {
    const found = DRAFT_TEMPLATES.find(t => t.key === draftKey);
    if (found) return found;
  }
  return DRAFT_TEMPLATES[0];
}

function getAlternateDraft(draftKey: string, currentIndex: number): string | null {
  const alts = ALTERNATE_DRAFTS[draftKey];
  if (!alts || alts.length === 0) return null;
  return alts[currentIndex % alts.length];
}

// ─── Component ───

type ComposerState = 'editing' | 'sending' | 'sent';

export function DraftComposer() {
  const { activePanel, setActivePanel } = useOrbit();
  const data = activePanel.data ?? {};
  const draftKey = (data.draftKey as string) ?? 'sarah-auth';

  const template = findTemplate(draftKey);
  const [body, setBody] = useState(template.body);
  const [state, setState] = useState<ComposerState>('editing');
  const [regenerateIndex, setRegenerateIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevPanelRef = useRef(data.previousPanel as Record<string, unknown> | undefined);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [body]);

  // Reset when template changes
  useEffect(() => {
    setBody(template.body);
    setState('editing');
    setRegenerateIndex(0);
  }, [template]);

  const handleSend = useCallback(() => {
    setState('sending');
    // Simulate send delay
    setTimeout(() => {
      setState('sent');
    }, 1200);
  }, []);

  const handleDiscard = useCallback(() => {
    // Return to previous panel or close
    const prev = prevPanelRef.current;
    if (prev && prev.type) {
      setActivePanel(prev as { type: 'person'; title?: string; data?: Record<string, unknown> });
    } else {
      setActivePanel({ type: null });
    }
  }, [setActivePanel]);

  const handleRegenerate = useCallback(() => {
    setIsRegenerating(true);
    const nextIndex = regenerateIndex + 1;
    setRegenerateIndex(nextIndex);

    // Simulate AI regeneration
    setTimeout(() => {
      const alt = getAlternateDraft(draftKey, nextIndex - 1);
      if (alt) {
        setBody(alt);
      } else {
        // Slight variation of original
        setBody(template.body + '\n\n(Regenerated with additional context)');
      }
      setIsRegenerating(false);
    }, 800);
  }, [draftKey, regenerateIndex, template.body]);

  const handleBackToEditing = useCallback(() => {
    setState('editing');
    setBody(template.body);
    setRegenerateIndex(0);
  }, [template.body]);

  // ─── Sent state ───
  if (state === 'sent') {
    return (
      <div className="flex flex-col h-full animate-slide-in-right">
        <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-[var(--color-border-subtle)]">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Message Sent</span>
          <button
            onClick={handleDiscard}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center animate-check-pop">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-medium text-[var(--color-text-primary)]">Sent to {template.recipient}</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">{template.subject}</p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleBackToEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Draft another
            </button>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Sending state ───
  if (state === 'sending') {
    return (
      <div className="flex flex-col h-full animate-slide-in-right">
        <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-[var(--color-border-subtle)]">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Sending...</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-typing-dot-1" />
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-typing-dot-2" />
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-typing-dot-3" />
          </div>
          <p className="text-[12px] text-[var(--color-text-tertiary)]">Sending to {template.recipient}...</p>
        </div>
      </div>
    );
  }

  // ─── Editing state ───
  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Draft Reply</span>
        </div>
        <button
          onClick={handleDiscard}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Composer body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Recipient */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[11px] font-bold text-[var(--color-text-secondary)]">
            {template.recipient.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-[12px] font-medium text-[var(--color-text-primary)]">To: {template.recipient}</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">{template.subject}</p>
          </div>
        </div>

        {/* AI badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-accent-subtle)] border border-[rgba(129,140,248,0.06)] w-fit">
          <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
          <span className="text-[10px] font-medium text-[var(--color-accent)]">AI-generated draft</span>
        </div>

        {/* Textarea */}
        <div className="relative">
          {isRegenerating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--color-bg-tertiary)]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[var(--color-accent)] animate-spin" />
                <span className="text-[12px] text-[var(--color-text-secondary)]">Regenerating...</span>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            className={cn(
              'w-full min-h-[200px] px-4 py-3 rounded-xl',
              'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]',
              'text-[12px] text-[var(--color-text-secondary)] leading-relaxed',
              'placeholder:text-[var(--color-text-muted)]',
              'outline-none resize-none',
              'focus:border-[var(--color-border-strong)]',
              'transition-colors'
            )}
            placeholder="Write your reply..."
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors',
              'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]',
              isRegenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('w-3 h-3', isRegenerating && 'animate-spin')} />
            Regenerate
          </button>
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[var(--color-text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Discard
          </button>
        </div>
        <button
          onClick={handleSend}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium bg-[var(--color-accent-strong)] text-white hover:opacity-90 transition-opacity"
        >
          <Send className="w-3 h-3" />
          Send
        </button>
      </div>
    </div>
  );
}
