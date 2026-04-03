// ============================================================================
// Barrel export — all Orbit types from a single import
// Usage: import type { PriorityItem, Person, Meeting } from '@/types';
// ============================================================================

// Common / shared primitives
export type {
  Severity,
  HealthScore,
  TimeRange,
  DataSource,
  Trend,
  TrendDirection,
  ProjectStatus,
  DeliveryChannel,
  IndustryEventType,
} from './common';

// Briefing domain
export type {
  PriorityItemType,
  PriorityItem,
  MeetingBrief,
  MeetingBriefAttendee,
  MeetingAnticipation,
  AnticipationType as BriefingAnticipationType,
  MeetingPrepNotes,
  ProjectHealth,
  IntelSignal,
  RelationshipAlertType,
  RelationshipAlert,
  WellbeingMetric,
  WellbeingMetrics,
  TimeAllocation,
  StrategicAlignment,
  BriefingSectionType,
  BriefingSectionId,
  BriefingSection,
  BriefingInboxItem,
  BriefingMeetingItem,
  BriefingProjectItem,
  BriefingIntelItem,
  BriefingPeopleItem,
  DailyBriefing,
} from './briefing';

// Relationships domain
export type {
  RelationshipType,
  InteractionType,
  Person,
  Relationship,
  InteractionSummary,
  InteractionParticipant,
} from './relationships';

// Meetings domain
export type {
  Meeting,
  Attendee,
  Anticipation,
  AnticipationType,
  MeetingPrepData,
} from './meetings';
