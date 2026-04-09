// ─── Finance Persona Data ───

// ─── Types ───

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  forecast: number;
  status: 'on-track' | 'at-risk' | 'over-budget';
  trend: 'up' | 'down' | 'stable';
}

export interface ApprovalItem {
  id: string;
  requester: string;
  type: 'headcount' | 'contractor' | 'software' | 'travel' | 'event';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted: string;
  agentRecommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ForecastScenario {
  id: string;
  label: string;
  description: string;
  hires: number;
  totalCost: number;
  runway: number;
  risk: 'low' | 'medium' | 'high';
  agentNote: string;
}

export interface BoardPrepItem {
  id: string;
  section: string;
  status: 'complete' | 'in-progress' | 'not-started';
  owner: string;
  dueDate: string;
  agentNote?: string;
}

export interface BurnRateEntry {
  month: string;
  actual: number;
  planned: number;
}

export interface FinanceAgentAction {
  id: string;
  type: 'alert' | 'recommendation' | 'draft' | 'forecast';
  title: string;
  message: string;
  sources: string[];
  actionLabel?: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface FinanceSummary {
  totalBudget: number;
  totalSpent: number;
  monthlyBurn: number;
  runway: number;
  teamSize: number;
  openReqs: number;
  pendingApprovals: number;
}

// ─── Mock Data ───

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'bc-1',
    name: 'Engineering Salaries',
    allocated: 2400000,
    spent: 1180000,
    forecast: 2350000,
    status: 'on-track',
    trend: 'stable',
  },
  {
    id: 'bc-2',
    name: 'Cloud Infrastructure',
    allocated: 480000,
    spent: 298000,
    forecast: 545000,
    status: 'over-budget',
    trend: 'up',
  },
  {
    id: 'bc-3',
    name: 'Software Licenses',
    allocated: 180000,
    spent: 95000,
    forecast: 175000,
    status: 'on-track',
    trend: 'stable',
  },
  {
    id: 'bc-4',
    name: 'Recruiting & Hiring',
    allocated: 120000,
    spent: 82000,
    forecast: 155000,
    status: 'at-risk',
    trend: 'up',
  },
  {
    id: 'bc-5',
    name: 'Contractors & Consulting',
    allocated: 360000,
    spent: 215000,
    forecast: 395000,
    status: 'at-risk',
    trend: 'up',
  },
  {
    id: 'bc-6',
    name: 'Travel & Events',
    allocated: 60000,
    spent: 18000,
    forecast: 52000,
    status: 'on-track',
    trend: 'down',
  },
];

export const APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: 'ap-1',
    requester: 'Sarah Chen',
    type: 'contractor',
    amount: 45000,
    description: 'Auth migration contractor — Kira Novak renewal for 3 months. Critical for hitting the migration deadline. She owns 40% of the adapter code.',
    status: 'pending',
    submitted: '2 days ago',
    agentRecommendation: 'Approve. Kira is on the critical path for the auth migration. Losing her mid-project would delay the migration by 3-4 weeks and increase risk on the $545K pipeline tied to SSO.',
    priority: 'high',
  },
  {
    id: 'ap-2',
    requester: 'Tom Baker',
    type: 'event',
    amount: 12000,
    description: 'SaaStr 2026 booth sponsorship. Expected to generate 25-30 qualified leads based on last year\'s performance (22 leads, 3 closed deals worth $180K).',
    status: 'pending',
    submitted: '3 days ago',
    agentRecommendation: 'Approve. Last year\'s SaaStr ROI was 15x ($180K closed on $12K spend). Current pipeline needs new top-of-funnel given the Zenith Labs deal going cold and quota attainment at 64%.',
    priority: 'medium',
  },
  {
    id: 'ap-3',
    requester: 'Mei Zhang',
    type: 'software',
    amount: 8400,
    description: 'Amplitude annual license renewal — product analytics platform used by product and engineering teams.',
    status: 'approved',
    submitted: '1 week ago',
    agentRecommendation: 'Approved. Renewal at same rate as last year. Amplitude is used daily by 12 team members. No comparable alternative at a lower price point.',
    priority: 'low',
  },
  {
    id: 'ap-4',
    requester: 'Mei Zhang',
    type: 'headcount',
    amount: 165000,
    description: 'Senior Product Designer for Agent Builder v2. The visual workflow editor (PRD-1) needs dedicated design support. Current team is at 120% capacity.',
    status: 'pending',
    submitted: '5 days ago',
    agentRecommendation: 'Recommend approval with caveat. Agent Builder v2 is the top-priority initiative and design is a bottleneck. However, this hire pushes the recruiting budget $35K over allocation. Consider deferring one of the two backfill positions to offset.',
    priority: 'high',
  },
  {
    id: 'ap-5',
    requester: 'Alex Rivera',
    type: 'travel',
    amount: 3200,
    description: 'Travel to Acme Corp HQ for on-site integration support. The billing bug fix (PR #847) requires coordinated deployment with their team.',
    status: 'pending',
    submitted: '1 day ago',
    agentRecommendation: 'Approve. Acme Corp is a $285K active deal in negotiation plus the largest existing customer. On-site support signals commitment and de-risks the deployment. The cost is well within the travel budget which is currently underutilized.',
    priority: 'medium',
  },
];

export const FORECAST_SCENARIOS: ForecastScenario[] = [
  {
    id: 'fs-1',
    label: 'Conservative',
    description: 'Backfill 2 expected departures only. No new headcount. Maintain current project velocity.',
    hires: 2,
    totalCost: 380000,
    runway: 22,
    risk: 'low',
    agentNote: 'Safest budget option. However, this leaves Agent Builder v2 under-resourced and doesn\'t address the design bottleneck. Win rate may decline as the team struggles to ship competitive features on time. Two senior engineers have signaled potential departures — backfills are essential.',
  },
  {
    id: 'fs-2',
    label: 'Base Case',
    description: 'Backfill 2 departures + 2 new hires (Senior Designer, Platform Engineer). Supports Agent Builder v2 and SSO.',
    hires: 4,
    totalCost: 720000,
    runway: 19,
    risk: 'medium',
    agentNote: 'Recommended scenario. Covers critical backfills and adds the two most impactful roles: the Senior Designer unblocks Agent Builder v2 design work, and the Platform Engineer supports the auth migration and API infrastructure. Runway remains comfortable at 19 months. This has the strongest ROI narrative for the board.',
  },
  {
    id: 'fs-3',
    label: 'Aggressive',
    description: 'Full growth plan: 2 backfills + 5 new hires. New platform team, expanded QA, dedicated DevRel.',
    hires: 7,
    totalCost: 1260000,
    runway: 15,
    risk: 'high',
    agentNote: 'Maximum growth option. Creates a dedicated platform team (Jordan\'s career goal aligns here), adds QA capacity, and hires DevRel to improve API documentation (15 negative feedback mentions/week). However, runway drops to 15 months and requires board approval. Only viable if Q2 pipeline converts at 40%+ win rate.',
  },
];

export const BOARD_PREP_ITEMS: BoardPrepItem[] = [
  {
    id: 'bp-1',
    section: 'Financial Overview & Burn Rate',
    status: 'complete',
    owner: 'David Park',
    dueDate: 'Apr 14',
    agentNote: 'Burn rate section is current. Highlight the cloud infrastructure overage ($65K over budget) and link it to auth migration load testing — it\'s a temporary spike, not a structural issue.',
  },
  {
    id: 'bp-2',
    section: 'Engineering Headcount Projections',
    status: 'in-progress',
    owner: 'You',
    dueDate: 'Apr 9',
    agentNote: 'Due today. Three scenarios prepared. Recommend leading with the base case (4 hires, $720K) as the default recommendation. Have conservative and aggressive as backup slides.',
  },
  {
    id: 'bp-3',
    section: 'Product Roadmap & Competitive Landscape',
    status: 'in-progress',
    owner: 'Mei Zhang',
    dueDate: 'Apr 11',
    agentNote: 'Mei\'s team is drafting this. Key updates needed: Intercom competitive response, Agent Builder v2 progress, and the decision to cut Low-Code Editor. Suggest reviewing before submission — Mei\'s recent tone suggests frustration with Q1 results.',
  },
  {
    id: 'bp-4',
    section: 'Sales Pipeline & Revenue Forecast',
    status: 'not-started',
    owner: 'Tom Baker',
    dueDate: 'Apr 11',
    agentNote: 'Tom\'s pipeline forecast is overdue from last product review. Weighted pipeline is $892K against a $1.5M quarter target (64% attainment). The Atlas Dynamics close ($225K) helps but two at-risk deals need attention. Follow up with Tom today.',
  },
  {
    id: 'bp-5',
    section: 'Key Risks & Mitigations',
    status: 'not-started',
    owner: 'You',
    dueDate: 'Apr 14',
    agentNote: 'I\'ve identified 4 key risks for the board deck: (1) auth migration timeline uncertainty, (2) Intercom competitive threat affecting 3 pipeline deals, (3) cloud spend overage, (4) two potential senior engineer departures. Draft ready for your review.',
  },
];

export const BURN_RATE_ENTRIES: BurnRateEntry[] = [
  { month: 'Nov', actual: 565000, planned: 555000 },
  { month: 'Dec', actual: 572000, planned: 560000 },
  { month: 'Jan', actual: 580000, planned: 565000 },
  { month: 'Feb', actual: 598000, planned: 570000 },
  { month: 'Mar', actual: 625000, planned: 575000 },
  { month: 'Apr', actual: 0, planned: 580000 },
];

export const FINANCE_AGENT_ACTIONS: FinanceAgentAction[] = [
  {
    id: 'faa-1',
    type: 'alert',
    title: 'Cloud infrastructure spend trending $65K over Q2 budget',
    message: 'AWS costs jumped 14% in March due to auth migration load testing and staging environment duplication. Current run rate projects $545K against $480K budget. The overage is primarily from EC2 instances used for load testing (temporary) and the new staging environment for auth-service. Recommend: (1) terminate load test instances after results are in, (2) right-size staging to reduce ongoing cost.',
    sources: ['AWS Cost Explorer', 'Cloud billing dashboard', 'Auth migration runbook'],
    actionLabel: 'View cost breakdown',
    urgency: 'high',
  },
  {
    id: 'faa-2',
    type: 'alert',
    title: 'Q2 headcount projections due to David by EOD',
    message: 'David Park needs your three-scenario headcount projection for the board deck. The Q2 budget cycle closes at 5pm today. I\'ve prepared the three scenarios (conservative: 2 hires/$380K, base: 4/$720K, aggressive: 7/$1.26M). Base case has the strongest ROI narrative. Review and send before 3pm to give David review buffer.',
    sources: ['Email from David Park', 'Budget planning spreadsheet', 'Team capacity report'],
    actionLabel: 'Review scenarios',
    urgency: 'high',
  },
  {
    id: 'faa-3',
    type: 'recommendation',
    title: 'Recruiting budget needs a $35K increase if designer is approved',
    message: 'The Senior Product Designer request from Mei ($165K) is compelling — design is a genuine bottleneck on Agent Builder v2. However, approving this hire alongside the two backfills pushes recruiting costs $35K over the $120K allocation. Options: (1) increase recruiting budget by $35K from travel underspend, (2) defer one backfill by one month, (3) use an external recruiter fee arrangement to spread cost.',
    sources: ['Recruiting budget tracker', 'Travel budget underspend', 'Headcount planning doc'],
    actionLabel: 'Adjust budget allocation',
    urgency: 'medium',
  },
  {
    id: 'faa-4',
    type: 'forecast',
    title: 'Revenue at risk: 3 deals worth $680K need attention',
    message: 'Pipeline analysis shows 3 at-risk deals totaling $680K (TechFlow $142K, Zenith Labs $198K, Meridian Health $340K). Each has a specific blocker: TechFlow needs SOC 2 documentation, Zenith champion may be leaving, Meridian requires BAA for HIPAA compliance. If all three slip to Q3, quota attainment drops from 64% to 49%. Recommend a deal review with Tom Baker this week.',
    sources: ['CRM pipeline data', 'Sales contact health scores', 'Compliance requirement tracker'],
    actionLabel: 'Schedule deal review',
    urgency: 'medium',
  },
  {
    id: 'faa-5',
    type: 'draft',
    title: 'Board deck risk section drafted — 4 key risks identified',
    message: 'I\'ve prepared the Key Risks & Mitigations section for the board deck based on current data. Risks: (1) Auth migration may slip 1-2 weeks — mitigation: phased rollout approach, (2) Intercom competitive threat affecting 3 deals — mitigation: accelerate Agent Builder v2 and template library, (3) Cloud spend $65K over budget — mitigation: temporary load test costs, will normalize in May, (4) Two senior engineers signaling departure — mitigation: backfill hiring already in base case scenario.',
    sources: ['Project health data', 'Pipeline analysis', 'AWS billing', 'HR signals'],
    actionLabel: 'Review draft',
    urgency: 'low',
  },
];

export const FINANCE_SUMMARY: FinanceSummary = {
  totalBudget: 3600000,
  totalSpent: 1888000,
  monthlyBurn: 625000,
  runway: 19,
  teamSize: 24,
  openReqs: 4,
  pendingApprovals: 4,
};
