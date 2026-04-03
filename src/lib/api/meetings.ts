// ============================================================================
// Mock API — Meetings
// Simulates network calls for meeting data and prep packages.
// These functions will eventually call real backend APIs.
// ============================================================================

import type { MeetingPrepData, Attendee, Anticipation } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Simulate network latency between 300-500 ms */
function networkDelay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockMeetingPreps: Record<string, MeetingPrepData> = {
  'mtg-1': {
    meeting: {
      id: 'mtg-1',
      title: 'Engineering Standup',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      endTime: new Date(new Date().setHours(9, 15, 0, 0)),
      attendeeCount: 3,
    },
    attendees: [
      { name: 'Sarah Chen', email: 'sarah@company.com', title: 'Staff Engineer', responseStatus: 'accepted', relationshipHealth: 0.85 },
      { name: 'Alex Rivera', email: 'alex@company.com', title: 'Senior Engineer', responseStatus: 'accepted', relationshipHealth: 0.72 },
      { name: 'Jordan Liu', email: 'jordan@company.com', title: 'Engineer II', responseStatus: 'accepted', relationshipHealth: 0.90 },
    ],
    prep: {
      lastMeetingSummary: 'Discussed auth migration timeline. Sarah flagged risk with 3rd-party dependency. Agreed to revisit after load testing.',
      openActionItems: [
        'Share load test results (you — due today)',
        'Update migration runbook (Sarah — in progress)',
      ],
      relevantDecisions: [],
      talkingPoints: [
        'Address auth dependency issue Sarah raised',
        "Alex's PR has been waiting 2 days for review",
      ],
      attendeeContext: 'Sarah: last spoke yesterday; Alex: last spoke 3d ago; Jordan: last spoke yesterday',
    },
    anticipations: [
      {
        type: 'unseen_discussion',
        title: 'Sarah discussed the auth issue with the CTO yesterday',
        body: 'Sarah and James (CTO) had a 20-minute conversation in #eng-leadership about the auth migration risk. James suggested considering a phased rollout instead of the big-bang approach you planned. Sarah may bring this up.',
        confidence: 0.82,
      },
    ],
    estimatedContextSwitchCost: 5,
  },

  'mtg-2': {
    meeting: {
      id: 'mtg-2',
      title: 'Product Review — Q2 Roadmap',
      startTime: new Date(new Date().setHours(14, 0, 0, 0)),
      endTime: new Date(new Date().setHours(15, 0, 0, 0)),
      attendeeCount: 4,
    },
    attendees: [
      { name: 'Mei Zhang', email: 'mei@company.com', title: 'VP Product', responseStatus: 'accepted', relationshipHealth: 0.55 },
      { name: 'David Park', email: 'david@company.com', title: 'CFO', responseStatus: 'accepted', relationshipHealth: 0.68 },
      { name: 'Sarah Chen', email: 'sarah@company.com', title: 'Staff Engineer', responseStatus: 'accepted', relationshipHealth: 0.85 },
      { name: 'Tom Baker', email: 'tom@company.com', title: 'Head of Sales', responseStatus: 'tentative', relationshipHealth: 0.60 },
    ],
    prep: {
      lastMeetingSummary: 'Reviewed Q1 OKR results. Product velocity was below target. Mei pushed for more aggressive Q2 goals. David raised budget constraints.',
      openActionItems: [
        'Submit updated headcount projections (you — due today)',
        'Finalize Q2 roadmap priorities (Mei — in review)',
        'Share enterprise pipeline forecast (Tom — overdue)',
      ],
      relevantDecisions: [
        'Q1: Decided to deprioritize mobile app in favor of enterprise features',
      ],
      talkingPoints: [
        'Budget projections need to be submitted today',
        'Intercom just launched competing AI Agent Builder — strategic implications',
        'Enterprise onboarding project velocity has dropped 40%',
      ],
      attendeeContext: 'Mei: visibility gap (12d since contact). David: expecting budget numbers. Tom: pipeline forecast is overdue.',
    },
    anticipations: [
      {
        type: 'sentiment_shift',
        title: "Mei's tone has shifted in recent conversations",
        body: "Mei's sentiment in the last 3 interactions has been noticeably more critical than her baseline. She may be under pressure from the board on Q1 results. Consider opening with a collaborative tone.",
        confidence: 0.71,
      },
      {
        type: 'external_signal',
        title: "Intercom's launch will likely come up",
        body: "Tom's team has already received questions from 3 prospects about whether you have a comparable offering. Expect Tom to push for accelerating the Agent Builder roadmap item.",
        confidence: 0.88,
      },
      {
        type: 'follow_up_gap',
        title: '2 action items from last meeting are still open',
        body: "Tom was supposed to share the enterprise pipeline forecast but hasn't. Your headcount projections are also due. Both may cause friction if not addressed.",
        confidence: 0.90,
      },
    ],
    estimatedContextSwitchCost: 25,
  },

  'mtg-3': {
    meeting: {
      id: 'mtg-3',
      title: '1:1 with Jordan',
      startTime: new Date(new Date().setHours(16, 0, 0, 0)),
      endTime: new Date(new Date().setHours(16, 30, 0, 0)),
      attendeeCount: 1,
    },
    attendees: [
      { name: 'Jordan Liu', email: 'jordan@company.com', title: 'Engineer II', responseStatus: 'accepted', relationshipHealth: 0.90 },
    ],
    prep: {
      lastMeetingSummary: "Discussed Jordan's interest in the platform team. You promised to look into an opportunity on the API redesign project.",
      openActionItems: [
        'Check with platform team about API redesign opening (you — 6 weeks overdue)',
      ],
      relevantDecisions: [],
      talkingPoints: [],
      attendeeContext: 'Jordan: strong engagement, recently took on SSO architecture work.',
    },
    anticipations: [
      {
        type: 'commitment_due',
        title: 'Your promise to Jordan about the platform team is 6 weeks overdue',
        body: "You told Jordan you'd check on the API redesign opening. That was 6 weeks ago. Jordan may bring this up, and the delay could impact their engagement.",
        confidence: 0.92,
      },
    ],
    estimatedContextSwitchCost: 10,
  },
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get the full meeting preparation package for a given meeting.
 * Simulates a network delay; will eventually call GET /api/meetings/:id/prep.
 *
 * @param meetingId - The meeting identifier (e.g., 'mtg-1')
 * @throws Error if the meeting ID is not found
 */
export async function getMeetingPrep(meetingId: string): Promise<MeetingPrepData> {
  await networkDelay();

  const prep = mockMeetingPreps[meetingId];
  if (!prep) {
    throw new Error(`Meeting not found: ${meetingId}`);
  }

  return prep;
}

/**
 * Get all meeting prep packages for today's meetings.
 * Simulates a network delay; will eventually call GET /api/meetings/today/prep.
 */
export async function getTodayMeetingPreps(): Promise<MeetingPrepData[]> {
  await networkDelay();
  return Object.values(mockMeetingPreps);
}

/**
 * Get the list of attendees for a given meeting.
 * Simulates a network delay; will eventually call GET /api/meetings/:id/attendees.
 */
export async function getMeetingAttendees(meetingId: string): Promise<Attendee[]> {
  await networkDelay();

  const prep = mockMeetingPreps[meetingId];
  if (!prep) {
    throw new Error(`Meeting not found: ${meetingId}`);
  }

  return prep.attendees;
}

/**
 * Get anticipations for a given meeting.
 * Simulates a network delay; will eventually call GET /api/meetings/:id/anticipations.
 */
export async function getMeetingAnticipations(meetingId: string): Promise<Anticipation[]> {
  await networkDelay();

  const prep = mockMeetingPreps[meetingId];
  if (!prep) {
    throw new Error(`Meeting not found: ${meetingId}`);
  }

  return prep.anticipations;
}
