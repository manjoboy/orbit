// ============================================================================
// Briefing types — models for daily briefings, priority inbox, projects, intel
// ============================================================================

import type {
  HealthScore,
  Severity,
  Trend,
  TrendDirection,
  ProjectStatus,
  DataSource,
  IndustryEventType,
} from './common';

// ─── Priority Inbox ─────────────────────────────────────────────────────────

/** The type of item appearing in the priority inbox */
export type PriorityItemType = 'message' | 'email' | 'task' | 'pr' | 'alert';

/** A single item in the user's priority inbox, ranked by composite score */
export interface PriorityItem {
  id: string;
  type: PriorityItemType;
  source: DataSource;
  title: string;
  summary: string;
  urgencyScore: number;
  importanceScore: number;
  compositeScore: number;
  suggestedAction: string;
  deepLink: string;
  from?: string;
  timestamp: Date;
}

// ─── Meetings (briefing-level) ──────────────────────────────────────────────

/** A meeting as it appears in the daily briefing */
export interface MeetingBrief {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: MeetingBriefAttendee[];
  prepNotes: MeetingPrepNotes;
  estimatedContextSwitchCost: number;
  anticipations: MeetingAnticipation[];
}

/** An attendee as shown in the briefing meeting card */
export interface MeetingBriefAttendee {
  name: string;
  title: string;
  relationshipHealth: HealthScore;
}

/** AI-generated anticipation for a meeting */
export interface MeetingAnticipation {
  type: AnticipationType;
  title: string;
  body: string;
  confidence: number;
}

/** Types of meeting anticipations the AI can surface */
export type AnticipationType =
  | 'unseen_discussion'
  | 'sentiment_shift'
  | 'external_signal'
  | 'follow_up_gap'
  | 'commitment_due';

/** Structured meeting prep notes */
export interface MeetingPrepNotes {
  lastMeetingSummary: string;
  openActionItems: string[];
  relevantDecisions: string[];
  talkingPoints: string[];
  attendeeContext: string;
}

// ─── Project Health ─────────────────────────────────────────────────────────

/** Project health summary for the briefing dashboard */
export interface ProjectHealth {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  healthScore: HealthScore;
  healthTrend: Trend;
  velocityChange: number;
  blockerCount: number;
  keyUpdate: string;
  riskFlag?: string;
  daysUntilDeadline: number;
}

// ─── Intelligence ───────────────────────────────────────────────────────────

/** An industry intelligence signal surfaced in the briefing */
export interface IntelSignal {
  id: string;
  title: string;
  summary: string;
  relevanceScore: number;
  eventType: IndustryEventType;
  company?: string;
  impactOnYou: string;
  suggestedAction: string;
  sourceUrl?: string;
}

// ─── Relationship Alerts ────────────────────────────────────────────────────

/** Alert type for relationships that need attention */
export type RelationshipAlertType =
  | 'decay'
  | 'sentiment_shift'
  | 'visibility_gap';

/** A relationship alert surfaced in the briefing */
export interface RelationshipAlert {
  personId: string;
  personName: string;
  personTitle: string;
  alertType: RelationshipAlertType;
  severity: Severity;
  description: string;
  suggestedAction: string;
  daysSinceContact: number;
}

// ─── Wellbeing ──────────────────────────────────────────────────────────────

/** A single wellbeing metric with a warning flag */
export interface WellbeingMetric {
  label: string;
  value: string;
  warn: boolean;
}

/** The full wellbeing check included in the briefing */
export interface WellbeingMetrics {
  sustainabilityScore: number;
  trend: Trend;
  meetingLoad: { hours: number; vsBaseline: number };
  focusTime: { hours: number; vsBaseline: number };
  contextSwitches: { count: number; vsBaseline: number };
  recommendation: string;
}

// ─── Strategic Alignment ────────────────────────────────────────────────────

/** Time allocation category and whether it is strategic */
export interface TimeAllocation {
  category: string;
  percentageOfTime: number;
  isStrategic: boolean;
}

/** Strategic alignment overview included in the briefing */
export interface StrategicAlignment {
  overallScore: number;
  timeBreakdown: TimeAllocation[];
  topTimeSink: {
    category: string;
    percentageOfTime: number;
    suggestion: string;
  };
  weekOverWeekTrend: Trend;
}

// ─── Briefing Sections (UI-level) ───────────────────────────────────────────

/** The type discriminator for briefing sections shown in the nav/stream */
export type BriefingSectionType =
  | 'item-list'
  | 'meeting-list'
  | 'project-list'
  | 'intel-list'
  | 'people-list'
  | 'wellbeing';

/** Section identifiers matching the side nav */
export type BriefingSectionId =
  | 'inbox'
  | 'meetings'
  | 'projects'
  | 'intel'
  | 'people'
  | 'wellbeing';

/** A UI-level briefing section (used by briefing-data.ts shape) */
export interface BriefingSection {
  id: BriefingSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: BriefingSectionType;
  count?: number;
  score?: number;

  // Conditional payloads keyed by type
  items?: BriefingInboxItem[];
  meetings?: BriefingMeetingItem[];
  projects?: BriefingProjectItem[];
  signals?: BriefingIntelItem[];
  people?: BriefingPeopleItem[];
  metrics?: WellbeingMetric[];
}

/** Priority inbox item as used in the briefing UI */
export interface BriefingInboxItem {
  icon: React.ComponentType<{ className?: string }>;
  from: string;
  time: string;
  title: string;
  urgency: boolean;
  panelType: string;
}

/** Meeting item as used in the briefing UI */
export interface BriefingMeetingItem {
  title: string;
  time: string;
  duration: string;
  attendeeCount: number;
  alertCount: number;
  attendees: { name: string; title: string; health: HealthScore }[];
  anticipations: { emoji: string; title: string; body: string }[];
  openItems: string[];
  lastSummary: string;
}

/** Project item as used in the briefing UI */
export interface BriefingProjectItem {
  name: string;
  health: HealthScore;
  trend: TrendDirection;
  velocity: number;
  blockers: number;
  deadline: number;
  status: ProjectStatus;
}

/** Intel item as used in the briefing UI */
export interface BriefingIntelItem {
  type: string;
  company?: string;
  relevance: number;
  title: string;
  summary: string;
  impact: string;
  action: string;
  sourceUrl?: string;
}

/** People/relationship item as used in the briefing UI */
export interface BriefingPeopleItem {
  name: string;
  role: string;
  subtitle: string;
  days: number;
  action: string;
}

// ─── Full Briefing Payload ──────────────────────────────────────────────────

/** The complete daily briefing as returned from the API / mock-data */
export interface DailyBriefing {
  date: string;
  generatedAt: Date;
  signalCount: number;
  insightCount: number;
  processingTimeMs: number;
  priorityInbox: PriorityItem[];
  meetings: MeetingBrief[];
  projectUpdates: ProjectHealth[];
  industryIntel: IntelSignal[];
  relationshipAlerts: RelationshipAlert[];
  strategicAlignment: StrategicAlignment;
  wellbeingCheck: WellbeingMetrics;
}
