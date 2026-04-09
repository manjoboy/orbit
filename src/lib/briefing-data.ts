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
  // Rich context for the reply panel
  situation?: string;
  nextSteps?: Array<{ label: string; description: string }>;
  actionPlan?: string[];
  threadHistory?: Array<{ from: string; time: string; message: string }>;
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
  lastMeetingNotes?: string[];
  lastMeetingActions?: Array<{ owner: string; item: string; status: 'done' | 'overdue' | 'pending' }>;
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
      {
        icon: MessageSquare, from: 'Sarah Chen', time: '2h',
        title: 'Critical auth dependency — workaround vs. 2-day delay',
        urgency: true, panelType: 'person',
        situation: 'Sarah is the Staff Engineer who owns the auth migration (deadline in 10 days). Yesterday she discovered the OAuth library v4.x has a breaking API change requiring a 2-day refactor. The alternative is a workaround that introduces ~400 lines of adapter code and some tech debt. The CTO has been discussing a phased rollout approach with her separately.',
        nextSteps: [
          { label: 'Approve the workaround', description: 'Accept the tech debt trade-off and keep the original timeline intact. Sarah can ship the adapter code now.' },
          { label: 'Grant a 2-day extension', description: 'Allow Sarah to do the clean refactor. Adjusts sprint plan and delays the migration launch slightly.' },
          { label: 'Sync with CTO first', description: 'James already discussed phased rollout with Sarah. Align on his preferred path before deciding.' },
        ],
        actionPlan: [
          'Review Sarah\'s technical doc in #eng-auth channel',
          'Check James\'s stance on phased rollout (he may have already decided)',
          'Reply to Sarah with your decision and reasoning by 1pm',
          'If approving extension, update sprint plan and notify David (CFO) of timeline shift',
        ],
        threadHistory: [
          { from: 'Sarah Chen', time: '9:00 AM', message: 'Hey — I\'ve hit a blocker on the auth migration. The OAuth lib v4.x changed their token refresh API. I see two paths: quick adapter workaround (2 days of tech debt) or a clean refactor (pushes us 2 days). What\'s the call?' },
          { from: 'You', time: '9:45 AM', message: 'Looking into it. Can you drop the relevant diff in the thread?' },
          { from: 'Sarah Chen', time: '10:05 AM', message: 'Linked the PR and the adapter proposal in #eng-auth. FYI James and I talked about phased rollout yesterday — might change the calculus.' },
        ],
      },
      {
        icon: Mail, from: 'David Park (CFO)', time: '4h',
        title: 'Q2 budget — headcount projections due EOD',
        urgency: true, panelType: 'person',
        situation: 'Q2 budget cycle closes today at 5pm. David needs engineering headcount projections for the board deck. You\'ve been asked to submit 3 scenarios (conservative, base, aggressive). Current team is at 73% capacity across 3 active projects. Last year you approved 6 new hires; 4 were backfilled. Two senior engineers have signaled potential departures.',
        nextSteps: [
          { label: 'Submit base projection (4 hires)', description: 'The safest ask with the strongest business case. Covers the two likely departures plus capacity for Agent Builder v2.' },
          { label: 'Submit aggressive projection (7 hires)', description: 'Maximizes growth opportunity but requires a strong ROI narrative given current budget constraints.' },
          { label: 'Request 24hr extension', description: 'If you need more time to gather team input. David has done this before but may push back given board timing.' },
        ],
        actionPlan: [
          'Pull current team capacity report from Linear sprint board',
          'Confirm the 2 potential departure signals with HR (confidential)',
          'Draft 3-scenario projection doc (conservative: 2, base: 4, aggressive: 7)',
          'Send to David by 3pm to allow review buffer before 5pm deadline',
        ],
        threadHistory: [
          { from: 'David Park (CFO)', time: '8:00 AM', message: 'Manoj — Q2 budget closes at 5pm today. I need engineering headcount projections for the board deck. Three scenarios as discussed. Let me know if you need the template.' },
          { from: 'David Park (CFO)', time: '11:30 AM', message: 'Checking in — do you have an ETA? Board materials need to be finalized by 4pm.' },
        ],
      },
      {
        icon: CheckSquare, from: 'Jordan Liu', time: '8h',
        title: 'Enterprise SSO architecture — waiting on your approval',
        urgency: false, panelType: 'person',
        situation: 'Jordan designed an Enterprise SSO system using SAML 2.0 for the Enterprise Onboarding Redesign project (currently at 38% health, AT_RISK). The architecture PR has been open 8 hours with 2 minor style comments from Alex. This is blocking the next sprint milestone. Jordan worked on this solo and is clearly invested — this is the most complex work he\'s done on the team.',
        nextSteps: [
          { label: 'Approve the PR now', description: 'Both comments are cosmetic. Unblocks the team immediately and shows confidence in Jordan\'s work.' },
          { label: 'Request a 15-min sync', description: 'Quick verbal review before approving. Good opportunity to give Jordan visibility on the broader project context.' },
          { label: 'Delegate to senior reviewer', description: 'Ask Sarah or Alex to do a thorough security review first given the SSO implications.' },
        ],
        actionPlan: [
          'Open PR #852 and skim the 2 open comments from Alex',
          'Check if comments are truly cosmetic or flag real issues',
          'Approve PR and leave a note acknowledging the quality of the design work',
          'Flag the unblock to Mei — Enterprise Onboarding should now be unblocked',
        ],
        threadHistory: [
          { from: 'Jordan Liu', time: '8:00 AM', message: 'PR #852 is up for the Enterprise SSO architecture. Went with SAML 2.0 — covered the rationale in the PR description. Alex left a couple style comments but nothing blocking. Waiting on your sign-off to proceed.' },
        ],
      },
      {
        icon: GitPullRequest, from: 'Alex Rivera', time: '2d',
        title: 'PR #847: Payment pipeline refactor — 2 days waiting',
        urgency: false, panelType: 'person',
        situation: 'Alex\'s payment pipeline refactor (PR #847) removes 340 lines of legacy code and adds comprehensive test coverage. It\'s been waiting 2 days with no assigned reviewer. The PR is linked to a customer-reported bug (#1203) from Acme Corp — your 3rd largest account — that\'s been escalating via CS. Alex has pinged twice in Slack.',
        nextSteps: [
          { label: 'Assign Jordan as reviewer', description: 'Jordan has context on the payment service and has bandwidth this sprint. Can turn it around in a few hours.' },
          { label: 'Fast-track with 2 team leads', description: 'Get Sarah and Jordan to do a quick parallel review for speed. Appropriate given the customer escalation.' },
          { label: 'Review it yourself', description: 'Takes ~30min. High signal — shows Alex his work matters and you can verify the customer fix firsthand.' },
        ],
        actionPlan: [
          'Acknowledge Alex\'s Slack ping with a quick reply',
          'Assign Jordan Liu as reviewer in GitHub',
          'Set a deadline: PR merged before EOD tomorrow',
          'Loop in CS to let Acme Corp know a fix is in review',
        ],
        threadHistory: [
          { from: 'Alex Rivera', time: '2 days ago', message: 'PR #847 is ready for review — payment pipeline refactor. This also fixes the Acme bug (#1203). Could use eyes on it soon.' },
          { from: 'Alex Rivera', time: 'Yesterday', message: 'Gentle ping on #847 — it\'s been sitting for a day. Acme CS ticket is still open.' },
        ],
      },
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
        lastMeetingNotes: [
          'Auth migration is 65% complete — originally tracking on schedule',
          'Sarah flagged a 3rd-party OAuth library issue (v4.x breaking change) — team agreed to evaluate the 2 paths by Wednesday',
          'Load tests are queued; results needed before go/no-go decision',
          'Alex raised a question about rollback strategy — no decision made, tabled for today',
          'Jordan completed the SSO architecture draft and will open a PR this week',
        ],
        lastMeetingActions: [
          { owner: 'You', item: 'Share load test results with the team', status: 'overdue' },
          { owner: 'Sarah', item: 'Update auth migration runbook with new OAuth path options', status: 'pending' },
          { owner: 'You', item: 'Escalate OAuth dependency blocker to CTO James', status: 'done' },
          { owner: 'Alex', item: 'Document rollback strategy for auth migration', status: 'pending' },
        ],
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
        lastMeetingNotes: [
          'Q1 OKR results: 67% attainment vs. 80% target — below expectations; board is aware',
          'Mei pushed to set aggressive Q2 goals to compensate — wants 90% OKR attainment target',
          'David raised budget constraints: eng team can\'t grow beyond a 15% headcount increase',
          'Tom flagged 3 competitive threats from Intercom and Zendesk affecting pipeline',
          'Decision: defer Low-Code Editor and White-Label features; focus entirely on Agent Builder v2',
          'Roadmap now has 4 core initiatives for Q2 — all tied to Agent Builder and enterprise expansion',
        ],
        lastMeetingActions: [
          { owner: 'You', item: 'Submit Q2 engineering headcount projections to David', status: 'overdue' },
          { owner: 'Mei', item: 'Publish updated Q2 roadmap priorities doc', status: 'pending' },
          { owner: 'Tom', item: 'Submit pipeline forecast update', status: 'overdue' },
          { owner: 'You', item: 'Draft competitive response battlecard for sales team', status: 'pending' },
          { owner: 'Sarah', item: 'Estimate effort for Agent Builder v2 Phase 1', status: 'done' },
        ],
      },
      {
        title: '1:1 with Jordan', time: '4:00 PM', duration: '30m', attendeeCount: 1, alertCount: 1,
        attendees: [{ name: 'Jordan Liu', title: 'Engineer II', health: 0.90 }],
        anticipations: [
          { emoji: '⏰', title: 'Your promise about the platform team is 6 weeks overdue', body: 'You told Jordan you\'d check on the API redesign opening. That was 6 weeks ago.' },
        ],
        openItems: ['Check platform team opening (you — 6 weeks overdue)'],
        lastSummary: 'Jordan expressed interest in platform team. You promised to look into API redesign opportunity.',
        lastMeetingNotes: [
          'Jordan expressed strong interest in moving to the platform team within 12-18 months',
          'Career goal: reach Staff Engineer via systems/infrastructure work — current role doesn\'t give enough exposure',
          'Jordan mentioned feeling underutilized in the current sprint (CRUD features, low complexity)',
          'Morale seems good overall but there\'s latent frustration about career pace',
          'Jordan asked directly about the API redesign opening on the platform team',
          'Good 1:1 energy — Jordan is engaged and proactive about career growth',
        ],
        lastMeetingActions: [
          { owner: 'You', item: 'Check with platform team lead about the API redesign opening', status: 'overdue' },
          { owner: 'You', item: 'Create a 12-month growth plan doc for Jordan', status: 'pending' },
          { owner: 'You', item: 'Give Jordan the lead on the next complex feature in the sprint', status: 'pending' },
          { owner: 'Jordan', item: 'Write up a short doc on systems work he wants to pursue', status: 'done' },
        ],
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
