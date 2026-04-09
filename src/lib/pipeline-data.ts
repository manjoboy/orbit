// ─── Pipeline / Sales Data Model ───

export interface Deal {
  id: string;
  company: string;
  value: number;
  stage: 'prospect' | 'discovery' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  owner: string;
  probability: number;
  daysInStage: number;
  nextStep: string;
  health: 'healthy' | 'at-risk' | 'stalled';
  contacts: string[];
  lastActivity: string;
}

export interface PipelineStage {
  name: string;
  count: number;
  value: number;
}

export interface SalesMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CompetitorThreat {
  competitor: string;
  deal: string;
  threat: 'high' | 'medium' | 'low';
  context: string;
}

// ─── Mock Data ───

export const DEALS: Deal[] = [
  {
    id: 'deal-1', company: 'Acme Corp', value: 180000, stage: 'negotiation',
    owner: 'Tom Baker', probability: 75, daysInStage: 12, health: 'healthy',
    nextStep: 'Send revised pricing proposal by Friday',
    contacts: ['Lisa Huang (VP Eng)', 'Marcus Cole (CTO)'],
    lastActivity: '1d ago',
  },
  {
    id: 'deal-2', company: 'TechFlow Inc', value: 120000, stage: 'proposal',
    owner: 'Tom Baker', probability: 50, daysInStage: 8, health: 'at-risk',
    nextStep: 'Schedule demo with their security team',
    contacts: ['Nina Patel (Head of Product)'],
    lastActivity: '3d ago',
  },
  {
    id: 'deal-3', company: 'Globex Industries', value: 95000, stage: 'discovery',
    owner: 'Rachel Kim', probability: 30, daysInStage: 5, health: 'healthy',
    nextStep: 'Send case study and ROI calculator',
    contacts: ['James Okafor (Director of Ops)'],
    lastActivity: '2d ago',
  },
  {
    id: 'deal-4', company: 'Meridian Health', value: 250000, stage: 'proposal',
    owner: 'Tom Baker', probability: 60, daysInStage: 18, health: 'at-risk',
    nextStep: 'Follow up on compliance requirements doc',
    contacts: ['Dr. Sarah Wells (CIO)', 'Raj Mehta (VP IT)'],
    lastActivity: '5d ago',
  },
  {
    id: 'deal-5', company: 'Pinnacle Finance', value: 310000, stage: 'negotiation',
    owner: 'Rachel Kim', probability: 80, daysInStage: 6, health: 'healthy',
    nextStep: 'Legal review of MSA — ETA 2 days',
    contacts: ['Derek Wong (COO)', 'Amy Chen (Procurement)'],
    lastActivity: '1d ago',
  },
  {
    id: 'deal-6', company: 'NovaTech', value: 75000, stage: 'prospect',
    owner: 'Rachel Kim', probability: 15, daysInStage: 3, health: 'healthy',
    nextStep: 'Initial discovery call scheduled Thursday',
    contacts: ['Carlos Vega (CEO)'],
    lastActivity: '3d ago',
  },
  {
    id: 'deal-7', company: 'Zenith Labs', value: 140000, stage: 'discovery',
    owner: 'Tom Baker', probability: 35, daysInStage: 14, health: 'stalled',
    nextStep: 'Re-engage — no response in 2 weeks',
    contacts: ['Priya Sharma (VP Engineering)'],
    lastActivity: '14d ago',
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  { name: 'Prospect', count: 1, value: 75000 },
  { name: 'Discovery', count: 2, value: 235000 },
  { name: 'Proposal', count: 2, value: 370000 },
  { name: 'Negotiation', count: 2, value: 490000 },
];

export const SALES_METRICS: SalesMetric[] = [
  { label: 'Pipeline Value', value: '$1.17M', change: 12, trend: 'up' },
  { label: 'Avg Deal Size', value: '$167K', change: -5, trend: 'down' },
  { label: 'Win Rate', value: '32%', change: 3, trend: 'up' },
  { label: 'Avg Sales Cycle', value: '45d', change: -8, trend: 'up' },
];

export const COMPETITOR_THREATS: CompetitorThreat[] = [
  { competitor: 'Intercom', deal: 'TechFlow Inc', threat: 'high', context: 'TechFlow is evaluating Intercom\'s new AI Agent Builder. Demo scheduled next week.' },
  { competitor: 'Zendesk', deal: 'Meridian Health', threat: 'medium', context: 'Meridian\'s IT team has an existing Zendesk contract. Renewal coming up — we need to displace.' },
  { competitor: 'Intercom', deal: 'Globex Industries', threat: 'low', context: 'Globex mentioned Intercom in passing. No formal evaluation yet.' },
];

export const PIPELINE_SUMMARY = {
  totalPipeline: 1170000,
  weightedPipeline: 625000,
  dealsAtRisk: 3,
  avgDaysInPipeline: 9.4,
  quotaAttainment: 0.42,
  quarterTarget: 1500000,
  closedThisQuarter: 630000,
};
