'use client';

import { useState } from 'react';
import { getGreeting } from '@/lib/utils';
import { BriefingHeader } from './briefing-header';
import { PriorityInbox } from './priority-inbox';
import { MeetingTimeline } from '../meetings/meeting-timeline';
import { ProjectHealthGrid } from './project-health-grid';
import { RelationshipAlerts } from './relationship-alerts';
import { IndustryIntelFeed } from '../intelligence/industry-intel-feed';
import { StrategicAlignmentCard } from './strategic-alignment-card';
import { WellbeingCard } from './wellbeing-card';
import { SectionFeedback } from '../feedback/section-feedback';
import { MOCK_BRIEFING } from '@/lib/mock-data';

export function BriefingDashboard() {
  const [briefing] = useState(MOCK_BRIEFING);
  // Use lazy useState initializers so the value is computed only on the client
  // after hydration, avoiding server/client mismatch from time-based rendering.
  const [greeting] = useState(() => getGreeting('Manoj'));
  const [today] = useState(() => new Date());

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <BriefingHeader
        greeting={greeting}
        date={today}
        signalCount={briefing.signalCount}
        insightCount={briefing.insightCount}
      />

      {/* Main Content — Two Column Layout */}
      <div className="max-w-[1400px] mx-auto px-6 pt-2">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Left Column — Primary Content */}
          <div className="space-y-6">
            {/* Priority Inbox */}
            <SectionFeedback sectionType="priority_inbox" sectionTitle="Priority Inbox">
              <PriorityInbox items={briefing.priorityInbox} />
            </SectionFeedback>

            {/* Today's Meetings */}
            <SectionFeedback sectionType="meeting_prep" sectionTitle="Today's Meetings">
              <MeetingTimeline meetings={briefing.meetings} />
            </SectionFeedback>

            {/* Project Health */}
            <SectionFeedback sectionType="project_updates" sectionTitle="Project Health">
              <ProjectHealthGrid projects={briefing.projectUpdates} />
            </SectionFeedback>

            {/* Industry Intelligence */}
            <SectionFeedback sectionType="industry_intel" sectionTitle="Intelligence">
              <IndustryIntelFeed signals={briefing.industryIntel} />
            </SectionFeedback>
          </div>

          {/* Right Column — Supporting Context */}
          <div className="space-y-6">
            {/* Strategic Alignment */}
            <StrategicAlignmentCard data={briefing.strategicAlignment} />

            {/* Wellbeing */}
            <WellbeingCard data={briefing.wellbeingCheck} />

            {/* Relationship Alerts */}
            <SectionFeedback sectionType="relationship_alerts" sectionTitle="Relationships">
              <RelationshipAlerts alerts={briefing.relationshipAlerts} />
            </SectionFeedback>
          </div>
        </div>
      </div>
    </div>
  );
}
