import {
  User,
  FolderKanban,
  Calendar,
  Zap,
  Compass,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ───

export type CommandCategory = 'People' | 'Projects' | 'Meetings' | 'Actions' | 'Navigation';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: CommandCategory;
  icon: LucideIcon;
  /** For people/projects/meetings: the panel type to open */
  panelType?: 'person' | 'project' | 'meeting' | 'intel' | 'wellbeing' | null;
  /** For navigation: the section to switch to */
  section?: 'inbox' | 'meetings' | 'projects' | 'intel' | 'people' | 'wellbeing';
  /** Additional data to pass to the panel */
  data?: Record<string, unknown>;
}

// ─── Data ───

export const COMMAND_ITEMS: CommandItem[] = [
  // People
  {
    id: 'person-sarah',
    title: 'Sarah Chen',
    subtitle: 'Staff Engineer',
    category: 'People',
    icon: User,
    panelType: 'person',
    data: { name: 'Sarah Chen', role: 'Staff Engineer', subtitle: 'Critical auth dependency — workaround vs. 2-day delay', days: 0, action: 'Respond to auth issue' },
  },
  {
    id: 'person-david',
    title: 'David Park',
    subtitle: 'CFO',
    category: 'People',
    icon: User,
    panelType: 'person',
    data: { name: 'David Park', role: 'CFO', subtitle: 'Q2 budget — headcount projections due EOD', days: 0, action: 'Submit projections' },
  },
  {
    id: 'person-mei',
    title: 'Mei Zhang',
    subtitle: 'VP Product',
    category: 'People',
    icon: User,
    panelType: 'person',
    data: { name: 'Mei Zhang', role: 'VP Product', subtitle: 'Key stakeholder — no direct contact in 12 days', days: 12, action: 'Schedule sync' },
  },
  {
    id: 'person-james',
    title: 'James (CTO)',
    subtitle: 'CTO',
    category: 'People',
    icon: User,
    panelType: 'person',
    data: { name: 'James (CTO)', role: 'CTO', subtitle: 'Sentiment shifted — likely related to auth delays', days: 5, action: 'Send status update' },
  },
  {
    id: 'person-tom',
    title: 'Tom Baker',
    subtitle: 'Head of Sales',
    category: 'People',
    icon: User,
    panelType: 'person',
    data: { name: 'Tom Baker', role: 'Head of Sales', subtitle: 'No 1:1 in 3 weeks — pipeline forecast overdue', days: 21, action: 'Follow up' },
  },
  {
    id: 'person-jordan',
    title: 'Jordan Liu',
    subtitle: 'Engineer II',
    category: 'People',
    icon: User,
    panelType: 'person',
    data: { name: 'Jordan Liu', role: 'Engineer II', subtitle: 'Enterprise SSO architecture — waiting on your approval', days: 0, action: 'Review SSO proposal' },
  },
  {
    id: 'person-alex',
    title: 'Alex Rivera',
    subtitle: 'Senior Engineer',
    category: 'People',
    icon: User,
    panelType: 'person',
    data: { name: 'Alex Rivera', role: 'Senior Engineer', subtitle: 'PR #847: Payment pipeline refactor — 2 days waiting', days: 2, action: 'Review PR' },
  },

  // Projects
  {
    id: 'project-onboarding',
    title: 'Enterprise Onboarding',
    subtitle: 'Health 38% — AT RISK',
    category: 'Projects',
    icon: FolderKanban,
    panelType: 'project',
    data: { name: 'Enterprise Onboarding Redesign', health: 0.38, trend: 'down', velocity: -42, blockers: 3, deadline: 18, status: 'AT_RISK' },
  },
  {
    id: 'project-agent',
    title: 'Agent Builder v2',
    subtitle: 'Health 72% — Active',
    category: 'Projects',
    icon: FolderKanban,
    panelType: 'project',
    data: { name: 'Agent Builder v2', health: 0.72, trend: 'stable', velocity: 5, blockers: 0, deadline: 45, status: 'ACTIVE' },
  },
  {
    id: 'project-auth',
    title: 'Auth Migration',
    subtitle: 'Health 58% — Active',
    category: 'Projects',
    icon: FolderKanban,
    panelType: 'project',
    data: { name: 'Auth Service Migration', health: 0.58, trend: 'down', velocity: -15, blockers: 1, deadline: 10, status: 'ACTIVE' },
  },
  {
    id: 'project-dashboard',
    title: 'Dashboard Analytics',
    subtitle: 'Health 89% — Active',
    category: 'Projects',
    icon: FolderKanban,
    panelType: 'project',
    data: { name: 'Dashboard Analytics v3', health: 0.89, trend: 'up', velocity: 20, blockers: 0, deadline: 30, status: 'ACTIVE' },
  },

  // Meetings
  {
    id: 'meeting-standup',
    title: 'Engineering Standup',
    subtitle: '9:00 AM — 15m — 1 heads up',
    category: 'Meetings',
    icon: Calendar,
    panelType: 'meeting',
    data: {
      title: 'Engineering Standup', time: '9:00 AM', duration: '15m', attendeeCount: 4, alertCount: 1,
      attendees: [
        { name: 'Sarah Chen', title: 'Staff Engineer', health: 0.85 },
        { name: 'Alex Rivera', title: 'Senior Engineer', health: 0.72 },
        { name: 'Jordan Liu', title: 'Engineer II', health: 0.90 },
      ],
      anticipations: [{ emoji: '---', title: 'CTO discussed phased rollout with Sarah', body: 'James and Sarah had a conversation about auth migration.' }],
      openItems: ['Share load test results (you — due today)', 'Update migration runbook (Sarah)'],
      lastSummary: 'Discussed auth migration timeline.',
    },
  },
  {
    id: 'meeting-review',
    title: 'Product Review',
    subtitle: '2:00 PM — 60m — 3 heads up',
    category: 'Meetings',
    icon: Calendar,
    panelType: 'meeting',
    data: {
      title: 'Product Review — Q2 Roadmap', time: '2:00 PM', duration: '60m', attendeeCount: 4, alertCount: 3,
      attendees: [
        { name: 'Mei Zhang', title: 'VP Product', health: 0.55 },
        { name: 'David Park', title: 'CFO', health: 0.68 },
        { name: 'Tom Baker', title: 'Head of Sales', health: 0.60 },
        { name: 'Sarah Chen', title: 'Staff Engineer', health: 0.85 },
      ],
      anticipations: [],
      openItems: ['Submit headcount projections (you — due today)', 'Q2 roadmap priorities (Mei)'],
      lastSummary: 'Q1 OKR results below target.',
    },
  },
  {
    id: 'meeting-jordan',
    title: '1:1 with Jordan',
    subtitle: '4:00 PM — 30m — 1 heads up',
    category: 'Meetings',
    icon: Calendar,
    panelType: 'meeting',
    data: {
      title: '1:1 with Jordan', time: '4:00 PM', duration: '30m', attendeeCount: 1, alertCount: 1,
      attendees: [{ name: 'Jordan Liu', title: 'Engineer II', health: 0.90 }],
      anticipations: [],
      openItems: ['Check platform team opening (you — 6 weeks overdue)'],
      lastSummary: 'Jordan expressed interest in platform team.',
    },
  },

  // Actions
  {
    id: 'action-note',
    title: 'New note',
    subtitle: 'Create a quick note',
    category: 'Actions',
    icon: Zap,
  },
  {
    id: 'action-schedule',
    title: 'Schedule meeting',
    subtitle: 'Find a time and schedule',
    category: 'Actions',
    icon: Zap,
  },
  {
    id: 'action-reminder',
    title: 'Set reminder',
    subtitle: 'Remind yourself later',
    category: 'Actions',
    icon: Zap,
  },
  {
    id: 'action-draft',
    title: 'Draft message',
    subtitle: 'Compose a new message',
    category: 'Actions',
    icon: Zap,
  },

  // Navigation
  {
    id: 'nav-inbox',
    title: 'Inbox',
    subtitle: 'Priority inbox items',
    category: 'Navigation',
    icon: Compass,
    section: 'inbox',
  },
  {
    id: 'nav-meetings',
    title: 'Meetings',
    subtitle: "Today's meetings",
    category: 'Navigation',
    icon: Compass,
    section: 'meetings',
  },
  {
    id: 'nav-projects',
    title: 'Projects',
    subtitle: 'Project health overview',
    category: 'Navigation',
    icon: Compass,
    section: 'projects',
  },
  {
    id: 'nav-intel',
    title: 'Intel',
    subtitle: 'Intelligence signals',
    category: 'Navigation',
    icon: Compass,
    section: 'intel',
  },
  {
    id: 'nav-people',
    title: 'People',
    subtitle: 'Relationships overview',
    category: 'Navigation',
    icon: Compass,
    section: 'people',
  },
  {
    id: 'nav-wellbeing',
    title: 'Wellbeing',
    subtitle: 'Sustainability score',
    category: 'Navigation',
    icon: Compass,
    section: 'wellbeing',
  },
];

// ─── Category order for display ───
export const CATEGORY_ORDER: CommandCategory[] = ['People', 'Projects', 'Meetings', 'Actions', 'Navigation'];

// ─── Category badge colors ───
export const CATEGORY_COLORS: Record<CommandCategory, string> = {
  People: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Projects: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Meetings: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Actions: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Navigation: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/20',
};

// ─── Simple fuzzy search ───
export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Direct substring match
  if (t.includes(q)) return true;

  // Fuzzy: each query char must appear in order in the text
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function searchCommands(query: string): CommandItem[] {
  if (!query.trim()) return COMMAND_ITEMS;

  return COMMAND_ITEMS.filter(
    (item) =>
      fuzzyMatch(query, item.title) ||
      fuzzyMatch(query, item.subtitle) ||
      fuzzyMatch(query, item.category)
  );
}
