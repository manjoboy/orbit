// ============================================================================
// INDUSTRY INTELLIGENCE ENGINE
// ============================================================================
// Ingests external signals (news, funding rounds, product launches, regulatory
// changes, competitor moves, talent market shifts) and scores them for
// relevance against each organization's context. Converts raw news into
// actionable intelligence tied to the user's internal world.
// ============================================================================

import { PrismaClient, IndustryEventType, CompetitorEventType } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawExternalEvent {
  id: string;
  sourceProvider: string;         // "techcrunch", "crunchbase", "sec_edgar", etc.
  sourceUrl: string;
  title: string;
  content: string;
  publishedAt: Date;
  fetchedAt: Date;
  entities: Array<{
    type: 'company' | 'person' | 'product' | 'amount' | 'location';
    value: string;
    metadata?: Record<string, unknown>;
  }>;
  tags: string[];
  rawPayload: Record<string, unknown>;
}

export interface ScoredIndustrySignal {
  event: RawExternalEvent;
  eventType: IndustryEventType;
  relevanceScore: number;          // 0-1 composite
  relevanceBreakdown: {
    companyOverlap: number;        // 0-1
    topicOverlap: number;          // 0-1
    roleRelevance: number;         // 0-1
    temporalUrgency: number;       // 0-1
    networkRelevance: number;      // 0-1
  };
  impactAssessment: string;        // LLM-generated
  affectedInternalEntities: Array<{
    type: 'project' | 'person' | 'deal' | 'team';
    id: string;
    name: string;
    impactDescription: string;
  }>;
  recommendedActions: Array<{
    action: string;
    targetAudience: string;        // "sales", "product", "engineering", "leadership"
    urgency: 'immediate' | 'this_week' | 'this_month';
  }>;
  deliveryPriority: 'immediate' | 'daily_briefing' | 'weekly_digest';
}

export interface CompetitorProfile {
  name: string;
  domain: string;
  trackedSince: Date;
  recentEvents: Array<{
    type: CompetitorEventType;
    title: string;
    date: Date;
    impact: string;
  }>;
  featureComparison: Record<string, {
    competitor: string;
    us: string;
    gap: 'ahead' | 'behind' | 'parity';
  }>;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface IndustryPackConfig {
  id: string;
  name: string;                    // "B2B SaaS", "FinTech", "HealthTech"
  newsSources: Array<{
    provider: string;
    feedUrl?: string;
    apiEndpoint?: string;
    refreshIntervalMin: number;
  }>;
  relevantTopics: string[];
  relevantEventTypes: IndustryEventType[];
  keyMetrics: string[];
  regulatoryBodies: string[];
  tradePublications: string[];
}

// ---------------------------------------------------------------------------
// Industry Packs (pre-configured intelligence profiles)
// ---------------------------------------------------------------------------

export const INDUSTRY_PACKS: Record<string, IndustryPackConfig> = {
  b2b_saas: {
    id: 'b2b_saas',
    name: 'B2B SaaS',
    newsSources: [
      { provider: 'techcrunch', refreshIntervalMin: 15 },
      { provider: 'crunchbase', refreshIntervalMin: 60 },
      { provider: 'producthunt', refreshIntervalMin: 30 },
      { provider: 'hackernews', refreshIntervalMin: 15 },
      { provider: 'g2_reviews', refreshIntervalMin: 360 },
      { provider: 'linkedin_jobs', refreshIntervalMin: 720 },
    ],
    relevantTopics: [
      'saas', 'arr', 'churn', 'product-led growth', 'enterprise sales',
      'ai agents', 'customer success', 'api', 'integrations', 'pricing',
      'series a', 'series b', 'series c', 'ipo', 'acquisition',
    ],
    relevantEventTypes: [
      'FUNDING_ROUND', 'PRODUCT_LAUNCH', 'ACQUISITION', 'PRICING_CHANGE',
      'LEADERSHIP_CHANGE', 'PARTNERSHIP',
    ],
    keyMetrics: ['ARR', 'NDR', 'CAC', 'LTV', 'payback_period', 'magic_number'],
    regulatoryBodies: ['FTC', 'EU_DMA', 'GDPR'],
    tradePublications: ['SaaStr', 'Point Nine', 'Tomasz Tunguz'],
  },

  fintech: {
    id: 'fintech',
    name: 'FinTech',
    newsSources: [
      { provider: 'finextra', refreshIntervalMin: 15 },
      { provider: 'sec_edgar', refreshIntervalMin: 60 },
      { provider: 'banking_dive', refreshIntervalMin: 30 },
      { provider: 'crunchbase', refreshIntervalMin: 60 },
    ],
    relevantTopics: [
      'fintech', 'banking', 'payments', 'lending', 'compliance', 'kyc',
      'aml', 'open banking', 'cryptocurrency', 'embedded finance',
      'neobank', 'regtech', 'insurtech',
    ],
    relevantEventTypes: [
      'FUNDING_ROUND', 'REGULATION_CHANGE', 'ACQUISITION', 'PARTNERSHIP',
      'SECURITY_BREACH', 'LEADERSHIP_CHANGE',
    ],
    keyMetrics: ['AUM', 'TPV', 'default_rate', 'regulatory_capital'],
    regulatoryBodies: ['SEC', 'CFPB', 'OCC', 'FDIC', 'FCA', 'EBA'],
    tradePublications: ['American Banker', 'Finextra', 'The Block'],
  },

  healthtech: {
    id: 'healthtech',
    name: 'HealthTech',
    newsSources: [
      { provider: 'stat_news', refreshIntervalMin: 30 },
      { provider: 'fda_announcements', refreshIntervalMin: 60 },
      { provider: 'cms_updates', refreshIntervalMin: 360 },
      { provider: 'crunchbase', refreshIntervalMin: 60 },
    ],
    relevantTopics: [
      'healthtech', 'digital health', 'telehealth', 'ehr', 'hipaa',
      'fda clearance', 'clinical trials', 'payer', 'provider',
      'population health', 'ai diagnostics', 'remote monitoring',
    ],
    relevantEventTypes: [
      'FUNDING_ROUND', 'REGULATION_CHANGE', 'ACQUISITION', 'PARTNERSHIP',
      'PRODUCT_LAUNCH', 'PATENT_FILING',
    ],
    keyMetrics: ['patient_outcomes', 'regulatory_timeline', 'clinical_trial_phase'],
    regulatoryBodies: ['FDA', 'CMS', 'HHS', 'ONC', 'EMA'],
    tradePublications: ['STAT News', 'Becker\'s Health IT', 'Healthcare Dive'],
  },
};

// ---------------------------------------------------------------------------
// Relevance Scoring Algorithm
// ---------------------------------------------------------------------------

export class RelevanceScoringEngine {
  constructor(
    private prisma: PrismaClient,
    private embeddingService: EmbeddingService,
  ) {}

  /**
   * Score a raw external event for relevance to a specific organization.
   *
   * The scoring algorithm combines 5 dimensions:
   * 1. Company overlap (0.35) — Is this about a customer, prospect, competitor, or partner?
   * 2. Topic overlap (0.25) — Does it relate to the org's active work?
   * 3. Role relevance (0.20) — Does it matter for specific roles in the org?
   * 4. Temporal urgency (0.10) — Is this time-sensitive?
   * 5. Network relevance (0.10) — Does it affect people in users' graphs?
   */
  async scoreForOrganization(
    event: RawExternalEvent,
    orgId: string
  ): Promise<{
    relevanceScore: number;
    breakdown: ScoredIndustrySignal['relevanceBreakdown'];
  }> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new Error(`Organization ${orgId} not found`);

    // Compute each dimension in parallel
    const [
      companyOverlap,
      topicOverlap,
      roleRelevance,
      temporalUrgency,
      networkRelevance,
    ] = await Promise.all([
      this.computeCompanyOverlap(event, org),
      this.computeTopicOverlap(event, orgId),
      this.computeRoleRelevance(event, org),
      this.computeTemporalUrgency(event),
      this.computeNetworkRelevance(event, orgId),
    ]);

    // Weighted composite
    const weights = {
      companyOverlap: 0.35,
      topicOverlap: 0.25,
      roleRelevance: 0.20,
      temporalUrgency: 0.10,
      networkRelevance: 0.10,
    };

    const relevanceScore =
      companyOverlap * weights.companyOverlap +
      topicOverlap * weights.topicOverlap +
      roleRelevance * weights.roleRelevance +
      temporalUrgency * weights.temporalUrgency +
      networkRelevance * weights.networkRelevance;

    return {
      relevanceScore,
      breakdown: {
        companyOverlap,
        topicOverlap,
        roleRelevance,
        temporalUrgency,
        networkRelevance,
      },
    };
  }

  /**
   * Dimension 1: Company Overlap
   * Checks if the event mentions a tracked company (competitor, customer, prospect, partner).
   *
   * Scoring:
   * - Direct competitor mentioned: 1.0
   * - Active customer mentioned: 0.9
   * - Prospect in pipeline mentioned: 0.8
   * - Partner mentioned: 0.7
   * - Industry peer (not tracked) mentioned: 0.3
   * - No company overlap: 0.0
   */
  private async computeCompanyOverlap(
    event: RawExternalEvent,
    org: { competitors: unknown; trackedCompanies: unknown }
  ): Promise<number> {
    const competitors = (org.competitors as string[]) || [];
    const trackedCompanies = (org.trackedCompanies as Array<{
      domain: string;
      type: 'customer' | 'prospect' | 'partner';
    }>) || [];

    const eventCompanies = event.entities
      .filter(e => e.type === 'company')
      .map(e => e.value.toLowerCase());

    const eventDomains = eventCompanies; // simplified; would use domain extraction

    // Check competitors
    for (const competitor of competitors) {
      if (eventCompanies.some(c => c.includes(competitor.toLowerCase())) ||
          event.content.toLowerCase().includes(competitor.toLowerCase())) {
        return 1.0;
      }
    }

    // Check tracked companies
    for (const tracked of trackedCompanies) {
      if (eventDomains.some(d => d.includes(tracked.domain.toLowerCase())) ||
          event.content.toLowerCase().includes(tracked.domain.toLowerCase())) {
        switch (tracked.type) {
          case 'customer': return 0.9;
          case 'prospect': return 0.8;
          case 'partner': return 0.7;
        }
      }
    }

    // Check if any company in the event is in the same industry
    // (would use industry classification in production)
    if (event.tags.some(t => t.toLowerCase().includes('saas') || t.toLowerCase().includes('ai'))) {
      return 0.3;
    }

    return 0.0;
  }

  /**
   * Dimension 2: Topic Overlap
   * Uses semantic similarity between the event content and the organization's
   * active topics (extracted from recent interactions, projects, documents).
   *
   * Algorithm:
   * 1. Get the org's topic vector (average of recent topic embeddings)
   * 2. Get the event's embedding
   * 3. Compute cosine similarity
   * 4. Boost for exact topic keyword matches
   */
  private async computeTopicOverlap(
    event: RawExternalEvent,
    orgId: string
  ): Promise<number> {
    // Get recent popular topics for the org
    const recentTopics = await this.prisma.topicInterest.findMany({
      where: {
        user: { orgId },
        lastSeen: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { weight: 'desc' },
      take: 50,
    });

    if (recentTopics.length === 0) return 0.2; // default baseline

    // Keyword matching (fast path)
    const topicNames = recentTopics.map(t => t.topic.toLowerCase());
    const eventText = `${event.title} ${event.content}`.toLowerCase();
    const keywordMatches = topicNames.filter(t => eventText.includes(t));
    const keywordScore = Math.min(1.0, keywordMatches.length / 3);

    // Semantic similarity (slow path, more accurate)
    const eventEmbedding = await this.embeddingService.embed(
      `${event.title}\n${event.content.substring(0, 1000)}`
    );

    // Compare against org's topic centroid
    // In production, this would be a pre-computed and cached centroid
    const topicText = recentTopics.map(t => t.topic).join(', ');
    const topicEmbedding = await this.embeddingService.embed(topicText);

    const semanticScore = cosineSimilarity(eventEmbedding, topicEmbedding);

    // Blend keyword and semantic scores
    return Math.min(1.0, keywordScore * 0.4 + semanticScore * 0.6);
  }

  /**
   * Dimension 3: Role Relevance
   * Determines which roles in the organization would find this event relevant.
   * Higher score if it affects more/senior roles.
   *
   * Heuristic mapping:
   * - Funding/M&A events → leadership (0.9)
   * - Product launches → product team (0.7)
   * - Security events → engineering (0.8)
   * - Pricing changes → sales (0.8)
   * - Regulatory changes → compliance/leadership (0.9)
   * - Job postings → HR/leadership (0.6)
   */
  private async computeRoleRelevance(
    event: RawExternalEvent,
    org: { companySize: string }
  ): Promise<number> {
    const eventType = this.classifyEventType(event);

    const roleRelevanceMap: Record<IndustryEventType, number> = {
      FUNDING_ROUND: 0.7,
      ACQUISITION: 0.9,
      PRODUCT_LAUNCH: 0.8,
      LEADERSHIP_CHANGE: 0.6,
      PARTNERSHIP: 0.7,
      LAYOFF: 0.5,
      PRICING_CHANGE: 0.8,
      REGULATION_CHANGE: 0.9,
      EARNINGS_REPORT: 0.5,
      SECURITY_BREACH: 0.8,
      IPO_FILING: 0.6,
      PATENT_FILING: 0.4,
      OPEN_SOURCE_RELEASE: 0.5,
    };

    return roleRelevanceMap[eventType] ?? 0.3;
  }

  /**
   * Dimension 4: Temporal Urgency
   * How time-sensitive is this event? Recent events score higher.
   * Events that require immediate response (security breach, pricing change)
   * get a boost.
   *
   * Formula: base_recency * urgency_multiplier
   */
  private async computeTemporalUrgency(event: RawExternalEvent): Promise<number> {
    const hoursAgo = (Date.now() - event.publishedAt.getTime()) / (1000 * 60 * 60);

    // Recency decay: full score within 6 hours, decays over 7 days
    const recencyScore = Math.max(0, 1.0 - (hoursAgo / 168)); // 168 hours = 7 days

    // Urgency multiplier based on event type
    const eventType = this.classifyEventType(event);
    const urgencyMultipliers: Partial<Record<IndustryEventType, number>> = {
      SECURITY_BREACH: 1.5,
      REGULATION_CHANGE: 1.3,
      PRICING_CHANGE: 1.2,
      PRODUCT_LAUNCH: 1.1,
    };

    const multiplier = urgencyMultipliers[eventType] ?? 1.0;
    return Math.min(1.0, recencyScore * multiplier);
  }

  /**
   * Dimension 5: Network Relevance
   * Does this event affect people in any user's professional graph?
   * e.g., "Your contact Sarah Chen was promoted to VP at Acme Corp"
   */
  private async computeNetworkRelevance(
    event: RawExternalEvent,
    orgId: string
  ): Promise<number> {
    const eventPeople = event.entities
      .filter(e => e.type === 'person')
      .map(e => e.value);

    if (eventPeople.length === 0) return 0.0;

    // Check if any mentioned person exists in any user's graph within this org
    const matchCount = await this.prisma.personNode.count({
      where: {
        orgId,
        OR: eventPeople.map(name => ({
          name: { contains: name, mode: 'insensitive' as any },
        })),
      },
    });

    return Math.min(1.0, matchCount / eventPeople.length);
  }

  /**
   * Classify a raw event into an IndustryEventType using keyword heuristics.
   * In production, this would use an LLM classifier.
   */
  private classifyEventType(event: RawExternalEvent): IndustryEventType {
    const text = `${event.title} ${event.content}`.toLowerCase();

    const patterns: Array<[IndustryEventType, RegExp[]]> = [
      ['FUNDING_ROUND', [/raises?\s+\$/, /series\s+[a-f]/i, /seed\s+round/, /funding/]],
      ['ACQUISITION', [/acquir/, /acquisition/, /bought\s+by/, /merged?\s+with/]],
      ['PRODUCT_LAUNCH', [/launch/, /released?/, /announced?\s+.*product/, /now\s+available/]],
      ['LEADERSHIP_CHANGE', [/appointed/, /promoted/, /hired\s+as/, /new\s+c[eo]{2}/, /steps\s+down/]],
      ['LAYOFF', [/layoff/, /laid\s+off/, /workforce\s+reduction/, /downsiz/]],
      ['PRICING_CHANGE', [/pricing/, /price\s+(increase|decrease|change)/, /new\s+pricing/]],
      ['REGULATION_CHANGE', [/regulation/, /regulatory/, /compliance/, /new\s+law/, /legislation/]],
      ['SECURITY_BREACH', [/breach/, /hack/, /data\s+leak/, /vulnerability/, /security\s+incident/]],
      ['IPO_FILING', [/ipo/, /initial\s+public\s+offering/, /s-1\s+filing/, /going\s+public/]],
      ['PATENT_FILING', [/patent/, /filed\s+patent/, /patent\s+application/]],
      ['PARTNERSHIP', [/partnership/, /partner/, /teamed\s+up/, /collaboration/, /alliance/]],
      ['EARNINGS_REPORT', [/earnings/, /quarterly\s+results/, /revenue\s+report/, /q[1-4]\s+results/]],
      ['OPEN_SOURCE_RELEASE', [/open.?source/, /github/, /released?.*under.*license/]],
    ];

    for (const [eventType, regexes] of patterns) {
      if (regexes.some(r => r.test(text))) {
        return eventType;
      }
    }

    return 'PRODUCT_LAUNCH'; // default fallback
  }
}

// ---------------------------------------------------------------------------
// Industry Intelligence Engine (Orchestrator)
// ---------------------------------------------------------------------------

export class IndustryIntelligenceEngine {
  constructor(
    private prisma: PrismaClient,
    private scoringEngine: RelevanceScoringEngine,
    private llmService: LLMService,
    private embeddingService: EmbeddingService,
    private dataProviders: DataProvider[],
  ) {}

  /**
   * Main ingestion loop. Called by scheduler every 15 minutes.
   * Fetches new events from all data sources, scores them, and stores
   * high-relevance signals.
   */
  async runIngestionCycle(orgId: string): Promise<{
    eventsProcessed: number;
    signalsCreated: number;
    competitorEventsCreated: number;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    let eventsProcessed = 0;
    let signalsCreated = 0;
    let competitorEventsCreated = 0;

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org || !org.industryPack) return { eventsProcessed: 0, signalsCreated: 0, competitorEventsCreated: 0, processingTimeMs: 0 };

    const pack = INDUSTRY_PACKS[org.industryPack];
    if (!pack) return { eventsProcessed: 0, signalsCreated: 0, competitorEventsCreated: 0, processingTimeMs: 0 };

    // Fetch events from all configured providers
    const rawEvents: RawExternalEvent[] = [];
    for (const provider of this.dataProviders) {
      if (pack.newsSources.some(s => s.provider === provider.name)) {
        try {
          const events = await provider.fetchRecent({
            topics: pack.relevantTopics,
            since: new Date(Date.now() - 60 * 60 * 1000), // last hour
          });
          rawEvents.push(...events);
        } catch (error) {
          console.error(`[IndustryIntel] Error fetching from ${provider.name}:`, error);
        }
      }
    }

    // Deduplicate across providers
    const deduped = this.deduplicateEvents(rawEvents);
    eventsProcessed = deduped.length;

    // Score each event for this organization
    for (const event of deduped) {
      const { relevanceScore, breakdown } = await this.scoringEngine.scoreForOrganization(event, orgId);

      // Only store events above relevance threshold
      if (relevanceScore < 0.3) continue;

      // Classify the event type
      const eventType = this.classifyEventType(event);

      // Generate impact assessment for high-relevance events
      let impactAssessment: string | null = null;
      let recommendedActions: unknown[] = [];
      let affectedTeams: string[] = [];

      if (relevanceScore >= 0.5) {
        const assessment = await this.llmService.assessImpact({
          event: {
            title: event.title,
            content: event.content.substring(0, 2000),
            type: eventType,
            companies: event.entities.filter(e => e.type === 'company').map(e => e.value),
          },
          orgContext: {
            industry: org.industryPack!,
            competitors: org.competitors as string[],
            trackedCompanies: org.trackedCompanies as any[],
          },
        });

        impactAssessment = assessment.analysis;
        recommendedActions = assessment.actions;
        affectedTeams = assessment.affectedTeams;
      }

      // Determine delivery priority
      const deliveryPriority = relevanceScore >= 0.8 ? 'IMMEDIATE' :
                               relevanceScore >= 0.5 ? 'DAILY_BRIEFING' :
                               'WEEKLY_DIGEST';

      // Generate embedding for deduplication and search
      const embedding = await this.embeddingService.embed(
        `${event.title}\n${event.content.substring(0, 1000)}`
      );

      // Check for near-duplicate signals already stored
      const isDuplicate = await this.checkDuplicate(orgId, embedding);
      if (isDuplicate) continue;

      // Store the industry signal
      await this.prisma.industrySignal.create({
        data: {
          orgId,
          eventType,
          title: event.title,
          summary: event.content.substring(0, 500),
          sourceUrl: event.sourceUrl,
          sourceName: event.sourceProvider,
          publishedAt: event.publishedAt,
          company: event.entities.find(e => e.type === 'company')?.value,
          relevanceScore,
          impactAssessment,
          affectedTeams,
          recommendedActions: recommendedActions as any,
          deliveryPriority: deliveryPriority as any,
          processedAt: new Date(),
        },
      });

      signalsCreated++;

      // If this is a competitor event, also create a CompetitorEvent record
      const competitors = (org.competitors as string[]) || [];
      const mentionedCompetitor = event.entities
        .filter(e => e.type === 'company')
        .find(e => competitors.some(c => e.value.toLowerCase().includes(c.toLowerCase())));

      if (mentionedCompetitor) {
        await this.createCompetitorEvent(orgId, event, mentionedCompetitor.value, impactAssessment);
        competitorEventsCreated++;
      }
    }

    return {
      eventsProcessed,
      signalsCreated,
      competitorEventsCreated,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Generate a competitor intelligence brief.
   * Synthesizes recent competitor events into a strategic overview.
   */
  async generateCompetitorBrief(
    orgId: string,
    competitorDomain: string,
    timeRangeDays: number = 30
  ): Promise<{
    competitor: string;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    summary: string;
    recentMoves: Array<{ type: string; title: string; date: Date; impact: string }>;
    strategicImplications: string[];
    recommendedResponses: string[];
  }> {
    const events = await this.prisma.competitorEvent.findMany({
      where: {
        orgId,
        competitorDomain: { contains: competitorDomain, mode: 'insensitive' },
        detectedAt: {
          gte: new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { detectedAt: 'desc' },
      take: 20,
    });

    // Compute threat level based on event frequency and severity
    const threatScore = events.reduce((sum, e) => sum + e.relevanceScore, 0) / Math.max(events.length, 1);
    const eventFrequency = events.length / timeRangeDays; // events per day

    const threatLevel: 'low' | 'medium' | 'high' | 'critical' =
      threatScore > 0.8 && eventFrequency > 0.5 ? 'critical' :
      threatScore > 0.6 || eventFrequency > 0.3 ? 'high' :
      threatScore > 0.4 || eventFrequency > 0.1 ? 'medium' :
      'low';

    // Generate strategic brief with LLM
    const brief = await this.llmService.generateCompetitorBrief({
      competitor: competitorDomain,
      events: events.map(e => ({
        type: e.eventType,
        title: e.title,
        description: e.description,
        date: e.detectedAt,
      })),
      threatLevel,
    });

    return {
      competitor: competitorDomain,
      threatLevel,
      summary: brief.summary,
      recentMoves: events.map(e => ({
        type: e.eventType,
        title: e.title,
        date: e.detectedAt,
        impact: e.impactAnalysis ?? '',
      })),
      strategicImplications: brief.strategicImplications,
      recommendedResponses: brief.recommendedResponses,
    };
  }

  /**
   * Get the industry intelligence briefing for a user's daily digest.
   * Returns top-N most relevant signals from the last 24 hours.
   */
  async getDailyBriefingSignals(
    userId: string,
    orgId: string,
    maxSignals: number = 5
  ): Promise<ScoredIndustrySignal[]> {
    const signals = await this.prisma.industrySignal.findMany({
      where: {
        orgId,
        processedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        relevanceScore: { gte: 0.4 },
        NOT: {
          deliveredToUsers: { has: userId },
        },
      },
      orderBy: { relevanceScore: 'desc' },
      take: maxSignals,
    });

    // Mark as delivered to this user
    for (const signal of signals) {
      await this.prisma.industrySignal.update({
        where: { id: signal.id },
        data: {
          deliveredToUsers: { push: userId },
        },
      });
    }

    return signals.map(s => ({
      event: {
        id: s.id,
        sourceProvider: s.sourceName ?? '',
        sourceUrl: s.sourceUrl ?? '',
        title: s.title,
        content: s.summary,
        publishedAt: s.publishedAt,
        fetchedAt: s.createdAt,
        entities: [],
        tags: [],
        rawPayload: {},
      },
      eventType: s.eventType,
      relevanceScore: s.relevanceScore,
      relevanceBreakdown: {
        companyOverlap: 0, topicOverlap: 0, roleRelevance: 0,
        temporalUrgency: 0, networkRelevance: 0,
      },
      impactAssessment: s.impactAssessment ?? '',
      affectedInternalEntities: [],
      recommendedActions: (s.recommendedActions as any[]) ?? [],
      deliveryPriority: s.deliveryPriority === 'IMMEDIATE' ? 'immediate' :
                        s.deliveryPriority === 'DAILY_BRIEFING' ? 'daily_briefing' :
                        'weekly_digest',
    }));
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private deduplicateEvents(events: RawExternalEvent[]): RawExternalEvent[] {
    const seen = new Map<string, RawExternalEvent>();
    for (const event of events) {
      const key = `${event.title.substring(0, 50)}_${event.publishedAt.toISOString().substring(0, 10)}`;
      if (!seen.has(key)) {
        seen.set(key, event);
      }
    }
    return Array.from(seen.values());
  }

  private classifyEventType(event: RawExternalEvent): IndustryEventType {
    const text = `${event.title} ${event.content}`.toLowerCase();
    const patterns: Array<[IndustryEventType, RegExp]> = [
      ['FUNDING_ROUND', /raises?\s+\$|series\s+[a-f]|seed\s+round|funding/i],
      ['ACQUISITION', /acquir|acquisition|bought\s+by/i],
      ['PRODUCT_LAUNCH', /launch|released?|now\s+available/i],
      ['LEADERSHIP_CHANGE', /appointed|promoted|hired\s+as|new\s+ceo/i],
      ['LAYOFF', /layoff|laid\s+off|workforce\s+reduction/i],
      ['PRICING_CHANGE', /pricing|price\s+(increase|decrease)/i],
      ['REGULATION_CHANGE', /regulation|regulatory|compliance/i],
      ['SECURITY_BREACH', /breach|hack|data\s+leak|vulnerability/i],
    ];

    for (const [type, regex] of patterns) {
      if (regex.test(text)) return type;
    }
    return 'PRODUCT_LAUNCH';
  }

  private async checkDuplicate(orgId: string, embedding: number[]): Promise<boolean> {
    // Check for near-duplicate using vector similarity
    const nearDuplicates = await this.prisma.$queryRaw<Array<{ similarity: number }>>`
      SELECT 1 - (embedding <=> ${embedding}::vector) as similarity
      FROM industry_signals
      WHERE org_id = ${orgId}::uuid
        AND created_at > NOW() - INTERVAL '7 days'
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embedding}::vector
      LIMIT 1
    `;

    return nearDuplicates.length > 0 && nearDuplicates[0].similarity > 0.92;
  }

  private async createCompetitorEvent(
    orgId: string,
    event: RawExternalEvent,
    competitorName: string,
    impactAnalysis: string | null
  ): Promise<void> {
    await this.prisma.competitorEvent.create({
      data: {
        orgId,
        competitorName,
        eventType: this.mapToCompetitorEventType(event),
        title: event.title,
        description: event.content.substring(0, 1000),
        sourceUrl: event.sourceUrl,
        relevanceScore: 0.8, // competitor events are inherently high-relevance
        impactAnalysis,
      },
    });
  }

  private mapToCompetitorEventType(event: RawExternalEvent): CompetitorEventType {
    const eventType = this.classifyEventType(event);
    const mapping: Record<string, CompetitorEventType> = {
      PRODUCT_LAUNCH: 'FEATURE_LAUNCH',
      PRICING_CHANGE: 'PRICING_CHANGE',
      FUNDING_ROUND: 'FUNDING',
      ACQUISITION: 'ACQUISITION',
      LEADERSHIP_CHANGE: 'KEY_HIRE',
      PARTNERSHIP: 'PARTNERSHIP',
      SECURITY_BREACH: 'SECURITY_INCIDENT',
    };
    return mapping[eventType] ?? 'FEATURE_LAUNCH';
  }
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// ---------------------------------------------------------------------------
// External service interfaces (injected)
// ---------------------------------------------------------------------------

export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
}

export interface LLMService {
  assessImpact(params: {
    event: {
      title: string;
      content: string;
      type: IndustryEventType;
      companies: string[];
    };
    orgContext: {
      industry: string;
      competitors: string[];
      trackedCompanies: any[];
    };
  }): Promise<{
    analysis: string;
    actions: Array<{ action: string; targetAudience: string; urgency: string }>;
    affectedTeams: string[];
  }>;

  generateCompetitorBrief(params: {
    competitor: string;
    events: Array<{ type: string; title: string; description: string; date: Date }>;
    threatLevel: string;
  }): Promise<{
    summary: string;
    strategicImplications: string[];
    recommendedResponses: string[];
  }>;
}

export interface DataProvider {
  name: string;
  fetchRecent(params: {
    topics: string[];
    since: Date;
  }): Promise<RawExternalEvent[]>;
}
