// ─── Roadmap / Product Data Model ───

export interface RoadmapItem {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'shipped' | 'blocked' | 'cut';
  quarter: string;
  owner: string;
  team: string;
  progress: number;
  priority: 'P0' | 'P1' | 'P2';
  effort: 'S' | 'M' | 'L' | 'XL';
  dependencies: string[];
  customerRequests: number;
  tags: string[];
}

export interface FeatureRequest {
  id: string;
  title: string;
  requestCount: number;
  revenue: number;
  source: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'planned' | 'in-progress' | 'shipped';
}

export interface SprintMetric {
  sprint: string;
  planned: number;
  completed: number;
  carryover: number;
}

export interface FeedbackTheme {
  theme: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'mixed';
  trend: 'up' | 'down' | 'stable';
  topQuotes: string[];
}

// ─── Mock Data ───

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'rm-1', name: 'Agent Builder v2', description: 'Next-gen AI agent creation platform with visual builder, custom tools, and enterprise deployment.',
    status: 'in-progress', quarter: 'Q2 2026', owner: 'Mei Zhang', team: 'Platform',
    progress: 0.35, priority: 'P0', effort: 'XL', dependencies: ['Auth Migration'],
    customerRequests: 23, tags: ['AI', 'Enterprise', 'Core Product'],
  },
  {
    id: 'rm-2', name: 'Enterprise SSO & SAML', description: 'SAML 2.0 and SCIM provisioning for enterprise customers. Unblocks Acme and Meridian deals.',
    status: 'in-progress', quarter: 'Q2 2026', owner: 'Jordan Liu', team: 'Engineering',
    progress: 0.60, priority: 'P0', effort: 'L', dependencies: [],
    customerRequests: 8, tags: ['Enterprise', 'Security'],
  },
  {
    id: 'rm-3', name: 'Auth Service Migration', description: 'Migrate from legacy auth to OAuth 2.0 with phased rollout. Critical infrastructure.',
    status: 'blocked', quarter: 'Q2 2026', owner: 'Sarah Chen', team: 'Engineering',
    progress: 0.65, priority: 'P0', effort: 'L', dependencies: [],
    customerRequests: 0, tags: ['Infrastructure', 'Security'],
  },
  {
    id: 'rm-4', name: 'Dashboard Analytics v3', description: 'Real-time analytics dashboard with custom reports, export, and alerting.',
    status: 'in-progress', quarter: 'Q2 2026', owner: 'Alex Rivera', team: 'Engineering',
    progress: 0.89, priority: 'P1', effort: 'M', dependencies: ['Agent Builder v2'],
    customerRequests: 15, tags: ['Analytics', 'Core Product'],
  },
  {
    id: 'rm-5', name: 'Enterprise Onboarding Redesign', description: 'Streamlined enterprise onboarding with guided setup, SSO integration, and team management.',
    status: 'blocked', quarter: 'Q2 2026', owner: 'Mei Zhang', team: 'Product',
    progress: 0.38, priority: 'P1', effort: 'L', dependencies: ['Enterprise SSO & SAML'],
    customerRequests: 11, tags: ['Enterprise', 'UX'],
  },
  {
    id: 'rm-6', name: 'API Rate Limiting & Throttling', description: 'Configurable rate limits per tenant with graceful degradation.',
    status: 'planned', quarter: 'Q2 2026', owner: 'Sarah Chen', team: 'Platform',
    progress: 0, priority: 'P2', effort: 'M', dependencies: ['Auth Migration'],
    customerRequests: 5, tags: ['Infrastructure', 'Enterprise'],
  },
  {
    id: 'rm-7', name: 'Low-Code Editor', description: 'Visual workflow editor for non-technical users.',
    status: 'cut', quarter: 'Q3 2026', owner: 'Mei Zhang', team: 'Product',
    progress: 0, priority: 'P2', effort: 'XL', dependencies: ['Agent Builder v2'],
    customerRequests: 18, tags: ['Product', 'UX'],
  },
  {
    id: 'rm-8', name: 'White-Label Solution', description: 'Rebrandable deployment for enterprise partners.',
    status: 'cut', quarter: 'Q3 2026', owner: 'Tom Baker', team: 'Platform',
    progress: 0, priority: 'P2', effort: 'XL', dependencies: ['Agent Builder v2', 'Enterprise SSO & SAML'],
    customerRequests: 6, tags: ['Enterprise', 'Revenue'],
  },
];

export const FEATURE_REQUESTS: FeatureRequest[] = [
  { id: 'fr-1', title: 'Custom AI agent templates', requestCount: 23, revenue: 420000, source: 'Enterprise customers', priority: 'critical', status: 'planned' },
  { id: 'fr-2', title: 'Real-time collaboration on workflows', requestCount: 18, revenue: 180000, source: 'Product feedback', priority: 'high', status: 'open' },
  { id: 'fr-3', title: 'Webhook event subscriptions', requestCount: 15, revenue: 95000, source: 'API users', priority: 'high', status: 'in-progress' },
  { id: 'fr-4', title: 'Audit log export (SOC 2)', requestCount: 12, revenue: 310000, source: 'Enterprise security', priority: 'critical', status: 'planned' },
  { id: 'fr-5', title: 'Multi-language support', requestCount: 9, revenue: 75000, source: 'International users', priority: 'medium', status: 'open' },
  { id: 'fr-6', title: 'Custom dashboard widgets', requestCount: 15, revenue: 120000, source: 'Product feedback', priority: 'medium', status: 'open' },
];

export const SPRINT_METRICS: SprintMetric[] = [
  { sprint: 'Sprint 18', planned: 34, completed: 28, carryover: 6 },
  { sprint: 'Sprint 19', planned: 32, completed: 30, carryover: 2 },
  { sprint: 'Sprint 20', planned: 36, completed: 31, carryover: 5 },
  { sprint: 'Sprint 21', planned: 30, completed: 29, carryover: 1 },
  { sprint: 'Sprint 22', planned: 35, completed: 24, carryover: 11 },
  { sprint: 'Sprint 23 (current)', planned: 33, completed: 14, carryover: 0 },
];

export const FEEDBACK_THEMES: FeedbackTheme[] = [
  { theme: 'Agent Builder complexity', mentions: 34, sentiment: 'negative', trend: 'up', topQuotes: ['Too many steps to create a simple agent', 'Need better templates'] },
  { theme: 'Dashboard speed', mentions: 22, sentiment: 'positive', trend: 'up', topQuotes: ['v3 is noticeably faster', 'Love the new real-time updates'] },
  { theme: 'Enterprise security', mentions: 18, sentiment: 'mixed', trend: 'stable', topQuotes: ['SSO is a must-have for us', 'Audit logs are incomplete'] },
  { theme: 'API documentation', mentions: 15, sentiment: 'negative', trend: 'down', topQuotes: ['Examples are outdated', 'Webhook docs are missing'] },
];

export const ROADMAP_SUMMARY = {
  totalItems: 8,
  inProgress: 3,
  blocked: 2,
  shipped: 0,
  cut: 2,
  planned: 1,
  topRequestedFeature: 'Custom AI agent templates',
  sprintVelocity: 82, // percentage
  sprintVelocityTrend: 'down' as const,
};
