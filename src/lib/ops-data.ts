// ─── Operations & OKR Data Model ───

export interface OKR {
  id: string;
  objective: string;
  owner: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  keyResults: KeyResult[];
  quarter: string;
}

export interface KeyResult {
  title: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface DecisionLogEntry {
  id: string;
  date: string;
  title: string;
  context: string;
  decision: string;
  owner: string;
  status: 'decided' | 'pending' | 'revisit';
  tags: string[];
}

export interface ActionItem {
  id: string;
  item: string;
  owner: string;
  source: string;
  dueDate: string;
  status: 'done' | 'overdue' | 'pending' | 'in-progress';
  priority: 'high' | 'medium' | 'low';
}

export interface ProcessHealth {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  lastReview: string;
  issues: number;
}

export interface DependencyItem {
  from: string;
  to: string;
  status: 'healthy' | 'blocked' | 'at-risk';
  description: string;
}

// ─── Mock Data ───

export const OKRS: OKR[] = [
  {
    id: 'okr-1',
    objective: 'Ship Agent Builder v2 to GA',
    owner: 'Mei Zhang',
    progress: 0.35,
    status: 'on-track',
    quarter: 'Q2 2026',
    keyResults: [
      { title: 'Complete core SDK', current: 60, target: 100, unit: '%', trend: 'up' },
      { title: 'Beta customers onboarded', current: 3, target: 10, unit: 'customers', trend: 'up' },
      { title: 'P0 bugs resolved', current: 8, target: 12, unit: 'bugs', trend: 'stable' },
    ],
  },
  {
    id: 'okr-2',
    objective: 'Expand enterprise revenue by 40%',
    owner: 'Tom Baker',
    progress: 0.22,
    status: 'at-risk',
    quarter: 'Q2 2026',
    keyResults: [
      { title: 'New enterprise deals', current: 4, target: 15, unit: 'deals', trend: 'down' },
      { title: 'Pipeline value', current: 1.8, target: 5.0, unit: '$M', trend: 'stable' },
      { title: 'NPS score improvement', current: 42, target: 55, unit: 'points', trend: 'up' },
    ],
  },
  {
    id: 'okr-3',
    objective: 'Reduce operational overhead by 20%',
    owner: 'You',
    progress: 0.48,
    status: 'on-track',
    quarter: 'Q2 2026',
    keyResults: [
      { title: 'Automated workflows', current: 6, target: 10, unit: 'workflows', trend: 'up' },
      { title: 'Meeting hours reduced', current: 12, target: 20, unit: '%', trend: 'stable' },
      { title: 'Decision cycle time', current: 3.2, target: 2, unit: 'days', trend: 'down' },
    ],
  },
  {
    id: 'okr-4',
    objective: 'Complete auth infrastructure migration',
    owner: 'Sarah Chen',
    progress: 0.65,
    status: 'at-risk',
    quarter: 'Q2 2026',
    keyResults: [
      { title: 'Services migrated', current: 7, target: 12, unit: 'services', trend: 'up' },
      { title: 'Zero-downtime deployment', current: 1, target: 1, unit: 'achieved', trend: 'stable' },
      { title: 'Auth latency p99', current: 180, target: 100, unit: 'ms', trend: 'down' },
    ],
  },
];

export const DECISION_LOG: DecisionLogEntry[] = [
  {
    id: 'dl-1', date: 'Apr 7', title: 'Auth migration: phased rollout approach',
    context: 'OAuth v4.x breaking change created two paths — quick adapter vs clean refactor.',
    decision: 'Pending your decision. CTO leans toward phased rollout.',
    owner: 'You', status: 'pending', tags: ['Engineering', 'Auth'],
  },
  {
    id: 'dl-2', date: 'Apr 5', title: 'Q2 roadmap: defer Low-Code Editor',
    context: 'Team bandwidth insufficient for both Low-Code Editor and Agent Builder v2.',
    decision: 'Defer Low-Code Editor and White-Label features. Focus on Agent Builder v2.',
    owner: 'Mei Zhang', status: 'decided', tags: ['Product', 'Strategy'],
  },
  {
    id: 'dl-3', date: 'Apr 3', title: 'Enterprise SSO: SAML 2.0 over OIDC',
    context: 'Jordan evaluated both SAML 2.0 and OIDC for enterprise SSO.',
    decision: 'SAML 2.0 selected based on enterprise customer requirements.',
    owner: 'Jordan Liu', status: 'decided', tags: ['Engineering', 'Enterprise'],
  },
  {
    id: 'dl-4', date: 'Apr 1', title: 'Competitive response: Intercom Agent Builder',
    context: 'Intercom launched a competing AI Agent Builder. 3 prospects evaluating.',
    decision: 'Draft a battlecard for sales. Accelerate Agent Builder v2 timeline if possible.',
    owner: 'Tom Baker', status: 'revisit', tags: ['Sales', 'Competitive'],
  },
  {
    id: 'dl-5', date: 'Mar 28', title: 'Headcount: conservative vs aggressive hiring',
    context: 'Q2 budget planning. Two senior engineers may depart. Need 3 scenarios.',
    decision: 'Pending — scenarios due to CFO today.',
    owner: 'You', status: 'pending', tags: ['Finance', 'Hiring'],
  },
];

export const ACTION_ITEMS: ActionItem[] = [
  { id: 'ai-1', item: 'Submit Q2 headcount projections to David', owner: 'You', source: 'Product Review', dueDate: 'Today', status: 'overdue', priority: 'high' },
  { id: 'ai-2', item: 'Share load test results with eng team', owner: 'You', source: 'Eng Standup', dueDate: 'Today', status: 'overdue', priority: 'high' },
  { id: 'ai-3', item: 'Check platform team opening for Jordan', owner: 'You', source: '1:1 with Jordan', dueDate: '6 weeks ago', status: 'overdue', priority: 'high' },
  { id: 'ai-4', item: 'Review PR #852 (Enterprise SSO)', owner: 'You', source: 'Inbox', dueDate: 'Today', status: 'pending', priority: 'high' },
  { id: 'ai-5', item: 'Draft competitive battlecard for sales', owner: 'You', source: 'Product Review', dueDate: 'This week', status: 'pending', priority: 'medium' },
  { id: 'ai-6', item: 'Create 12-month growth plan for Jordan', owner: 'You', source: '1:1 with Jordan', dueDate: 'This week', status: 'pending', priority: 'medium' },
  { id: 'ai-7', item: 'Update auth migration runbook', owner: 'Sarah Chen', source: 'Eng Standup', dueDate: 'This week', status: 'in-progress', priority: 'medium' },
  { id: 'ai-8', item: 'Publish Q2 roadmap priorities doc', owner: 'Mei Zhang', source: 'Product Review', dueDate: 'This week', status: 'pending', priority: 'medium' },
  { id: 'ai-9', item: 'Submit pipeline forecast update', owner: 'Tom Baker', source: 'Product Review', dueDate: 'Overdue', status: 'overdue', priority: 'high' },
  { id: 'ai-10', item: 'Document rollback strategy for auth', owner: 'Alex Rivera', source: 'Eng Standup', dueDate: 'This week', status: 'pending', priority: 'low' },
];

export const PROCESS_HEALTH: ProcessHealth[] = [
  { name: 'Sprint Planning', score: 82, trend: 'up', lastReview: '3d ago', issues: 0 },
  { name: 'Code Review', score: 45, trend: 'down', lastReview: '1d ago', issues: 3 },
  { name: 'Incident Response', score: 91, trend: 'stable', lastReview: '1w ago', issues: 0 },
  { name: 'Cross-Team Sync', score: 58, trend: 'down', lastReview: '2d ago', issues: 2 },
  { name: 'Onboarding', score: 74, trend: 'up', lastReview: '2w ago', issues: 1 },
];

export const DEPENDENCIES: DependencyItem[] = [
  { from: 'Agent Builder v2', to: 'Auth Migration', status: 'at-risk', description: 'Agent Builder needs new auth tokens — blocked until migration completes.' },
  { from: 'Enterprise Onboarding', to: 'Enterprise SSO', status: 'blocked', description: 'SSO PR awaiting approval. Onboarding redesign cannot proceed.' },
  { from: 'Dashboard Analytics v3', to: 'Agent Builder v2', status: 'healthy', description: 'Analytics depends on Agent Builder events. SDK is on track.' },
];
