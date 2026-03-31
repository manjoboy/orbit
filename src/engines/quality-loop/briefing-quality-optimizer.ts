// ============================================================================
// BRIEFING QUALITY OPTIMIZER
// ============================================================================
// Self-improving loop for the daily briefing — inspired by how Cursor uses
// inference to improve its composer. The core idea:
//
// 1. GENERATE the briefing
// 2. EVALUATE it using a critic model (separate LLM pass)
// 3. REWRITE sections that score below threshold
// 4. LEARN from user behavior to improve future generations
//
// This creates a flywheel where each briefing is better than the last,
// both within a single generation (inference-time improvement) and across
// generations (learned preferences).
// ============================================================================

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single section of the briefing that can be independently evaluated
 * and rewritten.
 */
export interface BriefingSection {
  id: string;
  type: BriefingSectionType;
  title: string;
  content: unknown;           // section-specific structured content
  renderedMarkdown: string;   // the human-readable version
  metadata: {
    itemCount: number;
    dataSourcesUsed: string[];
    generationTimeMs: number;
  };
}

export type BriefingSectionType =
  | 'priority_inbox'
  | 'meeting_prep'
  | 'project_updates'
  | 'relationship_alerts'
  | 'industry_intel'
  | 'deadlines'
  | 'strategic_alignment'
  | 'wellbeing_check'
  | 'anticipations';

/**
 * Quality evaluation for a single section.
 */
export interface SectionEvaluation {
  sectionId: string;
  sectionType: BriefingSectionType;

  // Scoring dimensions (each 0-1)
  scores: {
    relevance: number;       // Is this actually useful to the user today?
    actionability: number;   // Can the user DO something with this?
    specificity: number;     // Is this generic platitude or specific insight?
    novelty: number;         // Does this tell the user something they don't already know?
    calibration: number;     // Is the urgency/priority accurately calibrated?
    conciseness: number;     // Is this the right length? Not too verbose?
  };

  compositeScore: number;    // Weighted average
  passesThreshold: boolean;  // Above minimum quality bar?
  reasoning: string;         // Why the critic scored it this way
  rewriteSuggestion?: string; // How to improve it (if below threshold)
}

/**
 * Full briefing evaluation.
 */
export interface BriefingEvaluation {
  briefingId: string;
  userId: string;
  generatedAt: Date;
  evaluatedAt: Date;

  // Per-section evaluations
  sectionEvaluations: SectionEvaluation[];

  // Overall evaluation
  overallScore: number;
  sectionsThatNeedRewrite: string[];

  // Cross-section analysis
  crossSectionIssues: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
  }>;

  // Comparison to user's historical preferences
  personalizedFeedback: {
    tooLong: boolean;
    tooShort: boolean;
    missingPreferredSections: string[];
    overweightedSections: string[];
  };
}

/**
 * User behavior signal captured from briefing interaction.
 * These signals feed the learning loop.
 */
export interface BriefingInteractionSignal {
  userId: string;
  briefingId: string;
  sectionType: BriefingSectionType;
  signalType: InteractionSignalType;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export type InteractionSignalType =
  | 'section_viewed'         // user scrolled to this section
  | 'section_skipped'        // user scrolled past without pausing
  | 'section_expanded'       // user clicked to see more
  | 'section_collapsed'      // user collapsed an expanded section
  | 'item_clicked'           // user clicked a specific item
  | 'item_acted_on'          // user took the suggested action
  | 'item_dismissed'         // user explicitly dismissed an item
  | 'item_snoozed'           // user snoozed for later
  | 'section_time_spent'     // time spent reading this section
  | 'briefing_completed'     // user read the entire briefing
  | 'briefing_abandoned'     // user left before finishing
  | 'explicit_feedback'      // user clicked thumbs up/down
  | 'draft_edited'           // user edited an AI-generated draft
  | 'draft_sent_as_is';      // user sent draft without editing

/**
 * Learned preferences for a user, derived from interaction signals.
 */
export interface UserBriefingPreferences {
  userId: string;
  lastUpdated: Date;

  // Section preferences (learned weights)
  sectionWeights: Record<BriefingSectionType, number>; // 0-1 importance

  // Content preferences
  preferredBriefingLength: 'concise' | 'standard' | 'detailed';
  preferredItemsPerSection: Record<BriefingSectionType, number>;
  urgencyCalibration: number;  // how much to shift urgency scores (-0.5 to 0.5)

  // Topics the user consistently engages with
  highEngagementTopics: string[];
  // Topics the user consistently ignores
  lowEngagementTopics: string[];

  // People the user cares about most (learned from clicks/actions)
  highPriorityPeople: string[];

  // Time patterns
  averageBriefingReadTimeSeconds: number;
  averageCompletionRate: number;  // % of briefing typically read

  // Quality thresholds (learned from explicit feedback)
  qualityThresholds: {
    minRelevance: number;
    minActionability: number;
    minNovelty: number;
  };
}

// ---------------------------------------------------------------------------
// Quality Evaluation Prompts
// ---------------------------------------------------------------------------

const CRITIC_SYSTEM_PROMPT = `You are a quality evaluator for a personal chief-of-staff AI briefing system. Your job is to evaluate whether each section of a daily briefing is genuinely useful to the user.

You must be BRUTALLY HONEST. Most AI-generated content is too generic, too verbose, and not specific enough. Your job is to catch these failures.

Scoring dimensions (each 0.0 to 1.0):

RELEVANCE (0-1): Does this matter to the user TODAY?
- 1.0: Directly impacts something the user is working on today
- 0.5: Generally useful context but not urgent
- 0.0: Irrelevant filler content

ACTIONABILITY (0-1): Can the user DO something with this information?
- 1.0: Clear next action with specific details (who, what, when)
- 0.5: Suggests awareness but no clear action
- 0.0: Pure information dump with no action path

SPECIFICITY (0-1): Is this specific and concrete, or vague and generic?
- 1.0: Names specific people, projects, numbers, dates
- 0.5: Somewhat specific but missing key details
- 0.0: Could apply to literally anyone ("Stay organized!" "Keep track of deadlines!")

NOVELTY (0-1): Does this tell the user something they don't already know?
- 1.0: Information the user couldn't have gotten by checking their tools
- 0.5: Aggregation of known info, saves time but not surprising
- 0.0: States the obvious or repeats what user already saw

CALIBRATION (0-1): Is the urgency/priority level accurate?
- 1.0: Priority perfectly matches actual importance
- 0.5: Slightly over or under-weighted
- 0.0: Massively miscalibrated (marking trivial things as urgent, or missing real urgency)

CONCISENESS (0-1): Is the length appropriate?
- 1.0: Every word earns its place
- 0.5: Some padding but core message is there
- 0.0: Wall of text that buries the key insight`;

const REWRITE_SYSTEM_PROMPT = `You are a senior editor improving a personal briefing section. You have the original section, the critic's evaluation, and the user's learned preferences.

Rules:
1. Be MORE specific, not less. Add names, numbers, dates.
2. Lead with the action, not the context. What should they DO?
3. If something scores low on novelty, either add a genuine insight or cut it entirely.
4. Match the user's preferred length (concise/standard/detailed).
5. Every item must pass the "so what?" test — if the user would shrug, cut it.
6. Use the user's communication style (if available).`;

// ---------------------------------------------------------------------------
// Briefing Quality Optimizer
// ---------------------------------------------------------------------------

export class BriefingQualityOptimizer {
  // Minimum quality score for a section to pass without rewrite
  private static QUALITY_THRESHOLD = 0.6;
  // Maximum number of rewrite iterations per section
  private static MAX_REWRITES = 2;
  // Minimum improvement needed to accept a rewrite
  private static MIN_IMPROVEMENT = 0.1;

  constructor(
    private prisma: PrismaClient,
    private llmService: LLMService,
    private feedbackStore: FeedbackStore,
  ) {}

  // =========================================================================
  // PHASE 1: EVALUATE (Critic Pass)
  // =========================================================================

  /**
   * Run the critic model over a generated briefing.
   * This is a separate LLM call that evaluates quality WITHOUT seeing
   * the generation prompt — preventing the model from grading its own work.
   */
  async evaluateBriefing(
    briefingId: string,
    userId: string,
    sections: BriefingSection[]
  ): Promise<BriefingEvaluation> {
    const startTime = Date.now();

    // Load user preferences for personalized evaluation
    const preferences = await this.loadUserPreferences(userId);

    // Evaluate each section independently
    const sectionEvaluations = await Promise.all(
      sections.map(section => this.evaluateSection(section, preferences))
    );

    // Cross-section analysis
    const crossSectionIssues = this.analyzeCrossSectionIssues(sectionEvaluations, preferences);

    // Overall scoring
    const sectionScores = sectionEvaluations.map(e => e.compositeScore);
    const overallScore = sectionScores.reduce((sum, s) => sum + s, 0) / sectionScores.length;

    const evaluation: BriefingEvaluation = {
      briefingId,
      userId,
      generatedAt: new Date(),
      evaluatedAt: new Date(),
      sectionEvaluations,
      overallScore,
      sectionsThatNeedRewrite: sectionEvaluations
        .filter(e => !e.passesThreshold)
        .map(e => e.sectionId),
      crossSectionIssues,
      personalizedFeedback: this.generatePersonalizedFeedback(sectionEvaluations, preferences),
    };

    // Store evaluation for learning
    await this.storeEvaluation(evaluation);

    return evaluation;
  }

  /**
   * Evaluate a single section using the critic model.
   */
  private async evaluateSection(
    section: BriefingSection,
    preferences: UserBriefingPreferences | null
  ): Promise<SectionEvaluation> {
    const criticResponse = await this.llmService.evaluate({
      systemPrompt: CRITIC_SYSTEM_PROMPT,
      userPrompt: `Evaluate this briefing section:

SECTION TYPE: ${section.type}
SECTION TITLE: ${section.title}
ITEM COUNT: ${section.metadata.itemCount}

CONTENT:
${section.renderedMarkdown}

${preferences ? `
USER PREFERENCES:
- Preferred briefing style: ${preferences.preferredBriefingLength}
- High-engagement topics: ${preferences.highEngagementTopics.join(', ') || 'unknown'}
- Low-engagement topics: ${preferences.lowEngagementTopics.join(', ') || 'none'}
- Average read time: ${preferences.averageBriefingReadTimeSeconds}s
- Preferred items per section: ${preferences.preferredItemsPerSection[section.type] ?? 'unknown'}
` : ''}

Respond in JSON format:
{
  "relevance": <0-1>,
  "actionability": <0-1>,
  "specificity": <0-1>,
  "novelty": <0-1>,
  "calibration": <0-1>,
  "conciseness": <0-1>,
  "reasoning": "<one paragraph explaining your scores>",
  "rewrite_suggestion": "<if composite < 0.6, how to improve>"
}`,
    });

    const scores = criticResponse.scores;
    const weights = {
      relevance: 0.25,
      actionability: 0.20,
      specificity: 0.20,
      novelty: 0.15,
      calibration: 0.10,
      conciseness: 0.10,
    };

    const compositeScore =
      scores.relevance * weights.relevance +
      scores.actionability * weights.actionability +
      scores.specificity * weights.specificity +
      scores.novelty * weights.novelty +
      scores.calibration * weights.calibration +
      scores.conciseness * weights.conciseness;

    return {
      sectionId: section.id,
      sectionType: section.type,
      scores,
      compositeScore,
      passesThreshold: compositeScore >= BriefingQualityOptimizer.QUALITY_THRESHOLD,
      reasoning: criticResponse.reasoning,
      rewriteSuggestion: criticResponse.rewriteSuggestion,
    };
  }

  // =========================================================================
  // PHASE 2: REWRITE (Improvement Pass)
  // =========================================================================

  /**
   * Rewrite sections that scored below the quality threshold.
   * Uses the critic's feedback to guide the rewrite.
   * Can iterate up to MAX_REWRITES times per section.
   */
  async rewriteFailingSections(
    sections: BriefingSection[],
    evaluation: BriefingEvaluation,
    userId: string
  ): Promise<{
    improvedSections: BriefingSection[];
    rewriteLog: Array<{
      sectionId: string;
      iteration: number;
      beforeScore: number;
      afterScore: number;
      improved: boolean;
    }>;
  }> {
    const preferences = await this.loadUserPreferences(userId);
    const improvedSections = [...sections];
    const rewriteLog: Array<{
      sectionId: string;
      iteration: number;
      beforeScore: number;
      afterScore: number;
      improved: boolean;
    }> = [];

    for (const sectionEval of evaluation.sectionEvaluations) {
      if (sectionEval.passesThreshold) continue;

      const sectionIndex = improvedSections.findIndex(s => s.id === sectionEval.sectionId);
      if (sectionIndex === -1) continue;

      let currentSection = improvedSections[sectionIndex];
      let currentScore = sectionEval.compositeScore;
      let currentEval = sectionEval;

      // Iterative improvement loop
      for (let iteration = 0; iteration < BriefingQualityOptimizer.MAX_REWRITES; iteration++) {
        // Generate rewrite
        const rewrittenSection = await this.rewriteSection(
          currentSection,
          currentEval,
          preferences
        );

        // Re-evaluate the rewrite
        const newEval = await this.evaluateSection(rewrittenSection, preferences);

        const improvement = newEval.compositeScore - currentScore;

        rewriteLog.push({
          sectionId: sectionEval.sectionId,
          iteration: iteration + 1,
          beforeScore: currentScore,
          afterScore: newEval.compositeScore,
          improved: improvement >= BriefingQualityOptimizer.MIN_IMPROVEMENT,
        });

        // Accept rewrite only if it's meaningfully better
        if (improvement >= BriefingQualityOptimizer.MIN_IMPROVEMENT) {
          currentSection = rewrittenSection;
          currentScore = newEval.compositeScore;
          currentEval = newEval;
          improvedSections[sectionIndex] = rewrittenSection;
        }

        // Stop if we've passed the threshold or aren't improving
        if (newEval.passesThreshold || improvement < BriefingQualityOptimizer.MIN_IMPROVEMENT) {
          break;
        }
      }
    }

    return { improvedSections, rewriteLog };
  }

  /**
   * Rewrite a single section based on critic feedback.
   */
  private async rewriteSection(
    section: BriefingSection,
    evaluation: SectionEvaluation,
    preferences: UserBriefingPreferences | null
  ): Promise<BriefingSection> {
    // Identify the weakest dimensions to focus the rewrite
    const weakDimensions = Object.entries(evaluation.scores)
      .filter(([_, score]) => score < 0.5)
      .sort((a, b) => a[1] - b[1])
      .map(([dim, score]) => `${dim}: ${score.toFixed(2)}`);

    const rewriteResponse = await this.llmService.rewrite({
      systemPrompt: REWRITE_SYSTEM_PROMPT,
      userPrompt: `Rewrite this briefing section to improve quality.

ORIGINAL SECTION:
${section.renderedMarkdown}

CRITIC EVALUATION:
- Overall score: ${evaluation.compositeScore.toFixed(2)} (threshold: ${BriefingQualityOptimizer.QUALITY_THRESHOLD})
- Weakest dimensions: ${weakDimensions.join(', ')}
- Critic reasoning: ${evaluation.reasoning}
- Rewrite suggestion: ${evaluation.rewriteSuggestion ?? 'No specific suggestion'}

${preferences ? `
USER PREFERENCES:
- Style: ${preferences.preferredBriefingLength}
- Max items: ${preferences.preferredItemsPerSection[section.type] ?? 5}
- High-priority people: ${preferences.highPriorityPeople.join(', ') || 'unknown'}
` : ''}

Focus on improving: ${weakDimensions.slice(0, 3).join(', ')}

Return the improved section in the same format.`,
    });

    return {
      ...section,
      renderedMarkdown: rewriteResponse.content,
      metadata: {
        ...section.metadata,
        generationTimeMs: section.metadata.generationTimeMs + rewriteResponse.generationTimeMs,
      },
    };
  }

  // =========================================================================
  // PHASE 3: LEARN (Feedback Loop)
  // =========================================================================

  /**
   * Process a user interaction signal and update preferences.
   * Called in real-time as the user interacts with the briefing.
   */
  async processInteractionSignal(signal: BriefingInteractionSignal): Promise<void> {
    // Store the raw signal
    await this.feedbackStore.storeSignal(signal);

    // Immediate preference updates for strong signals
    switch (signal.signalType) {
      case 'item_dismissed':
        // User explicitly said "not useful" — decrease weight for this type
        await this.adjustSectionWeight(signal.userId, signal.sectionType, -0.05);
        break;

      case 'item_acted_on':
        // User found this valuable enough to act on — increase weight
        await this.adjustSectionWeight(signal.userId, signal.sectionType, 0.03);
        break;

      case 'draft_sent_as_is':
        // User trusted the AI draft completely — strong positive signal
        await this.adjustSectionWeight(signal.userId, signal.sectionType, 0.05);
        break;

      case 'draft_edited':
        // User edited the draft — useful but not perfect. Store the delta
        // for voice/style learning
        await this.learnFromDraftEdit(signal);
        break;

      case 'section_skipped':
        // User didn't engage — weak negative signal
        await this.adjustSectionWeight(signal.userId, signal.sectionType, -0.02);
        break;

      case 'section_expanded':
        // User wanted more detail — this section is too concise for them
        await this.adjustPreferredItemCount(signal.userId, signal.sectionType, 1);
        break;

      case 'explicit_feedback':
        // Thumbs up/down — strongest signal
        const isPositive = signal.metadata.feedback === 'positive';
        await this.adjustSectionWeight(
          signal.userId,
          signal.sectionType,
          isPositive ? 0.08 : -0.08
        );
        break;

      case 'briefing_abandoned':
        // User didn't finish — briefing is too long or front-loaded wrong
        await this.handleBriefingAbandonment(signal);
        break;
    }
  }

  /**
   * Nightly learning job: analyze the day's interaction signals and
   * update the user's briefing preferences model.
   *
   * This is the "across-generation" learning loop.
   */
  async runNightlyLearning(userId: string): Promise<{
    preferencesUpdated: boolean;
    changesApplied: string[];
  }> {
    const changesApplied: string[] = [];

    // Get the last 7 days of interaction signals
    const recentSignals = await this.feedbackStore.getRecentSignals(userId, 7);

    if (recentSignals.length < 10) {
      return { preferencesUpdated: false, changesApplied: [] };
    }

    const preferences = await this.loadUserPreferences(userId) ?? this.defaultPreferences(userId);

    // ─── LEARNING 1: Section weight optimization ───
    const sectionEngagement = this.computeSectionEngagement(recentSignals);
    for (const [sectionType, engagement] of Object.entries(sectionEngagement)) {
      const currentWeight = preferences.sectionWeights[sectionType as BriefingSectionType] ?? 0.5;
      const targetWeight = Math.max(0.1, Math.min(1.0,
        currentWeight * 0.8 + engagement * 0.2 // EMA blend
      ));

      if (Math.abs(targetWeight - currentWeight) > 0.03) {
        preferences.sectionWeights[sectionType as BriefingSectionType] = targetWeight;
        changesApplied.push(
          `${sectionType} weight: ${currentWeight.toFixed(2)} → ${targetWeight.toFixed(2)}`
        );
      }
    }

    // ─── LEARNING 2: Optimal briefing length ───
    const completionRates = recentSignals
      .filter(s => s.signalType === 'briefing_completed' || s.signalType === 'briefing_abandoned')
      .map(s => s.signalType === 'briefing_completed' ? 1.0 : (s.metadata.scrollDepth as number ?? 0.5));

    if (completionRates.length >= 3) {
      const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
      preferences.averageCompletionRate = avgCompletion;

      if (avgCompletion < 0.5 && preferences.preferredBriefingLength !== 'concise') {
        preferences.preferredBriefingLength = 'concise';
        changesApplied.push('Switched to concise briefing (low completion rate)');
      } else if (avgCompletion > 0.9 && preferences.preferredBriefingLength === 'concise') {
        preferences.preferredBriefingLength = 'standard';
        changesApplied.push('Switched to standard briefing (high completion rate)');
      }
    }

    // ─── LEARNING 3: Topic engagement patterns ───
    const topicEngagement = this.computeTopicEngagement(recentSignals);

    preferences.highEngagementTopics = topicEngagement
      .filter(t => t.engagementRate > 0.7)
      .map(t => t.topic)
      .slice(0, 20);

    preferences.lowEngagementTopics = topicEngagement
      .filter(t => t.engagementRate < 0.2)
      .map(t => t.topic)
      .slice(0, 20);

    // ─── LEARNING 4: Urgency calibration ───
    // If users consistently act on low-urgency items and ignore high-urgency ones,
    // our urgency model is miscalibrated
    const urgencyActions = recentSignals.filter(s =>
      s.signalType === 'item_acted_on' || s.signalType === 'item_dismissed'
    );

    if (urgencyActions.length >= 10) {
      const actedOnUrgencies = urgencyActions
        .filter(s => s.signalType === 'item_acted_on')
        .map(s => s.metadata.urgencyScore as number ?? 0.5);

      const dismissedUrgencies = urgencyActions
        .filter(s => s.signalType === 'item_dismissed')
        .map(s => s.metadata.urgencyScore as number ?? 0.5);

      const avgActedUrgency = actedOnUrgencies.length > 0
        ? actedOnUrgencies.reduce((a, b) => a + b, 0) / actedOnUrgencies.length
        : 0.5;
      const avgDismissedUrgency = dismissedUrgencies.length > 0
        ? dismissedUrgencies.reduce((a, b) => a + b, 0) / dismissedUrgencies.length
        : 0.5;

      // If user acts on low-urgency items more than high-urgency ones,
      // our urgency model needs recalibration
      if (avgDismissedUrgency > avgActedUrgency + 0.1) {
        preferences.urgencyCalibration -= 0.05;
        changesApplied.push('Adjusted urgency calibration down (user acts on lower-urgency items)');
      }
    }

    // ─── LEARNING 5: People importance ───
    const peopleEngagement = recentSignals
      .filter(s => s.metadata.personName && s.signalType === 'item_acted_on')
      .reduce((acc, s) => {
        const name = s.metadata.personName as string;
        acc.set(name, (acc.get(name) ?? 0) + 1);
        return acc;
      }, new Map<string, number>());

    preferences.highPriorityPeople = Array.from(peopleEngagement.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name]) => name);

    // ─── LEARNING 6: Quality threshold adaptation ───
    // Use explicit feedback to adjust what the user considers "good enough"
    const feedbackSignals = recentSignals.filter(s => s.signalType === 'explicit_feedback');
    const positiveScores = feedbackSignals
      .filter(s => s.metadata.feedback === 'positive')
      .map(s => s.metadata.sectionScore as number ?? 0.7);
    const negativeScores = feedbackSignals
      .filter(s => s.metadata.feedback === 'negative')
      .map(s => s.metadata.sectionScore as number ?? 0.4);

    if (positiveScores.length >= 3 && negativeScores.length >= 2) {
      // The threshold should be between the avg negative score and avg positive score
      const avgPositive = positiveScores.reduce((a, b) => a + b, 0) / positiveScores.length;
      const avgNegative = negativeScores.reduce((a, b) => a + b, 0) / negativeScores.length;
      const optimalThreshold = (avgPositive + avgNegative) / 2;

      preferences.qualityThresholds.minRelevance = Math.max(0.3, optimalThreshold - 0.1);
      preferences.qualityThresholds.minActionability = Math.max(0.3, optimalThreshold - 0.05);
      changesApplied.push(`Quality threshold adjusted to ${optimalThreshold.toFixed(2)}`);
    }

    // Save updated preferences
    preferences.lastUpdated = new Date();
    await this.saveUserPreferences(preferences);

    return {
      preferencesUpdated: changesApplied.length > 0,
      changesApplied,
    };
  }

  // =========================================================================
  // FULL OPTIMIZE PIPELINE
  // =========================================================================

  /**
   * The complete optimization loop. Called after the briefing generator
   * produces a draft briefing.
   *
   * Flow:
   * 1. Convert briefing to sections
   * 2. Evaluate each section with critic
   * 3. Rewrite failing sections (up to 2 iterations each)
   * 4. Apply personalization adjustments
   * 5. Return optimized briefing
   */
  async optimizeBriefing(
    briefingId: string,
    userId: string,
    rawSections: BriefingSection[]
  ): Promise<{
    optimizedSections: BriefingSection[];
    evaluation: BriefingEvaluation;
    rewriteLog: Array<{
      sectionId: string;
      iteration: number;
      beforeScore: number;
      afterScore: number;
      improved: boolean;
    }>;
    totalOptimizationTimeMs: number;
  }> {
    const startTime = Date.now();

    // Step 1: Load user preferences
    const preferences = await this.loadUserPreferences(userId);

    // Step 2: Pre-filter sections based on learned weights
    let filteredSections = rawSections;
    if (preferences) {
      filteredSections = this.applyPersonalization(rawSections, preferences);
    }

    // Step 3: Evaluate the draft
    const evaluation = await this.evaluateBriefing(briefingId, userId, filteredSections);

    // Step 4: Rewrite failing sections
    let optimizedSections = filteredSections;
    let rewriteLog: Array<{
      sectionId: string;
      iteration: number;
      beforeScore: number;
      afterScore: number;
      improved: boolean;
    }> = [];

    if (evaluation.sectionsThatNeedRewrite.length > 0) {
      const rewriteResult = await this.rewriteFailingSections(
        filteredSections,
        evaluation,
        userId
      );
      optimizedSections = rewriteResult.improvedSections;
      rewriteLog = rewriteResult.rewriteLog;
    }

    // Step 5: Apply cross-section ordering optimization
    optimizedSections = this.optimizeSectionOrder(optimizedSections, preferences);

    return {
      optimizedSections,
      evaluation,
      rewriteLog,
      totalOptimizationTimeMs: Date.now() - startTime,
    };
  }

  // =========================================================================
  // Personalization Helpers
  // =========================================================================

  /**
   * Apply learned preferences to filter and adjust sections.
   */
  private applyPersonalization(
    sections: BriefingSection[],
    preferences: UserBriefingPreferences
  ): BriefingSection[] {
    return sections
      // Remove sections the user consistently ignores (weight < 0.15)
      .filter(s => (preferences.sectionWeights[s.type] ?? 0.5) >= 0.15)
      // Adjust item counts based on learned preferences
      .map(s => {
        const preferredCount = preferences.preferredItemsPerSection[s.type];
        if (preferredCount && s.metadata.itemCount > preferredCount) {
          // Truncate to preferred count
          // In production, this would intelligently select the top N items
          return {
            ...s,
            metadata: { ...s.metadata, itemCount: preferredCount },
          };
        }
        return s;
      });
  }

  /**
   * Order sections by user preference weight (highest engagement first).
   */
  private optimizeSectionOrder(
    sections: BriefingSection[],
    preferences: UserBriefingPreferences | null
  ): BriefingSection[] {
    if (!preferences) return sections;

    return [...sections].sort((a, b) => {
      const weightA = preferences.sectionWeights[a.type] ?? 0.5;
      const weightB = preferences.sectionWeights[b.type] ?? 0.5;
      return weightB - weightA;
    });
  }

  // =========================================================================
  // Cross-Section Analysis
  // =========================================================================

  private analyzeCrossSectionIssues(
    evaluations: SectionEvaluation[],
    preferences: UserBriefingPreferences | null
  ): BriefingEvaluation['crossSectionIssues'] {
    const issues: BriefingEvaluation['crossSectionIssues'] = [];

    // Check for overall length issues
    const totalItems = evaluations.reduce((sum, e) =>
      sum + (e.scores.conciseness < 0.4 ? 1 : 0), 0);
    if (totalItems > 3) {
      issues.push({
        issue: 'Multiple sections are too verbose',
        severity: 'medium',
        suggestion: 'Reduce item counts across the board or switch to concise mode',
      });
    }

    // Check for novelty drought
    const avgNovelty = evaluations.reduce((sum, e) => sum + e.scores.novelty, 0) / evaluations.length;
    if (avgNovelty < 0.4) {
      issues.push({
        issue: 'Low novelty across the briefing — too much rehashing of known info',
        severity: 'high',
        suggestion: 'Focus on cross-tool synthesis and genuine insights, not summaries',
      });
    }

    // Check for urgency inflation
    const highUrgencySections = evaluations.filter(e => e.scores.calibration < 0.4);
    if (highUrgencySections.length > 2) {
      issues.push({
        issue: 'Urgency inflation — too many items marked as high priority',
        severity: 'medium',
        suggestion: 'Recalibrate priority scoring. If everything is urgent, nothing is.',
      });
    }

    return issues;
  }

  // =========================================================================
  // Signal Analysis
  // =========================================================================

  private computeSectionEngagement(
    signals: BriefingInteractionSignal[]
  ): Record<string, number> {
    const sectionStats = new Map<string, { views: number; actions: number; dismissals: number }>();

    for (const signal of signals) {
      if (!sectionStats.has(signal.sectionType)) {
        sectionStats.set(signal.sectionType, { views: 0, actions: 0, dismissals: 0 });
      }
      const stats = sectionStats.get(signal.sectionType)!;

      if (signal.signalType === 'section_viewed') stats.views++;
      if (signal.signalType === 'item_acted_on' || signal.signalType === 'section_expanded') stats.actions++;
      if (signal.signalType === 'item_dismissed' || signal.signalType === 'section_skipped') stats.dismissals++;
    }

    const engagement: Record<string, number> = {};
    for (const [section, stats] of sectionStats) {
      const total = stats.views + stats.actions + stats.dismissals;
      engagement[section] = total > 0
        ? (stats.actions * 2 + stats.views) / (total * 2 + stats.dismissals) // weight actions higher
        : 0.5; // neutral default
    }

    return engagement;
  }

  private computeTopicEngagement(
    signals: BriefingInteractionSignal[]
  ): Array<{ topic: string; engagementRate: number }> {
    const topicStats = new Map<string, { engaged: number; total: number }>();

    for (const signal of signals) {
      const topics = (signal.metadata.topics as string[]) ?? [];
      for (const topic of topics) {
        if (!topicStats.has(topic)) topicStats.set(topic, { engaged: 0, total: 0 });
        const stats = topicStats.get(topic)!;
        stats.total++;
        if (signal.signalType === 'item_acted_on' || signal.signalType === 'item_clicked') {
          stats.engaged++;
        }
      }
    }

    return Array.from(topicStats.entries())
      .map(([topic, stats]) => ({
        topic,
        engagementRate: stats.total > 0 ? stats.engaged / stats.total : 0,
      }))
      .sort((a, b) => b.engagementRate - a.engagementRate);
  }

  // =========================================================================
  // Specific Learning Handlers
  // =========================================================================

  private async adjustSectionWeight(
    userId: string,
    sectionType: BriefingSectionType,
    delta: number
  ): Promise<void> {
    const preferences = await this.loadUserPreferences(userId) ?? this.defaultPreferences(userId);
    const current = preferences.sectionWeights[sectionType] ?? 0.5;
    preferences.sectionWeights[sectionType] = Math.max(0.1, Math.min(1.0, current + delta));
    await this.saveUserPreferences(preferences);
  }

  private async adjustPreferredItemCount(
    userId: string,
    sectionType: BriefingSectionType,
    delta: number
  ): Promise<void> {
    const preferences = await this.loadUserPreferences(userId) ?? this.defaultPreferences(userId);
    const current = preferences.preferredItemsPerSection[sectionType] ?? 5;
    preferences.preferredItemsPerSection[sectionType] = Math.max(1, Math.min(15, current + delta));
    await this.saveUserPreferences(preferences);
  }

  private async learnFromDraftEdit(signal: BriefingInteractionSignal): Promise<void> {
    // Store the original draft and the user's edited version
    // This creates training data for style matching
    const original = signal.metadata.originalDraft as string;
    const edited = signal.metadata.editedDraft as string;

    if (original && edited && original !== edited) {
      await this.feedbackStore.storeDraftDelta({
        userId: signal.userId,
        original,
        edited,
        timestamp: signal.timestamp,
      });
    }
  }

  private async handleBriefingAbandonment(signal: BriefingInteractionSignal): Promise<void> {
    const scrollDepth = signal.metadata.scrollDepth as number ?? 0;
    const timeSpent = signal.metadata.timeSpentSeconds as number ?? 0;

    // If user abandoned very early, briefing is probably too long or poorly ordered
    if (scrollDepth < 0.3 && timeSpent < 30) {
      const preferences = await this.loadUserPreferences(signal.userId) ?? this.defaultPreferences(signal.userId);

      if (preferences.preferredBriefingLength !== 'concise') {
        preferences.preferredBriefingLength = 'concise';
        await this.saveUserPreferences(preferences);
      }
    }
  }

  // =========================================================================
  // Personalized Feedback Generation
  // =========================================================================

  private generatePersonalizedFeedback(
    evaluations: SectionEvaluation[],
    preferences: UserBriefingPreferences | null
  ): BriefingEvaluation['personalizedFeedback'] {
    const totalWords = evaluations.length * 100; // rough estimate
    const targetWords = preferences?.preferredBriefingLength === 'concise' ? 400 :
                        preferences?.preferredBriefingLength === 'detailed' ? 1200 :
                        800;

    return {
      tooLong: totalWords > targetWords * 1.3,
      tooShort: totalWords < targetWords * 0.5,
      missingPreferredSections: preferences
        ? Object.entries(preferences.sectionWeights)
            .filter(([_, weight]) => weight > 0.7)
            .map(([section]) => section)
            .filter(section => !evaluations.some(e => e.sectionType === section))
        : [],
      overweightedSections: preferences
        ? evaluations
            .filter(e => (preferences.sectionWeights[e.sectionType] ?? 0.5) < 0.2)
            .map(e => e.sectionType)
        : [],
    };
  }

  // =========================================================================
  // Storage Helpers
  // =========================================================================

  private async loadUserPreferences(userId: string): Promise<UserBriefingPreferences | null> {
    // In production, this reads from a dedicated preferences table
    // with Redis caching for hot paths
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });
    if (!prefs) return null;

    // The briefingPreferences would be stored as JSON in the preferences model
    // For now, return defaults
    return this.defaultPreferences(userId);
  }

  private async saveUserPreferences(preferences: UserBriefingPreferences): Promise<void> {
    // In production: upsert to database + invalidate Redis cache
  }

  private async storeEvaluation(evaluation: BriefingEvaluation): Promise<void> {
    // In production: store in an evaluations table for analytics and learning
  }

  private defaultPreferences(userId: string): UserBriefingPreferences {
    return {
      userId,
      lastUpdated: new Date(),
      sectionWeights: {
        priority_inbox: 0.9,
        meeting_prep: 0.85,
        project_updates: 0.7,
        relationship_alerts: 0.6,
        industry_intel: 0.5,
        deadlines: 0.75,
        strategic_alignment: 0.5,
        wellbeing_check: 0.4,
        anticipations: 0.8,
      },
      preferredBriefingLength: 'standard',
      preferredItemsPerSection: {
        priority_inbox: 7,
        meeting_prep: 5,
        project_updates: 5,
        relationship_alerts: 3,
        industry_intel: 3,
        deadlines: 5,
        strategic_alignment: 1,
        wellbeing_check: 1,
        anticipations: 5,
      },
      urgencyCalibration: 0,
      highEngagementTopics: [],
      lowEngagementTopics: [],
      highPriorityPeople: [],
      averageBriefingReadTimeSeconds: 180,
      averageCompletionRate: 0.7,
      qualityThresholds: {
        minRelevance: 0.5,
        minActionability: 0.4,
        minNovelty: 0.3,
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Service Interfaces
// ---------------------------------------------------------------------------

export interface LLMService {
  evaluate(params: {
    systemPrompt: string;
    userPrompt: string;
  }): Promise<{
    scores: SectionEvaluation['scores'];
    reasoning: string;
    rewriteSuggestion?: string;
  }>;

  rewrite(params: {
    systemPrompt: string;
    userPrompt: string;
  }): Promise<{
    content: string;
    generationTimeMs: number;
  }>;
}

export interface FeedbackStore {
  storeSignal(signal: BriefingInteractionSignal): Promise<void>;
  getRecentSignals(userId: string, days: number): Promise<BriefingInteractionSignal[]>;
  storeDraftDelta(params: {
    userId: string;
    original: string;
    edited: string;
    timestamp: Date;
  }): Promise<void>;
}
