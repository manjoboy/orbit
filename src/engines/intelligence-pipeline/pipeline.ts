// ============================================================================
// INTELLIGENCE PIPELINE
// ============================================================================
// The central nervous system. Every raw event from every connector flows
// through this pipeline, getting enriched, scored, and routed to the
// appropriate engines and storage layers.
// ============================================================================

import { PrismaClient, DataSource, MessageIntent, TriageStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Normalized event schema — all connectors emit events in this format.
 * This is the universal language of the intelligence pipeline.
 */
export interface NormalizedEvent {
  id: string;
  source: DataSource;
  sourceId: string;               // ID in the source system
  eventType: EventType;
  timestamp: Date;
  orgId: string;
  userId: string;

  // Actor (who triggered this event)
  actor: {
    id?: string;
    name: string;
    email?: string;
  };

  // Content
  content: {
    raw: string;                   // original text
    sanitized?: string;            // PII-scrubbed version
    subject?: string;              // email subject, PR title, etc.
    htmlContent?: string;          // rich content if available
  };

  // Extracted entities (pre-filled by connector or enriched by pipeline)
  entities: Array<{
    type: 'person' | 'project' | 'company' | 'topic' | 'date' | 'url';
    value: string;
    confidence: number;
  }>;

  // Source-specific metadata
  metadata: {
    channelId?: string;
    channelName?: string;
    threadId?: string;
    isThread?: boolean;
    projectId?: string;
    projectName?: string;
    prNumber?: number;
    meetingId?: string;
    labels?: string[];
    priority?: number;
    [key: string]: unknown;
  };

  // Processing state
  idempotencyKey: string;          // for deduplication
  retryCount: number;
  maxRetries: number;
}

export type EventType =
  | 'message.created'
  | 'message.updated'
  | 'message.deleted'
  | 'message.reaction'
  | 'thread.created'
  | 'thread.reply'
  | 'email.received'
  | 'email.sent'
  | 'meeting.created'
  | 'meeting.updated'
  | 'meeting.cancelled'
  | 'meeting.started'
  | 'meeting.ended'
  | 'meeting.transcript'
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.assigned'
  | 'pr.created'
  | 'pr.updated'
  | 'pr.merged'
  | 'pr.review_requested'
  | 'pr.reviewed'
  | 'document.created'
  | 'document.updated'
  | 'calendar.event_created'
  | 'calendar.event_updated'
  | 'calendar.event_deleted';

/**
 * Enriched event — after pipeline processing.
 * Contains all extracted intelligence ready for storage and routing.
 */
export interface EnrichedEvent extends NormalizedEvent {
  enrichment: {
    // Entity resolution
    resolvedEntities: Array<{
      type: string;
      originalMention: string;
      resolvedId: string | null;
      resolvedName: string;
      confidence: number;
      isNew: boolean;
    }>;

    // Content analysis
    sentiment: number;              // -1 to 1
    urgencyScore: number;           // 0 to 1
    intentClassification: MessageIntent;
    topics: string[];
    summary: string;

    // Commitment & decision extraction
    commitments: Array<{
      description: string;
      owner: string;
      dueDate?: Date;
      confidence: number;
    }>;
    decisions: Array<{
      title: string;
      description: string;
      rationale?: string;
      confidence: number;
    }>;

    // Embedding
    embedding: number[];

    // PII detection
    piiDetected: boolean;
    piiLocations: Array<{
      type: string;
      start: number;
      end: number;
    }>;
  };
}

/**
 * Signal emitted by pattern detectors.
 */
export interface DetectedSignal {
  type: string;
  subType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  score: number;
  title: string;
  description: string;
  evidence: Array<{
    source: string;
    data: unknown;
    timestamp: Date;
  }>;
  affectedEntities: Array<{
    type: string;
    id: string;
    name: string;
  }>;
  detectorName: string;
  detectorVersion: string;
}

// ---------------------------------------------------------------------------
// Pipeline Stage Interfaces
// ---------------------------------------------------------------------------

export interface PipelineStage<TInput, TOutput> {
  name: string;
  process(input: TInput, context: PipelineContext): Promise<TOutput>;
  onError(error: Error, input: TInput, context: PipelineContext): Promise<void>;
}

export interface PipelineContext {
  orgId: string;
  userId: string;
  traceId: string;
  startedAt: Date;
  metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Stage 1: Ingestion & Deduplication
// ---------------------------------------------------------------------------

export class IngestionStage implements PipelineStage<NormalizedEvent, NormalizedEvent | null> {
  name = 'ingestion';

  constructor(
    private prisma: PrismaClient,
    private redis: RedisClient,
  ) {}

  async process(
    event: NormalizedEvent,
    context: PipelineContext
  ): Promise<NormalizedEvent | null> {
    // Deduplication: check if we've already processed this event
    const dedupeKey = `dedup:${event.orgId}:${event.idempotencyKey}`;
    const exists = await this.redis.get(dedupeKey);
    if (exists) {
      return null; // already processed
    }

    // Mark as processing (TTL: 24 hours)
    await this.redis.set(dedupeKey, '1', 'EX', 86400);

    // Validate required fields
    if (!event.orgId || !event.userId || !event.source) {
      throw new PipelineError('Missing required fields', 'VALIDATION_ERROR', event);
    }

    return event;
  }

  async onError(error: Error, input: NormalizedEvent, context: PipelineContext): Promise<void> {
    console.error(`[Ingestion] Error processing event ${input.id}:`, error.message);
    // Dead letter queue for failed events
    await this.redis.lpush(
      `dlq:${input.orgId}`,
      JSON.stringify({ event: input, error: error.message, timestamp: new Date() })
    );
  }
}

// ---------------------------------------------------------------------------
// Stage 2: Enrichment
// ---------------------------------------------------------------------------

export class EnrichmentStage implements PipelineStage<NormalizedEvent, EnrichedEvent> {
  name = 'enrichment';

  constructor(
    private llmService: LLMService,
    private embeddingService: EmbeddingService,
    private entityResolver: EntityResolver,
    private piiDetector: PIIDetector,
  ) {}

  async process(
    event: NormalizedEvent,
    context: PipelineContext
  ): Promise<EnrichedEvent> {
    // Run enrichment steps in parallel where possible
    const [
      entityResolution,
      contentAnalysis,
      embedding,
      piiResult,
    ] = await Promise.all([
      this.resolveEntities(event, context),
      this.analyzeContent(event, context),
      this.generateEmbedding(event),
      this.detectPII(event),
    ]);

    // Extract commitments and decisions (depends on content analysis)
    const [commitments, decisions] = await Promise.all([
      this.extractCommitments(event, contentAnalysis),
      this.extractDecisions(event, contentAnalysis),
    ]);

    return {
      ...event,
      enrichment: {
        resolvedEntities: entityResolution,
        sentiment: contentAnalysis.sentiment,
        urgencyScore: contentAnalysis.urgencyScore,
        intentClassification: contentAnalysis.intent,
        topics: contentAnalysis.topics,
        summary: contentAnalysis.summary,
        commitments,
        decisions,
        embedding,
        piiDetected: piiResult.detected,
        piiLocations: piiResult.locations,
      },
    };
  }

  private async resolveEntities(
    event: NormalizedEvent,
    context: PipelineContext
  ): Promise<EnrichedEvent['enrichment']['resolvedEntities']> {
    const results = [];

    // Resolve the actor
    if (event.actor.name || event.actor.email) {
      const resolution = await this.entityResolver.resolve(
        context.userId,
        context.orgId,
        {
          name: event.actor.name,
          email: event.actor.email,
          source: event.source,
          context: event.content.raw.substring(0, 500),
        }
      );

      results.push({
        type: 'person',
        originalMention: event.actor.name,
        resolvedId: resolution.resolvedId,
        resolvedName: event.actor.name,
        confidence: resolution.confidence,
        isNew: resolution.isNew,
      });
    }

    // Resolve mentioned entities
    for (const entity of event.entities) {
      if (entity.type === 'person') {
        const resolution = await this.entityResolver.resolve(
          context.userId,
          context.orgId,
          {
            name: entity.value,
            source: event.source,
            context: event.content.raw.substring(0, 500),
          }
        );

        results.push({
          type: 'person',
          originalMention: entity.value,
          resolvedId: resolution.resolvedId,
          resolvedName: entity.value,
          confidence: resolution.confidence,
          isNew: resolution.isNew,
        });
      }
    }

    return results;
  }

  private async analyzeContent(
    event: NormalizedEvent,
    context: PipelineContext
  ): Promise<{
    sentiment: number;
    urgencyScore: number;
    intent: MessageIntent;
    topics: string[];
    summary: string;
  }> {
    if (!event.content.raw || event.content.raw.length < 10) {
      return {
        sentiment: 0,
        urgencyScore: 0,
        intent: 'FYI' as MessageIntent,
        topics: [],
        summary: '',
      };
    }

    return this.llmService.analyzeContent({
      content: event.content.raw,
      subject: event.content.subject,
      eventType: event.eventType,
      source: event.source,
      metadata: event.metadata,
    });
  }

  private async generateEmbedding(event: NormalizedEvent): Promise<number[]> {
    const embeddingText = [
      event.content.subject,
      event.content.raw.substring(0, 2000), // limit for embedding model
      event.entities.map(e => e.value).join(', '),
    ].filter(Boolean).join('\n');

    return this.embeddingService.embed(embeddingText);
  }

  private async detectPII(
    event: NormalizedEvent
  ): Promise<{ detected: boolean; locations: Array<{ type: string; start: number; end: number }> }> {
    return this.piiDetector.detect(event.content.raw);
  }

  private async extractCommitments(
    event: NormalizedEvent,
    analysis: { topics: string[]; summary: string }
  ): Promise<EnrichedEvent['enrichment']['commitments']> {
    if (!event.content.raw || event.content.raw.length < 20) return [];

    return this.llmService.extractCommitments({
      content: event.content.raw,
      participants: [event.actor.name, ...event.entities.filter(e => e.type === 'person').map(e => e.value)],
    });
  }

  private async extractDecisions(
    event: NormalizedEvent,
    analysis: { topics: string[]; summary: string }
  ): Promise<EnrichedEvent['enrichment']['decisions']> {
    if (!event.content.raw || event.content.raw.length < 50) return [];

    return this.llmService.extractDecisions({
      content: event.content.raw,
      topics: analysis.topics,
    });
  }

  async onError(error: Error, input: NormalizedEvent, context: PipelineContext): Promise<void> {
    console.error(`[Enrichment] Error enriching event ${input.id}:`, error.message);
  }
}

// ---------------------------------------------------------------------------
// Stage 3: Graph Update
// ---------------------------------------------------------------------------

export class GraphUpdateStage implements PipelineStage<EnrichedEvent, EnrichedEvent> {
  name = 'graph_update';

  constructor(
    private graphEngine: ProfessionalGraphEngine,
    private prisma: PrismaClient,
  ) {}

  async process(
    event: EnrichedEvent,
    context: PipelineContext
  ): Promise<EnrichedEvent> {
    // Route to appropriate graph update based on event type
    switch (event.eventType) {
      case 'message.created':
      case 'thread.reply':
        await this.handleMessage(event, context);
        break;

      case 'email.received':
      case 'email.sent':
        await this.handleEmail(event, context);
        break;

      case 'meeting.ended':
      case 'meeting.transcript':
        await this.handleMeeting(event, context);
        break;

      case 'task.created':
      case 'task.updated':
      case 'task.completed':
      case 'task.assigned':
        await this.handleTask(event, context);
        break;

      case 'pr.created':
      case 'pr.reviewed':
      case 'pr.merged':
        await this.handlePR(event, context);
        break;

      case 'document.created':
      case 'document.updated':
        await this.handleDocument(event, context);
        break;

      case 'calendar.event_created':
      case 'calendar.event_updated':
        await this.handleCalendarEvent(event, context);
        break;
    }

    // Update topic interests
    for (const topic of event.enrichment.topics) {
      await this.prisma.topicInterest.upsert({
        where: { userId_topic: { userId: context.userId, topic } },
        update: {
          weight: { increment: 0.1 },
          lastSeen: event.timestamp,
        },
        create: {
          userId: context.userId,
          topic,
          weight: 0.5,
          lastSeen: event.timestamp,
          frequency: 0,
        },
      });
    }

    return event;
  }

  private async handleMessage(event: EnrichedEvent, context: PipelineContext): Promise<void> {
    // Store the message
    await this.prisma.message.upsert({
      where: {
        userId_source_sourceId: {
          userId: context.userId,
          source: event.source,
          sourceId: event.sourceId,
        },
      },
      update: {
        content: event.content.sanitized ?? event.content.raw,
        sentiment: event.enrichment.sentiment,
        urgencyScore: event.enrichment.urgencyScore,
        intentClass: event.enrichment.intentClassification,
        triageStatus: 'TRIAGED' as TriageStatus,
        needsReply: event.enrichment.intentClassification === 'NEEDS_REPLY',
      },
      create: {
        orgId: context.orgId,
        userId: context.userId,
        source: event.source,
        sourceId: event.sourceId,
        channelId: event.metadata.channelId as string,
        channelName: event.metadata.channelName as string,
        threadId: event.metadata.threadId as string,
        authorEmail: event.actor.email,
        authorName: event.actor.name,
        content: event.content.sanitized ?? event.content.raw,
        timestamp: event.timestamp,
        isFromUser: false,
        sentiment: event.enrichment.sentiment,
        urgencyScore: event.enrichment.urgencyScore,
        intentClass: event.enrichment.intentClassification,
        triageStatus: 'TRIAGED' as TriageStatus,
        needsReply: event.enrichment.intentClassification === 'NEEDS_REPLY',
      },
    });

    // Process as interaction in the graph
    const participants = event.enrichment.resolvedEntities
      .filter(e => e.type === 'person')
      .map(e => ({ name: e.resolvedName, email: undefined }));

    if (participants.length > 0) {
      await this.graphEngine.processInteraction({
        userId: context.userId,
        orgId: context.orgId,
        type: event.metadata.isThread ? 'SLACK_THREAD' : 'SLACK_MESSAGE',
        source: event.source,
        sourceId: event.sourceId,
        timestamp: event.timestamp,
        participants,
        content: event.content.raw,
      });
    }
  }

  private async handleEmail(event: EnrichedEvent, context: PipelineContext): Promise<void> {
    await this.prisma.emailRecord.upsert({
      where: {
        userId_sourceId: {
          userId: context.userId,
          sourceId: event.sourceId,
        },
      },
      update: {
        urgencyScore: event.enrichment.urgencyScore,
        intentClass: event.enrichment.intentClassification,
        needsReply: event.enrichment.intentClassification === 'NEEDS_REPLY',
        sentiment: event.enrichment.sentiment,
      },
      create: {
        orgId: context.orgId,
        userId: context.userId,
        source: 'GMAIL',
        sourceId: event.sourceId,
        threadId: event.metadata.threadId as string,
        subject: event.content.subject ?? '',
        fromEmail: event.actor.email ?? '',
        fromName: event.actor.name,
        toEmails: (event.metadata.toEmails as string[]) ?? [],
        ccEmails: (event.metadata.ccEmails as string[]) ?? [],
        snippet: event.content.raw.substring(0, 200),
        timestamp: event.timestamp,
        isFromUser: event.eventType === 'email.sent',
        labels: (event.metadata.labels as string[]) ?? [],
        hasAttachment: (event.metadata.hasAttachment as boolean) ?? false,
        urgencyScore: event.enrichment.urgencyScore,
        intentClass: event.enrichment.intentClassification,
        needsReply: event.enrichment.intentClassification === 'NEEDS_REPLY',
        sentiment: event.enrichment.sentiment,
      },
    });
  }

  private async handleMeeting(event: EnrichedEvent, context: PipelineContext): Promise<void> {
    // Store meeting with intelligence
    await this.prisma.meeting.upsert({
      where: {
        userId_source_sourceId: {
          userId: context.userId,
          source: event.source,
          sourceId: event.sourceId,
        },
      },
      update: {
        summary: event.enrichment.summary,
        transcript: event.content.raw,
        decisionsCount: event.enrichment.decisions.length,
      },
      create: {
        orgId: context.orgId,
        userId: context.userId,
        source: event.source,
        sourceId: event.sourceId,
        title: event.content.subject ?? 'Meeting',
        startTime: event.timestamp,
        endTime: new Date(event.timestamp.getTime() + (event.metadata.durationMin as number ?? 30) * 60000),
        attendeeCount: event.entities.filter(e => e.type === 'person').length,
        summary: event.enrichment.summary,
        transcript: event.content.raw,
        decisionsCount: event.enrichment.decisions.length,
      },
    });
  }

  private async handleTask(event: EnrichedEvent, context: PipelineContext): Promise<void> {
    const statusMap: Record<string, string> = {
      'task.created': 'TODO',
      'task.updated': 'IN_PROGRESS',
      'task.completed': 'DONE',
      'task.assigned': 'TODO',
    };

    await this.prisma.taskItem.upsert({
      where: {
        id: event.sourceId, // Use source ID as primary key for external tasks
      },
      update: {
        status: statusMap[event.eventType] as any,
        updatedAt: event.timestamp,
      },
      create: {
        orgId: context.orgId,
        userId: context.userId,
        source: event.source,
        sourceId: event.sourceId,
        title: event.content.subject ?? event.content.raw.substring(0, 100),
        description: event.content.raw,
        status: statusMap[event.eventType] as any,
        priority: event.metadata.priority as number ?? 3,
        tags: event.enrichment.topics,
      },
    });
  }

  private async handlePR(event: EnrichedEvent, context: PipelineContext): Promise<void> {
    // PRs are treated as interactions for the professional graph
    const participants = event.enrichment.resolvedEntities
      .filter(e => e.type === 'person')
      .map(e => ({ name: e.resolvedName, email: undefined }));

    if (participants.length > 0) {
      await this.graphEngine.processInteraction({
        userId: context.userId,
        orgId: context.orgId,
        type: 'PR_REVIEW',
        source: event.source,
        sourceId: event.sourceId,
        timestamp: event.timestamp,
        participants,
        content: event.content.raw,
      });
    }
  }

  private async handleDocument(event: EnrichedEvent, context: PipelineContext): Promise<void> {
    await this.prisma.documentRecord.upsert({
      where: {
        userId_source_sourceId: {
          userId: context.userId,
          source: event.source,
          sourceId: event.sourceId,
        },
      },
      update: {
        title: event.content.subject ?? '',
        content: event.content.raw,
        lastModified: event.timestamp,
        modifiedBy: event.actor.name,
      },
      create: {
        orgId: context.orgId,
        userId: context.userId,
        source: event.source,
        sourceId: event.sourceId,
        title: event.content.subject ?? '',
        content: event.content.raw,
        lastModified: event.timestamp,
        modifiedBy: event.actor.name,
      },
    });

    // Extract knowledge nodes from documents
    if (event.content.raw && event.content.raw.length > 100) {
      const knowledgeItems = await this.extractKnowledge(event);
      for (const item of knowledgeItems) {
        await this.prisma.knowledgeNode.create({
          data: {
            orgId: context.orgId,
            userId: context.userId,
            type: item.type as any,
            title: item.title,
            content: item.content,
            source: event.source,
            sourceId: event.sourceId,
            tags: event.enrichment.topics,
            confidence: item.confidence,
          },
        });
      }
    }
  }

  private async handleCalendarEvent(event: EnrichedEvent, context: PipelineContext): Promise<void> {
    await this.prisma.calendarEvent.upsert({
      where: {
        userId_sourceId: {
          userId: context.userId,
          sourceId: event.sourceId,
        },
      },
      update: {
        title: event.content.subject ?? '',
        startTime: event.timestamp,
        attendeeCount: event.entities.filter(e => e.type === 'person').length,
      },
      create: {
        orgId: context.orgId,
        userId: context.userId,
        sourceId: event.sourceId,
        title: event.content.subject ?? '',
        startTime: event.timestamp,
        endTime: new Date(event.timestamp.getTime() + 3600000), // default 1 hour
        attendeeCount: event.entities.filter(e => e.type === 'person').length,
        isRecurring: (event.metadata.isRecurring as boolean) ?? false,
      },
    });
  }

  private async extractKnowledge(
    event: EnrichedEvent
  ): Promise<Array<{ type: string; title: string; content: string; confidence: number }>> {
    // Delegate to LLM for knowledge extraction
    // This would be a more sophisticated prompt in production
    return [];
  }

  async onError(error: Error, input: EnrichedEvent, context: PipelineContext): Promise<void> {
    console.error(`[GraphUpdate] Error for event ${input.id}:`, error.message);
  }
}

// ---------------------------------------------------------------------------
// Stage 4: Signal Detection
// ---------------------------------------------------------------------------

export class SignalDetectionStage implements PipelineStage<EnrichedEvent, DetectedSignal[]> {
  name = 'signal_detection';

  constructor(
    private detectors: PatternDetector[],
    private prisma: PrismaClient,
  ) {}

  async process(
    event: EnrichedEvent,
    context: PipelineContext
  ): Promise<DetectedSignal[]> {
    const signals: DetectedSignal[] = [];

    // Run all applicable detectors in parallel
    const detectorResults = await Promise.allSettled(
      this.detectors
        .filter(d => d.appliesTo(event))
        .map(d => d.detect(event, context))
    );

    for (const result of detectorResults) {
      if (result.status === 'fulfilled' && result.value) {
        signals.push(...(Array.isArray(result.value) ? result.value : [result.value]));
      }
    }

    // Persist detected signals
    for (const signal of signals) {
      await this.prisma.signal.create({
        data: {
          orgId: context.orgId,
          userId: context.userId,
          type: signal.type as any,
          subType: signal.subType,
          severity: signal.severity.toUpperCase() as any,
          score: signal.score,
          title: signal.title,
          description: signal.description,
          evidence: signal.evidence as any,
          affectedEntities: signal.affectedEntities as any,
          detectorName: signal.detectorName,
          detectorVersion: signal.detectorVersion,
        },
      });
    }

    return signals;
  }

  async onError(error: Error, input: EnrichedEvent, context: PipelineContext): Promise<void> {
    console.error(`[SignalDetection] Error for event ${input.id}:`, error.message);
  }
}

// ---------------------------------------------------------------------------
// Stage 5: Insight Generation
// ---------------------------------------------------------------------------

export class InsightGenerationStage implements PipelineStage<DetectedSignal[], void> {
  name = 'insight_generation';

  constructor(
    private llmService: LLMService,
    private prisma: PrismaClient,
    private notificationService: NotificationService,
  ) {}

  async process(
    signals: DetectedSignal[],
    context: PipelineContext
  ): Promise<void> {
    if (signals.length === 0) return;

    // Group related signals for synthesis
    const signalGroups = this.groupRelatedSignals(signals);

    for (const group of signalGroups) {
      // Determine if this warrants an insight
      const maxSeverity = group.reduce(
        (max, s) => this.severityToNum(s.severity) > this.severityToNum(max)
          ? s.severity : max,
        'info' as DetectedSignal['severity']
      );

      if (this.severityToNum(maxSeverity) < 2) continue; // skip low-severity

      // Generate human-readable insight with LLM
      const insight = await this.llmService.synthesizeInsight({
        signals: group,
        userId: context.userId,
        orgId: context.orgId,
      });

      if (!insight) continue;

      // Store the insight
      const storedInsight = await this.prisma.insight.create({
        data: {
          orgId: context.orgId,
          userId: context.userId,
          type: insight.type as any,
          priority: insight.priority as any,
          title: insight.title,
          body: insight.body,
          recommendedActions: insight.recommendedActions as any,
          deliveryChannel: insight.deliveryChannel as any,
        },
      });

      // Route to appropriate delivery channel
      if (insight.deliveryChannel === 'IMMEDIATE' || maxSeverity === 'critical') {
        await this.notificationService.sendImmediate({
          userId: context.userId,
          insightId: storedInsight.id,
          title: insight.title,
          body: insight.body,
          actions: insight.recommendedActions,
        });
      }
      // Otherwise, it'll be picked up by the next briefing generation
    }
  }

  private groupRelatedSignals(signals: DetectedSignal[]): DetectedSignal[][] {
    // Group signals that share affected entities
    const groups: Map<string, DetectedSignal[]> = new Map();

    for (const signal of signals) {
      const key = signal.affectedEntities.map(e => e.id).sort().join(',') || signal.type;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(signal);
    }

    return Array.from(groups.values());
  }

  private severityToNum(severity: DetectedSignal['severity']): number {
    return { critical: 4, high: 3, medium: 2, low: 1, info: 0 }[severity];
  }

  async onError(error: Error, input: DetectedSignal[], context: PipelineContext): Promise<void> {
    console.error(`[InsightGeneration] Error:`, error.message);
  }
}

// ---------------------------------------------------------------------------
// Pipeline Orchestrator
// ---------------------------------------------------------------------------

export class IntelligencePipeline {
  private ingestion: IngestionStage;
  private enrichment: EnrichmentStage;
  private graphUpdate: GraphUpdateStage;
  private signalDetection: SignalDetectionStage;
  private insightGeneration: InsightGenerationStage;

  constructor(deps: {
    prisma: PrismaClient;
    redis: RedisClient;
    llmService: LLMService;
    embeddingService: EmbeddingService;
    entityResolver: EntityResolver;
    piiDetector: PIIDetector;
    graphEngine: ProfessionalGraphEngine;
    patternDetectors: PatternDetector[];
    notificationService: NotificationService;
  }) {
    this.ingestion = new IngestionStage(deps.prisma, deps.redis);
    this.enrichment = new EnrichmentStage(
      deps.llmService, deps.embeddingService, deps.entityResolver, deps.piiDetector
    );
    this.graphUpdate = new GraphUpdateStage(deps.graphEngine, deps.prisma);
    this.signalDetection = new SignalDetectionStage(deps.patternDetectors, deps.prisma);
    this.insightGeneration = new InsightGenerationStage(
      deps.llmService, deps.prisma, deps.notificationService
    );
  }

  /**
   * Process a single event through the full pipeline.
   * This is the main entry point — called by Celery workers for each incoming event.
   */
  async processEvent(event: NormalizedEvent): Promise<{
    processed: boolean;
    signals: DetectedSignal[];
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const context: PipelineContext = {
      orgId: event.orgId,
      userId: event.userId,
      traceId: `trace_${event.id}_${Date.now()}`,
      startedAt: new Date(),
      metadata: {},
    };

    try {
      // Stage 1: Ingestion & dedup
      const ingested = await this.ingestion.process(event, context);
      if (!ingested) {
        return { processed: false, signals: [], processingTimeMs: Date.now() - startTime };
      }

      // Stage 2: Enrichment
      const enriched = await this.enrichment.process(ingested, context);

      // Stage 3: Graph update
      const graphUpdated = await this.graphUpdate.process(enriched, context);

      // Stage 4: Signal detection
      const signals = await this.signalDetection.process(graphUpdated, context);

      // Stage 5: Insight generation
      await this.insightGeneration.process(signals, context);

      return {
        processed: true,
        signals,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`[Pipeline] Fatal error processing event ${event.id}:`, error);

      // Retry logic
      if (event.retryCount < event.maxRetries) {
        event.retryCount++;
        // Re-queue with exponential backoff
        // In production: celery.send_task('process_event', event, countdown=2^retryCount)
      }

      return {
        processed: false,
        signals: [],
        processingTimeMs: Date.now() - startTime,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class PipelineError extends Error {
  constructor(
    message: string,
    public code: string,
    public event: NormalizedEvent,
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

// ---------------------------------------------------------------------------
// External service interfaces (injected)
// ---------------------------------------------------------------------------

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<void>;
  lpush(key: string, value: string): Promise<void>;
}

export interface LLMService {
  analyzeContent(params: {
    content: string;
    subject?: string;
    eventType: EventType;
    source: DataSource;
    metadata: Record<string, unknown>;
  }): Promise<{
    sentiment: number;
    urgencyScore: number;
    intent: MessageIntent;
    topics: string[];
    summary: string;
  }>;

  extractCommitments(params: {
    content: string;
    participants: string[];
  }): Promise<Array<{
    description: string;
    owner: string;
    dueDate?: Date;
    confidence: number;
  }>>;

  extractDecisions(params: {
    content: string;
    topics: string[];
  }): Promise<Array<{
    title: string;
    description: string;
    rationale?: string;
    confidence: number;
  }>>;

  synthesizeInsight(params: {
    signals: DetectedSignal[];
    userId: string;
    orgId: string;
  }): Promise<{
    type: string;
    priority: string;
    title: string;
    body: string;
    recommendedActions: unknown[];
    deliveryChannel: string;
  } | null>;
}

export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
}

export interface EntityResolver {
  resolve(userId: string, orgId: string, params: {
    name?: string;
    email?: string;
    source: DataSource;
    context?: string;
  }): Promise<{
    resolvedId: string | null;
    confidence: number;
    isNew: boolean;
  }>;
}

export interface PIIDetector {
  detect(text: string): Promise<{
    detected: boolean;
    locations: Array<{ type: string; start: number; end: number }>;
  }>;
}

export interface PatternDetector {
  name: string;
  version: string;
  appliesTo(event: EnrichedEvent): boolean;
  detect(event: EnrichedEvent, context: PipelineContext): Promise<DetectedSignal | DetectedSignal[] | null>;
}

export interface ProfessionalGraphEngine {
  processInteraction(params: {
    userId: string;
    orgId: string;
    type: string;
    source: DataSource;
    sourceId: string;
    timestamp: Date;
    participants: Array<{ name: string; email?: string }>;
    content?: string;
  }): Promise<unknown>;
}

export interface NotificationService {
  sendImmediate(params: {
    userId: string;
    insightId: string;
    title: string;
    body: string;
    actions: unknown[];
  }): Promise<void>;
}
