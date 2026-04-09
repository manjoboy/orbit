// ─── Product Persona Data ───

// ─── Types ───

export interface PRDItem {
  id: string;
  title: string;
  status: 'draft' | 'in-review' | 'approved' | 'shipped';
  owner: string;
  blockers: string[];
  customerRequests: number;
  revenueImpact: string;
  agentInsight: string;
}

export interface FeedbackTheme {
  id: string;
  theme: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'mixed';
  trend: 'up' | 'down' | 'stable';
  topQuotes: string[];
  agentSynthesis: string;
}

export interface SprintItem {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'p0' | 'p1' | 'p2';
  storyPoints: number;
  linkedPRD?: string;
}

export interface SprintMetric {
  sprint: string;
  planned: number;
  completed: number;
  carryover: number;
}

export interface ProductAgentAction {
  id: string;
  type: 'alert' | 'recommendation' | 'draft' | 'synthesis';
  title: string;
  message: string;
  sources: string[];
  actionLabel?: string;
}

export interface ProductSummary {
  activePRDs: number;
  blockedFeatures: number;
  sprintVelocity: number;
  feedbackMentions: number;
  customerInterviews: number;
  nps: number;
}

// ─── Mock Data ───

export const PRD_ITEMS: PRDItem[] = [
  {
    id: 'prd-1',
    title: 'Agent Builder v2 — Visual Workflow Editor',
    status: 'approved',
    owner: 'Mei Zhang',
    blockers: [],
    customerRequests: 23,
    revenueImpact: '$420K ARR',
    agentInsight: 'This is the most-requested feature across enterprise accounts. Acme Corp and Pinnacle Systems both listed it as a top-3 requirement in their last QBR. Shipping this in Q2 directly unblocks $705K in pipeline.',
  },
  {
    id: 'prd-2',
    title: 'Enterprise SSO & SCIM Provisioning',
    status: 'approved',
    owner: 'Jordan Liu',
    blockers: ['Waiting on auth migration to complete token refresh changes'],
    customerRequests: 8,
    revenueImpact: '$310K ARR',
    agentInsight: 'Three enterprise deals (Acme Corp, Meridian Health, Pinnacle Systems) have SSO as a hard requirement. The Meridian deal ($340K) specifically cannot proceed without SAML support. Auth migration blocker needs resolution this week.',
  },
  {
    id: 'prd-3',
    title: 'Real-time Analytics Dashboard v3',
    status: 'shipped',
    owner: 'Alex Rivera',
    blockers: [],
    customerRequests: 15,
    revenueImpact: '$180K ARR',
    agentInsight: 'Shipped last sprint to positive reception. Early usage data shows 3.2x increase in daily active dashboard users. NPS for analytics features jumped from 32 to 48. Consider a customer spotlight blog post to amplify.',
  },
  {
    id: 'prd-4',
    title: 'Custom AI Agent Templates Library',
    status: 'in-review',
    owner: 'Mei Zhang',
    blockers: ['Needs finalized template schema from platform team', 'Design review pending — 3 open comments'],
    customerRequests: 19,
    revenueImpact: '$275K ARR',
    agentInsight: 'Intercom just shipped their version of agent templates last week. Our approach is more flexible (open schema vs. rigid categories) but we need to ship within 6 weeks to avoid losing the narrative. Two prospects have specifically asked about this.',
  },
  {
    id: 'prd-5',
    title: 'Audit Log Export & SOC 2 Compliance',
    status: 'draft',
    owner: 'Sarah Chen',
    blockers: ['PRD needs security team review', 'Scope TBD: full audit trail vs. configurable export'],
    customerRequests: 12,
    revenueImpact: '$310K ARR',
    agentInsight: 'This is a hard blocker for regulated industries. TechFlow\'s CISO specifically flagged this in their security review. Meridian Health needs it for HIPAA compliance. Recommend fast-tracking the PRD review to unblock two deals worth $482K combined.',
  },
];

export const FEEDBACK_THEMES: FeedbackTheme[] = [
  {
    id: 'ft-1',
    theme: 'Agent builder is too complex for non-technical users',
    mentions: 34,
    sentiment: 'negative',
    trend: 'up',
    topQuotes: [
      'I spent 2 hours trying to build a simple FAQ agent. There are too many configuration steps.',
      'My product team gave up and asked engineering to build the agents instead. Defeats the purpose.',
      'The visual builder is powerful but the learning curve is brutal. Need better templates.',
    ],
    agentSynthesis: 'This is the top complaint across all channels. 68% of mentions come from non-technical users (PMs, ops leads). The template library PRD directly addresses this — shipping it should reduce these complaints by an estimated 40%. Intercom is winning in this area with their guided wizard approach.',
  },
  {
    id: 'ft-2',
    theme: 'Dashboard v3 performance improvements',
    mentions: 22,
    sentiment: 'positive',
    trend: 'up',
    topQuotes: [
      'Night and day difference. v3 loads in under a second now.',
      'The real-time updates are exactly what we needed for our ops team.',
      'Finally feels like a modern analytics tool. Great work.',
    ],
    agentSynthesis: 'Strong positive reception since the v3 launch. Usage metrics confirm the sentiment: session duration up 45%, daily active users up 3.2x. This is a bright spot to highlight in the next board update and marketing materials.',
  },
  {
    id: 'ft-3',
    theme: 'Enterprise security and compliance gaps',
    mentions: 18,
    sentiment: 'negative',
    trend: 'stable',
    topQuotes: [
      'We can\'t proceed without SSO. It\'s a non-starter for our security team.',
      'The audit logs are incomplete — we need export for SOC 2 compliance.',
      'Data residency is a hard requirement. We need EU hosting.',
    ],
    agentSynthesis: 'Security-related feedback is steady at 18 mentions/week, primarily from enterprise prospects and customers. SSO, audit logs, and EU data residency are the three most common asks. The SSO PRD is approved; audit logs are in draft. EU hosting isn\'t on the roadmap yet — this is a gap.',
  },
  {
    id: 'ft-4',
    theme: 'API documentation quality',
    mentions: 15,
    sentiment: 'negative',
    trend: 'down',
    topQuotes: [
      'The webhook documentation is completely missing examples for custom events.',
      'API versioning is confusing — deprecation notices came too late.',
      'The SDK changelog doesn\'t match the actual API behavior.',
    ],
    agentSynthesis: 'Developer experience is suffering. API docs complaints have decreased slightly from 19 to 15 mentions (the SDK update helped), but the remaining issues are deeper: missing webhook examples, confusing versioning, stale changelogs. Recommend a docs sprint in Q3.',
  },
  {
    id: 'ft-5',
    theme: 'Onboarding experience for enterprise teams',
    mentions: 11,
    sentiment: 'mixed',
    trend: 'up',
    topQuotes: [
      'The self-serve onboarding was smooth for my team of 5, but we struggled with team admin features.',
      'We needed hand-holding for SSO setup. The docs assume a lot of prior knowledge.',
      'Love the product but getting 50 people onboarded was painful. Need bulk provisioning.',
    ],
    agentSynthesis: 'Enterprise onboarding friction is growing as deal sizes increase. Teams under 10 users report smooth experiences, but anything above triggers complaints about team admin, bulk provisioning, and SSO setup. The Enterprise Onboarding Redesign PRD is blocked by SSO — resolve that dependency to address this theme.',
  },
];

export const SPRINT_ITEMS: SprintItem[] = [
  {
    id: 'si-1',
    title: 'Agent builder: implement drag-and-drop node connections',
    assignee: 'Sarah Chen',
    status: 'in-progress',
    priority: 'p0',
    storyPoints: 8,
    linkedPRD: 'prd-1',
  },
  {
    id: 'si-2',
    title: 'SAML 2.0 authentication flow — core implementation',
    assignee: 'Jordan Liu',
    status: 'in-review',
    priority: 'p0',
    storyPoints: 13,
    linkedPRD: 'prd-2',
  },
  {
    id: 'si-3',
    title: 'Agent template schema: define JSON structure and validation',
    assignee: 'Mei Zhang',
    status: 'todo',
    priority: 'p0',
    storyPoints: 5,
    linkedPRD: 'prd-4',
  },
  {
    id: 'si-4',
    title: 'Dashboard v3: add custom date range picker',
    assignee: 'Alex Rivera',
    status: 'done',
    priority: 'p1',
    storyPoints: 3,
    linkedPRD: 'prd-3',
  },
  {
    id: 'si-5',
    title: 'Auth migration: update token refresh logic for OAuth v4',
    assignee: 'Sarah Chen',
    status: 'in-progress',
    priority: 'p0',
    storyPoints: 8,
  },
  {
    id: 'si-6',
    title: 'Audit log: design export API schema',
    assignee: 'Alex Rivera',
    status: 'todo',
    priority: 'p1',
    storyPoints: 5,
    linkedPRD: 'prd-5',
  },
  {
    id: 'si-7',
    title: 'Agent builder: error handling for malformed workflow configs',
    assignee: 'Jordan Liu',
    status: 'done',
    priority: 'p1',
    storyPoints: 3,
    linkedPRD: 'prd-1',
  },
  {
    id: 'si-8',
    title: 'SCIM provisioning: user sync endpoint',
    assignee: 'Jordan Liu',
    status: 'todo',
    priority: 'p0',
    storyPoints: 8,
    linkedPRD: 'prd-2',
  },
  {
    id: 'si-9',
    title: 'Dashboard v3: export to CSV/PDF',
    assignee: 'Alex Rivera',
    status: 'in-progress',
    priority: 'p2',
    storyPoints: 5,
    linkedPRD: 'prd-3',
  },
  {
    id: 'si-10',
    title: 'Agent builder: template preview and sandbox mode',
    assignee: 'Sarah Chen',
    status: 'todo',
    priority: 'p1',
    storyPoints: 8,
    linkedPRD: 'prd-4',
  },
];

export const SPRINT_METRICS: SprintMetric[] = [
  { sprint: 'Sprint 20', planned: 36, completed: 31, carryover: 5 },
  { sprint: 'Sprint 21', planned: 30, completed: 29, carryover: 1 },
  { sprint: 'Sprint 22', planned: 35, completed: 24, carryover: 11 },
  { sprint: 'Sprint 23 (current)', planned: 66, completed: 30, carryover: 0 },
];

export const PRODUCT_AGENT_ACTIONS: ProductAgentAction[] = [
  {
    id: 'paa-1',
    type: 'alert',
    title: 'Intercom shipped agent templates — competitive pressure rising',
    message: 'Intercom launched their agent template library last Tuesday. Early reviews highlight ease of use. Your Custom AI Agent Templates PRD (prd-4) is still in review with 3 open design comments. Recommend prioritizing the review to ship within 6 weeks and maintain competitive position.',
    sources: ['TechCrunch article', 'Intercom changelog', 'G2 reviews'],
    actionLabel: 'Escalate PRD review',
  },
  {
    id: 'paa-2',
    type: 'synthesis',
    title: 'Weekly feedback digest: complexity remains the top theme',
    message: 'Across 87 feedback mentions this week, agent builder complexity (34 mentions) dominates. This is the 4th consecutive week it\'s been the #1 theme. The template library is the most direct solution, but consider an interim quick-win: a "guided setup wizard" that reduces the 12-step creation flow to 4 steps.',
    sources: ['Zendesk tickets', 'NPS survey comments', 'Intercom chat transcripts', 'G2 reviews'],
    actionLabel: 'View full digest',
  },
  {
    id: 'paa-3',
    type: 'recommendation',
    title: 'Audit log PRD should be fast-tracked for TechFlow and Meridian',
    message: 'Two active deals worth $482K combined (TechFlow $142K, Meridian Health $340K) have audit log export as a hard requirement. The PRD is still in draft status with two open blockers. Recommend scheduling a security team review this week and scoping to "configurable export" to ship faster.',
    sources: ['TechFlow CISO requirements doc', 'Meridian Health compliance checklist', 'Sales CRM notes'],
    actionLabel: 'Schedule PRD review',
  },
  {
    id: 'paa-4',
    type: 'draft',
    title: 'Q2 roadmap update drafted for stakeholder review',
    message: 'I\'ve prepared a Q2 roadmap update based on current sprint progress, deal pipeline, and feedback themes. Key changes: Agent Builder v2 on track (35%), SSO blocked by auth migration, Dashboard v3 shipped successfully, templates PRD needs acceleration. Ready for your review before the Thursday product review meeting.',
    sources: ['Sprint board', 'PRD tracker', 'Pipeline data', 'Feedback aggregator'],
    actionLabel: 'Review draft',
  },
];

export const PRODUCT_SUMMARY: ProductSummary = {
  activePRDs: 4,
  blockedFeatures: 2,
  sprintVelocity: 78,
  feedbackMentions: 87,
  customerInterviews: 6,
  nps: 42,
};
