// ============================================================================
// CONTEXT SNAPSHOT SERIALIZER
// ============================================================================
// Builds a complete, serialized view of a user's professional world that
// fits within a model's context window. Designed for the 1M-token future
// where you can dump everything into a single prompt and let the model
// reason over the full picture.
//
// Two modes:
// 1. FOCUSED: ~50K tokens for real-time queries (today)
// 2. COMPREHENSIVE: ~500K-1M tokens for deep analysis (future)
//
// The key insight: this is not just "dump everything." The serializer
// STRUCTURES the data so the model can reason effectively — with clear
// sections, relationships, and temporal markers.
// ============================================================================

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContextSnapshotConfig {
  mode: 'focused' | 'comprehensive';

  // What to include
  includeSlack: boolean;
  includeEmail: boolean;
  includeMeetings: boolean;
  includeTasks: boolean;
  includeDocuments: boolean;
  includeGraph: boolean;
  includeIndustryIntel: boolean;
  includeDecisionLog: boolean;
  includeCommitments: boolean;
  includeActivityMetrics: boolean;

  // Time range
  timeRangeDays: number;        // how far back to look

  // Focus (optional) — narrow the snapshot to a specific topic/person/project
  focus?: {
    type: 'person' | 'project' | 'topic' | 'meeting' | 'general';
    id?: string;
    name?: string;
    query?: string;
  };

  // Token budget
  maxTokens: number;            // hard limit on output size
}

export interface ContextSnapshot {
  userId: string;
  generatedAt: Date;
  config: ContextSnapshotConfig;

  // The serialized context as structured markdown
  serialized: string;

  // Token estimates per section (for debugging/optimization)
  tokenBreakdown: Record<string, number>;
  totalEstimatedTokens: number;

  // What was included vs. truncated
  coverage: {
    messagesIncluded: number;
    messagesTotal: number;
    meetingsIncluded: number;
    meetingsTotal: number;
    peopleIncluded: number;
    peopleTotal: number;
    documentsIncluded: number;
    documentsTotal: number;
  };
}

// ---------------------------------------------------------------------------
// Token Estimation
// ---------------------------------------------------------------------------

/** Rough token estimation: ~4 characters per token for English text */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// Context Snapshot Serializer
// ---------------------------------------------------------------------------

export class ContextSnapshotSerializer {
  constructor(private prisma: PrismaClient) {}

  /**
   * Build a complete context snapshot for a user.
   * This is the primary method — produces a structured document that
   * can be fed directly to a long-context model.
   */
  async buildSnapshot(
    userId: string,
    config: ContextSnapshotConfig
  ): Promise<ContextSnapshot> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { org: true, preferences: true },
    });
    if (!user) throw new Error(`User ${userId} not found`);

    const sections: Array<{ name: string; content: string; priority: number }> = [];
    const coverage = {
      messagesIncluded: 0, messagesTotal: 0,
      meetingsIncluded: 0, meetingsTotal: 0,
      peopleIncluded: 0, peopleTotal: 0,
      documentsIncluded: 0, documentsTotal: 0,
    };

    const since = new Date(Date.now() - config.timeRangeDays * 24 * 60 * 60 * 1000);

    // ─── Section: User Profile & Context ───
    sections.push({
      name: 'user_profile',
      content: this.serializeUserProfile(user),
      priority: 10,
    });

    // ─── Section: Professional Graph ───
    if (config.includeGraph) {
      const graphSection = await this.serializeGraph(userId, config, coverage);
      sections.push({ name: 'professional_graph', content: graphSection, priority: 9 });
    }

    // ─── Section: Today's Calendar ───
    if (config.includeMeetings) {
      const meetingsSection = await this.serializeMeetings(userId, since, config, coverage);
      sections.push({ name: 'meetings', content: meetingsSection, priority: 8 });
    }

    // ─── Section: Active Tasks & Projects ───
    if (config.includeTasks) {
      const tasksSection = await this.serializeTasks(userId, config);
      sections.push({ name: 'tasks_and_projects', content: tasksSection, priority: 7 });
    }

    // ─── Section: Recent Messages ───
    if (config.includeSlack) {
      const messagesSection = await this.serializeMessages(userId, since, config, coverage);
      sections.push({ name: 'recent_messages', content: messagesSection, priority: 6 });
    }

    // ─── Section: Recent Emails ───
    if (config.includeEmail) {
      const emailSection = await this.serializeEmails(userId, since, config, coverage);
      sections.push({ name: 'recent_emails', content: emailSection, priority: 5 });
    }

    // ─── Section: Decision Log ───
    if (config.includeDecisionLog) {
      const decisionsSection = await this.serializeDecisions(userId, since);
      sections.push({ name: 'decision_log', content: decisionsSection, priority: 4 });
    }

    // ─── Section: Commitments ───
    if (config.includeCommitments) {
      const commitmentsSection = await this.serializeCommitments(userId);
      sections.push({ name: 'commitments', content: commitmentsSection, priority: 3 });
    }

    // ─── Section: Industry Intelligence ───
    if (config.includeIndustryIntel) {
      const intelSection = await this.serializeIndustryIntel(user.orgId, since);
      sections.push({ name: 'industry_intelligence', content: intelSection, priority: 2 });
    }

    // ─── Section: Activity Metrics ───
    if (config.includeActivityMetrics) {
      const metricsSection = await this.serializeActivityMetrics(userId, since);
      sections.push({ name: 'activity_metrics', content: metricsSection, priority: 1 });
    }

    // ─── Assemble within token budget ───
    const assembled = this.assembleWithinBudget(sections, config.maxTokens);

    return {
      userId,
      generatedAt: new Date(),
      config,
      serialized: assembled.content,
      tokenBreakdown: assembled.tokenBreakdown,
      totalEstimatedTokens: assembled.totalTokens,
      coverage,
    };
  }

  // =========================================================================
  // Section Serializers
  // =========================================================================

  private serializeUserProfile(user: any): string {
    return `# YOUR PROFESSIONAL CONTEXT

**Name:** ${user.name}
**Role:** ${user.jobTitle ?? 'Unknown'} at ${user.org.name}
**Department:** ${user.department ?? 'Unknown'}
**Timezone:** ${user.timezone}
**Company:** ${user.org.name} (${user.org.industry ?? 'Unknown industry'}, ${user.org.companySize})
**Today:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`;
  }

  private async serializeGraph(
    userId: string,
    config: ContextSnapshotConfig,
    coverage: ContextSnapshot['coverage']
  ): Promise<string> {
    const relationships = await this.prisma.relationship.findMany({
      where: { userId },
      include: { person: true },
      orderBy: { person: { importanceScore: 'desc' } },
      take: config.mode === 'comprehensive' ? 100 : 25,
    });

    coverage.peopleTotal = await this.prisma.personNode.count({ where: { userId } });
    coverage.peopleIncluded = relationships.length;

    let content = `# YOUR PROFESSIONAL NETWORK

${relationships.length} key relationships (of ${coverage.peopleTotal} total):

`;

    for (const rel of relationships) {
      const daysSince = rel.person.lastInteractionAt
        ? Math.round((Date.now() - rel.person.lastInteractionAt.getTime()) / 86400000)
        : null;

      content += `## ${rel.person.name}
- **Role:** ${rel.person.title ?? 'Unknown'}${rel.person.company ? ` at ${rel.person.company}` : ''}
- **Relationship:** ${rel.type.toLowerCase().replace('_', ' ')} | Strength: ${(rel.strength * 100).toFixed(0)}% | Health: ${(rel.healthScore * 100).toFixed(0)}%
- **Importance:** ${(rel.person.importanceScore * 100).toFixed(0)}% | Political capital: ${(rel.politicalCapital * 100).toFixed(0)}%
- **Last contact:** ${daysSince !== null ? `${daysSince} days ago` : 'Never'}
- **Sentiment:** ${this.sentimentLabel(rel.person.sentimentAvg)}
- **Interaction frequency:** ${rel.currentFrequency.toFixed(1)}/week (baseline: ${rel.baselineFrequency.toFixed(1)}/week)
${rel.isDecisionMaker ? '- **⚡ Decision maker for your goals**' : ''}
${rel.notes ? `- **Notes:** ${rel.notes}` : ''}

`;
    }

    return content;
  }

  private async serializeMeetings(
    userId: string,
    since: Date,
    config: ContextSnapshotConfig,
    coverage: ContextSnapshot['coverage']
  ): Promise<string> {
    // Get today's meetings + recent past meetings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [todayMeetings, recentMeetings] = await Promise.all([
      this.prisma.meeting.findMany({
        where: { userId, startTime: { gte: todayStart, lt: todayEnd } },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.meeting.findMany({
        where: { userId, startTime: { gte: since, lt: todayStart } },
        orderBy: { startTime: 'desc' },
        take: config.mode === 'comprehensive' ? 50 : 10,
      }),
    ]);

    coverage.meetingsTotal = todayMeetings.length + recentMeetings.length;
    coverage.meetingsIncluded = coverage.meetingsTotal;

    let content = `# TODAY'S MEETINGS

`;
    for (const meeting of todayMeetings) {
      const attendees = (meeting.attendees as Array<{ name: string }>) ?? [];
      content += `## ${meeting.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${meeting.title}
- **Duration:** ${Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000)} minutes
- **Attendees (${meeting.attendeeCount}):** ${attendees.map(a => a.name).join(', ')}
${meeting.summary ? `- **Prep notes:** ${meeting.summary}` : ''}
${meeting.contextBundle ? `- **Context:** ${JSON.stringify(meeting.contextBundle).substring(0, 300)}` : ''}

`;
    }

    if (config.mode === 'comprehensive' && recentMeetings.length > 0) {
      content += `# RECENT MEETING HISTORY

`;
      for (const meeting of recentMeetings) {
        content += `## ${meeting.startTime.toLocaleDateString()} - ${meeting.title}
${meeting.summary ? `- **Summary:** ${meeting.summary}` : '- No summary available'}
${meeting.decisionsCount > 0 ? `- **Decisions made:** ${meeting.decisionsCount}` : ''}

`;
      }
    }

    return content;
  }

  private async serializeTasks(
    userId: string,
    config: ContextSnapshotConfig
  ): Promise<string> {
    const [activeTasks, activeProjects] = await Promise.all([
      this.prisma.taskItem.findMany({
        where: { userId, status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] } },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
        take: config.mode === 'comprehensive' ? 50 : 15,
      }),
      this.prisma.projectNode.findMany({
        where: { userId, status: { in: ['ACTIVE', 'AT_RISK'] } },
        orderBy: { strategicWeight: 'desc' },
      }),
    ]);

    let content = `# ACTIVE PROJECTS

`;
    for (const project of activeProjects) {
      content += `## ${project.name}
- **Status:** ${project.status} | Health: ${project.healthScore ? (project.healthScore * 100).toFixed(0) + '%' : 'Unknown'}
- **Priority:** ${project.priority} | Strategic weight: ${(project.strategicWeight * 100).toFixed(0)}%
- **Blockers:** ${project.blockerCount}
${project.targetDate ? `- **Deadline:** ${project.targetDate.toLocaleDateString()} (${Math.round((project.targetDate.getTime() - Date.now()) / 86400000)} days)` : ''}
${project.velocityTrend ? `- **Velocity trend:** ${project.velocityTrend > 0 ? '↑' : project.velocityTrend < 0 ? '↓' : '→'} ${(project.velocityTrend * 100).toFixed(0)}%` : ''}

`;
    }

    content += `# ACTIVE TASKS (${activeTasks.length})

`;
    const priorityLabels = ['', 'URGENT', 'HIGH', 'NORMAL', 'LOW'];
    for (const task of activeTasks) {
      const dueStr = task.dueDate
        ? `Due: ${task.dueDate.toLocaleDateString()} (${Math.round((task.dueDate.getTime() - Date.now()) / 86400000)}d)`
        : '';
      content += `- [${task.status}] **${task.title}** — ${priorityLabels[task.priority] ?? ''} ${dueStr}
`;
    }

    return content;
  }

  private async serializeMessages(
    userId: string,
    since: Date,
    config: ContextSnapshotConfig,
    coverage: ContextSnapshot['coverage']
  ): Promise<string> {
    const messages = await this.prisma.message.findMany({
      where: {
        userId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'desc' },
      take: config.mode === 'comprehensive' ? 200 : 30,
    });

    coverage.messagesTotal = await this.prisma.message.count({
      where: { userId, timestamp: { gte: since } },
    });
    coverage.messagesIncluded = messages.length;

    // Group messages by channel for readability
    const byChannel = new Map<string, typeof messages>();
    for (const msg of messages) {
      const channel = msg.channelName ?? msg.channelId ?? 'Unknown';
      if (!byChannel.has(channel)) byChannel.set(channel, []);
      byChannel.get(channel)!.push(msg);
    }

    let content = `# RECENT SLACK MESSAGES (${messages.length} of ${coverage.messagesTotal})

`;
    for (const [channel, channelMsgs] of byChannel) {
      content += `## #${channel}\n`;
      for (const msg of channelMsgs.slice(0, 10)) {
        const needsReply = msg.needsReply && !msg.repliedAt ? ' ⚠️ NEEDS REPLY' : '';
        content += `[${msg.timestamp.toLocaleString()}] **${msg.authorName ?? 'Unknown'}:** ${msg.content.substring(0, 300)}${needsReply}\n`;
      }
      content += '\n';
    }

    return content;
  }

  private async serializeEmails(
    userId: string,
    since: Date,
    config: ContextSnapshotConfig,
    coverage: ContextSnapshot['coverage']
  ): Promise<string> {
    const emails = await this.prisma.emailRecord.findMany({
      where: { userId, timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
      take: config.mode === 'comprehensive' ? 50 : 15,
    });

    let content = `# RECENT EMAILS (${emails.length})

`;
    for (const email of emails) {
      const needsReply = email.needsReply && !email.repliedAt ? ' ⚠️ NEEDS REPLY' : '';
      content += `## ${email.subject}${needsReply}
- **From:** ${email.fromName ?? email.fromEmail} | ${email.timestamp.toLocaleString()}
- **Snippet:** ${email.snippet ?? ''}

`;
    }

    return content;
  }

  private async serializeDecisions(userId: string, since: Date): Promise<string> {
    const decisions = await this.prisma.decisionLog.findMany({
      where: { userId, madeAt: { gte: since } },
      orderBy: { madeAt: 'desc' },
      take: 20,
    });

    let content = `# DECISION LOG (${decisions.length} recent)

`;
    for (const d of decisions) {
      content += `## ${d.title}
- **Date:** ${d.madeAt.toLocaleDateString()}
- **Decision:** ${d.description}
${d.rationale ? `- **Rationale:** ${d.rationale}` : ''}
- **Participants:** ${d.participants.join(', ')}
${d.reversedAt ? `- **⚠️ REVERSED on ${d.reversedAt.toLocaleDateString()}**` : ''}

`;
    }

    return content;
  }

  private async serializeCommitments(userId: string): Promise<string> {
    const commitments = await this.prisma.commitment.findMany({
      where: { userId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: { owner: true },
      orderBy: { dueDate: 'asc' },
    });

    let content = `# OPEN COMMITMENTS (${commitments.length})

`;
    for (const c of commitments) {
      const dueStr = c.dueDate
        ? `Due: ${c.dueDate.toLocaleDateString()} (${Math.round((c.dueDate.getTime() - Date.now()) / 86400000)}d)`
        : 'No due date';
      const isOverdue = c.dueDate && c.dueDate < new Date();
      content += `- [${c.status}]${isOverdue ? ' ⚠️ OVERDUE' : ''} ${c.description} — ${c.owner?.name ?? 'You'} | ${dueStr}\n`;
    }

    return content;
  }

  private async serializeIndustryIntel(orgId: string, since: Date): Promise<string> {
    const signals = await this.prisma.industrySignal.findMany({
      where: { orgId, publishedAt: { gte: since }, relevanceScore: { gte: 0.4 } },
      orderBy: { relevanceScore: 'desc' },
      take: 10,
    });

    let content = `# INDUSTRY INTELLIGENCE (${signals.length} relevant signals)

`;
    for (const s of signals) {
      content += `## ${s.title}
- **Type:** ${s.eventType} | Relevance: ${(s.relevanceScore * 100).toFixed(0)}%
- **Published:** ${s.publishedAt.toLocaleDateString()}
${s.company ? `- **Company:** ${s.company}` : ''}
${s.impactAssessment ? `- **Impact:** ${s.impactAssessment}` : ''}

`;
    }

    return content;
  }

  private async serializeActivityMetrics(userId: string, since: Date): Promise<string> {
    const metrics = await this.prisma.activityMetric.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'desc' },
      take: 14,
    });

    if (metrics.length === 0) return '';

    const avgMeetingHours = metrics.reduce((s, m) => s + m.meetingHours, 0) / metrics.length;
    const avgFocusHours = metrics.reduce((s, m) => s + m.focusHours, 0) / metrics.length;
    const avgContextSwitches = metrics.reduce((s, m) => s + m.contextSwitches, 0) / metrics.length;

    return `# ACTIVITY PATTERNS (last ${metrics.length} days)

- **Avg daily meeting hours:** ${avgMeetingHours.toFixed(1)}h
- **Avg daily focus hours:** ${avgFocusHours.toFixed(1)}h
- **Avg daily context switches:** ${Math.round(avgContextSwitches)}
- **Tasks completed (total):** ${metrics.reduce((s, m) => s + m.tasksCompleted, 0)}
- **Messages sent (total):** ${metrics.reduce((s, m) => s + m.messagesSent, 0)}
- **PRs reviewed (total):** ${metrics.reduce((s, m) => s + m.prsReviewed, 0)}
`;
  }

  // =========================================================================
  // Assembly
  // =========================================================================

  /**
   * Assemble sections within the token budget.
   * Higher-priority sections get included first.
   * Lower-priority sections get truncated if budget is tight.
   */
  private assembleWithinBudget(
    sections: Array<{ name: string; content: string; priority: number }>,
    maxTokens: number
  ): { content: string; tokenBreakdown: Record<string, number>; totalTokens: number } {
    // Sort by priority (highest first)
    const sorted = [...sections].sort((a, b) => b.priority - a.priority);

    let totalTokens = 0;
    const included: string[] = [];
    const tokenBreakdown: Record<string, number> = {};

    // Reserve 2000 tokens for system prompt overhead
    const budget = maxTokens - 2000;

    for (const section of sorted) {
      const sectionTokens = estimateTokens(section.content);

      if (totalTokens + sectionTokens <= budget) {
        // Include full section
        included.push(section.content);
        tokenBreakdown[section.name] = sectionTokens;
        totalTokens += sectionTokens;
      } else {
        // Truncate section to fit remaining budget
        const remaining = budget - totalTokens;
        if (remaining > 500) { // minimum useful section size
          const truncatedContent = section.content.substring(0, remaining * 4); // rough char estimate
          included.push(truncatedContent + '\n\n*[Section truncated due to context limit]*\n');
          tokenBreakdown[section.name] = estimateTokens(truncatedContent);
          totalTokens += tokenBreakdown[section.name];
        }
        break; // no more budget
      }
    }

    return {
      content: included.join('\n---\n\n'),
      tokenBreakdown,
      totalTokens,
    };
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private sentimentLabel(score: number): string {
    if (score > 0.3) return 'Positive';
    if (score > -0.3) return 'Neutral';
    return 'Negative';
  }
}
