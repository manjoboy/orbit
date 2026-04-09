// ─── Sales Persona Data ───

// ─── Types ───

export interface SalesDeal {
  id: string;
  company: string;
  value: number;
  stage: 'prospect' | 'discovery' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  owner: string;
  probability: number;
  daysInStage: number;
  nextStep: string;
  health: 'healthy' | 'at-risk' | 'critical';
  lastActivity: string;
  contacts: string[];
}

export interface SalesContact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  lastInteraction: string;
  interactionCount: number;
  health: 'strong' | 'warm' | 'cooling' | 'cold';
  notes: string;
}

export interface CompetitorThreat {
  id: string;
  competitor: string;
  deal: string;
  threatLevel: 'high' | 'medium' | 'low';
  context: string;
  battlecard: string;
}

export interface DemoPrep {
  id: string;
  company: string;
  date: string;
  time: string;
  attendees: string[];
  talkingPoints: string[];
  objections: string[];
  competitorAngle: string;
}

export interface AgentAction {
  id: string;
  type: 'alert' | 'recommendation' | 'draft' | 'intel';
  title: string;
  message: string;
  sources: string[];
  actionLabel?: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface SalesSummary {
  pipelineValue: number;
  weightedPipeline: number;
  dealsAtRisk: number;
  quotaAttainment: number;
  avgDealSize: number;
  winRate: number;
}

// ─── Mock Data ───

export const SALES_DEALS: SalesDeal[] = [
  {
    id: 'sd-1',
    company: 'Acme Corp',
    value: 285000,
    stage: 'negotiation',
    owner: 'Tom Baker',
    probability: 78,
    daysInStage: 9,
    nextStep: 'Send revised MSA with updated SLA terms by Thursday',
    health: 'healthy',
    lastActivity: '4 hours ago',
    contacts: ['Lisa Huang (VP Eng)', 'Marcus Cole (CTO)', 'Derek Owens (Procurement)'],
  },
  {
    id: 'sd-2',
    company: 'TechFlow',
    value: 142000,
    stage: 'proposal',
    owner: 'Rachel Kim',
    probability: 45,
    daysInStage: 14,
    nextStep: 'Schedule security review with their CISO — they need SOC 2 documentation',
    health: 'at-risk',
    lastActivity: '5 days ago',
    contacts: ['Nina Patel (Head of Product)', 'Raj Anand (CISO)'],
  },
  {
    id: 'sd-3',
    company: 'Zenith Labs',
    value: 198000,
    stage: 'discovery',
    owner: 'Tom Baker',
    probability: 30,
    daysInStage: 21,
    nextStep: 'Re-engage champion — no response in 3 weeks despite strong initial interest',
    health: 'critical',
    lastActivity: '21 days ago',
    contacts: ['Priya Sharma (VP Engineering)'],
  },
  {
    id: 'sd-4',
    company: 'Meridian Health',
    value: 340000,
    stage: 'proposal',
    owner: 'Tom Baker',
    probability: 55,
    daysInStage: 18,
    nextStep: 'Address HIPAA compliance requirements in updated proposal',
    health: 'at-risk',
    lastActivity: '3 days ago',
    contacts: ['Dr. Sarah Wells (CIO)', 'Raj Mehta (VP IT)', 'Karen Liu (Compliance)'],
  },
  {
    id: 'sd-5',
    company: 'Pinnacle Systems',
    value: 410000,
    stage: 'negotiation',
    owner: 'Rachel Kim',
    probability: 85,
    daysInStage: 5,
    nextStep: 'Legal review of MSA — their counsel has minor redlines, ETA 2 days',
    health: 'healthy',
    lastActivity: '1 day ago',
    contacts: ['Derek Wong (COO)', 'Amy Chen (Procurement)', 'Brett Larson (CTO)'],
  },
  {
    id: 'sd-6',
    company: 'NovaTech',
    value: 87000,
    stage: 'prospect',
    owner: 'Rachel Kim',
    probability: 15,
    daysInStage: 4,
    nextStep: 'Initial discovery call scheduled for Friday 2pm',
    health: 'healthy',
    lastActivity: '2 days ago',
    contacts: ['Carlos Vega (CEO)'],
  },
  {
    id: 'sd-7',
    company: 'Atlas Dynamics',
    value: 225000,
    stage: 'closed-won',
    owner: 'Tom Baker',
    probability: 100,
    daysInStage: 2,
    nextStep: 'Kickoff onboarding — CSM handoff meeting scheduled Monday',
    health: 'healthy',
    lastActivity: '2 days ago',
    contacts: ['Sam Nakamura (VP Ops)', 'Leah Strauss (Head of Engineering)'],
  },
  {
    id: 'sd-8',
    company: 'Acme Corp',
    value: 120000,
    stage: 'closed-lost',
    owner: 'Rachel Kim',
    probability: 0,
    daysInStage: 7,
    nextStep: 'Post-mortem: lost to Intercom on agent builder capabilities — schedule win-back in Q3',
    health: 'critical',
    lastActivity: '7 days ago',
    contacts: ['Lisa Huang (VP Eng)'],
  },
];

export const SALES_CONTACTS: SalesContact[] = [
  {
    id: 'sc-1',
    name: 'Lisa Huang',
    company: 'Acme Corp',
    role: 'VP Engineering',
    email: 'l.huang@acmecorp.com',
    lastInteraction: '4 hours ago',
    interactionCount: 18,
    health: 'strong',
    notes: 'Key champion for the $285K deal. Recently promoted — now has expanded budget authority. She pushed for us over Intercom in the main deal, though we lost the secondary workflow automation deal to them.',
  },
  {
    id: 'sc-2',
    name: 'Nina Patel',
    company: 'TechFlow',
    role: 'Head of Product',
    email: 'nina.patel@techflow.io',
    lastInteraction: '5 days ago',
    interactionCount: 7,
    health: 'cooling',
    notes: 'Was highly engaged during initial demo but has gone quiet after requesting SOC 2 docs. Her CISO Raj Anand is the real blocker — he has concerns about our data residency.',
  },
  {
    id: 'sc-3',
    name: 'Dr. Sarah Wells',
    company: 'Meridian Health',
    role: 'CIO',
    email: 's.wells@meridianhealth.org',
    lastInteraction: '3 days ago',
    interactionCount: 11,
    health: 'warm',
    notes: 'Supportive but cautious. HIPAA compliance is non-negotiable for her. Needs a BAA signed before she can move forward. Mentioned board presentation in two weeks.',
  },
  {
    id: 'sc-4',
    name: 'Derek Wong',
    company: 'Pinnacle Systems',
    role: 'COO',
    email: 'd.wong@pinnaclesystems.com',
    lastInteraction: '1 day ago',
    interactionCount: 14,
    health: 'strong',
    notes: 'Executive sponsor and budget holder. Has been fast-tracking internal approvals. Their legal team has minor MSA redlines around liability caps — not deal-breaking.',
  },
  {
    id: 'sc-5',
    name: 'Priya Sharma',
    company: 'Zenith Labs',
    role: 'VP Engineering',
    email: 'priya@zenithlabs.com',
    lastInteraction: '21 days ago',
    interactionCount: 4,
    health: 'cold',
    notes: 'Showed strong interest in Q1 but has not responded to last 3 outreach attempts. LinkedIn shows she may be evaluating a job change. Risk of champion loss.',
  },
  {
    id: 'sc-6',
    name: 'Carlos Vega',
    company: 'NovaTech',
    role: 'CEO',
    email: 'carlos@novatech.co',
    lastInteraction: '2 days ago',
    interactionCount: 2,
    health: 'warm',
    notes: 'Early-stage. Reached out via our website after seeing the TechCrunch coverage. Small company but fast-growing (3x YoY). Could be a strong case study customer.',
  },
];

export const COMPETITOR_THREATS: CompetitorThreat[] = [
  {
    id: 'ct-1',
    competitor: 'Intercom',
    deal: 'TechFlow',
    threatLevel: 'high',
    context: 'TechFlow is running a parallel eval with Intercom\'s AI Agent Builder. Their CISO prefers Intercom\'s EU data residency offering. Demo scheduled with Intercom next Tuesday.',
    battlecard: 'Lead with our superior customization, open API, and 3x faster agent deployment. Intercom locks customers into their ecosystem. Highlight our SOC 2 Type II and upcoming EU hosting.',
  },
  {
    id: 'ct-2',
    competitor: 'Zendesk',
    deal: 'Meridian Health',
    threatLevel: 'medium',
    context: 'Meridian has an existing Zendesk contract expiring in 60 days. Their support team is comfortable with Zendesk but the CIO wants more AI capabilities. Zendesk is offering a 20% renewal discount.',
    battlecard: 'Emphasize our healthcare-specific AI agent templates and HIPAA-ready infrastructure. Zendesk\'s AI features are generic and lack healthcare workflows. Offer a migration concierge service.',
  },
  {
    id: 'ct-3',
    competitor: 'Intercom',
    deal: 'Zenith Labs',
    threatLevel: 'low',
    context: 'Priya mentioned Intercom during initial discovery but hasn\'t actively engaged with either vendor in 3 weeks. May be deprioritizing the project entirely.',
    battlecard: 'If re-engaged, lead with speed-to-value story. Our platform ships 2x faster than Intercom for technical teams. Offer a free POC to rebuild momentum.',
  },
];

export const DEMO_PREPS: DemoPrep[] = [
  {
    id: 'dp-1',
    company: 'TechFlow',
    date: 'Apr 11, 2026',
    time: '10:00 AM',
    attendees: ['Nina Patel (Head of Product)', 'Raj Anand (CISO)', 'Dev Team Lead (TBD)'],
    talkingPoints: [
      'Open with the security architecture overview — address Raj\'s data residency concerns upfront',
      'Demo the agent builder with TechFlow-specific use case: customer onboarding automation',
      'Show SOC 2 Type II report and compliance dashboard',
      'Preview upcoming EU data residency feature (Q3 roadmap) — this could neutralize Intercom\'s advantage',
      'Close with customer case study: Atlas Dynamics deployed in 3 weeks',
    ],
    objections: [
      'Data residency: "We need EU hosting" — Respond with Q3 EU rollout timeline and interim encryption architecture',
      'Vendor lock-in: "Your API seems proprietary" — Show open webhook system and export capabilities',
      'Pricing: "Intercom is 15% cheaper" — Reframe around TCO: our deployment is 3x faster with less eng overhead',
    ],
    competitorAngle: 'Intercom has a demo with TechFlow next Tuesday. We need to make a strong impression in this session. Focus on security depth and customization — areas where Intercom is weak.',
  },
  {
    id: 'dp-2',
    company: 'NovaTech',
    date: 'Apr 11, 2026',
    time: '2:00 PM',
    attendees: ['Carlos Vega (CEO)', 'Head of Engineering (joining remotely)'],
    talkingPoints: [
      'Keep it high-level — Carlos is a CEO, not a technical buyer',
      'Focus on speed-to-value: show a working agent in under 5 minutes',
      'Highlight our startup pricing tier and growth-friendly licensing',
      'Mention the case study program — NovaTech\'s growth story could be compelling marketing',
      'Tailor demo to their vertical: SaaS onboarding automation',
    ],
    objections: [
      'Budget: "We\'re a small team" — Emphasize startup pricing and ROI within 30 days',
      'Resources: "We don\'t have a dedicated ops team" — Show self-serve agent builder with zero-code templates',
    ],
    competitorAngle: 'No known competitor involvement yet. Carlos found us organically. Position early to lock out competitors before they enter the picture.',
  },
];

export const AGENT_ACTIONS: AgentAction[] = [
  {
    id: 'aa-1',
    type: 'alert',
    title: 'Zenith Labs deal going cold — champion may be leaving',
    message: 'Priya Sharma (VP Engineering, Zenith Labs) hasn\'t responded in 21 days. LinkedIn activity suggests she may be exploring new roles. The $198K deal has no secondary champion identified. Recommend immediate outreach to her CTO to establish a backup relationship.',
    sources: ['LinkedIn activity', 'CRM engagement data', 'Email open tracking'],
    actionLabel: 'Draft outreach to Zenith CTO',
    urgency: 'high',
  },
  {
    id: 'aa-2',
    type: 'intel',
    title: 'Acme Corp announced $50M Series C',
    message: 'Acme Corp closed a $50M round yesterday. Their CEO signaled expansion into healthcare and fintech verticals. Your $285K deal is in negotiation — this funding typically correlates with expanded vendor budgets. Consider proposing a multi-year enterprise agreement while momentum is high.',
    sources: ['Crunchbase', 'TechCrunch', 'Acme Corp press release'],
    actionLabel: 'Draft expansion proposal',
    urgency: 'medium',
  },
  {
    id: 'aa-3',
    type: 'recommendation',
    title: 'Pinnacle Systems deal is ready to close',
    message: 'All signals point to close within 5 business days. Legal redlines are minor (liability cap adjustment). Derek Wong confirmed internal budget approval yesterday. Recommend scheduling a signature meeting for next Wednesday to maintain momentum.',
    sources: ['CRM activity log', 'Email thread with Pinnacle legal', 'Derek Wong call notes'],
    actionLabel: 'Schedule closing meeting',
    urgency: 'medium',
  },
  {
    id: 'aa-4',
    type: 'draft',
    title: 'Follow-up email drafted for TechFlow security review',
    message: 'Nina Patel hasn\'t responded in 5 days after requesting SOC 2 documentation. I\'ve drafted a follow-up email that attaches the SOC 2 Type II report, addresses Raj Anand\'s data residency question, and proposes a 30-minute security deep-dive call. Review and send before their Intercom demo on Tuesday.',
    sources: ['Email thread with Nina', 'SOC 2 report', 'Raj Anand LinkedIn profile'],
    actionLabel: 'Review draft email',
    urgency: 'high',
  },
  {
    id: 'aa-5',
    type: 'alert',
    title: 'Meridian Health proposal is stalling — HIPAA blocker',
    message: 'The Meridian deal ($340K) has been in proposal stage for 18 days. Dr. Wells mentioned needing a signed BAA before she can present to her board in two weeks. Your legal team hasn\'t started the BAA review yet. If this isn\'t prioritized now, the deal slips to Q3.',
    sources: ['CRM stage duration', 'Dr. Wells email from 3 days ago', 'Legal team capacity tracker'],
    actionLabel: 'Escalate BAA to legal',
    urgency: 'high',
  },
];

export const SALES_SUMMARY: SalesSummary = {
  pipelineValue: 1687000,
  weightedPipeline: 892450,
  dealsAtRisk: 3,
  quotaAttainment: 64,
  avgDealSize: 211000,
  winRate: 34,
};
