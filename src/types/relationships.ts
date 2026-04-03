// ============================================================================
// Relationship types — people, connections, and interaction tracking
// ============================================================================

import type { HealthScore, DataSource, Severity } from './common';

/** Relationship categories between the user and people in their graph */
export type RelationshipType =
  | 'MANAGER'
  | 'DIRECT_REPORT'
  | 'PEER'
  | 'SKIP_LEVEL'
  | 'CROSS_FUNCTIONAL'
  | 'EXTERNAL_CLIENT'
  | 'EXTERNAL_VENDOR'
  | 'EXTERNAL_PARTNER'
  | 'MENTOR'
  | 'MENTEE'
  | 'EXECUTIVE';

/** Interaction channel types between people */
export type InteractionType =
  | 'SLACK_MESSAGE'
  | 'SLACK_THREAD'
  | 'EMAIL'
  | 'MEETING'
  | 'PR_REVIEW'
  | 'DOCUMENT_COLLAB'
  | 'TASK_ASSIGNMENT'
  | 'TASK_COMMENT'
  | 'ONE_ON_ONE';

/** A person node in the user's professional graph */
export interface Person {
  id: string;
  name: string;
  email?: string;
  title?: string;
  company?: string;
  department?: string;
  avatarUrl?: string;
  isInternal: boolean;
  isActive: boolean;
  source: DataSource;

  /** 0-1 importance relative to the user */
  importanceScore: number;
  /** Average interactions per week */
  interactionFrequency: number;
  /** When the user last interacted with this person */
  lastInteractionAt?: Date;
  /** Rolling average sentiment from -1 (negative) to 1 (positive) */
  sentimentAverage: number;
}

/** A directed relationship edge between the user and a person */
export interface Relationship {
  id: string;
  personId: string;
  person: Person;
  type: RelationshipType;
  /** 0-1 overall relationship strength computed from interactions */
  strength: HealthScore;
  /** 0-1 composite factoring sentiment and recency */
  healthScore: HealthScore;
  /** 0-1 trust/goodwill balance */
  politicalCapital: HealthScore;
  isDecisionMaker: boolean;
  notes?: string;

  /** Expected vs. actual interaction frequency for decay detection */
  baselineFrequency: number;
  currentFrequency: number;
  decayAlertSent: boolean;
}

/** A discrete interaction between the user and one or more people */
export interface InteractionSummary {
  id: string;
  type: InteractionType;
  source: DataSource;
  timestamp: Date;
  durationMin?: number;
  /** -1 to 1 sentiment score */
  sentiment?: number;
  topics: string[];
  summary?: string;
  hasDecision: boolean;
  hasCommitment: boolean;
  participants: InteractionParticipant[];
}

/** A participant in an interaction */
export interface InteractionParticipant {
  personId: string;
  personName: string;
  role: string;
}
