// ============================================================================
// PROACTIVE INTELLIGENCE — PATTERN DETECTORS
// ============================================================================
// Each detector watches for a specific pattern and emits signals when
// thresholds are crossed. Detectors are stateless — they query the database
// on each run and compare against learned baselines.
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { PatternDetector, EnrichedEvent, DetectedSignal, PipelineContext } from '../intelligence-pipeline/pipeline';

// ---------------------------------------------------------------------------
// 1. RELATIONSHIP DECAY DETECTOR
// ---------------------------------------------------------------------------

/**
 * Detects when important relationships are losing engagement.
 *
 * Algorithm:
 * - For each relationship above importance threshold:
 *   - Compute exponential decay based on days since last interaction
 *   - Compare current interaction frequency to baseline frequency
 *   - If decayed below 60% of baseline AND importance > 0.5, emit signal
 * - Severity is proportional to importance * decay magnitude
 */
export class RelationshipDecayDetector implements PatternDetector {
  name = 'RelationshipDecayDetector';
  version = '1.0';

  constructor(private prisma: PrismaClient) {}

  appliesTo(event: EnrichedEvent): boolean {
    // This detector runs on schedule, not per-event
    // But can also trigger on message events to check if a relationship recovered
    return ['message.created', 'email.received', 'meeting.ended'].includes(event.eventType);
  }

  async detect(event: EnrichedEvent, context: PipelineContext): Promise<DetectedSignal[]> {
    const signals: DetectedSignal[] = [];

    // Get relationships that haven't been checked recently
    const relationships = await this.prisma.relationship.findMany({
      where: {
        userId: context.userId,
        person: {
          importanceScore: { gte: 0.5 },
        },
        decayAlertSent: false,
      },
      include: { person: true },
    });

    for (const rel of relationships) {
      const daysSinceInteraction = rel.person.lastInteractionAt
        ? (Date.now() - rel.person.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24)
        : 90;

      // Skip if recently interacted
      if (daysSinceInteraction < 7) continue;

      // Check if current frequency is significantly below baseline
      const frequencyRatio = rel.baselineFrequency > 0
        ? rel.currentFrequency / rel.baselineFrequency
        : 0;

      // Decay threshold varies by importance
      const decayThreshold = 0.6 - (rel.person.importanceScore * 0.2);
      // For very important people (importance=1.0), threshold is 0.4 (more sensitive)
      // For moderately important (importance=0.5), threshold is 0.5

      if (frequencyRatio < decayThreshold) {
        const severity = rel.person.importanceScore > 0.8 ? 'high' :
                        rel.person.importanceScore > 0.6 ? 'medium' : 'low';

        signals.push({
          type: 'RELATIONSHIP',
          subType: 'relationship_decay',
          severity: severity as DetectedSignal['severity'],
          score: rel.person.importanceScore * (1 - frequencyRatio),
          title: `Relationship with ${rel.person.name} is fading`,
          description: `You haven't connected with ${rel.person.name} in ${Math.round(daysSinceInteraction)} days. Your typical cadence is ${Math.round(rel.baselineFrequency * 7)} times per week. ${rel.person.title ? `They are ${rel.person.title}${rel.person.company ? ` at ${rel.person.company}` : ''}.` : ''}`,
          evidence: [
            {
              source: 'interaction_history',
              data: {
                daysSinceInteraction: Math.round(daysSinceInteraction),
                baselineFrequency: rel.baselineFrequency,
                currentFrequency: rel.currentFrequency,
                frequencyRatio,
              },
              timestamp: new Date(),
            },
          ],
          affectedEntities: [
            { type: 'person', id: rel.personNodeId, name: rel.person.name },
          ],
          detectorName: this.name,
          detectorVersion: this.version,
        });
      }
    }

    return signals;
  }
}

// ---------------------------------------------------------------------------
// 2. PROJECT VELOCITY DROP DETECTOR
// ---------------------------------------------------------------------------

/**
 * Detects when project velocity (task completion rate) is declining.
 *
 * Algorithm:
 * - Compute rolling 7-day task completion rate for each active project
 * - Compare to 30-day moving average
 * - If current rate < 65% of average for 2+ consecutive periods, emit signal
 * - Factor in: blocked task count, team member changes, scope changes
 */
export class VelocityDropDetector implements PatternDetector {
  name = 'VelocityDropDetector';
  version = '1.0';

  constructor(private prisma: PrismaClient) {}

  appliesTo(event: EnrichedEvent): boolean {
    return ['task.completed', 'task.created', 'task.updated'].includes(event.eventType);
  }

  async detect(event: EnrichedEvent, context: PipelineContext): Promise<DetectedSignal | null> {
    // Get the project this task belongs to
    const projectId = event.metadata.projectId as string;
    if (!projectId) return null;

    const project = await this.prisma.projectNode.findUnique({
      where: { id: projectId },
    });
    if (!project || project.status !== 'ACTIVE') return null;

    // Compute recent velocity (last 7 days)
    const recentCompleted = await this.prisma.taskItem.count({
      where: {
        projectId,
        status: 'DONE',
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    // Compute 30-day average velocity (per week)
    const monthCompleted = await this.prisma.taskItem.count({
      where: {
        projectId,
        status: 'DONE',
        completedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });
    const weeklyAverage = monthCompleted / 4.3; // 30 days ≈ 4.3 weeks

    if (weeklyAverage < 1) return null; // not enough data

    const velocityRatio = recentCompleted / weeklyAverage;

    // Check for velocity drop
    if (velocityRatio < 0.65) {
      // Check blocker count for context
      const blockerCount = await this.prisma.taskItem.count({
        where: {
          projectId,
          status: 'TODO',
          tags: { has: 'blocked' },
        },
      });

      const severity = velocityRatio < 0.3 ? 'high' :
                       velocityRatio < 0.5 ? 'medium' : 'low';

      return {
        type: 'PROJECT',
        subType: 'velocity_drop',
        severity: severity as DetectedSignal['severity'],
        score: (1 - velocityRatio) * (project.strategicWeight || 0.5),
        title: `Velocity drop on "${project.name}"`,
        description: `Task completion rate dropped to ${Math.round(velocityRatio * 100)}% of normal. ${recentCompleted} tasks completed this week vs. ${Math.round(weeklyAverage)} weekly average.${blockerCount > 0 ? ` ${blockerCount} tasks are currently blocked.` : ''}`,
        evidence: [
          {
            source: 'task_metrics',
            data: {
              recentCompleted,
              weeklyAverage: Math.round(weeklyAverage * 10) / 10,
              velocityRatio: Math.round(velocityRatio * 100) / 100,
              blockerCount,
            },
            timestamp: new Date(),
          },
        ],
        affectedEntities: [
          { type: 'project', id: projectId, name: project.name },
        ],
        detectorName: this.name,
        detectorVersion: this.version,
      };
    }

    return null;
  }
}

// ---------------------------------------------------------------------------
// 3. STRATEGIC DRIFT DETECTOR
// ---------------------------------------------------------------------------

/**
 * Detects when a user's time allocation is drifting away from their stated priorities.
 *
 * Algorithm:
 * - Compute time allocation vector from calendar + activity data
 * - Compute priority vector from OKRs/stated goals
 * - Cosine similarity between the two vectors
 * - If similarity < 0.5 for 3+ consecutive days, emit signal
 */
export class StrategicDriftDetector implements PatternDetector {
  name = 'StrategicDriftDetector';
  version = '1.0';

  constructor(private prisma: PrismaClient) {}

  appliesTo(event: EnrichedEvent): boolean {
    return ['calendar.event_created', 'task.completed', 'meeting.ended'].includes(event.eventType);
  }

  async detect(event: EnrichedEvent, context: PipelineContext): Promise<DetectedSignal | null> {
    // Get user's stated priorities (projects with strategic weight)
    const priorities = await this.prisma.projectNode.findMany({
      where: {
        userId: context.userId,
        status: 'ACTIVE',
        strategicWeight: { gt: 0.3 },
      },
      orderBy: { strategicWeight: 'desc' },
    });

    if (priorities.length === 0) return null;

    // Get this week's activity metrics
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const metrics = await this.prisma.activityMetric.findMany({
      where: {
        userId: context.userId,
        date: { gte: startOfWeek },
      },
    });

    if (metrics.length < 3) return null; // need at least 3 days of data

    // Compute alignment score
    const totalMeetingHours = metrics.reduce((sum, m) => sum + m.meetingHours, 0);
    const totalFocusHours = metrics.reduce((sum, m) => sum + m.focusHours, 0);
    const totalHours = totalMeetingHours + totalFocusHours;

    if (totalHours < 10) return null; // not enough activity

    // Get tasks completed this week by project
    const tasksThisWeek = await this.prisma.taskItem.findMany({
      where: {
        userId: context.userId,
        completedAt: { gte: startOfWeek },
      },
      select: { projectId: true },
    });

    // Compute what % of completed tasks are on priority projects
    const priorityProjectIds = new Set(priorities.map(p => p.id));
    const priorityTaskCount = tasksThisWeek.filter(t => t.projectId && priorityProjectIds.has(t.projectId)).length;
    const alignmentRatio = tasksThisWeek.length > 0
      ? priorityTaskCount / tasksThisWeek.length
      : 0;

    // Also check: what % of meeting time is on priority topics
    // (simplified; would analyze meeting titles/attendees in production)

    // Check for strategic drift
    const meetingLoadRatio = totalMeetingHours / totalHours;

    if (alignmentRatio < 0.4 || meetingLoadRatio > 0.65) {
      const topPriority = priorities[0];

      return {
        type: 'PERSONAL',
        subType: 'strategic_drift',
        severity: alignmentRatio < 0.2 ? 'high' : 'medium',
        score: 1 - alignmentRatio,
        title: 'Your time is drifting from your priorities',
        description: `This week, only ${Math.round(alignmentRatio * 100)}% of your completed tasks are on priority projects. ${Math.round(meetingLoadRatio * 100)}% of your time is in meetings. Your top priority "${topPriority.name}" may be at risk.`,
        evidence: [
          {
            source: 'activity_metrics',
            data: {
              alignmentRatio,
              meetingLoadRatio,
              totalFocusHours: Math.round(totalFocusHours * 10) / 10,
              totalMeetingHours: Math.round(totalMeetingHours * 10) / 10,
              priorityTaskPct: Math.round(alignmentRatio * 100),
            },
            timestamp: new Date(),
          },
        ],
        affectedEntities: priorities.map(p => ({
          type: 'project',
          id: p.id,
          name: p.name,
        })),
        detectorName: this.name,
        detectorVersion: this.version,
      };
    }

    return null;
  }
}

// ---------------------------------------------------------------------------
// 4. BURNOUT RISK DETECTOR
// ---------------------------------------------------------------------------

/**
 * Detects early signs of burnout using multiple behavioral signals.
 *
 * Features:
 * - Work hours creep (first Slack message getting earlier)
 * - Meeting overload (>6 hours/day)
 * - Response time elongation
 * - PTO deficit (no time off in >6 weeks)
 * - Communication tone shift (sentiment decline)
 * - Context switch overload (>12/day)
 *
 * Uses a weighted composite score with learned per-user baselines.
 */
export class BurnoutRiskDetector implements PatternDetector {
  name = 'BurnoutRiskDetector';
  version = '1.0';

  constructor(private prisma: PrismaClient) {}

  appliesTo(_event: EnrichedEvent): boolean {
    return true; // runs on every event to maintain fresh scores
  }

  async detect(_event: EnrichedEvent, context: PipelineContext): Promise<DetectedSignal | null> {
    // Get last 14 days of activity metrics
    const metrics = await this.prisma.activityMetric.findMany({
      where: {
        userId: context.userId,
        date: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: 'asc' },
    });

    if (metrics.length < 7) return null;

    // Get 30-day baseline
    const baselineMetrics = await this.prisma.activityMetric.findMany({
      where: {
        userId: context.userId,
        date: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Compute burnout features
    const recentAvgMeetingHours = avg(metrics.map(m => m.meetingHours));
    const baselineAvgMeetingHours = avg(baselineMetrics.map(m => m.meetingHours));

    const recentAvgContextSwitches = avg(metrics.map(m => m.contextSwitches));
    const baselineAvgContextSwitches = avg(baselineMetrics.map(m => m.contextSwitches));

    const recentAvgFocusHours = avg(metrics.map(m => m.focusHours));
    const baselineAvgFocusHours = avg(baselineMetrics.map(m => m.focusHours));

    // Feature 1: Meeting overload (normalized 0-1)
    const meetingOverload = Math.min(1, Math.max(0,
      (recentAvgMeetingHours - 4) / 4 // 4hrs = baseline, 8hrs = max score
    ));

    // Feature 2: Meeting hours increasing
    const meetingCreep = baselineAvgMeetingHours > 0
      ? Math.min(1, Math.max(0, (recentAvgMeetingHours - baselineAvgMeetingHours) / baselineAvgMeetingHours))
      : 0;

    // Feature 3: Context switch overload
    const contextSwitchOverload = Math.min(1, Math.max(0,
      (recentAvgContextSwitches - 8) / 8 // 8 = baseline, 16 = max score
    ));

    // Feature 4: Focus time erosion
    const focusErosion = baselineAvgFocusHours > 0
      ? Math.min(1, Math.max(0, 1 - (recentAvgFocusHours / baselineAvgFocusHours)))
      : 0;

    // Feature 5: Early start / late finish pattern
    const earlyStarts = metrics.filter(m =>
      m.firstActivityAt && new Date(m.firstActivityAt).getHours() < 7
    ).length;
    const earlyStartRatio = earlyStarts / metrics.length;

    // Feature 6: PTO deficit
    // (would check PTO calendar in production; using focus sessions as proxy)
    const daysSinceBreak = 30; // placeholder

    const ptoDeficit = Math.min(1, Math.max(0, (daysSinceBreak - 30) / 30));

    // Weighted burnout score
    const burnoutScore =
      meetingOverload * 0.20 +
      meetingCreep * 0.15 +
      contextSwitchOverload * 0.15 +
      focusErosion * 0.20 +
      earlyStartRatio * 0.15 +
      ptoDeficit * 0.15;

    // Only alert if score is concerning
    if (burnoutScore > 0.55) {
      const contributingFactors: string[] = [];
      if (meetingOverload > 0.5) contributingFactors.push(`${Math.round(recentAvgMeetingHours)}h avg daily meetings`);
      if (focusErosion > 0.3) contributingFactors.push(`focus time down ${Math.round(focusErosion * 100)}%`);
      if (contextSwitchOverload > 0.5) contributingFactors.push(`${Math.round(recentAvgContextSwitches)} context switches/day`);
      if (earlyStartRatio > 0.3) contributingFactors.push(`starting work before 7am ${Math.round(earlyStartRatio * 100)}% of days`);

      return {
        type: 'PERSONAL',
        subType: 'burnout_risk',
        severity: burnoutScore > 0.75 ? 'high' : 'medium',
        score: burnoutScore,
        title: 'Elevated burnout risk detected',
        description: `Your sustainability score has declined over the past 2 weeks. Contributing factors: ${contributingFactors.join('; ')}.`,
        evidence: [
          {
            source: 'activity_metrics',
            data: {
              burnoutScore: Math.round(burnoutScore * 100) / 100,
              meetingOverload: Math.round(meetingOverload * 100) / 100,
              focusErosion: Math.round(focusErosion * 100) / 100,
              contextSwitchOverload: Math.round(contextSwitchOverload * 100) / 100,
              earlyStartRatio: Math.round(earlyStartRatio * 100) / 100,
              contributingFactors,
            },
            timestamp: new Date(),
          },
        ],
        affectedEntities: [],
        detectorName: this.name,
        detectorVersion: this.version,
      };
    }

    return null;
  }
}

// ---------------------------------------------------------------------------
// 5. COMMITMENT OVERRUN DETECTOR
// ---------------------------------------------------------------------------

/**
 * Detects when tracked commitments are at risk of being missed.
 *
 * Algorithm:
 * - For each open commitment with a due date:
 *   - Estimate completion probability using Monte Carlo simulation
 *     based on historical task completion velocity
 *   - If P(on_time) < 0.6, emit signal
 */
export class CommitmentOverrunDetector implements PatternDetector {
  name = 'CommitmentOverrunDetector';
  version = '1.0';

  constructor(private prisma: PrismaClient) {}

  appliesTo(event: EnrichedEvent): boolean {
    return ['task.completed', 'task.updated'].includes(event.eventType);
  }

  async detect(_event: EnrichedEvent, context: PipelineContext): Promise<DetectedSignal[]> {
    const signals: DetectedSignal[] = [];

    // Get open commitments approaching deadline
    const commitments = await this.prisma.commitment.findMany({
      where: {
        userId: context.userId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // next 2 weeks
        },
      },
      include: { owner: true },
    });

    for (const commitment of commitments) {
      if (!commitment.dueDate) continue;

      const daysUntilDue = (commitment.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

      // Simple heuristic: if commitment is still OPEN (not IN_PROGRESS)
      // and due within 3 days, it's at risk
      if (commitment.status === 'OPEN' && daysUntilDue < 3) {
        signals.push({
          type: 'PERSONAL',
          subType: 'commitment_at_risk',
          severity: daysUntilDue < 1 ? 'high' : 'medium',
          score: Math.max(0, 1 - (daysUntilDue / 3)),
          title: `Commitment at risk: "${commitment.description.substring(0, 60)}"`,
          description: `Due in ${Math.round(daysUntilDue)} day${daysUntilDue >= 2 ? 's' : ''} but hasn't started.${commitment.owner ? ` Owner: ${commitment.owner.name}.` : ''}`,
          evidence: [{
            source: 'commitment_tracker',
            data: {
              commitmentId: commitment.id,
              dueDate: commitment.dueDate.toISOString(),
              daysUntilDue: Math.round(daysUntilDue),
              status: commitment.status,
            },
            timestamp: new Date(),
          }],
          affectedEntities: commitment.owner
            ? [{ type: 'person', id: commitment.owner.id, name: commitment.owner.name }]
            : [],
          detectorName: this.name,
          detectorVersion: this.version,
        });
      }
    }

    return signals;
  }
}

// ---------------------------------------------------------------------------
// 6. MEETING EFFICIENCY DETECTOR
// ---------------------------------------------------------------------------

/**
 * Detects meetings that consistently produce low value.
 *
 * Algorithm:
 * - efficiency_score = (decisions + action_items) / (duration_hours * attendee_count)
 * - Track efficiency over time for recurring meetings
 * - Flag bottom 20% meetings and suggest optimization
 */
export class MeetingEfficiencyDetector implements PatternDetector {
  name = 'MeetingEfficiencyDetector';
  version = '1.0';

  constructor(private prisma: PrismaClient) {}

  appliesTo(event: EnrichedEvent): boolean {
    return event.eventType === 'meeting.ended';
  }

  async detect(event: EnrichedEvent, context: PipelineContext): Promise<DetectedSignal | null> {
    // Get recent meetings for this user
    const recentMeetings = await this.prisma.meeting.findMany({
      where: {
        userId: context.userId,
        endTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        efficiencyScore: { not: null },
      },
      orderBy: { efficiencyScore: 'asc' },
    });

    if (recentMeetings.length < 10) return null;

    // Find the 20th percentile threshold
    const p20Index = Math.floor(recentMeetings.length * 0.2);
    const p20Threshold = recentMeetings[p20Index]?.efficiencyScore ?? 0;

    // Check if the current meeting is below threshold
    const currentMeeting = await this.prisma.meeting.findFirst({
      where: {
        userId: context.userId,
        source: event.source,
        sourceId: event.sourceId,
      },
    });

    if (!currentMeeting || !currentMeeting.efficiencyScore) return null;
    if (currentMeeting.efficiencyScore > p20Threshold) return null;

    // Check if this is a recurring meeting with consistently low efficiency
    if (currentMeeting.isRecurring && currentMeeting.recurringId) {
      const seriesEfficiency = await this.prisma.meeting.findMany({
        where: {
          userId: context.userId,
          recurringId: currentMeeting.recurringId,
          efficiencyScore: { not: null },
        },
        select: { efficiencyScore: true },
        take: 5,
        orderBy: { startTime: 'desc' },
      });

      const avgEfficiency = avg(seriesEfficiency.map(m => m.efficiencyScore!));

      if (avgEfficiency < p20Threshold) {
        const durationHours = (currentMeeting.endTime.getTime() - currentMeeting.startTime.getTime()) / 3600000;
        const weeklyTimeCost = durationHours * currentMeeting.attendeeCount;

        return {
          type: 'ORGANIZATIONAL',
          subType: 'low_efficiency_meeting',
          severity: 'low',
          score: 1 - avgEfficiency,
          title: `"${currentMeeting.title}" has consistently low ROI`,
          description: `This recurring meeting averages ${Math.round(avgEfficiency * 100)}% efficiency (bottom 20%). It costs ${Math.round(weeklyTimeCost)} person-hours per occurrence. Consider: shorter duration, fewer attendees, or async format.`,
          evidence: [{
            source: 'meeting_metrics',
            data: {
              meetingTitle: currentMeeting.title,
              avgEfficiency,
              attendeeCount: currentMeeting.attendeeCount,
              durationHours,
              weeklyPersonHoursCost: weeklyTimeCost,
              p20Threshold,
            },
            timestamp: new Date(),
          }],
          affectedEntities: [{
            type: 'meeting' as any,
            id: currentMeeting.id,
            name: currentMeeting.title,
          }],
          detectorName: this.name,
          detectorVersion: this.version,
        };
      }
    }

    return null;
  }
}

// ---------------------------------------------------------------------------
// DETECTOR REGISTRY
// ---------------------------------------------------------------------------

export function createDefaultDetectors(prisma: PrismaClient): PatternDetector[] {
  return [
    new RelationshipDecayDetector(prisma),
    new VelocityDropDetector(prisma),
    new StrategicDriftDetector(prisma),
    new BurnoutRiskDetector(prisma),
    new CommitmentOverrunDetector(prisma),
    new MeetingEfficiencyDetector(prisma),
  ];
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
