// ============================================================================
// Mock API — Relationships
// Simulates network calls for relationship alerts and people data.
// These functions will eventually call real backend APIs.
// ============================================================================

import type { RelationshipAlert, Person, Relationship } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Simulate network latency between 300-500 ms */
function networkDelay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockRelationshipAlerts: RelationshipAlert[] = [
  {
    personId: 'person-1',
    personName: 'Mei Zhang',
    personTitle: 'VP Product',
    alertType: 'decay',
    severity: 'high',
    description:
      "No direct interaction in 12 days. She's a key stakeholder for your Q2 goals.",
    suggestedAction: 'Schedule a quick sync before the product review',
    daysSinceContact: 12,
  },
  {
    personId: 'person-2',
    personName: 'James (CTO)',
    personTitle: 'Chief Technology Officer',
    alertType: 'sentiment_shift',
    severity: 'medium',
    description:
      'Recent interactions show lower sentiment. May be related to the auth migration delays.',
    suggestedAction: 'Reach out with a status update on the auth migration',
    daysSinceContact: 5,
  },
  {
    personId: 'person-3',
    personName: 'Tom Baker',
    personTitle: 'Head of Sales',
    alertType: 'visibility_gap',
    severity: 'medium',
    description:
      "You haven't had a 1:1 in 3 weeks. He has a pending action item that's overdue.",
    suggestedAction: 'Follow up on pipeline forecast and schedule catch-up',
    daysSinceContact: 21,
  },
];

const mockPeople: Person[] = [
  {
    id: 'person-1',
    name: 'Mei Zhang',
    email: 'mei@company.com',
    title: 'VP Product',
    company: 'Decagon',
    department: 'Product',
    isInternal: true,
    isActive: true,
    source: 'SLACK',
    importanceScore: 0.92,
    interactionFrequency: 2.1,
    lastInteractionAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    sentimentAverage: 0.35,
  },
  {
    id: 'person-2',
    name: 'James Chen',
    email: 'james@company.com',
    title: 'Chief Technology Officer',
    company: 'Decagon',
    department: 'Engineering',
    isInternal: true,
    isActive: true,
    source: 'SLACK',
    importanceScore: 0.95,
    interactionFrequency: 3.5,
    lastInteractionAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    sentimentAverage: 0.2,
  },
  {
    id: 'person-3',
    name: 'Tom Baker',
    email: 'tom@company.com',
    title: 'Head of Sales',
    company: 'Decagon',
    department: 'Sales',
    isInternal: true,
    isActive: true,
    source: 'SLACK',
    importanceScore: 0.78,
    interactionFrequency: 1.2,
    lastInteractionAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    sentimentAverage: 0.5,
  },
  {
    id: 'person-4',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    title: 'Staff Engineer',
    company: 'Decagon',
    department: 'Engineering',
    isInternal: true,
    isActive: true,
    source: 'SLACK',
    importanceScore: 0.88,
    interactionFrequency: 8.5,
    lastInteractionAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    sentimentAverage: 0.72,
  },
  {
    id: 'person-5',
    name: 'David Park',
    email: 'david@company.com',
    title: 'CFO',
    company: 'Decagon',
    department: 'Finance',
    isInternal: true,
    isActive: true,
    source: 'GMAIL',
    importanceScore: 0.85,
    interactionFrequency: 1.8,
    lastInteractionAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    sentimentAverage: 0.55,
  },
  {
    id: 'person-6',
    name: 'Jordan Liu',
    email: 'jordan@company.com',
    title: 'Engineer II',
    company: 'Decagon',
    department: 'Engineering',
    isInternal: true,
    isActive: true,
    source: 'SLACK',
    importanceScore: 0.72,
    interactionFrequency: 5.0,
    lastInteractionAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    sentimentAverage: 0.8,
  },
  {
    id: 'person-7',
    name: 'Alex Rivera',
    email: 'alex@company.com',
    title: 'Senior Engineer',
    company: 'Decagon',
    department: 'Engineering',
    isInternal: true,
    isActive: true,
    source: 'GITHUB',
    importanceScore: 0.7,
    interactionFrequency: 4.2,
    lastInteractionAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    sentimentAverage: 0.65,
  },
];

const mockRelationships: Relationship[] = [
  {
    id: 'rel-1',
    personId: 'person-1',
    person: mockPeople[0],
    type: 'CROSS_FUNCTIONAL',
    strength: 0.55,
    healthScore: 0.55,
    politicalCapital: 0.6,
    isDecisionMaker: true,
    baselineFrequency: 3.0,
    currentFrequency: 0.8,
    decayAlertSent: true,
  },
  {
    id: 'rel-2',
    personId: 'person-2',
    person: mockPeople[1],
    type: 'MANAGER',
    strength: 0.72,
    healthScore: 0.68,
    politicalCapital: 0.65,
    isDecisionMaker: true,
    baselineFrequency: 4.0,
    currentFrequency: 2.5,
    decayAlertSent: false,
  },
  {
    id: 'rel-3',
    personId: 'person-3',
    person: mockPeople[2],
    type: 'CROSS_FUNCTIONAL',
    strength: 0.45,
    healthScore: 0.4,
    politicalCapital: 0.5,
    isDecisionMaker: false,
    baselineFrequency: 2.0,
    currentFrequency: 0.5,
    decayAlertSent: true,
  },
  {
    id: 'rel-4',
    personId: 'person-4',
    person: mockPeople[3],
    type: 'DIRECT_REPORT',
    strength: 0.88,
    healthScore: 0.85,
    politicalCapital: 0.9,
    isDecisionMaker: false,
    baselineFrequency: 10.0,
    currentFrequency: 8.5,
    decayAlertSent: false,
  },
  {
    id: 'rel-5',
    personId: 'person-6',
    person: mockPeople[5],
    type: 'DIRECT_REPORT',
    strength: 0.85,
    healthScore: 0.9,
    politicalCapital: 0.7,
    isDecisionMaker: false,
    notes: 'Interested in platform team move',
    baselineFrequency: 6.0,
    currentFrequency: 5.0,
    decayAlertSent: false,
  },
];

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get all active relationship alerts for the user.
 * Simulates a network delay; will eventually call GET /api/relationships/alerts.
 */
export async function getRelationships(): Promise<RelationshipAlert[]> {
  await networkDelay();
  return mockRelationshipAlerts;
}

/**
 * Get the full list of people in the user's professional graph.
 * Simulates a network delay; will eventually call GET /api/people.
 */
export async function getPeople(): Promise<Person[]> {
  await networkDelay();
  return mockPeople;
}

/**
 * Get a single person by ID.
 * Simulates a network delay; will eventually call GET /api/people/:id.
 *
 * @throws Error if the person is not found
 */
export async function getPersonById(personId: string): Promise<Person> {
  await networkDelay();
  const person = mockPeople.find((p) => p.id === personId);
  if (!person) {
    throw new Error(`Person not found: ${personId}`);
  }
  return person;
}

/**
 * Get relationship details between the user and their contacts.
 * Simulates a network delay; will eventually call GET /api/relationships.
 */
export async function getRelationshipDetails(): Promise<Relationship[]> {
  await networkDelay();
  return mockRelationships;
}

/**
 * Get the relationship detail for a specific person.
 * Simulates a network delay; will eventually call GET /api/relationships/:personId.
 *
 * @throws Error if the relationship is not found
 */
export async function getRelationshipByPersonId(
  personId: string,
): Promise<Relationship> {
  await networkDelay();
  const rel = mockRelationships.find((r) => r.personId === personId);
  if (!rel) {
    throw new Error(`Relationship not found for person: ${personId}`);
  }
  return rel;
}
