import { Inbox, Calendar, FolderKanban, Newspaper, Users, Heart, MessageSquare, Mail, CheckSquare, GitPullRequest } from 'lucide-react';

// ─── Types ───

type IconComponent = React.ComponentType<{ className?: string }>;

interface BriefingItemListItem {
  icon: IconComponent;
  from?: string;
  time?: string;
  title: string;
  urgency: boolean;
  panelType: string;
}

interface BriefingMeeting {
  title: string;
  time: string;
  duration: string;
  attendeeCount: number;
  alertCount: number;
  attendees: Array<{ name: string; title?: string; health?: number }>;
  anticipations: Array<{ emoji: string; title: string; body: string }>;
  openItems: string[];
  lastSummary: string;
}

interface BriefingProject {
  name: string;
  health: number;
  trend: 'up' | 'down' | 'stable';
  velocity: number;
  blockers: number;
  deadline?: number;
  status: string;
}

interface BriefingSignal {
  type: string;
  company?: string;
  relevance: number;
  title: string;
  summary: string;
  impact: string;
  action: string;
  sourceUrl?: string;
}

interface BriefingPerson {
  name: string;
  role: string;
  subtitle: string;
  days: number;
  action: string;
}

interface BriefingMetric {
  label: string;
  value: string;
  warn: boolean;
}

interface BriefingSectionBase {
  id: string;
  label: string;
  icon: IconComponent;
  count?: number;
}

interface ItemListSection extends BriefingSectionBase {
  type: 'item-list';
  items: BriefingItemListItem[];
}

interface MeetingListSection extends BriefingSectionBase {
  type: 'meeting-list';
  meetings: BriefingMeeting[];
}

interface ProjectListSection extends BriefingSectionBase {
  type: 'project-list';
  projects: BriefingProject[];
}

interface IntelListSection extends BriefingSectionBase {
  type: 'intel-list';
  signals: BriefingSignal[];
}

interface PeopleListSection extends BriefingSectionBase {
  type: 'people-list';
  people: BriefingPerson[];
}

interface WellbeingSection extends BriefingSectionBase {
  type: 'wellbeing';
  score: number;
  metrics: BriefingMetric[];
}

interface AiMessageSection extends BriefingSectionBase {
  type: 'ai-message';
  message: string;
}

export type BriefingSection =
  | ItemListSection
  | MeetingListSection
  | ProjectListSection
  | IntelListSection
  | PeopleListSection
  | WellbeingSection
  | AiMessageSection;

// ─── Data ───

export const BRIEFING_SECTIONS: BriefingSection[] = [
  // ─── Priority Inbox ───
  {
    id: 'inbox',
    label: 'Priority Inbox',
    icon: Inbox,
    type: 'item-list' as const,
    count: 4,
    items: [
      { icon: MessageSquare, from: 'Sarah Chen', time: '2h', title: 'Critical auth dependency — workaround vs. 2-day delay', urgency: true, panelType: 'person' },
      { icon: Mail, from: 'David Park (CFO)', time: '4h', title: 'Q2 budget — headcount projections due EOD', urgency: true, panelType: 'person' },
      { icon: CheckSquare, from: 'Jordan Liu', time: '8h', title: 'Enterprise SSO architecture — waiting on your approval', urgency: false, panelType: 'person' },
      { icon: GitPullRequest, from: 'Alex Rivera', time: '2d', title: 'PR #847: Payment pipeline refactor — 2 days waiting', urgency: false, panelType: 'person' },
    ],
  },

  // ─── Meetings ───
  {
    id: 'meetings',
    label: 'Today\'s Meetings',
    icon: Calendar,
    type: 'meeting-list' as const,
    count: 3,
    meetings: [
      {
        title: 'Engineering Standup', time: '9:00 AM', duration: '15m', attendeeCount: 4, alertCount: 1,
        attendees: [
          { name: 'Sarah Chen', title: 'Staff Engineer', health: 0.85 },
          { name: 'Alex Rivera', title: 'Senior Engineer', health: 0.72 },
          { name: 'Jordan Liu', title: 'Engineer II', health: 0.90 },
        ],
        anticipations: [
          { emoji: '⚠️', title: 'CTO discussed phased rollout with Sarah', body: 'James and Sarah had a 20-min conversation about the auth migration in #eng-leadership. James is leaning toward a phased approach. You weren\'t in that channel.' },
        ],
        openItems: ['Share load test results (you — due today)', 'Update migration runbook (Sarah)'],
        lastSummary: 'Discussed auth migration timeline. Sarah flagged risk with 3rd-party dependency.',
      },
      {
        title: 'Product Review — Q2 Roadmap', time: '2:00 PM', duration: '60m', attendeeCount: 4, alertCount: 3,
        attendees: [
          { name: 'Mei Zhang', title: 'VP Product', health: 0.55 },
          { name: 'David Park', title: 'CFO', health: 0.68 },
          { name: 'Tom Baker', title: 'Head of Sales', health: 0.60 },
          { name: 'Sarah Chen', title: 'Staff Engineer', health: 0.85 },
        ],
        anticipations: [
          { emoji: '⚠️', title: 'Mei\'s tone has shifted recently', body: 'Her sentiment in the last 3 interactions is more critical. She may be under board pressure on Q1 results.' },
          { emoji: '📰', title: 'Intercom launch will come up', body: 'Tom\'s team received questions from 3 prospects. Expect push to accelerate Agent Builder.' },
          { emoji: '📋', title: '2 open items from last meeting', body: 'Tom\'s pipeline forecast is overdue. Your headcount projections are due today.' },
        ],
        openItems: ['Submit headcount projections (you — due today)', 'Q2 roadmap priorities (Mei)', 'Pipeline forecast (Tom — overdue)'],
        lastSummary: 'Q1 OKR results below target. Mei pushed for aggressive Q2 goals. David raised budget constraints.',
      },
      {
        title: '1:1 with Jordan', time: '4:00 PM', duration: '30m', attendeeCount: 1, alertCount: 1,
        attendees: [{ name: 'Jordan Liu', title: 'Engineer II', health: 0.90 }],
        anticipations: [
          { emoji: '⏰', title: 'Your promise about the platform team is 6 weeks overdue', body: 'You told Jordan you\'d check on the API redesign opening. That was 6 weeks ago.' },
        ],
        openItems: ['Check platform team opening (you — 6 weeks overdue)'],
        lastSummary: 'Jordan expressed interest in platform team. You promised to look into API redesign opportunity.',
      },
    ],
  },

  // ─── Projects ───
  {
    id: 'projects',
    label: 'Project Health',
    icon: FolderKanban,
    type: 'project-list' as const,
    count: 4,
    projects: [
      { name: 'Enterprise Onboarding Redesign', health: 0.38, trend: 'down', velocity: -42, blockers: 3, deadline: 18, status: 'AT_RISK' },
      { name: 'Agent Builder v2', health: 0.72, trend: 'stable', velocity: 5, blockers: 0, deadline: 45, status: 'ACTIVE' },
      { name: 'Auth Service Migration', health: 0.58, trend: 'down', velocity: -15, blockers: 1, deadline: 10, status: 'ACTIVE' },
      { name: 'Dashboard Analytics v3', health: 0.89, trend: 'up', velocity: 20, blockers: 0, deadline: 30, status: 'ACTIVE' },
    ],
  },

  // ─── Intelligence ───
  {
    id: 'intel',
    label: 'Intelligence',
    icon: Newspaper,
    type: 'intel-list' as const,
    count: 3,
    signals: [
      {
        type: 'Product Launch', company: 'Intercom', relevance: 91,
        title: 'Intercom launches AI Agent Builder for enterprise',
        summary: 'Intercom announced their new AI Agent Builder, targeting enterprise customers with customizable AI agents for support automation.',
        impact: 'Directly competes with Agent Builder v2. 3 active prospects are evaluating Intercom. Sales needs a battlecard.',
        action: 'Draft battlecard', sourceUrl: 'https://techcrunch.com',
      },
      {
        type: 'Funding', company: 'Acme Corp', relevance: 78,
        title: 'Acme Corp announces $50M Series C',
        summary: 'Your 3rd largest customer raised $50M. CEO signals expansion into new markets.',
        impact: 'Contract renewal in 60 days. Funding typically triggers expansion — strong upsell opportunity.',
        action: 'Notify account manager', sourceUrl: 'https://crunchbase.com',
      },
      {
        type: 'Regulation', relevance: 65,
        title: 'EU AI Act enforcement moves to Q3',
        summary: 'Key provisions enforced 6 months earlier than expected.',
        impact: '4 enterprise customers are EU-based. AI agent product may need compliance updates.',
        action: 'Schedule compliance review',
      },
    ],
  },

  // ─── People ───
  {
    id: 'people',
    label: 'Relationships',
    icon: Users,
    type: 'people-list' as const,
    count: 3,
    people: [
      { name: 'Mei Zhang', role: 'VP Product', subtitle: 'Key stakeholder — no direct contact in 12 days', days: 12, action: 'Schedule sync' },
      { name: 'James (CTO)', role: 'CTO', subtitle: 'Sentiment shifted — likely related to auth delays', days: 5, action: 'Send status update' },
      { name: 'Tom Baker', role: 'Head of Sales', subtitle: 'No 1:1 in 3 weeks — pipeline forecast overdue', days: 21, action: 'Follow up' },
    ],
  },

  // ─── Wellbeing ───
  {
    id: 'wellbeing',
    label: 'Wellbeing',
    icon: Heart,
    type: 'wellbeing' as const,
    score: 58,
    metrics: [
      { label: 'Meetings', value: '5.2h', warn: true },
      { label: 'Focus', value: '1.8h', warn: true },
      { label: 'Switches', value: '14', warn: true },
    ],
  },
];
