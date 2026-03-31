// ============================================================================
// ANTICIPATION ENGINE
// ============================================================================
// The "how did it know that?" engine. For every upcoming interaction
// (meeting, 1:1, presentation, email chain), this engine runs a pre-flight
// check to surface things the user needs to know but hasn't asked about.
//
// Core idea: look at what OTHER people are discussing/doing that is relevant
// to an upcoming interaction, but that the USER hasn't seen yet.
// ============================================================================

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnticipationContext {
  /** The upcoming event/interaction we're preparing for */
  trigger: {
    type: 'meeting' | 'one_on_one' | 'presentation' | 'email_thread' | 'slack_thread';
    id: string;
    title: string;
    startTime: Date;
    participants: Array<{ name: string; email?: string; personNodeId?: string }>;
  };
}

export interface AnticipatedInsight {
  id: string;
  type: AnticipatedInsightType;
  confidence: number;        // 0-1: how confident are we this is relevant
  urgency: number;           // 0-1: how important to surface before the interaction
  title: string;
  body: string;              // markdown-formatted explanation
  evidence: Array<{
    source: string;          // "slack", "email", "linear", etc.
    summary: string;         // what happened
    timestamp: Date;
    participants: string[];  // who was involved
    userSawThis: boolean;    // did the user see the original?
  }>;
  suggestedTalkingPoints: string[];
  suggestedActions: Array<{
    label: string;
    action: string;          // "draft_message", "add_to_agenda", "schedule_followup"
    metadata: Record<string, unknown>;
  }>;
}

export type AnticipatedInsightType =
  | 'unseen_discussion'      // people discussed something relevant that user missed
  | 'sentiment_shift'        // someone's sentiment changed since last interaction
  | 'commitment_due'         // a commitment related to this interaction is due
  | 'decision_reversal'      // a previous decision relevant to this meeting may be challenged
  | 'external_signal'        // industry/competitor event affecting this interaction
  | 'relationship_tension'   // detected friction between attendees
  | 'context_gap'            // user is missing context that other attendees have
  | 'agenda_prediction'      // predicted topic based on recent activity patterns
  | 'follow_up_gap'          // action items from last meeting not completed
  | 'stakeholder_shift';     // someone's role/influence/priorities changed

// ---------------------------------------------------------------------------
// Anticipation Engine
// ---------------------------------------------------------------------------

export class AnticipationEngine {
  constructor(
    private prisma: PrismaClient,
    private llmService: LLMService,
    private embeddingService: EmbeddingService,
  ) {}

  /**
   * Run pre-flight intelligence for an upcoming interaction.
   * This is the core method — called ~30 minutes before each meeting
   * and on-demand when a user opens meeting prep.
   */
  async generateAnticipations(
    userId: string,
    orgId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];

    // Run all anticipation strategies in parallel
    const [
      unseenDiscussions,
      sentimentShifts,
      commitmentRisks,
      decisionReversals,
      externalSignals,
      followUpGaps,
      agendaPredictions,
      contextGaps,
    ] = await Promise.allSettled([
      this.findUnseenDiscussions(userId, orgId, context),
      this.detectSentimentShifts(userId, context),
      this.findAtRiskCommitments(userId, context),
      this.detectDecisionReversals(userId, context),
      this.findRelevantExternalSignals(orgId, context),
      this.findFollowUpGaps(userId, context),
      this.predictAgendaTopics(userId, context),
      this.findContextGaps(userId, orgId, context),
    ]);

    // Collect successful results
    const settledResults = [
      unseenDiscussions, sentimentShifts, commitmentRisks,
      decisionReversals, externalSignals, followUpGaps,
      agendaPredictions, contextGaps,
    ];

    for (const result of settledResults) {
      if (result.status === 'fulfilled' && result.value) {
        insights.push(...(Array.isArray(result.value) ? result.value : [result.value]));
      }
    }

    // Filter by confidence threshold and sort by urgency * confidence
    return insights
      .filter(i => i.confidence >= 0.5)
      .sort((a, b) => (b.urgency * b.confidence) - (a.urgency * a.confidence))
      .slice(0, 7); // max 7 anticipations per interaction
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 1: Unseen Discussions
  // =========================================================================
  /**
   * Find conversations that meeting attendees had that the user DIDN'T see.
   * This is the highest-value anticipation — it surfaces information
   * asymmetry before it becomes a problem.
   *
   * Algorithm:
   * 1. Get all channels/threads where attendees posted in last 7 days
   * 2. Filter to messages the user hasn't seen (not in user's active channels,
   *    or posted after user's last read timestamp)
   * 3. Semantically match against the meeting title/context
   * 4. Surface the top matches as "things discussed without you"
   */
  private async findUnseenDiscussions(
    userId: string,
    orgId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];
    const participantEmails = context.trigger.participants
      .map(p => p.email)
      .filter(Boolean) as string[];

    if (participantEmails.length === 0) return [];

    // Find messages from attendees that the user likely hasn't seen
    // "Hasn't seen" heuristic: messages in channels the user doesn't post in,
    // or messages posted outside the user's active hours
    const recentAttendeeMessages = await this.prisma.message.findMany({
      where: {
        orgId,
        authorEmail: { in: participantEmails },
        isFromUser: false,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        // Exclude channels where user actively posts
        NOT: {
          channelId: {
            in: await this.getUserActiveChannels(userId),
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    if (recentAttendeeMessages.length === 0) return [];

    // Semantic matching: which of these messages are relevant to the meeting?
    const meetingEmbedding = await this.embeddingService.embed(
      `${context.trigger.title} ${context.trigger.participants.map(p => p.name).join(', ')}`
    );

    // Score each message for relevance
    const scoredMessages = await Promise.all(
      recentAttendeeMessages.map(async (msg) => {
        // Quick keyword check first (fast path)
        const meetingWords = context.trigger.title.toLowerCase().split(/\s+/);
        const contentLower = msg.content.toLowerCase();
        const keywordOverlap = meetingWords.filter(w => w.length > 3 && contentLower.includes(w)).length;

        if (keywordOverlap === 0 && msg.content.length < 50) return null;

        // Semantic similarity for messages that pass keyword filter
        const msgEmbedding = await this.embeddingService.embed(msg.content.substring(0, 500));
        const similarity = cosineSimilarity(meetingEmbedding, msgEmbedding);

        if (similarity < 0.4) return null;

        return {
          message: msg,
          relevanceScore: similarity * 0.6 + Math.min(1, keywordOverlap / 3) * 0.4,
        };
      })
    );

    // Group related messages into threads/topics
    const relevantMessages = scoredMessages
      .filter(Boolean)
      .sort((a, b) => b!.relevanceScore - a!.relevanceScore)
      .slice(0, 5);

    if (relevantMessages.length === 0) return [];

    // Synthesize into anticipation insights using LLM
    const synthesis = await this.llmService.synthesizeUnseenDiscussions({
      meetingTitle: context.trigger.title,
      meetingParticipants: context.trigger.participants.map(p => p.name),
      unseenMessages: relevantMessages.map(m => ({
        author: m!.message.authorName ?? 'Unknown',
        channel: m!.message.channelName ?? 'Unknown',
        content: m!.message.content.substring(0, 500),
        timestamp: m!.message.timestamp,
        relevanceScore: m!.relevanceScore,
      })),
    });

    if (synthesis && synthesis.insights.length > 0) {
      for (const s of synthesis.insights) {
        insights.push({
          id: `unseen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'unseen_discussion',
          confidence: s.confidence,
          urgency: s.urgency,
          title: s.title,
          body: s.body,
          evidence: s.evidence.map((e: any) => ({
            ...e,
            userSawThis: false,
          })),
          suggestedTalkingPoints: s.talkingPoints,
          suggestedActions: [
            {
              label: 'Add to meeting notes',
              action: 'add_to_agenda',
              metadata: { meetingId: context.trigger.id },
            },
          ],
        });
      }
    }

    return insights;
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 2: Sentiment Shifts
  // =========================================================================
  /**
   * Detect if any attendee's sentiment toward the user or toward a shared
   * topic has shifted recently. Warns user before they walk into a tense
   * conversation.
   */
  private async detectSentimentShifts(
    userId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];
    const personNodeIds = context.trigger.participants
      .map(p => p.personNodeId)
      .filter(Boolean) as string[];

    for (const personNodeId of personNodeIds) {
      const relationship = await this.prisma.relationship.findUnique({
        where: { userId_personNodeId: { userId, personNodeId } },
        include: { person: true },
      });

      if (!relationship) continue;

      // Get recent interactions with this person
      const recentInteractions = await this.prisma.interaction.findMany({
        where: {
          userId,
          participants: { some: { personNodeId } },
          timestamp: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          sentiment: { not: null },
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      if (recentInteractions.length < 3) continue;

      // Compare recent sentiment to baseline
      const recentSentiment = recentInteractions
        .slice(0, 3)
        .reduce((sum, i) => sum + (i.sentiment ?? 0), 0) / 3;

      const baselineSentiment = relationship.person.sentimentAvg;
      const sentimentDelta = recentSentiment - baselineSentiment;

      // Alert on significant negative shift
      if (sentimentDelta < -0.3) {
        insights.push({
          id: `sentiment_${personNodeId}_${Date.now()}`,
          type: 'sentiment_shift',
          confidence: Math.min(0.9, 0.5 + Math.abs(sentimentDelta)),
          urgency: 0.7,
          title: `${relationship.person.name}'s tone has shifted`,
          body: `Recent interactions with ${relationship.person.name} show a more negative tone than usual. Their sentiment has dropped from ${this.sentimentLabel(baselineSentiment)} to ${this.sentimentLabel(recentSentiment)} over the last 2 weeks. This may come up in your conversation.`,
          evidence: recentInteractions.slice(0, 3).map(i => ({
            source: i.source,
            summary: i.summary ?? i.topics.join(', '),
            timestamp: i.timestamp,
            participants: [relationship.person.name],
            userSawThis: true,
          })),
          suggestedTalkingPoints: [
            `Consider opening with a check-in: "How are things going for you?"`,
            `Avoid bringing up contentious topics first — let ${relationship.person.name} set the tone`,
          ],
          suggestedActions: [
            {
              label: 'View interaction history',
              action: 'view_history',
              metadata: { personNodeId },
            },
          ],
        });
      }
    }

    return insights;
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 3: At-Risk Commitments
  // =========================================================================
  /**
   * Surface commitments related to this meeting's participants or topics
   * that are at risk of being missed.
   */
  private async findAtRiskCommitments(
    userId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];
    const personNodeIds = context.trigger.participants
      .map(p => p.personNodeId)
      .filter(Boolean) as string[];

    // Find commitments involving meeting participants
    const commitments = await this.prisma.commitment.findMany({
      where: {
        userId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        OR: [
          { ownerId: { in: personNodeIds } },
          // Also find commitments related to meeting topics
          // (would use semantic search in production)
        ],
      },
      include: { owner: true },
    });

    for (const commitment of commitments) {
      const isOverdue = commitment.dueDate && commitment.dueDate < new Date();
      const isDueSoon = commitment.dueDate &&
        commitment.dueDate < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      if (isOverdue || (isDueSoon && commitment.status === 'OPEN')) {
        const ownerName = commitment.owner?.name ?? 'Someone';
        const isUserOwned = !commitment.ownerId; // user made this commitment

        insights.push({
          id: `commitment_${commitment.id}`,
          type: 'commitment_due',
          confidence: 0.8,
          urgency: isOverdue ? 0.9 : 0.6,
          title: isUserOwned
            ? `Your commitment to ${ownerName} is ${isOverdue ? 'overdue' : 'due soon'}`
            : `${ownerName}'s commitment is ${isOverdue ? 'overdue' : 'due soon'}`,
          body: `"${commitment.description}"${commitment.dueDate ? ` — due ${commitment.dueDate.toLocaleDateString()}` : ''}. ${isUserOwned ? 'They may ask about this in the meeting.' : 'You may want to follow up.'}`,
          evidence: [{
            source: commitment.source,
            summary: commitment.extractedFrom ?? commitment.description,
            timestamp: commitment.createdAt,
            participants: [ownerName],
            userSawThis: true,
          }],
          suggestedTalkingPoints: isUserOwned
            ? [`Be prepared to provide a status update on: "${commitment.description.substring(0, 80)}"`]
            : [`Follow up with ${ownerName} on: "${commitment.description.substring(0, 80)}"`],
          suggestedActions: [
            {
              label: isUserOwned ? 'Mark as complete' : 'Send reminder',
              action: isUserOwned ? 'complete_commitment' : 'send_reminder',
              metadata: { commitmentId: commitment.id },
            },
          ],
        });
      }
    }

    return insights;
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 4: Decision Reversals
  // =========================================================================
  /**
   * Detect when a topic that was previously "decided" is being re-discussed,
   * suggesting a potential reversal. Warn the user so they're not blindsided.
   */
  private async detectDecisionReversals(
    userId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];

    // Get the meeting's likely topics
    const meetingEmbedding = await this.embeddingService.embed(context.trigger.title);

    // Find past decisions semantically similar to the meeting topic
    const relatedDecisions = await this.prisma.$queryRaw<
      Array<{ id: string; title: string; description: string; made_at: Date; similarity: number }>
    >`
      SELECT id, title, description, made_at,
             1 - (embedding <=> ${meetingEmbedding}::vector) as similarity
      FROM decision_log
      WHERE user_id = ${userId}::uuid
        AND embedding IS NOT NULL
        AND made_at > NOW() - INTERVAL '90 days'
        AND reversed_at IS NULL
      ORDER BY embedding <=> ${meetingEmbedding}::vector
      LIMIT 3
    `;

    for (const decision of relatedDecisions) {
      if (decision.similarity < 0.6) continue;

      // Check if this topic has been re-discussed recently
      const recentDiscussions = await this.prisma.interaction.count({
        where: {
          userId,
          topics: { hasSome: decision.title.toLowerCase().split(' ').filter(w => w.length > 3) },
          timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      });

      if (recentDiscussions >= 2) {
        insights.push({
          id: `reversal_${decision.id}`,
          type: 'decision_reversal',
          confidence: Math.min(0.85, decision.similarity),
          urgency: 0.6,
          title: `Previous decision may be challenged: "${decision.title}"`,
          body: `This topic was decided ${Math.round((Date.now() - new Date(decision.made_at).getTime()) / 86400000)} days ago: "${decision.description.substring(0, 150)}". It's been re-discussed ${recentDiscussions} times this week, suggesting the decision may be revisited in this meeting.`,
          evidence: [{
            source: 'decision_log',
            summary: decision.description.substring(0, 200),
            timestamp: new Date(decision.made_at),
            participants: [],
            userSawThis: true,
          }],
          suggestedTalkingPoints: [
            `Be prepared to defend or revisit: "${decision.title}"`,
            `Consider: what new information has emerged since the original decision?`,
          ],
          suggestedActions: [{
            label: 'View original decision',
            action: 'view_decision',
            metadata: { decisionId: decision.id },
          }],
        });
      }
    }

    return insights;
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 5: External Signals
  // =========================================================================
  /**
   * Find industry/competitor signals that are relevant to this interaction.
   * e.g., "The company your attendee works for just announced layoffs"
   */
  private async findRelevantExternalSignals(
    orgId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];

    // Get companies associated with attendees
    const attendeeCompanies = context.trigger.participants
      .map(p => p.name) // would resolve to company in production
      .filter(Boolean);

    // Find recent industry signals mentioning attendee companies or meeting topics
    const meetingEmbedding = await this.embeddingService.embed(context.trigger.title);

    const relevantSignals = await this.prisma.$queryRaw<
      Array<{ id: string; title: string; summary: string; event_type: string;
              company: string; published_at: Date; similarity: number }>
    >`
      SELECT id, title, summary, event_type, company, published_at,
             1 - (embedding <=> ${meetingEmbedding}::vector) as similarity
      FROM industry_signals
      WHERE org_id = ${orgId}::uuid
        AND embedding IS NOT NULL
        AND published_at > NOW() - INTERVAL '7 days'
        AND relevance_score > 0.4
      ORDER BY embedding <=> ${meetingEmbedding}::vector
      LIMIT 3
    `;

    for (const signal of relevantSignals) {
      if (signal.similarity < 0.5) continue;

      insights.push({
        id: `external_${signal.id}`,
        type: 'external_signal',
        confidence: signal.similarity,
        urgency: 0.5,
        title: `Relevant news: ${signal.title.substring(0, 80)}`,
        body: signal.summary.substring(0, 300),
        evidence: [{
          source: 'industry_intelligence',
          summary: signal.summary.substring(0, 200),
          timestamp: new Date(signal.published_at),
          participants: [],
          userSawThis: false,
        }],
        suggestedTalkingPoints: [
          `This ${signal.event_type.toLowerCase().replace('_', ' ')} may come up in discussion`,
        ],
        suggestedActions: [],
      });
    }

    return insights;
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 6: Follow-Up Gaps
  // =========================================================================
  /**
   * For recurring meetings, check if action items from the last occurrence
   * were actually completed.
   */
  private async findFollowUpGaps(
    userId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];

    // Find the previous meeting with same recurring ID or similar title
    const previousMeeting = await this.prisma.meeting.findFirst({
      where: {
        userId,
        title: context.trigger.title,
        startTime: { lt: context.trigger.startTime },
      },
      orderBy: { startTime: 'desc' },
    });

    if (!previousMeeting) return [];

    // Get action items from the previous meeting
    const actionItems = (previousMeeting.actionItems as Array<{
      description: string;
      owner: string;
      status?: string;
    }>) ?? [];

    const incompleteItems = actionItems.filter(a => a.status !== 'done');

    if (incompleteItems.length > 0) {
      insights.push({
        id: `followup_${previousMeeting.id}`,
        type: 'follow_up_gap',
        confidence: 0.85,
        urgency: 0.7,
        title: `${incompleteItems.length} action item${incompleteItems.length > 1 ? 's' : ''} from last meeting still open`,
        body: `From the previous "${context.trigger.title}" on ${previousMeeting.startTime.toLocaleDateString()}:\n${incompleteItems.map(a => `- ${a.description} (${a.owner})`).join('\n')}`,
        evidence: [{
          source: 'meeting_notes',
          summary: `${incompleteItems.length} incomplete action items`,
          timestamp: previousMeeting.startTime,
          participants: incompleteItems.map(a => a.owner),
          userSawThis: true,
        }],
        suggestedTalkingPoints: incompleteItems.map(a =>
          `Follow up with ${a.owner}: "${a.description}"`
        ),
        suggestedActions: [{
          label: 'View previous meeting notes',
          action: 'view_meeting',
          metadata: { meetingId: previousMeeting.id },
        }],
      });
    }

    return insights;
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 7: Agenda Predictions
  // =========================================================================
  /**
   * Predict what topics will likely come up based on recent activity patterns
   * of the attendees. Even if there's no formal agenda.
   */
  private async predictAgendaTopics(
    userId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const personNodeIds = context.trigger.participants
      .map(p => p.personNodeId)
      .filter(Boolean) as string[];

    if (personNodeIds.length === 0) return [];

    // Get topics that attendees have been most active on recently
    const recentTopics = await this.prisma.interaction.findMany({
      where: {
        userId,
        participants: { some: { personNodeId: { in: personNodeIds } } },
        timestamp: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        topics: { isEmpty: false },
      },
      select: { topics: true, timestamp: true },
      orderBy: { timestamp: 'desc' },
      take: 30,
    });

    // Count topic frequency
    const topicCounts = new Map<string, number>();
    for (const interaction of recentTopics) {
      for (const topic of interaction.topics) {
        topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
      }
    }

    // Get top 5 predicted topics
    const predictedTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, frequency: count }));

    if (predictedTopics.length === 0) return [];

    return [{
      id: `agenda_pred_${context.trigger.id}`,
      type: 'agenda_prediction',
      confidence: 0.6,
      urgency: 0.4,
      title: 'Predicted discussion topics',
      body: `Based on recent activity with these attendees, likely topics: ${predictedTopics.map(t => `**${t.topic}** (mentioned ${t.frequency}x recently)`).join(', ')}`,
      evidence: [],
      suggestedTalkingPoints: predictedTopics.map(t => `Be prepared to discuss: ${t.topic}`),
      suggestedActions: [],
    }];
  }

  // =========================================================================
  // ANTICIPATION STRATEGY 8: Context Gaps
  // =========================================================================
  /**
   * Identify information that OTHER attendees have but the user DOESN'T.
   * This is about information asymmetry detection.
   */
  private async findContextGaps(
    userId: string,
    orgId: string,
    context: AnticipationContext
  ): Promise<AnticipatedInsight[]> {
    const insights: AnticipatedInsight[] = [];
    const participantEmails = context.trigger.participants
      .map(p => p.email)
      .filter(Boolean) as string[];

    // Find documents recently edited by attendees that the user hasn't viewed
    const attendeeDocs = await this.prisma.documentRecord.findMany({
      where: {
        orgId,
        modifiedBy: { in: participantEmails.map(e => e.split('@')[0]) },
        lastModified: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        NOT: { userId }, // not in user's document records
      },
      take: 5,
      orderBy: { lastModified: 'desc' },
    });

    if (attendeeDocs.length > 0) {
      // Check semantic relevance to the meeting
      const meetingEmbedding = await this.embeddingService.embed(context.trigger.title);

      for (const doc of attendeeDocs) {
        if (!doc.content) continue;

        const docEmbedding = await this.embeddingService.embed(
          `${doc.title} ${doc.content.substring(0, 500)}`
        );
        const similarity = cosineSimilarity(meetingEmbedding, docEmbedding);

        if (similarity > 0.5) {
          insights.push({
            id: `context_gap_${doc.id}`,
            type: 'context_gap',
            confidence: similarity,
            urgency: 0.5,
            title: `${doc.modifiedBy} updated "${doc.title}" — you haven't seen it`,
            body: `This document was recently updated and may be relevant to your meeting. Other attendees may reference it.`,
            evidence: [{
              source: doc.source,
              summary: `Document "${doc.title}" updated ${doc.lastModified?.toLocaleDateString()}`,
              timestamp: doc.lastModified ?? new Date(),
              participants: [doc.modifiedBy ?? 'Unknown'],
              userSawThis: false,
            }],
            suggestedTalkingPoints: [`Review "${doc.title}" before the meeting`],
            suggestedActions: [{
              label: 'Open document',
              action: 'open_url',
              metadata: { url: doc.sourceUrl },
            }],
          });
        }
      }
    }

    return insights;
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private async getUserActiveChannels(userId: string): Promise<string[]> {
    const recentMessages = await this.prisma.message.findMany({
      where: {
        userId,
        isFromUser: true,
        timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { channelId: true },
      distinct: ['channelId'],
    });
    return recentMessages.map(m => m.channelId).filter(Boolean) as string[];
  }

  private sentimentLabel(score: number): string {
    if (score > 0.3) return 'positive';
    if (score > -0.3) return 'neutral';
    return 'negative';
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// ---------------------------------------------------------------------------
// Service Interfaces
// ---------------------------------------------------------------------------

export interface LLMService {
  synthesizeUnseenDiscussions(params: {
    meetingTitle: string;
    meetingParticipants: string[];
    unseenMessages: Array<{
      author: string;
      channel: string;
      content: string;
      timestamp: Date;
      relevanceScore: number;
    }>;
  }): Promise<{
    insights: Array<{
      title: string;
      body: string;
      confidence: number;
      urgency: number;
      talkingPoints: string[];
      evidence: Array<{
        source: string;
        summary: string;
        timestamp: Date;
        participants: string[];
      }>;
    }>;
  } | null>;
}

export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
}
