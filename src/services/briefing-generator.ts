// ============================================================================
// BRIEFING GENERATOR SERVICE
// ============================================================================
// Generates the daily briefing — the single most important user-facing output.
// Orchestrates all engines to produce a comprehensive, prioritized, actionable
// morning brief that replaces the user's need to check 5+ tools.
// ============================================================================

import { PrismaClient, BriefingType } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyBriefing {
  date: string;
  generatedAt: Date;

  // Section 1: Priority Inbox (top items needing attention)
  priorityInbox: PriorityItem[];

  // Section 2: Today's Meetings (with prep context)
  meetings: MeetingBrief[];

  // Section 3: Project Health Updates
  projectUpdates: ProjectUpdate[];

  // Section 4: Relationship Alerts
  relationshipAlerts: RelationshipAlert[];

  // Section 5: Industry Intelligence
  industryIntel: IndustryBriefItem[];

  // Section 6: Commitments & Deadlines
  upcomingDeadlines: DeadlineItem[];

  // Section 7: Strategic Alignment Check
  strategicAlignment: StrategicAlignmentReport;

  // Section 8: Wellbeing Check
  wellbeingCheck: WellbeingReport;

  // Section 9: Career Intelligence (weekly, not daily)
  careerIntel?: CareerBriefItem[];

  // Metadata
  signalCount: number;
  insightCount: number;
  processingTimeMs: number;
}

export interface PriorityItem {
  id: string;
  type: 'message' | 'email' | 'task' | 'pr' | 'decision' | 'alert';
  source: string;
  title: string;
  summary: string;
  urgencyScore: number;
  importanceScore: number;
  compositeScore: number;
  suggestedAction: string;
  deepLink: string;      // link to the item in its source system
  from?: string;         // who sent/created this
  timestamp: Date;
}

export interface MeetingBrief {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{
    name: string;
    title?: string;
    relationshipHealth?: number;
    lastInteraction?: Date;
    recentContext?: string;
  }>;
  prepNotes: {
    lastMeetingSummary?: string;
    openActionItems: string[];
    relevantDecisions: string[];
    talkingPoints: string[];
    attendeeContext: string;  // what you should know about the attendees
  };
  estimatedContextSwitchCost: number; // minutes
}

export interface ProjectUpdate {
  projectId: string;
  projectName: string;
  status: string;
  healthScore: number;
  healthTrend: 'improving' | 'stable' | 'declining';
  velocityChange: number;   // percentage change
  blockerCount: number;
  keyUpdate: string;        // one-line summary of what changed
  riskFlag?: string;        // if there's a risk
  daysUntilDeadline?: number;
}

export interface RelationshipAlert {
  personId: string;
  personName: string;
  personTitle?: string;
  alertType: 'decay' | 'sentiment_shift' | 'visibility_gap' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedAction: string;
  daysSinceContact: number;
}

export interface IndustryBriefItem {
  id: string;
  title: string;
  summary: string;
  relevanceScore: number;
  eventType: string;
  company?: string;
  impactOnYou: string;     // personalized impact statement
  suggestedAction?: string;
  sourceUrl?: string;
}

export interface DeadlineItem {
  id: string;
  type: 'task' | 'commitment' | 'milestone' | 'review';
  title: string;
  dueDate: Date;
  daysUntilDue: number;
  status: string;
  owner?: string;
  riskLevel: 'on_track' | 'at_risk' | 'overdue';
}

export interface StrategicAlignmentReport {
  overallScore: number;     // 0-1 alignment with stated priorities
  timeBreakdown: Array<{
    category: string;       // "Priority Project A", "Meetings", "Reactive Work"
    percentageOfTime: number;
    isStrategic: boolean;
  }>;
  topTimeSink: {
    category: string;
    percentageOfTime: number;
    suggestion: string;
  };
  weekOverWeekTrend: 'improving' | 'stable' | 'declining';
}

export interface WellbeingReport {
  sustainabilityScore: number;  // 0-100
  trend: 'improving' | 'stable' | 'declining';
  meetingLoad: { hours: number; vsBaseline: number };
  focusTime: { hours: number; vsBaseline: number };
  contextSwitches: { count: number; vsBaseline: number };
  recommendation?: string;
}

export interface CareerBriefItem {
  type: 'skill_gap' | 'visibility_event' | 'network_opportunity' | 'comp_intel';
  title: string;
  description: string;
  action?: string;
}

// ---------------------------------------------------------------------------
// Briefing Generator
// ---------------------------------------------------------------------------

export class BriefingGenerator {
  constructor(
    private prisma: PrismaClient,
    private graphEngine: any,      // ProfessionalGraphEngine
    private industryEngine: any,   // IndustryIntelligenceEngine
    private llmService: any,       // LLMService
  ) {}

  /**
   * Generate a complete daily briefing for a user.
   * Called by scheduled job at the user's configured briefing time.
   */
  async generateDailyBriefing(userId: string): Promise<DailyBriefing> {
    const startTime = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true, org: true },
    });
    if (!user) throw new Error(`User ${userId} not found`);

    // Generate all sections in parallel for speed
    const [
      priorityInbox,
      meetings,
      projectUpdates,
      relationshipAlerts,
      industryIntel,
      upcomingDeadlines,
      strategicAlignment,
      wellbeingCheck,
    ] = await Promise.all([
      this.generatePriorityInbox(userId, user.orgId),
      this.generateMeetingBriefs(userId, user.orgId),
      this.generateProjectUpdates(userId),
      this.generateRelationshipAlerts(userId),
      this.generateIndustryIntel(userId, user.orgId),
      this.generateDeadlines(userId),
      this.generateStrategicAlignment(userId),
      this.generateWellbeingCheck(userId),
    ]);

    // Count signals and insights from last 24 hours
    const signalCount = await this.prisma.signal.count({
      where: { userId, detectedAt: { gte: new Date(Date.now() - 86400000) } },
    });
    const insightCount = await this.prisma.insight.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 86400000) } },
    });

    const briefing: DailyBriefing = {
      date: today.toISOString().split('T')[0],
      generatedAt: new Date(),
      priorityInbox,
      meetings,
      projectUpdates,
      relationshipAlerts,
      industryIntel,
      upcomingDeadlines,
      strategicAlignment,
      wellbeingCheck,
      signalCount,
      insightCount,
      processingTimeMs: Date.now() - startTime,
    };

    // Store the briefing
    await this.prisma.briefing.upsert({
      where: {
        userId_type_date: {
          userId,
          type: 'DAILY' as BriefingType,
          date: today,
        },
      },
      update: {
        content: briefing as any,
        status: 'generated',
        priorityInbox: briefing.priorityInbox as any,
        meetingPrep: briefing.meetings as any,
        projectUpdates: briefing.projectUpdates as any,
        industryIntel: briefing.industryIntel as any,
        relationshipAlerts: briefing.relationshipAlerts as any,
        strategicAlignment: briefing.strategicAlignment as any,
        wellbeingCheck: briefing.wellbeingCheck as any,
      },
      create: {
        orgId: user.orgId,
        userId,
        type: 'DAILY' as BriefingType,
        date: today,
        content: briefing as any,
        status: 'generated',
        priorityInbox: briefing.priorityInbox as any,
        meetingPrep: briefing.meetings as any,
        projectUpdates: briefing.projectUpdates as any,
        industryIntel: briefing.industryIntel as any,
        relationshipAlerts: briefing.relationshipAlerts as any,
        strategicAlignment: briefing.strategicAlignment as any,
        wellbeingCheck: briefing.wellbeingCheck as any,
      },
    });

    return briefing;
  }

  // =========================================================================
  // Section Generators
  // =========================================================================

  private async generatePriorityInbox(
    userId: string,
    orgId: string
  ): Promise<PriorityItem[]> {
    // Gather all items that might need attention
    const [unrepliedMessages, unrepliedEmails, urgentTasks, pendingAlerts] = await Promise.all([
      // Unprocessed/needs-reply messages from last 24h
      this.prisma.message.findMany({
        where: {
          userId,
          needsReply: true,
          repliedAt: null,
          timestamp: { gte: new Date(Date.now() - 86400000) },
        },
        orderBy: { urgencyScore: 'desc' },
        take: 20,
      }),

      // Unprocessed emails
      this.prisma.emailRecord.findMany({
        where: {
          userId,
          needsReply: true,
          repliedAt: null,
          timestamp: { gte: new Date(Date.now() - 86400000) },
        },
        orderBy: { urgencyScore: 'desc' },
        take: 10,
      }),

      // High-priority tasks approaching deadline
      this.prisma.taskItem.findMany({
        where: {
          userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          priority: { lte: 2 }, // urgent or high
          dueDate: { lte: new Date(Date.now() + 3 * 86400000) },
        },
        orderBy: { priority: 'asc' },
        take: 10,
      }),

      // Unread alerts
      this.prisma.alert.findMany({
        where: {
          userId,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Score and rank all items
    const allItems: PriorityItem[] = [];

    for (const msg of unrepliedMessages) {
      allItems.push({
        id: msg.id,
        type: 'message',
        source: msg.source,
        title: `${msg.authorName} in ${msg.channelName ?? 'DM'}`,
        summary: msg.content.substring(0, 150),
        urgencyScore: msg.urgencyScore ?? 0.5,
        importanceScore: 0.6, // would look up sender importance from graph
        compositeScore: (msg.urgencyScore ?? 0.5) * 0.5 + 0.6 * 0.5,
        suggestedAction: 'Reply',
        deepLink: `slack://channel/${msg.channelId}`,
        from: msg.authorName ?? undefined,
        timestamp: msg.timestamp,
      });
    }

    for (const email of unrepliedEmails) {
      allItems.push({
        id: email.id,
        type: 'email',
        source: 'GMAIL',
        title: email.subject,
        summary: email.snippet ?? '',
        urgencyScore: email.urgencyScore ?? 0.5,
        importanceScore: 0.6,
        compositeScore: (email.urgencyScore ?? 0.5) * 0.5 + 0.6 * 0.5,
        suggestedAction: 'Reply',
        deepLink: `https://mail.google.com/mail/u/0/#inbox/${email.sourceId}`,
        from: email.fromName ?? email.fromEmail,
        timestamp: email.timestamp,
      });
    }

    for (const task of urgentTasks) {
      const daysUntilDue = task.dueDate
        ? (task.dueDate.getTime() - Date.now()) / 86400000
        : 7;

      allItems.push({
        id: task.id,
        type: 'task',
        source: task.source,
        title: task.title,
        summary: task.description?.substring(0, 150) ?? '',
        urgencyScore: Math.min(1, 1 - (daysUntilDue / 3)),
        importanceScore: (5 - task.priority) / 4, // priority 1=1.0, 4=0.25
        compositeScore: 0,
        suggestedAction: task.status === 'TODO' ? 'Start' : 'Continue',
        deepLink: task.sourceId ? `https://linear.app/issue/${task.sourceId}` : '',
        timestamp: task.createdAt,
      });
    }

    // Compute composite scores
    for (const item of allItems) {
      item.compositeScore = item.urgencyScore * 0.5 + item.importanceScore * 0.5;
    }

    // Sort by composite score and return top 10
    return allItems
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 10);
  }

  private async generateMeetingBriefs(
    userId: string,
    orgId: string
  ): Promise<MeetingBrief[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const meetings = await this.prisma.meeting.findMany({
      where: {
        userId,
        startTime: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { startTime: 'asc' },
    });

    return Promise.all(
      meetings.map(async (meeting) => {
        // Get attendee context from the professional graph
        const attendees = (meeting.attendees as Array<{ email: string; name: string }>)
          ?? [];

        const attendeeDetails = await Promise.all(
          attendees.slice(0, 5).map(async (a) => { // limit to 5 for performance
            const person = await this.prisma.personNode.findFirst({
              where: { userId, email: a.email },
            });

            const relationship = person
              ? await this.prisma.relationship.findFirst({
                  where: { userId, personNodeId: person.id },
                })
              : null;

            return {
              name: a.name || a.email,
              title: person?.title ?? undefined,
              relationshipHealth: relationship?.healthScore ?? undefined,
              lastInteraction: person?.lastInteractionAt ?? undefined,
              recentContext: undefined, // would be generated by LLM
            };
          })
        );

        // Get last meeting with same attendees
        const previousMeeting = meeting.recurringId
          ? await this.prisma.meeting.findFirst({
              where: {
                userId,
                recurringId: meeting.recurringId,
                startTime: { lt: meeting.startTime },
              },
              orderBy: { startTime: 'desc' },
            })
          : null;

        // Get open action items mentioning any attendee
        const openActions = await this.prisma.commitment.findMany({
          where: {
            userId,
            status: { in: ['OPEN', 'IN_PROGRESS'] },
          },
          take: 5,
        });

        return {
          id: meeting.id,
          title: meeting.title,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          attendees: attendeeDetails,
          prepNotes: {
            lastMeetingSummary: previousMeeting?.summary ?? undefined,
            openActionItems: openActions.map(a => a.description),
            relevantDecisions: [], // would query decision log
            talkingPoints: [],     // would be LLM-generated
            attendeeContext: attendeeDetails
              .filter(a => a.lastInteraction)
              .map(a => `${a.name}${a.title ? ` (${a.title})` : ''}: last spoke ${a.lastInteraction ? Math.round((Date.now() - a.lastInteraction.getTime()) / 86400000) + 'd ago' : 'never'}`)
              .join('; '),
          },
          estimatedContextSwitchCost: 15, // would be computed from user patterns
        };
      })
    );
  }

  private async generateProjectUpdates(userId: string): Promise<ProjectUpdate[]> {
    const projects = await this.prisma.projectNode.findMany({
      where: { userId, status: { in: ['ACTIVE', 'AT_RISK'] } },
      orderBy: { strategicWeight: 'desc' },
      take: 10,
    });

    return projects.map(p => ({
      projectId: p.id,
      projectName: p.name,
      status: p.status,
      healthScore: p.healthScore ?? 0.5,
      healthTrend: (p.velocityTrend ?? 0) > 0.05 ? 'improving' as const :
                   (p.velocityTrend ?? 0) < -0.05 ? 'declining' as const :
                   'stable' as const,
      velocityChange: Math.round((p.velocityTrend ?? 0) * 100),
      blockerCount: p.blockerCount,
      keyUpdate: p.blockerCount > 0
        ? `${p.blockerCount} blocker${p.blockerCount > 1 ? 's' : ''} detected`
        : p.status === 'AT_RISK' ? 'Project flagged at-risk'
        : 'On track',
      riskFlag: p.status === 'AT_RISK' ? 'At risk — review needed' : undefined,
      daysUntilDeadline: p.targetDate
        ? Math.round((p.targetDate.getTime() - Date.now()) / 86400000)
        : undefined,
    }));
  }

  private async generateRelationshipAlerts(userId: string): Promise<RelationshipAlert[]> {
    const healthReport = await this.graphEngine.getRelationshipHealthReport(userId, {
      minImportance: 0.4,
      includeHealthy: false,
    });

    return healthReport.map((r: any) => ({
      personId: r.personId,
      personName: r.personName,
      alertType: r.trend === 'declining' ? 'decay' : 'visibility_gap',
      severity: r.riskLevel === 'critical' || r.riskLevel === 'high' ? 'high' :
                r.riskLevel === 'medium' ? 'medium' : 'low',
      description: r.suggestedActions[0] ?? `Relationship health: ${Math.round(r.healthScore * 100)}%`,
      suggestedAction: r.suggestedActions[0] ?? 'Reach out',
      daysSinceContact: r.lastInteraction
        ? Math.round((Date.now() - r.lastInteraction.getTime()) / 86400000)
        : 999,
    }));
  }

  private async generateIndustryIntel(
    userId: string,
    orgId: string
  ): Promise<IndustryBriefItem[]> {
    const signals = await this.industryEngine.getDailyBriefingSignals(userId, orgId, 5);

    return signals.map((s: any) => ({
      id: s.event.id,
      title: s.event.title,
      summary: s.event.content.substring(0, 200),
      relevanceScore: s.relevanceScore,
      eventType: s.eventType,
      company: s.event.entities?.find((e: any) => e.type === 'company')?.value,
      impactOnYou: s.impactAssessment || 'Potentially relevant to your work.',
      suggestedAction: s.recommendedActions?.[0]?.action,
      sourceUrl: s.event.sourceUrl,
    }));
  }

  private async generateDeadlines(userId: string): Promise<DeadlineItem[]> {
    const [tasks, commitments] = await Promise.all([
      this.prisma.taskItem.findMany({
        where: {
          userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 86400000),
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      this.prisma.commitment.findMany({
        where: {
          userId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 86400000),
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ]);

    const items: DeadlineItem[] = [
      ...tasks.map(t => ({
        id: t.id,
        type: 'task' as const,
        title: t.title,
        dueDate: t.dueDate!,
        daysUntilDue: Math.round((t.dueDate!.getTime() - Date.now()) / 86400000),
        status: t.status,
        owner: t.assigneeEmail ?? undefined,
        riskLevel: t.status === 'TODO' && ((t.dueDate!.getTime() - Date.now()) / 86400000) < 2
          ? 'at_risk' as const
          : 'on_track' as const,
      })),
      ...commitments.map(c => ({
        id: c.id,
        type: 'commitment' as const,
        title: c.description,
        dueDate: c.dueDate!,
        daysUntilDue: Math.round((c.dueDate!.getTime() - Date.now()) / 86400000),
        status: c.status,
        riskLevel: c.status === 'OPEN' && ((c.dueDate!.getTime() - Date.now()) / 86400000) < 2
          ? 'at_risk' as const
          : 'on_track' as const,
      })),
    ];

    return items.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  private async generateStrategicAlignment(userId: string): Promise<StrategicAlignmentReport> {
    const thisWeekMetrics = await this.prisma.activityMetric.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 7 * 86400000) },
      },
    });

    const totalMeetingHours = thisWeekMetrics.reduce((s, m) => s + m.meetingHours, 0);
    const totalFocusHours = thisWeekMetrics.reduce((s, m) => s + m.focusHours, 0);
    const totalHours = totalMeetingHours + totalFocusHours || 1;

    return {
      overallScore: 0.65, // would be computed from task alignment
      timeBreakdown: [
        { category: 'Meetings', percentageOfTime: Math.round(totalMeetingHours / totalHours * 100), isStrategic: false },
        { category: 'Focus Work', percentageOfTime: Math.round(totalFocusHours / totalHours * 100), isStrategic: true },
      ],
      topTimeSink: {
        category: 'Meetings',
        percentageOfTime: Math.round(totalMeetingHours / totalHours * 100),
        suggestion: totalMeetingHours > totalFocusHours
          ? 'Consider converting 2 status meetings to async updates'
          : 'Meeting load is healthy',
      },
      weekOverWeekTrend: 'stable',
    };
  }

  private async generateWellbeingCheck(userId: string): Promise<WellbeingReport> {
    const recentMetrics = await this.prisma.activityMetric.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 7 * 86400000) },
      },
    });

    const avgMeetingHours = recentMetrics.length > 0
      ? recentMetrics.reduce((s, m) => s + m.meetingHours, 0) / recentMetrics.length
      : 0;
    const avgFocusHours = recentMetrics.length > 0
      ? recentMetrics.reduce((s, m) => s + m.focusHours, 0) / recentMetrics.length
      : 0;
    const avgContextSwitches = recentMetrics.length > 0
      ? recentMetrics.reduce((s, m) => s + m.contextSwitches, 0) / recentMetrics.length
      : 0;

    // Simple sustainability score
    const meetingPenalty = Math.max(0, avgMeetingHours - 4) * 10;
    const focusBonus = Math.min(20, avgFocusHours * 5);
    const switchPenalty = Math.max(0, avgContextSwitches - 8) * 3;
    const sustainabilityScore = Math.max(0, Math.min(100,
      70 + focusBonus - meetingPenalty - switchPenalty
    ));

    return {
      sustainabilityScore: Math.round(sustainabilityScore),
      trend: sustainabilityScore > 70 ? 'stable' : 'declining',
      meetingLoad: { hours: Math.round(avgMeetingHours * 10) / 10, vsBaseline: 0 },
      focusTime: { hours: Math.round(avgFocusHours * 10) / 10, vsBaseline: 0 },
      contextSwitches: { count: Math.round(avgContextSwitches), vsBaseline: 0 },
      recommendation: sustainabilityScore < 60
        ? 'Your sustainability score is low. Consider blocking focus time and declining non-essential meetings.'
        : undefined,
    };
  }
}
