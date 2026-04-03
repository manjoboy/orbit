// ============================================================================
// MOCK DATA — Realistic briefing data for development
// ============================================================================

// NOTE: Date objects are computed at module evaluation time. In SSR contexts
// this can produce hydration mismatches. Consumers should be aware that
// `generatedAt` and meeting start/end times are snapshot values.
const _now = typeof window === 'undefined' ? new Date('2026-04-02T08:00:00') : new Date();

export const MOCK_BRIEFING = {
  date: _now.toISOString().split('T')[0],
  generatedAt: _now,
  signalCount: 23,
  insightCount: 7,
  processingTimeMs: 3200,

  // ─── Priority Inbox ───
  priorityInbox: [
    {
      id: 'pi-1',
      type: 'message' as const,
      source: 'SLACK',
      title: 'Sarah Chen in #eng-platform',
      summary: 'Flagged a critical dependency issue with the auth service migration — needs your input on whether to proceed with the workaround or delay the release by 2 days.',
      urgencyScore: 0.92,
      importanceScore: 0.85,
      compositeScore: 0.89,
      suggestedAction: 'Reply',
      deepLink: 'slack://channel/C04ABC123',
      from: 'Sarah Chen',
      timestamp: new Date(_now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'pi-2',
      type: 'email' as const,
      source: 'GMAIL',
      title: 'Re: Q2 Planning — Final Budget Review',
      summary: 'CFO is requesting your updated headcount projections by EOD. Attached the revised template with the new cost centers.',
      urgencyScore: 0.85,
      importanceScore: 0.80,
      compositeScore: 0.83,
      suggestedAction: 'Reply',
      deepLink: 'https://mail.google.com',
      from: 'David Park (CFO)',
      timestamp: new Date(_now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'pi-3',
      type: 'task' as const,
      source: 'LINEAR',
      title: 'Review: Enterprise SSO architecture proposal',
      summary: 'Jordan submitted the architecture doc for the new SSO system. 3 team members have already reviewed — waiting on your approval to move to implementation.',
      urgencyScore: 0.70,
      importanceScore: 0.75,
      compositeScore: 0.73,
      suggestedAction: 'Review',
      deepLink: 'https://linear.app/issue/ENG-1234',
      from: 'Jordan Liu',
      timestamp: new Date(_now.getTime() - 8 * 60 * 60 * 1000),
    },
    {
      id: 'pi-4',
      type: 'pr' as const,
      source: 'GITHUB',
      title: 'PR #847: Refactor payment processing pipeline',
      summary: 'Major refactor touching 14 files. Alex has been waiting 2 days for your review. Tests are passing.',
      urgencyScore: 0.65,
      importanceScore: 0.60,
      compositeScore: 0.63,
      suggestedAction: 'Review',
      deepLink: 'https://github.com/decagon/platform/pull/847',
      from: 'Alex Rivera',
      timestamp: new Date(_now.getTime() - 48 * 60 * 60 * 1000),
    },
    {
      id: 'pi-5',
      type: 'message' as const,
      source: 'SLACK',
      title: 'Maya in #design',
      summary: 'Shared updated mockups for the dashboard redesign. Wants your feedback before the design review on Thursday.',
      urgencyScore: 0.45,
      importanceScore: 0.55,
      compositeScore: 0.50,
      suggestedAction: 'Reply',
      deepLink: 'slack://channel/C04DEF456',
      from: 'Maya Patel',
      timestamp: new Date(_now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      id: 'pi-6',
      type: 'alert' as const,
      source: 'SYSTEM',
      title: 'Competitor alert: Intercom launched AI Agent Builder',
      summary: 'Intercom announced their new AI Agent Builder for enterprise customers. This directly competes with your Q2 roadmap item.',
      urgencyScore: 0.60,
      importanceScore: 0.70,
      compositeScore: 0.65,
      suggestedAction: 'Review brief',
      deepLink: '/intelligence',
      timestamp: new Date(_now.getTime() - 3 * 60 * 60 * 1000),
    },
  ],

  // ─── Meetings ───
  meetings: [
    {
      id: 'mtg-1',
      title: 'Engineering Standup',
      startTime: new Date(new Date(_now).setHours(9, 0, 0, 0)),
      endTime: new Date(new Date(_now).setHours(9, 15, 0, 0)),
      attendees: [
        { name: 'Sarah Chen', title: 'Staff Engineer', relationshipHealth: 0.85 },
        { name: 'Alex Rivera', title: 'Senior Engineer', relationshipHealth: 0.72 },
        { name: 'Jordan Liu', title: 'Engineer II', relationshipHealth: 0.90 },
      ],
      prepNotes: {
        lastMeetingSummary: 'Discussed auth migration timeline. Sarah flagged risk with 3rd-party dependency. Agreed to revisit after load testing.',
        openActionItems: [
          'Share load test results (you — due today)',
          'Update migration runbook (Sarah — in progress)',
        ],
        relevantDecisions: [],
        talkingPoints: [
          'Address auth dependency issue Sarah raised',
          'Alex\'s PR has been waiting 2 days for review',
        ],
        attendeeContext: 'Sarah: last spoke yesterday; Alex: last spoke 3d ago; Jordan: last spoke yesterday',
      },
      estimatedContextSwitchCost: 5,
      anticipations: [
        {
          type: 'unseen_discussion',
          title: 'Sarah discussed the auth issue with the CTO yesterday',
          body: 'Sarah and James (CTO) had a 20-minute conversation in #eng-leadership about the auth migration risk. James suggested considering a phased rollout instead of the big-bang approach you planned. Sarah may bring this up.',
          confidence: 0.82,
        },
      ],
    },
    {
      id: 'mtg-2',
      title: 'Product Review — Q2 Roadmap',
      startTime: new Date(new Date(_now).setHours(14, 0, 0, 0)),
      endTime: new Date(new Date(_now).setHours(15, 0, 0, 0)),
      attendees: [
        { name: 'Mei Zhang', title: 'VP Product', relationshipHealth: 0.55 },
        { name: 'David Park', title: 'CFO', relationshipHealth: 0.68 },
        { name: 'Sarah Chen', title: 'Staff Engineer', relationshipHealth: 0.85 },
        { name: 'Tom Baker', title: 'Head of Sales', relationshipHealth: 0.60 },
      ],
      prepNotes: {
        lastMeetingSummary: 'Reviewed Q1 OKR results. Product velocity was below target. Mei pushed for more aggressive Q2 goals. David raised budget constraints.',
        openActionItems: [
          'Submit updated headcount projections (you — due today)',
          'Finalize Q2 roadmap priorities (Mei — in review)',
          'Share enterprise pipeline forecast (Tom — overdue)',
        ],
        relevantDecisions: ['Q1: Decided to deprioritize mobile app in favor of enterprise features'],
        talkingPoints: [
          'Budget projections need to be submitted today',
          'Intercom just launched competing AI Agent Builder — strategic implications',
          'Enterprise onboarding project velocity has dropped 40%',
        ],
        attendeeContext: 'Mei: visibility gap (12d since contact). David: expecting budget numbers. Tom: pipeline forecast is overdue.',
      },
      estimatedContextSwitchCost: 25,
      anticipations: [
        {
          type: 'sentiment_shift',
          title: 'Mei\'s tone has shifted in recent conversations',
          body: 'Mei\'s sentiment in the last 3 interactions has been noticeably more critical than her baseline. She may be under pressure from the board on Q1 results. Consider opening with a collaborative tone.',
          confidence: 0.71,
        },
        {
          type: 'external_signal',
          title: 'Intercom\'s launch will likely come up',
          body: 'Tom\'s team has already received questions from 3 prospects about whether you have a comparable offering. Expect Tom to push for accelerating the Agent Builder roadmap item.',
          confidence: 0.88,
        },
        {
          type: 'follow_up_gap',
          title: '2 action items from last meeting are still open',
          body: 'Tom was supposed to share the enterprise pipeline forecast but hasn\'t. Your headcount projections are also due. Both may cause friction if not addressed.',
          confidence: 0.90,
        },
      ],
    },
    {
      id: 'mtg-3',
      title: '1:1 with Jordan',
      startTime: new Date(new Date(_now).setHours(16, 0, 0, 0)),
      endTime: new Date(new Date(_now).setHours(16, 30, 0, 0)),
      attendees: [
        { name: 'Jordan Liu', title: 'Engineer II', relationshipHealth: 0.90 },
      ],
      prepNotes: {
        lastMeetingSummary: 'Discussed Jordan\'s interest in the platform team. You promised to look into an opportunity on the API redesign project.',
        openActionItems: [
          'Check with platform team about API redesign opening (you — 6 weeks overdue)',
        ],
        relevantDecisions: [],
        talkingPoints: [],
        attendeeContext: 'Jordan: strong engagement, recently took on SSO architecture work.',
      },
      estimatedContextSwitchCost: 10,
      anticipations: [
        {
          type: 'commitment_due',
          title: 'Your promise to Jordan about the platform team is 6 weeks overdue',
          body: 'You told Jordan you\'d check on the API redesign opening. That was 6 weeks ago. Jordan may bring this up, and the delay could impact their engagement.',
          confidence: 0.92,
        },
      ],
    },
  ],

  // ─── Project Updates ───
  projectUpdates: [
    {
      projectId: 'proj-1',
      projectName: 'Enterprise Onboarding Redesign',
      status: 'AT_RISK',
      healthScore: 0.38,
      healthTrend: 'declining' as const,
      velocityChange: -42,
      blockerCount: 3,
      keyUpdate: '3 engineers blocked on API dependency',
      riskFlag: 'At risk — review needed',
      daysUntilDeadline: 18,
    },
    {
      projectId: 'proj-2',
      projectName: 'Agent Builder v2',
      status: 'ACTIVE',
      healthScore: 0.72,
      healthTrend: 'stable' as const,
      velocityChange: 5,
      blockerCount: 0,
      keyUpdate: 'On track — design phase completing this week',
      daysUntilDeadline: 45,
    },
    {
      projectId: 'proj-3',
      projectName: 'Auth Service Migration',
      status: 'ACTIVE',
      healthScore: 0.58,
      healthTrend: 'declining' as const,
      velocityChange: -15,
      blockerCount: 1,
      keyUpdate: 'Load testing revealed performance regression',
      daysUntilDeadline: 10,
    },
    {
      projectId: 'proj-4',
      projectName: 'Dashboard Analytics v3',
      status: 'ACTIVE',
      healthScore: 0.89,
      healthTrend: 'improving' as const,
      velocityChange: 20,
      blockerCount: 0,
      keyUpdate: 'Ahead of schedule — Maya\'s designs approved',
      daysUntilDeadline: 30,
    },
  ],

  // ─── Industry Intelligence ───
  industryIntel: [
    {
      id: 'intel-1',
      title: 'Intercom launches AI Agent Builder for enterprise',
      summary: 'Intercom announced their new AI Agent Builder product, targeting enterprise customers with customizable AI agents for customer support automation.',
      relevanceScore: 0.91,
      eventType: 'PRODUCT_LAUNCH',
      company: 'Intercom',
      impactOnYou: 'This directly competes with your Q2 roadmap item "Agent Builder v2." 3 of your active prospects have also been evaluating Intercom. Sales team may need an updated competitive battlecard.',
      suggestedAction: 'Draft competitive battlecard',
      sourceUrl: 'https://techcrunch.com',
    },
    {
      id: 'intel-2',
      title: 'Acme Corp announces $50M Series C',
      summary: 'Acme Corp, one of your largest enterprise customers, raised $50M led by Sequoia. CEO signals expansion into new markets.',
      relevanceScore: 0.78,
      eventType: 'FUNDING_ROUND',
      company: 'Acme Corp',
      impactOnYou: 'Acme is your 3rd largest customer by ARR. Funding typically triggers expansion — their contract renewal is in 60 days. This is a strong upsell opportunity. Their new VP of Engineering (hired 2 weeks ago) may want to evaluate the expanded platform.',
      suggestedAction: 'Notify account manager',
      sourceUrl: 'https://crunchbase.com',
    },
    {
      id: 'intel-3',
      title: 'EU AI Act enforcement timeline moves up to Q3',
      summary: 'The European Commission announced that key provisions of the EU AI Act will be enforced starting Q3 2026, 6 months earlier than expected.',
      relevanceScore: 0.65,
      eventType: 'REGULATION_CHANGE',
      impactOnYou: '4 of your enterprise customers are EU-based. Your AI agent product may need compliance updates before the deadline. Engineering should assess impact on the model deployment pipeline.',
      suggestedAction: 'Schedule compliance review',
    },
  ],

  // ─── Relationship Alerts ───
  relationshipAlerts: [
    {
      personId: 'person-1',
      personName: 'Mei Zhang',
      personTitle: 'VP Product',
      alertType: 'decay' as const,
      severity: 'high' as const,
      description: 'No direct interaction in 12 days. She\'s a key stakeholder for your Q2 goals.',
      suggestedAction: 'Schedule a quick sync before the product review',
      daysSinceContact: 12,
    },
    {
      personId: 'person-2',
      personName: 'James (CTO)',
      personTitle: 'Chief Technology Officer',
      alertType: 'sentiment_shift' as const,
      severity: 'medium' as const,
      description: 'Recent interactions show lower sentiment. May be related to the auth migration delays.',
      suggestedAction: 'Reach out with a status update on the auth migration',
      daysSinceContact: 5,
    },
    {
      personId: 'person-3',
      personName: 'Tom Baker',
      personTitle: 'Head of Sales',
      alertType: 'visibility_gap' as const,
      severity: 'medium' as const,
      description: 'You haven\'t had a 1:1 in 3 weeks. He has a pending action item that\'s overdue.',
      suggestedAction: 'Follow up on pipeline forecast and schedule catch-up',
      daysSinceContact: 21,
    },
  ],

  // ─── Strategic Alignment ───
  strategicAlignment: {
    overallScore: 0.52,
    timeBreakdown: [
      { category: 'Meetings', percentageOfTime: 45, isStrategic: false },
      { category: 'Focus / Deep Work', percentageOfTime: 22, isStrategic: true },
      { category: 'Enterprise Onboarding (Q2 Priority)', percentageOfTime: 15, isStrategic: true },
      { category: 'Reactive / Support', percentageOfTime: 18, isStrategic: false },
    ],
    topTimeSink: {
      category: 'Meetings',
      percentageOfTime: 45,
      suggestion: 'Consider converting 2 status meetings to async updates — this could free up ~3 hours/week for focused work on enterprise onboarding.',
    },
    weekOverWeekTrend: 'declining' as const,
  },

  // ─── Wellbeing ───
  wellbeingCheck: {
    sustainabilityScore: 58,
    trend: 'declining' as const,
    meetingLoad: { hours: 5.2, vsBaseline: 1.4 },
    focusTime: { hours: 1.8, vsBaseline: -1.2 },
    contextSwitches: { count: 14, vsBaseline: 6 },
    recommendation: 'Your sustainability score has dropped 15 points this week. Meeting load is 40% above your baseline, and focus time is critically low. Consider blocking a 2-hour focus block tomorrow morning and declining non-essential meetings.',
  },
};
