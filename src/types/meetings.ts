// ============================================================================
// Meeting types — meetings, attendees, prep data, and anticipations
// ============================================================================

import type { HealthScore, DataSource } from './common';

/** A calendar meeting synced from a connected calendar */
export interface Meeting {
  id: string;
  source: DataSource;
  sourceId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeCount: number;
  attendees: Attendee[];
  location?: string;
  meetingLink?: string;
  isRecurring: boolean;
  recurringId?: string;

  /** AI-generated meeting prep notes (stringified markdown) */
  prepNotes?: string;
  /** AI-generated post-meeting summary */
  summary?: string;
  /** Number of decisions captured from this meeting */
  decisionsCount: number;
  /** (decisions + actions) / (duration * attendees) */
  efficiencyScore?: number;
  /** Minutes of ramp-back time after this meeting */
  estimatedContextSwitchCost?: number;
}

/** A meeting attendee with their response status and relationship health */
export interface Attendee {
  name: string;
  email?: string;
  title?: string;
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  /** 0-1 relationship health between the user and this attendee */
  relationshipHealth?: HealthScore;
}

/** An AI-generated anticipation for an upcoming meeting */
export interface Anticipation {
  /** The category of anticipation */
  type: AnticipationType;
  title: string;
  body: string;
  /** 0-1 confidence that this anticipation is relevant */
  confidence: number;
}

/** Categories of anticipation the AI engine can surface */
export type AnticipationType =
  | 'unseen_discussion'
  | 'sentiment_shift'
  | 'external_signal'
  | 'follow_up_gap'
  | 'commitment_due';

/** Complete meeting preparation package returned by the API */
export interface MeetingPrepData {
  meeting: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    attendeeCount: number;
  };

  attendees: Attendee[];

  /** AI-generated contextual prep */
  prep: {
    lastMeetingSummary: string;
    openActionItems: string[];
    relevantDecisions: string[];
    talkingPoints: string[];
    attendeeContext: string;
  };

  /** Proactive heads-ups about what might come up */
  anticipations: Anticipation[];

  /** Minutes of cognitive ramp-back after this meeting */
  estimatedContextSwitchCost: number;
}
