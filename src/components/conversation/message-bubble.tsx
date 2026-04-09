'use client';

import type { Message } from './conversation-view';
import { PriorityListCard } from '../cards/priority-list-card';
import { MeetingPrepCard } from '../cards/meeting-prep-card';
import { IntelBriefCard } from '../cards/intel-brief-card';
import { RelationshipAlertCard } from '../cards/relationship-alert-card';
import { ProjectHealthCard } from '../cards/project-health-card';
import { WellbeingCard } from '../cards/wellbeing-card';
import { StatRowCard } from '../cards/stat-row-card';
import { ActionPromptCard } from '../cards/action-prompt-card';
import { ToolResultCardRenderer } from '../cards/tool-result-cards';

export function MessageBubble({ message, isLatest: _isLatest }: { message: Message; isLatest: boolean }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end py-1.5 animate-fade-in">
        <div className="max-w-[440px] px-3.5 py-2 rounded-2xl rounded-br-sm bg-[var(--color-accent-strong)] text-white text-[13px] leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 animate-slide-up">
      {message.content && (
        <p className="text-[13.5px] text-[var(--color-text-secondary)] leading-[1.65] mb-2.5">
          {message.content}
        </p>
      )}
      {message.cards && message.cards.length > 0 && (
        <div className="space-y-2">
          {message.cards.map((card, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardRenderer card={card} />
            </div>
          ))}
        </div>
      )}
      {/* Tool result cards from agent chat */}
      {message.toolResults && message.toolResults.length > 0 && (
        <div className="space-y-2 mt-2">
          {message.toolResults.map((card, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <ToolResultCardRenderer card={card} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardRenderer({ card }: { card: NonNullable<Message['cards']>[number] }) {
  switch (card.type) {
    case 'priority-list': return <PriorityListCard data={card.data} />;
    case 'meeting-prep': return <MeetingPrepCard data={card.data} />;
    case 'intel-brief': return <IntelBriefCard data={card.data} />;
    case 'relationship-alert': return <RelationshipAlertCard data={card.data} />;
    case 'project-health': return <ProjectHealthCard data={card.data} />;
    case 'wellbeing': return <WellbeingCard data={card.data} />;
    case 'stat-row': return <StatRowCard data={card.data} />;
    case 'action-prompt': return <ActionPromptCard data={card.data} />;
    default: return null;
  }
}
