// ─── Engineering Persona Data ───

// ─── Types ───

export interface Ticket {
  id: string;
  key: string;
  title: string;
  assignee: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  storyPoints: number;
  labels: string[];
  linkedPR?: string;
  blocked?: boolean;
  blockedBy?: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  status: 'open' | 'approved' | 'changes-requested' | 'merged';
  linesAdded: number;
  linesRemoved: number;
  age: string;
  ciStatus: 'passing' | 'failing' | 'pending';
  reviewers: string[];
  linkedTicket?: string;
  agentSummary?: string;
}

export interface Deployment {
  id: string;
  service: string;
  version: string;
  environment: 'production' | 'staging' | 'preview';
  status: 'success' | 'failed' | 'rolling' | 'rolled-back';
  author: string;
  timestamp: string;
  commitCount: number;
  agentRiskLevel?: 'low' | 'medium' | 'high';
  agentNote?: string;
}

export interface EngineeringAgentAction {
  id: string;
  type: 'alert' | 'recommendation' | 'review' | 'dependency';
  title: string;
  message: string;
  sources: string[];
  actionLabel?: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface EngineeringSummary {
  prsNeedingReview: number;
  activeIncidents: number;
  sprintCompletion: number;
  deployments24h: number;
  techDebtItems: number;
  avgReviewTime: string;
}

// ─── Mock Data ───

export const TICKETS: Ticket[] = [
  {
    id: 'tk-1',
    key: 'ENG-401',
    title: 'Auth migration: update token refresh logic for OAuth v4.x',
    assignee: 'Sarah Chen',
    status: 'in-progress',
    priority: 'urgent',
    storyPoints: 8,
    labels: ['auth', 'infrastructure', 'migration'],
    linkedPR: 'PR #861',
    blocked: false,
  },
  {
    id: 'tk-2',
    key: 'ENG-398',
    title: 'Enterprise SSO: SAML 2.0 authentication flow',
    assignee: 'Jordan Liu',
    status: 'in-review',
    priority: 'urgent',
    storyPoints: 13,
    labels: ['enterprise', 'security', 'sso'],
    linkedPR: 'PR #852',
    blocked: false,
  },
  {
    id: 'tk-3',
    key: 'ENG-412',
    title: 'Agent builder: drag-and-drop node connections',
    assignee: 'Sarah Chen',
    status: 'in-progress',
    priority: 'high',
    storyPoints: 8,
    labels: ['agent-builder', 'frontend', 'p0-feature'],
    blocked: false,
  },
  {
    id: 'tk-4',
    key: 'ENG-387',
    title: 'Payment pipeline refactor — fix Acme Corp billing bug (#1203)',
    assignee: 'Alex Rivera',
    status: 'in-review',
    priority: 'high',
    storyPoints: 5,
    labels: ['payments', 'bug', 'customer-escalation'],
    linkedPR: 'PR #847',
    blocked: false,
  },
  {
    id: 'tk-5',
    key: 'ENG-415',
    title: 'SCIM provisioning: user sync endpoint',
    assignee: 'Jordan Liu',
    status: 'todo',
    priority: 'high',
    storyPoints: 8,
    labels: ['enterprise', 'sso', 'api'],
    blocked: true,
    blockedBy: 'ENG-398 (SSO core must ship first)',
  },
  {
    id: 'tk-6',
    key: 'ENG-420',
    title: 'Agent builder: template preview and sandbox mode',
    assignee: 'Sarah Chen',
    status: 'todo',
    priority: 'high',
    storyPoints: 8,
    labels: ['agent-builder', 'frontend'],
    blocked: true,
    blockedBy: 'Template schema definition (waiting on product)',
  },
  {
    id: 'tk-7',
    key: 'ENG-409',
    title: 'Dashboard v3: export to CSV and PDF',
    assignee: 'Alex Rivera',
    status: 'in-progress',
    priority: 'medium',
    storyPoints: 5,
    labels: ['dashboard', 'feature'],
    linkedPR: 'PR #858',
    blocked: false,
  },
  {
    id: 'tk-8',
    key: 'ENG-422',
    title: 'Audit log: design export API schema',
    assignee: 'Alex Rivera',
    status: 'todo',
    priority: 'medium',
    storyPoints: 5,
    labels: ['compliance', 'api', 'enterprise'],
    blocked: false,
  },
  {
    id: 'tk-9',
    key: 'ENG-430',
    title: 'Tech debt: remove deprecated v1 webhook handlers',
    assignee: 'Jordan Liu',
    status: 'backlog',
    priority: 'low',
    storyPoints: 3,
    labels: ['tech-debt', 'cleanup'],
    blocked: false,
  },
  {
    id: 'tk-10',
    key: 'ENG-431',
    title: 'CI pipeline: reduce build time from 14min to under 8min',
    assignee: 'Sarah Chen',
    status: 'backlog',
    priority: 'medium',
    storyPoints: 5,
    labels: ['devex', 'ci-cd', 'tech-debt'],
    blocked: false,
  },
];

export const PULL_REQUESTS: PullRequest[] = [
  {
    id: 'pr-1',
    number: 852,
    title: 'feat: Enterprise SSO — SAML 2.0 authentication flow',
    author: 'Jordan Liu',
    status: 'open',
    linesAdded: 1420,
    linesRemoved: 85,
    age: '8 hours',
    ciStatus: 'passing',
    reviewers: ['Alex Rivera'],
    linkedTicket: 'ENG-398',
    agentSummary: 'Large PR adding SAML 2.0 support. Architecture is clean — properly separates IdP configuration from auth flow. Two open comments from Alex are cosmetic (naming convention). No security concerns detected. Recommend approving to unblock Enterprise Onboarding.',
  },
  {
    id: 'pr-2',
    number: 847,
    title: 'fix: Payment pipeline refactor + Acme billing bug #1203',
    author: 'Alex Rivera',
    status: 'open',
    linesAdded: 280,
    linesRemoved: 340,
    age: '2 days',
    ciStatus: 'passing',
    reviewers: [],
    linkedTicket: 'ENG-387',
    agentSummary: 'Net negative lines — removes legacy payment processing code and adds comprehensive test coverage. Fixes the Acme Corp billing bug (#1203) that has been escalating via CS. No assigned reviewer after 2 days. The customer impact makes this time-sensitive.',
  },
  {
    id: 'pr-3',
    number: 861,
    title: 'feat: Auth migration — OAuth v4.x token refresh adapter',
    author: 'Sarah Chen',
    status: 'open',
    linesAdded: 410,
    linesRemoved: 45,
    age: '6 hours',
    ciStatus: 'pending',
    reviewers: ['Jordan Liu'],
    linkedTicket: 'ENG-401',
    agentSummary: 'Implements the adapter pattern for OAuth v4.x breaking changes. Adds ~400 lines of adapter code (acknowledged tech debt from the workaround decision). CI is still running load tests. If tests pass, this unblocks the rest of the auth migration.',
  },
  {
    id: 'pr-4',
    number: 858,
    title: 'feat: Dashboard v3 — CSV and PDF export',
    author: 'Alex Rivera',
    status: 'approved',
    linesAdded: 520,
    linesRemoved: 30,
    age: '1 day',
    ciStatus: 'passing',
    reviewers: ['Sarah Chen'],
    linkedTicket: 'ENG-409',
    agentSummary: 'Clean implementation using server-side PDF generation. Sarah approved with no comments. Ready to merge — just needs the author to hit the merge button.',
  },
  {
    id: 'pr-5',
    number: 845,
    title: 'fix: Rate limiter edge case causing 429s on valid enterprise requests',
    author: 'Sarah Chen',
    status: 'merged',
    linesAdded: 45,
    linesRemoved: 12,
    age: '3 days',
    ciStatus: 'passing',
    reviewers: ['Alex Rivera', 'Jordan Liu'],
    linkedTicket: 'ENG-395',
    agentSummary: 'Small but critical fix. Enterprise customers with high-throughput API usage were hitting false 429 errors due to a race condition in the sliding window counter. Properly fixes the concurrency issue.',
  },
  {
    id: 'pr-6',
    number: 855,
    title: 'chore: Upgrade React to v19 + fix hydration warnings',
    author: 'Jordan Liu',
    status: 'changes-requested',
    linesAdded: 180,
    linesRemoved: 95,
    age: '4 days',
    ciStatus: 'failing',
    reviewers: ['Sarah Chen'],
    linkedTicket: 'ENG-410',
    agentSummary: 'React 19 upgrade. Sarah requested changes around Suspense boundary handling — 3 components need to be updated for the new streaming SSR API. CI is failing on 2 integration tests. Jordan acknowledged the feedback but hasn\'t pushed updates yet.',
  },
];

export const DEPLOYMENTS: Deployment[] = [
  {
    id: 'dep-1',
    service: 'api-gateway',
    version: 'v2.14.3',
    environment: 'production',
    status: 'success',
    author: 'Sarah Chen',
    timestamp: '2 hours ago',
    commitCount: 3,
    agentRiskLevel: 'low',
    agentNote: 'Routine deployment. Rate limiter fix (PR #845) plus 2 minor config updates. All health checks passing. No anomalies in error rates or latency.',
  },
  {
    id: 'dep-2',
    service: 'auth-service',
    version: 'v3.1.0-rc1',
    environment: 'staging',
    status: 'rolling',
    author: 'Sarah Chen',
    timestamp: '45 minutes ago',
    commitCount: 8,
    agentRiskLevel: 'high',
    agentNote: 'Auth migration release candidate with OAuth v4.x adapter. This is the critical path for the migration. Load tests are still running on staging. Watch for token refresh failures in the first 30 minutes post-deploy.',
  },
  {
    id: 'dep-3',
    service: 'dashboard-service',
    version: 'v4.2.0',
    environment: 'production',
    status: 'success',
    author: 'Alex Rivera',
    timestamp: '6 hours ago',
    commitCount: 5,
    agentRiskLevel: 'low',
    agentNote: 'Dashboard v3 analytics updates. Includes the custom date range picker and performance optimizations. Deployment was clean. Dashboard load times improved by 18% in production.',
  },
  {
    id: 'dep-4',
    service: 'payment-service',
    version: 'v1.8.2',
    environment: 'staging',
    status: 'failed',
    author: 'Alex Rivera',
    timestamp: '4 hours ago',
    commitCount: 2,
    agentRiskLevel: 'medium',
    agentNote: 'Payment pipeline refactor staging deploy failed. Database migration timed out after 120 seconds — the new index on the transactions table is taking longer than expected on the staging dataset. Recommend increasing migration timeout or running the index creation asynchronously.',
  },
  {
    id: 'dep-5',
    service: 'agent-runtime',
    version: 'v2.6.1',
    environment: 'preview',
    status: 'success',
    author: 'Jordan Liu',
    timestamp: '1 day ago',
    commitCount: 4,
    agentRiskLevel: 'low',
    agentNote: 'Agent builder preview deployment for internal testing. Includes the new node connection UI and error handling improvements. Preview URL shared with product team for feedback.',
  },
];

export const ENGINEERING_AGENT_ACTIONS: EngineeringAgentAction[] = [
  {
    id: 'eaa-1',
    type: 'alert',
    title: 'PR #847 has been waiting for review for 2 days',
    message: 'Alex Rivera\'s payment pipeline refactor (PR #847) has no assigned reviewer. This PR fixes the Acme Corp billing bug (#1203) that customer success has been escalating. Alex has pinged twice in Slack. Assigning Jordan as reviewer would unblock this — he has context on the payment service.',
    sources: ['GitHub PR #847', 'Slack #eng-reviews channel', 'CS escalation ticket #1203'],
    actionLabel: 'Assign reviewer',
    urgency: 'high',
  },
  {
    id: 'eaa-2',
    type: 'alert',
    title: 'Auth service staging deploy: load tests critical',
    message: 'The auth-service v3.1.0-rc1 is rolling out to staging with the OAuth v4.x adapter code. This is the make-or-break test for the auth migration. Load tests are running and initial results show a 12% increase in p99 latency. If latency exceeds 200ms, the migration will need to be reconsidered. Results expected within the hour.',
    sources: ['Staging deploy monitor', 'Load test dashboard', 'Auth migration runbook'],
    actionLabel: 'View load test results',
    urgency: 'high',
  },
  {
    id: 'eaa-3',
    type: 'review',
    title: 'PR #852 (Enterprise SSO) is ready for your approval',
    message: 'Jordan\'s SAML 2.0 implementation has been open for 8 hours. Alex left 2 cosmetic comments (variable naming). CI is green. The architecture properly separates IdP configuration from auth flow. This PR unblocks the Enterprise Onboarding Redesign project which is at 38% health and declining. Recommend approving.',
    sources: ['GitHub PR #852', 'Project health tracker', 'Sprint board'],
    actionLabel: 'Review PR',
    urgency: 'medium',
  },
  {
    id: 'eaa-4',
    type: 'dependency',
    title: 'Payment staging deploy failure will delay the Acme fix',
    message: 'The payment-service staging deploy failed due to a database migration timeout. The new transactions table index is too slow on the staging dataset. Two options: increase the migration timeout to 300s, or create the index concurrently (non-blocking). Alex is investigating but the Acme billing fix can\'t ship to production until staging passes.',
    sources: ['Deploy log', 'Database migration output', 'ENG-387 ticket'],
    actionLabel: 'View deploy logs',
    urgency: 'medium',
  },
  {
    id: 'eaa-5',
    type: 'recommendation',
    title: 'Tech debt is accumulating — 14 items in backlog',
    message: 'The engineering backlog now has 14 tech debt items, up from 9 last month. The OAuth adapter added ~400 lines of acknowledged tech debt. CI build times have crept up to 14 minutes. The deprecated v1 webhook handlers are still live. Recommend allocating 20% of next sprint\'s capacity to debt reduction, starting with the CI pipeline optimization (ENG-431).',
    sources: ['Linear backlog', 'CI metrics dashboard', 'Sprint retrospective notes'],
    actionLabel: 'Plan tech debt sprint',
    urgency: 'low',
  },
];

export const ENGINEERING_SUMMARY: EngineeringSummary = {
  prsNeedingReview: 3,
  activeIncidents: 0,
  sprintCompletion: 42,
  deployments24h: 4,
  techDebtItems: 14,
  avgReviewTime: '18 hours',
};
