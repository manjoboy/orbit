import type { Message } from '@/components/conversation/conversation-view';

/**
 * The morning briefing scripted as a conversation.
 * This is what makes it feel like talking to a person, not reading a dashboard.
 *
 * NOTE: We use a lazy getter to avoid creating Date objects at module evaluation
 * time, which would cause React hydration mismatches (server vs. client timestamps).
 */

function buildConversationMessages(): Message[] {
  const now = new Date();
  return [
    // 1. Warm greeting with quick stats
    {
      id: 'briefing-1',
      role: 'ai',
      content: "Good morning, Manoj. I've been watching your world while you slept. Here's what I found overnight:",
      cards: [
        {
          type: 'stat-row',
          data: {
            stats: [
              { key: 'signals', label: 'signals detected', value: '23' },
              { key: 'insights', label: 'insights generated', value: '7' },
              { key: 'accuracy', label: 'briefing accuracy', value: '94%' },
            ],
          },
        },
      ],
      timestamp: now,
    },

    // 2. The #1 thing — most important item
    {
      id: 'briefing-2',
      role: 'ai',
      content: "First — this needs your attention. You have 6 items that need a response, ranked by urgency and importance:",
      cards: [
        {
          type: 'priority-list',
          data: {
            items: [
              {
                id: 'p1', type: 'message', title: 'Flagged a critical auth dependency — needs your call on workaround vs. delay',
                summary: 'The auth service migration has hit a dependency issue blocking 3 engineers. Sarah wants to know if you want to proceed with the workaround (faster, riskier) or delay the release by 2 days.',
                from: 'Sarah Chen', time: '2h ago', urgency: 0.92, action: 'Reply in Slack',
              },
              {
                id: 'p2', type: 'email', title: 'Q2 budget — needs your headcount projections by EOD',
                summary: 'CFO sent the revised template with new cost centers. Your projections are the last piece needed to finalize the Q2 budget.',
                from: 'David Park (CFO)', time: '4h ago', urgency: 0.85, action: 'Reply',
              },
              {
                id: 'p3', type: 'task', title: 'Enterprise SSO architecture proposal — waiting on your approval',
                summary: 'Jordan submitted the architecture doc. 3 team members reviewed. You\'re the last approver before implementation begins.',
                from: 'Jordan Liu', time: '8h ago', urgency: 0.70, action: 'Review',
              },
              {
                id: 'p4', type: 'pr', title: 'PR #847: Payment pipeline refactor — 2 days waiting',
                summary: 'Major refactor touching 14 files. All tests passing. Alex has been waiting for your review.',
                from: 'Alex Rivera', time: '2d ago', urgency: 0.63, action: 'Review PR',
              },
            ],
          },
        },
      ],
      timestamp: now,
    },

    // 3. Meeting prep — the high-stakes one
    {
      id: 'briefing-3',
      role: 'ai',
      content: "Your 2pm product review is the highest-stakes meeting today. I found some things you should know going in:",
      cards: [
        {
          type: 'meeting-prep',
          data: {
            title: 'Product Review — Q2 Roadmap',
            time: '2:00 PM',
            duration: '60 min',
            attendees: [
              { name: 'Mei Zhang', title: 'VP Product', health: 0.55 },
              { name: 'David Park', title: 'CFO', health: 0.68 },
              { name: 'Tom Baker', title: 'Head of Sales', health: 0.60 },
              { name: 'Sarah Chen', title: 'Staff Engineer', health: 0.85 },
            ],
            anticipations: [
              {
                emoji: '⚠️',
                title: "Mei's tone has shifted recently",
                body: "Her sentiment in the last 3 interactions is more critical than her baseline. She may be under board pressure on Q1 results. Open with a collaborative tone.",
              },
              {
                emoji: '📰',
                title: "Intercom's launch will come up",
                body: "Tom's team already received questions from 3 prospects. Expect him to push for accelerating the Agent Builder roadmap.",
              },
              {
                emoji: '📋',
                title: '2 action items from last meeting are still open',
                body: "Tom's pipeline forecast is overdue, and your headcount projections are due today. Both may cause friction.",
              },
            ],
            openItems: [
              'Submit updated headcount projections (you — due today)',
              'Finalize Q2 roadmap priorities (Mei — in review)',
              'Share enterprise pipeline forecast (Tom — overdue)',
            ],
            lastMeetingSummary: 'Reviewed Q1 OKR results. Velocity below target. Mei pushed for aggressive Q2 goals. David raised budget constraints.',
          },
        },
      ],
      timestamp: now,
    },

    // 4. Competitor intelligence
    {
      id: 'briefing-4',
      role: 'ai',
      content: "One external signal that's going to affect your day — a competitor made a move:",
      cards: [
        {
          type: 'intel-brief',
          data: {
            title: 'Intercom launches AI Agent Builder for enterprise',
            eventType: 'PRODUCT_LAUNCH',
            company: 'Intercom',
            summary: 'Intercom announced their new AI Agent Builder, targeting enterprise customers with customizable AI agents for customer support.',
            impact: 'This directly competes with your Q2 roadmap item "Agent Builder v2." 3 active prospects are also evaluating Intercom. Sales team needs an updated competitive battlecard before their next calls.',
            relevance: 0.91,
            action: 'Draft competitive battlecard',
            sourceUrl: 'https://techcrunch.com',
          },
        },
      ],
      timestamp: now,
    },

    // 5. Project health
    {
      id: 'briefing-5',
      role: 'ai',
      content: "Quick project pulse — one of your priorities is slipping:",
      cards: [
        {
          type: 'project-health',
          data: {
            projects: [
              { name: 'Enterprise Onboarding Redesign', health: 0.38, trend: 'declining', velocity: -42, blockers: 3, deadline: 18, status: 'AT_RISK' },
              { name: 'Agent Builder v2', health: 0.72, trend: 'stable', velocity: 5, blockers: 0, deadline: 45, status: 'ACTIVE' },
              { name: 'Auth Service Migration', health: 0.58, trend: 'declining', velocity: -15, blockers: 1, deadline: 10, status: 'ACTIVE' },
              { name: 'Dashboard Analytics v3', health: 0.89, trend: 'improving', velocity: 20, blockers: 0, deadline: 30, status: 'ACTIVE' },
            ],
          },
        },
      ],
      timestamp: now,
    },

    // 6. Relationships that need attention
    {
      id: 'briefing-6',
      role: 'ai',
      content: "Three relationships that need attention — I noticed some gaps in your network:",
      cards: [
        {
          type: 'relationship-alert',
          data: {
            alerts: [
              { name: 'Mei Zhang', title: 'VP Product', type: 'decay', days: 12, description: 'Key stakeholder for Q2 goals — no direct contact in 12 days', action: 'Schedule a sync before the 2pm review' },
              { name: 'James (CTO)', title: 'Chief Technology Officer', type: 'sentiment_shift', days: 5, description: 'Recent tone is more negative. Likely related to auth migration delays.', action: 'Send proactive status update' },
              { name: 'Tom Baker', title: 'Head of Sales', type: 'visibility_gap', days: 21, description: 'No 1:1 in 3 weeks. His pipeline forecast is overdue.', action: 'Follow up on forecast' },
            ],
          },
        },
      ],
      timestamp: now,
    },

    // 7. Wellbeing check
    {
      id: 'briefing-7',
      role: 'ai',
      content: "One more thing — I want to flag something about your pace this week:",
      cards: [
        {
          type: 'wellbeing',
          data: {
            score: 58,
            meetings: '5.2h',
            focus: '1.8h',
            switches: 14,
            recommendation: 'Your sustainability score dropped 15 points this week. Meeting load is 40% above baseline, focus time is critically low. Consider blocking a 2-hour focus block tomorrow morning.',
          },
        },
      ],
      timestamp: now,
    },

    // 8. Action prompt — what to do now
    {
      id: 'briefing-8',
      role: 'ai',
      content: "Your highest-leverage moves right now:",
      cards: [
        {
          type: 'action-prompt',
          data: {
            actions: [
              { label: 'Reply to Sarah about auth', description: 'Unblocks 3 engineers' },
              { label: 'Prep for 2pm product review', description: 'High-stakes meeting' },
              { label: 'Draft competitive battlecard', description: 'Sales team needs this' },
              { label: 'Submit budget projections', description: 'CFO waiting, due EOD' },
            ],
          },
        },
      ],
      timestamp: now,
    },
  ];
}

/** Lazily built to avoid hydration mismatches from module-level Date objects. */
let _cachedMessages: Message[] | null = null;
export function getConversationMessages(): Message[] {
  if (!_cachedMessages) {
    _cachedMessages = buildConversationMessages();
  }
  return _cachedMessages;
}

/**
 * @deprecated Use getConversationMessages() instead to avoid hydration mismatches.
 * Kept for backward compatibility.
 */
export const CONVERSATION_MESSAGES = buildConversationMessages();
