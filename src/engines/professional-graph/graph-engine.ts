// ============================================================================
// PROFESSIONAL GRAPH ENGINE
// ============================================================================
// The core intelligence substrate. Maintains a living, weighted graph of
// people, projects, topics, and decisions for each user. Every other engine
// reads from and writes to this graph.
// ============================================================================

import { PrismaClient, DataSource, RelationshipType, InteractionType } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphNode {
  id: string;
  type: 'person' | 'project' | 'topic' | 'decision' | 'knowledge';
  name: string;
  metadata: Record<string, unknown>;
  importanceScore: number;
  lastUpdated: Date;
}

export interface GraphEdge {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  weight: number;
  metadata: Record<string, unknown>;
  lastUpdated: Date;
}

export interface GraphTraversalResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  depth: number;
}

export interface EntityResolutionResult {
  resolvedId: string | null;
  confidence: number;
  candidates: Array<{ id: string; name: string; score: number }>;
  isNew: boolean;
}

export interface RelationshipHealthReport {
  personId: string;
  personName: string;
  healthScore: number;
  trend: 'improving' | 'stable' | 'declining';
  lastInteraction: Date | null;
  interactionFrequency: number;
  baselineFrequency: number;
  sentimentAvg: number;
  politicalCapital: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
}

export interface StakeholderMap {
  decisionMakers: Array<{
    person: GraphNode;
    relationship: GraphEdge;
    influence: number;
    position: 'supporter' | 'neutral' | 'opponent' | 'unknown';
    lastInteraction: Date | null;
    visibilityGap: boolean;
  }>;
  informedParties: GraphNode[];
  missingStakeholders: string[]; // roles/types not represented
}

// ---------------------------------------------------------------------------
// Decay & Scoring Functions
// ---------------------------------------------------------------------------

/**
 * Exponential decay function for relationship strength.
 * Relationships lose weight over time without interaction.
 *
 * Formula: weight = baseWeight * e^(-lambda * daysSinceLastInteraction)
 *
 * Lambda is calibrated per-relationship based on historical interaction frequency.
 * A relationship that normally has weekly contact decays faster when silent
 * than one that's naturally monthly.
 */
export function computeRelationshipDecay(
  baseWeight: number,
  daysSinceLastInteraction: number,
  baselineFrequencyPerWeek: number
): number {
  // Lambda: higher baseline frequency = faster decay when absent
  // A weekly relationship has lambda ~0.05 (half-life ~14 days)
  // A monthly relationship has lambda ~0.015 (half-life ~46 days)
  const lambda = 0.01 + (baselineFrequencyPerWeek * 0.01);
  const decayedWeight = baseWeight * Math.exp(-lambda * daysSinceLastInteraction);
  return Math.max(0.05, Math.min(1.0, decayedWeight)); // floor at 0.05
}

/**
 * Importance score computation for a person node.
 * Combines multiple signals into a single 0-1 score.
 */
export function computeImportanceScore(params: {
  interactionFrequency: number;     // interactions per week
  sentimentWeight: number;          // how much sentiment matters
  isDecisionMaker: boolean;         // for user's active goals
  organizationalLevel: number;      // 0=IC, 1=manager, 2=director, 3=VP, 4=C-suite
  sharedProjectCount: number;       // active shared projects
  recentMentionCount: number;       // mentioned by others recently
  userExplicitImportance?: number;  // user manual override (0-1)
}): number {
  const weights = {
    frequency: 0.20,
    decisionMaker: 0.25,
    orgLevel: 0.15,
    sharedProjects: 0.15,
    recentMentions: 0.10,
    userOverride: 0.15,
  };

  const freqScore = Math.min(1.0, params.interactionFrequency / 5); // normalize to 5/week
  const dmScore = params.isDecisionMaker ? 1.0 : 0.0;
  const orgScore = Math.min(1.0, params.organizationalLevel / 4);
  const projectScore = Math.min(1.0, params.sharedProjectCount / 3);
  const mentionScore = Math.min(1.0, params.recentMentionCount / 10);
  const userScore = params.userExplicitImportance ?? 0.5;

  return (
    freqScore * weights.frequency +
    dmScore * weights.decisionMaker +
    orgScore * weights.orgLevel +
    projectScore * weights.sharedProjects +
    mentionScore * weights.recentMentions +
    userScore * weights.userOverride
  );
}

/**
 * Political capital computation.
 * Tracks the balance of "goodwill" in a relationship based on:
 * - Positive interactions (delivering on promises, helping, positive feedback)
 * - Negative interactions (missing deadlines, public disagreements, dropped balls)
 * Uses an EMA (exponential moving average) with recency bias.
 */
export function computePoliticalCapital(
  transactions: Array<{ timestamp: Date; delta: number; description: string }>
): number {
  if (transactions.length === 0) return 0.5;

  const now = Date.now();
  let weightedSum = 0;
  let totalWeight = 0;

  for (const tx of transactions) {
    const daysAgo = (now - tx.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.exp(-0.03 * daysAgo); // half-life ~23 days
    weightedSum += tx.delta * recencyWeight;
    totalWeight += recencyWeight;
  }

  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  // Normalize to 0-1 range (raw score is roughly -1 to 1)
  return Math.max(0, Math.min(1, (rawScore + 1) / 2));
}

// ---------------------------------------------------------------------------
// Professional Graph Engine
// ---------------------------------------------------------------------------

export class ProfessionalGraphEngine {
  constructor(
    private prisma: PrismaClient,
    private embeddingService: EmbeddingService,
    private llmService: LLMService,
  ) {}

  // =========================================================================
  // ENTITY RESOLUTION
  // =========================================================================

  /**
   * Resolve an entity mention to an existing graph node or create a new one.
   * Handles: "Sarah", "Sarah Chen", "sarah@acme.com", "@sarah.chen"
   *
   * Algorithm:
   * 1. Exact email match (highest confidence)
   * 2. Fuzzy name match using pg_trgm similarity
   * 3. Embedding similarity for contextual disambiguation
   * 4. If no match above threshold, create new node
   */
  async resolveEntity(
    userId: string,
    orgId: string,
    mention: {
      name?: string;
      email?: string;
      source: DataSource;
      context?: string; // surrounding text for disambiguation
    }
  ): Promise<EntityResolutionResult> {
    // Step 1: Exact email match
    if (mention.email) {
      const exactMatch = await this.prisma.personNode.findUnique({
        where: { userId_email: { userId, email: mention.email } },
      });
      if (exactMatch) {
        return {
          resolvedId: exactMatch.id,
          confidence: 1.0,
          candidates: [{ id: exactMatch.id, name: exactMatch.name, score: 1.0 }],
          isNew: false,
        };
      }
    }

    // Step 2: Fuzzy name match
    if (mention.name) {
      const candidates = await this.prisma.$queryRaw<
        Array<{ id: string; name: string; email: string; similarity: number }>
      >`
        SELECT id, name, email,
               similarity(name, ${mention.name}) as similarity
        FROM person_nodes
        WHERE user_id = ${userId}::uuid
          AND similarity(name, ${mention.name}) > 0.3
        ORDER BY similarity DESC
        LIMIT 5
      `;

      if (candidates.length > 0 && candidates[0].similarity > 0.8) {
        return {
          resolvedId: candidates[0].id,
          confidence: candidates[0].similarity,
          candidates: candidates.map(c => ({ id: c.id, name: c.name, score: c.similarity })),
          isNew: false,
        };
      }

      // Step 3: If ambiguous, use embedding similarity with context
      if (candidates.length > 1 && mention.context) {
        const contextEmbedding = await this.embeddingService.embed(mention.context);
        const bestMatch = await this.prisma.$queryRaw<
          Array<{ id: string; name: string; cosine_sim: number }>
        >`
          SELECT id, name,
                 1 - (embedding <=> ${contextEmbedding}::vector) as cosine_sim
          FROM person_nodes
          WHERE user_id = ${userId}::uuid
            AND id = ANY(${candidates.map(c => c.id)}::uuid[])
            AND embedding IS NOT NULL
          ORDER BY cosine_sim DESC
          LIMIT 1
        `;

        if (bestMatch.length > 0 && bestMatch[0].cosine_sim > 0.7) {
          return {
            resolvedId: bestMatch[0].id,
            confidence: bestMatch[0].cosine_sim,
            candidates: candidates.map(c => ({ id: c.id, name: c.name, score: c.similarity })),
            isNew: false,
          };
        }
      }

      // Return top candidate if above threshold
      if (candidates.length > 0 && candidates[0].similarity > 0.6) {
        return {
          resolvedId: candidates[0].id,
          confidence: candidates[0].similarity,
          candidates: candidates.map(c => ({ id: c.id, name: c.name, score: c.similarity })),
          isNew: false,
        };
      }
    }

    // Step 4: No match — signal that a new node should be created
    return {
      resolvedId: null,
      confidence: 0,
      candidates: [],
      isNew: true,
    };
  }

  // =========================================================================
  // GRAPH UPDATES
  // =========================================================================

  /**
   * Process a new interaction and update all affected graph nodes/edges.
   * This is the primary write path for the graph.
   */
  async processInteraction(params: {
    userId: string;
    orgId: string;
    type: InteractionType;
    source: DataSource;
    sourceId: string;
    timestamp: Date;
    participants: Array<{ name: string; email?: string }>;
    content?: string;
    durationMin?: number;
  }): Promise<{
    interactionId: string;
    resolvedParticipants: Array<{ personId: string; name: string; isNew: boolean }>;
    extractedTopics: string[];
    extractedCommitments: string[];
    detectedDecision: boolean;
  }> {
    // 1. Resolve all participants to graph nodes
    const resolvedParticipants = await Promise.all(
      params.participants.map(async (p) => {
        const resolution = await this.resolveEntity(params.userId, params.orgId, {
          name: p.name,
          email: p.email,
          source: params.source,
          context: params.content,
        });

        let personId: string;
        if (resolution.isNew) {
          const newPerson = await this.prisma.personNode.create({
            data: {
              orgId: params.orgId,
              userId: params.userId,
              source: params.source,
              name: p.name,
              email: p.email,
              isInternal: p.email?.endsWith(`@${await this.getOrgDomain(params.orgId)}`) ?? false,
            },
          });
          personId = newPerson.id;
        } else {
          personId = resolution.resolvedId!;
        }

        return { personId, name: p.name, isNew: resolution.isNew };
      })
    );

    // 2. Extract intelligence from content
    let extractedTopics: string[] = [];
    let extractedCommitments: string[] = [];
    let detectedDecision = false;
    let sentiment: number | null = null;

    if (params.content) {
      const analysis = await this.llmService.analyzeInteraction({
        content: params.content,
        type: params.type,
        participants: params.participants.map(p => p.name),
      });

      extractedTopics = analysis.topics;
      extractedCommitments = analysis.commitments;
      detectedDecision = analysis.hasDecision;
      sentiment = analysis.sentiment;
    }

    // 3. Generate embedding
    const embeddingText = [
      `${params.type}: ${params.participants.map(p => p.name).join(', ')}`,
      params.content?.substring(0, 1000),
      extractedTopics.join(', '),
    ].filter(Boolean).join('\n');
    const embedding = await this.embeddingService.embed(embeddingText);

    // 4. Create interaction record
    const interaction = await this.prisma.interaction.create({
      data: {
        orgId: params.orgId,
        userId: params.userId,
        type: params.type,
        source: params.source,
        sourceId: params.sourceId,
        timestamp: params.timestamp,
        durationMin: params.durationMin,
        sentiment,
        topics: extractedTopics,
        hasDecision: detectedDecision,
        hasCommitment: extractedCommitments.length > 0,
        rawContent: params.content,
      },
    });

    // 5. Update relationship edges for all participants
    for (const participant of resolvedParticipants) {
      await this.updateRelationshipFromInteraction(
        params.userId,
        params.orgId,
        participant.personId,
        {
          interactionType: params.type,
          timestamp: params.timestamp,
          sentiment,
          topics: extractedTopics,
        }
      );
    }

    // 6. Track commitments
    for (const commitment of extractedCommitments) {
      await this.prisma.commitment.create({
        data: {
          orgId: params.orgId,
          userId: params.userId,
          description: commitment,
          source: params.source,
          sourceId: params.sourceId,
          status: 'OPEN',
        },
      });
    }

    // 7. Log decision if detected
    if (detectedDecision && params.content) {
      const decisionAnalysis = await this.llmService.extractDecision(params.content);
      if (decisionAnalysis) {
        await this.prisma.decisionLog.create({
          data: {
            orgId: params.orgId,
            userId: params.userId,
            title: decisionAnalysis.title,
            description: decisionAnalysis.description,
            rationale: decisionAnalysis.rationale,
            participants: params.participants.map(p => p.name),
            madeAt: params.timestamp,
            source: params.source,
            sourceId: params.sourceId,
          },
        });
      }
    }

    return {
      interactionId: interaction.id,
      resolvedParticipants,
      extractedTopics,
      extractedCommitments,
      detectedDecision,
    };
  }

  /**
   * Update a relationship edge based on a new interaction.
   * Creates the relationship if it doesn't exist.
   */
  private async updateRelationshipFromInteraction(
    userId: string,
    orgId: string,
    personNodeId: string,
    interaction: {
      interactionType: InteractionType;
      timestamp: Date;
      sentiment: number | null;
      topics: string[];
    }
  ): Promise<void> {
    const existing = await this.prisma.relationship.findUnique({
      where: { userId_personNodeId: { userId, personNodeId } },
    });

    if (existing) {
      // Update existing relationship
      const person = await this.prisma.personNode.findUnique({
        where: { id: personNodeId },
      });

      // Recalculate interaction frequency (interactions in last 30 days)
      const recentCount = await this.prisma.interaction.count({
        where: {
          userId,
          participants: { some: { personNodeId } },
          timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      });
      const currentFrequency = recentCount / 4.3; // convert to per-week

      // Update rolling sentiment average (EMA)
      const alpha = 0.3; // smoothing factor
      const newSentimentAvg = interaction.sentiment !== null
        ? alpha * interaction.sentiment + (1 - alpha) * existing.healthScore
        : existing.healthScore;

      // Recompute strength based on fresh interaction
      const daysSinceLast = existing.currentFrequency > 0
        ? 0 // just interacted
        : (Date.now() - (person?.lastInteractionAt?.getTime() ?? Date.now())) / (1000 * 60 * 60 * 24);

      const newStrength = computeRelationshipDecay(
        1.0, // base weight resets on interaction
        daysSinceLast,
        existing.baselineFrequency
      );

      await this.prisma.relationship.update({
        where: { id: existing.id },
        data: {
          strength: newStrength,
          healthScore: Math.max(0, Math.min(1, newSentimentAvg)),
          currentFrequency,
          decayAlertSent: false, // reset decay alert on new interaction
          updatedAt: new Date(),
        },
      });

      // Update person node
      await this.prisma.personNode.update({
        where: { id: personNodeId },
        data: {
          lastInteractionAt: interaction.timestamp,
          interactionFreq: currentFrequency,
          sentimentAvg: interaction.sentiment !== null
            ? alpha * interaction.sentiment + (1 - alpha) * (person?.sentimentAvg ?? 0)
            : person?.sentimentAvg ?? 0,
        },
      });
    } else {
      // Create new relationship
      await this.prisma.relationship.create({
        data: {
          orgId,
          userId,
          personNodeId,
          type: RelationshipType.PEER, // default; can be refined later
          strength: 0.5,
          healthScore: 0.5,
          politicalCapital: 0.5,
          baselineFrequency: 0,
          currentFrequency: 0,
        },
      });
    }
  }

  // =========================================================================
  // GRAPH QUERIES
  // =========================================================================

  /**
   * Get the full stakeholder map for a user's goal or decision.
   * Identifies who has influence, who's been engaged, and where gaps exist.
   */
  async getStakeholderMap(
    userId: string,
    context: string // e.g., "Q2 roadmap approval" or "promotion to Staff Eng"
  ): Promise<StakeholderMap> {
    // Get all relationships with decision-maker flag or high importance
    const relationships = await this.prisma.relationship.findMany({
      where: {
        userId,
        OR: [
          { isDecisionMaker: true },
          { strength: { gte: 0.6 } },
        ],
      },
      include: { person: true },
      orderBy: { strength: 'desc' },
    });

    // Get influence scores for these people
    const decisionMakers = await Promise.all(
      relationships
        .filter(r => r.isDecisionMaker || r.strength >= 0.7)
        .map(async (r) => {
          const influence = await this.prisma.influenceScore.findFirst({
            where: { userId, personNodeId: r.personNodeId },
            orderBy: { assessedAt: 'desc' },
          });

          // Determine if there's a visibility gap
          const daysSinceContact = r.person.lastInteractionAt
            ? (Date.now() - r.person.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24)
            : Infinity;
          const visibilityGap = daysSinceContact > 21; // 3 weeks without contact

          return {
            person: {
              id: r.personNodeId,
              type: 'person' as const,
              name: r.person.name,
              metadata: {
                title: r.person.title,
                company: r.person.company,
                email: r.person.email,
              },
              importanceScore: r.person.importanceScore,
              lastUpdated: r.person.updatedAt,
            },
            relationship: {
              id: r.id,
              fromId: userId,
              toId: r.personNodeId,
              type: r.type,
              weight: r.strength,
              metadata: {
                healthScore: r.healthScore,
                politicalCapital: r.politicalCapital,
              },
              lastUpdated: r.updatedAt,
            },
            influence: influence?.score ?? 0.5,
            position: 'unknown' as const, // would be enriched by LLM analysis
            lastInteraction: r.person.lastInteractionAt,
            visibilityGap,
          };
        })
    );

    return {
      decisionMakers,
      informedParties: relationships
        .filter(r => !r.isDecisionMaker && r.strength < 0.7)
        .map(r => ({
          id: r.personNodeId,
          type: 'person' as const,
          name: r.person.name,
          metadata: {},
          importanceScore: r.person.importanceScore,
          lastUpdated: r.person.updatedAt,
        })),
      missingStakeholders: [], // populated by LLM analysis
    };
  }

  /**
   * Semantic search across the user's professional graph.
   * Uses vector similarity + BM25 + graph proximity for hybrid retrieval.
   */
  async semanticSearch(
    userId: string,
    query: string,
    options: {
      limit?: number;
      entityTypes?: Array<'person' | 'project' | 'decision' | 'knowledge'>;
      timeRange?: { start: Date; end: Date };
    } = {}
  ): Promise<Array<{ node: GraphNode; relevanceScore: number; snippet: string }>> {
    const limit = options.limit ?? 10;
    const queryEmbedding = await this.embeddingService.embed(query);

    // Hybrid search: vector similarity + full text
    const results = await this.prisma.$queryRaw<
      Array<{
        id: string;
        type: string;
        name: string;
        content: string;
        vector_score: number;
        text_score: number;
      }>
    >`
      WITH vector_matches AS (
        SELECT id, 'interaction' as type,
               COALESCE(summary, '') as name,
               COALESCE(raw_content, '') as content,
               1 - (embedding <=> ${queryEmbedding}::vector) as vector_score
        FROM interactions
        WHERE user_id = ${userId}::uuid
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${queryEmbedding}::vector
        LIMIT ${limit * 3}
      ),
      text_matches AS (
        SELECT id, 'interaction' as type,
               COALESCE(summary, '') as name,
               COALESCE(raw_content, '') as content,
               ts_rank(to_tsvector('english', COALESCE(raw_content, '')), plainto_tsquery('english', ${query})) as text_score
        FROM interactions
        WHERE user_id = ${userId}::uuid
          AND to_tsvector('english', COALESCE(raw_content, '')) @@ plainto_tsquery('english', ${query})
        LIMIT ${limit * 3}
      )
      SELECT
        COALESCE(v.id, t.id) as id,
        COALESCE(v.type, t.type) as type,
        COALESCE(v.name, t.name) as name,
        COALESCE(v.content, t.content) as content,
        COALESCE(v.vector_score, 0) as vector_score,
        COALESCE(t.text_score, 0) as text_score
      FROM vector_matches v
      FULL OUTER JOIN text_matches t ON v.id = t.id
      ORDER BY (COALESCE(v.vector_score, 0) * 0.7 + COALESCE(t.text_score, 0) * 0.3) DESC
      LIMIT ${limit}
    `;

    return results.map(r => ({
      node: {
        id: r.id,
        type: r.type as GraphNode['type'],
        name: r.name,
        metadata: {},
        importanceScore: r.vector_score * 0.7 + r.text_score * 0.3,
        lastUpdated: new Date(),
      },
      relevanceScore: r.vector_score * 0.7 + r.text_score * 0.3,
      snippet: r.content.substring(0, 200),
    }));
  }

  /**
   * Get relationship health report for all relationships above a threshold.
   * Used for the "Relationship Alerts" section of the daily briefing.
   */
  async getRelationshipHealthReport(
    userId: string,
    options: { minImportance?: number; includeHealthy?: boolean } = {}
  ): Promise<RelationshipHealthReport[]> {
    const minImportance = options.minImportance ?? 0.4;

    const relationships = await this.prisma.relationship.findMany({
      where: {
        userId,
        person: { importanceScore: { gte: minImportance } },
      },
      include: { person: true },
      orderBy: { healthScore: 'asc' },
    });

    return relationships.map(r => {
      const daysSinceInteraction = r.person.lastInteractionAt
        ? (Date.now() - r.person.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      // Determine trend from recent health score history
      const trend: 'improving' | 'stable' | 'declining' =
        r.currentFrequency > r.baselineFrequency * 1.1 ? 'improving' :
        r.currentFrequency < r.baselineFrequency * 0.7 ? 'declining' :
        'stable';

      // Risk level computation
      const riskScore = (1 - r.healthScore) * 0.4 +
                        (1 - r.strength) * 0.3 +
                        (r.person.importanceScore > 0.7 && daysSinceInteraction > 14 ? 0.3 : 0);

      const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
        riskScore > 0.8 ? 'critical' :
        riskScore > 0.6 ? 'high' :
        riskScore > 0.4 ? 'medium' :
        'low';

      // Generate suggested actions based on state
      const suggestedActions: string[] = [];
      if (daysSinceInteraction > 21) {
        suggestedActions.push(`Reach out to ${r.person.name} — it's been ${Math.round(daysSinceInteraction)} days`);
      }
      if (r.politicalCapital < 0.3) {
        suggestedActions.push(`Rebuild trust with ${r.person.name} — consider offering help on their priorities`);
      }
      if (trend === 'declining') {
        suggestedActions.push(`Schedule a 1:1 with ${r.person.name} to re-engage`);
      }

      return {
        personId: r.personNodeId,
        personName: r.person.name,
        healthScore: r.healthScore,
        trend,
        lastInteraction: r.person.lastInteractionAt,
        interactionFrequency: r.currentFrequency,
        baselineFrequency: r.baselineFrequency,
        sentimentAvg: r.person.sentimentAvg,
        politicalCapital: r.politicalCapital,
        riskLevel,
        suggestedActions,
      };
    }).filter(r => !options.includeHealthy ? r.riskLevel !== 'low' : true);
  }

  // =========================================================================
  // GRAPH MAINTENANCE
  // =========================================================================

  /**
   * Nightly job: recalculate all relationship strengths with decay,
   * update importance scores, and detect anomalies.
   */
  async runNightlyGraphMaintenance(orgId: string): Promise<{
    relationshipsUpdated: number;
    decayAlertsGenerated: number;
    importanceScoresUpdated: number;
  }> {
    let relationshipsUpdated = 0;
    let decayAlertsGenerated = 0;
    let importanceScoresUpdated = 0;

    // Get all active relationships for this org
    const relationships = await this.prisma.relationship.findMany({
      where: { orgId },
      include: { person: true },
    });

    for (const rel of relationships) {
      const daysSinceInteraction = rel.person.lastInteractionAt
        ? (Date.now() - rel.person.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24)
        : 90; // default to 90 days if never interacted

      // Recalculate strength with decay
      const newStrength = computeRelationshipDecay(
        rel.strength,
        1, // 1 day since last calculation
        rel.baselineFrequency
      );

      // Check if relationship has decayed below alert threshold
      const shouldAlert = !rel.decayAlertSent &&
        newStrength < 0.4 &&
        rel.person.importanceScore > 0.5 &&
        daysSinceInteraction > 14;

      await this.prisma.relationship.update({
        where: { id: rel.id },
        data: {
          strength: newStrength,
          decayAlertSent: shouldAlert ? true : rel.decayAlertSent,
        },
      });

      relationshipsUpdated++;
      if (shouldAlert) decayAlertsGenerated++;
    }

    // Update importance scores for all person nodes
    const personNodes = await this.prisma.personNode.findMany({
      where: { orgId: orgId },
    });

    for (const person of personNodes) {
      const relationship = await this.prisma.relationship.findFirst({
        where: { personNodeId: person.id },
      });

      const sharedProjectCount = await this.prisma.interaction.count({
        where: {
          userId: person.userId,
          participants: { some: { personNodeId: person.id } },
          type: 'TASK_ASSIGNMENT',
          timestamp: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      });

      const newImportance = computeImportanceScore({
        interactionFrequency: person.interactionFreq,
        sentimentWeight: 0.5,
        isDecisionMaker: relationship?.isDecisionMaker ?? false,
        organizationalLevel: 0, // would be enriched from org data
        sharedProjectCount,
        recentMentionCount: 0, // would count recent entity mentions
      });

      await this.prisma.personNode.update({
        where: { id: person.id },
        data: { importanceScore: newImportance },
      });

      importanceScoresUpdated++;
    }

    return { relationshipsUpdated, decayAlertsGenerated, importanceScoresUpdated };
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  private async getOrgDomain(orgId: string): Promise<string> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { domain: true },
    });
    return org?.domain ?? '';
  }
}

// ---------------------------------------------------------------------------
// Service interfaces (injected dependencies)
// ---------------------------------------------------------------------------

export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface LLMService {
  analyzeInteraction(params: {
    content: string;
    type: InteractionType;
    participants: string[];
  }): Promise<{
    topics: string[];
    commitments: string[];
    hasDecision: boolean;
    sentiment: number;
    summary: string;
  }>;

  extractDecision(content: string): Promise<{
    title: string;
    description: string;
    rationale: string;
  } | null>;
}
