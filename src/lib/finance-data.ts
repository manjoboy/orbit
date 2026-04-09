// ─── Finance Data Model ───

export interface BudgetItem {
  category: string;
  allocated: number;
  spent: number;
  forecast: number;
  status: 'on-track' | 'over' | 'under' | 'at-risk';
}

export interface BurnRateEntry {
  month: string;
  actual: number;
  planned: number;
}

export interface HeadcountScenario {
  label: string;
  description: string;
  hires: number;
  cost: number;
  risk: 'low' | 'medium' | 'high';
}

export interface FinanceAlert {
  id: string;
  type: 'anomaly' | 'deadline' | 'approval' | 'forecast';
  title: string;
  description: string;
  urgency: 'critical' | 'warning' | 'info';
  time: string;
}

export interface ApprovalItem {
  id: string;
  requester: string;
  type: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted: string;
}

// ─── Mock Data ───

export const BUDGET_ITEMS: BudgetItem[] = [
  { category: 'Engineering Salaries', allocated: 2400000, spent: 1180000, forecast: 2350000, status: 'on-track' },
  { category: 'Cloud Infrastructure', allocated: 480000, spent: 285000, forecast: 520000, status: 'over' },
  { category: 'Software Licenses', allocated: 180000, spent: 95000, forecast: 175000, status: 'on-track' },
  { category: 'Recruiting & Hiring', allocated: 120000, spent: 78000, forecast: 140000, status: 'at-risk' },
  { category: 'Travel & Events', allocated: 60000, spent: 18000, forecast: 45000, status: 'under' },
  { category: 'Contractors', allocated: 360000, spent: 210000, forecast: 380000, status: 'at-risk' },
];

export const BURN_RATE: BurnRateEntry[] = [
  { month: 'Jan', actual: 580, planned: 560 },
  { month: 'Feb', actual: 595, planned: 570 },
  { month: 'Mar', actual: 610, planned: 575 },
  { month: 'Apr', actual: 0, planned: 580 },
  { month: 'May', actual: 0, planned: 585 },
  { month: 'Jun', actual: 0, planned: 590 },
];

export const HEADCOUNT_SCENARIOS: HeadcountScenario[] = [
  { label: 'Conservative', description: 'Backfill 2 departures only. Maintain current velocity.', hires: 2, cost: 380000, risk: 'low' },
  { label: 'Base Case', description: 'Backfill + 2 new for Agent Builder v2. Strongest ROI case.', hires: 4, cost: 720000, risk: 'medium' },
  { label: 'Aggressive', description: 'Full growth — new platform team + expanded QA. Requires board approval.', hires: 7, cost: 1260000, risk: 'high' },
];

export const FINANCE_ALERTS: FinanceAlert[] = [
  { id: 'fa-1', type: 'deadline', title: 'Q2 Headcount Projections Due', description: 'David Park needs your engineering headcount scenarios by 5pm today for the board deck.', urgency: 'critical', time: '5h left' },
  { id: 'fa-2', type: 'anomaly', title: 'Cloud Spend Trending 8% Over', description: 'AWS costs jumped 12% in March due to load testing for auth migration. Projected to exceed Q2 budget by $40K.', urgency: 'warning', time: '3d ago' },
  { id: 'fa-3', type: 'approval', title: '2 Pending Expense Approvals', description: 'Contractor renewal ($45K) and conference sponsorship ($12K) waiting for your sign-off.', urgency: 'info', time: '1d ago' },
  { id: 'fa-4', type: 'forecast', title: 'Recruiting Spend At Risk', description: 'If we proceed with base case (4 hires), recruiting budget needs a $20K increase. Flag to David.', urgency: 'warning', time: 'projected' },
];

export const APPROVAL_ITEMS: ApprovalItem[] = [
  { id: 'ap-1', requester: 'Sarah Chen', type: 'Contractor', amount: 45000, description: 'Auth migration contractor — Kira Novak renewal (3 months)', submitted: '2d ago', status: 'pending' },
  { id: 'ap-2', requester: 'Tom Baker', type: 'Sponsorship', amount: 12000, description: 'SaaStr 2026 booth sponsorship for pipeline generation', submitted: '3d ago', status: 'pending' },
  { id: 'ap-3', requester: 'Mei Zhang', type: 'Software', amount: 8400, description: 'Amplitude annual license renewal — product analytics', submitted: '1w ago', status: 'approved' },
  { id: 'ap-4', requester: 'Alex Rivera', type: 'Training', amount: 2500, description: 'Rust Systems Programming course (O\'Reilly)', submitted: '1w ago', status: 'approved' },
];

// ─── Summary stats ───
export const FINANCE_SUMMARY = {
  totalBudget: 3600000,
  totalSpent: 1866000,
  totalForecast: 3610000,
  runway: '18 months',
  burnRate: 610000,
  burnTrend: 'up' as const,
  teamSize: 24,
  openReqs: 4,
  pendingApprovals: 2,
  pendingAmount: 57000,
};
