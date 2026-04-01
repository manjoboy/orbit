'use client';

import { cn } from '@/lib/utils';
import type { Message } from './conversation-view';
import { PriorityListCard } from '../cards/priority-list-card';
import { MeetingPrepCard } from '../cards/meeting-prep-card';
import { IntelBriefCard } from '../cards/intel-brief-card';
import { RelationshipAlertCard } from '../cards/relationship-alert-card';
import { ProjectHealthCard } from '../cards/project-health-card';
import { WellbeingCard } from '../cards/wellbeing-card';
import { StatRowCard } from '../cards/stat-row-card';
import { ActionPromptCard } from '../cards/action-prompt-card';

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  if (message.role === 'user') {
    return <UserMessage content={message.content ?? ''} />;
  }

  return <AIMessage message={message} isLatest={isLatest} />;
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end py-2 animate-fade-in">
      <div className={cn(
        'max-w-[480px] px-4 py-2.5 rounded-2xl rounded-br-md',
        'bg-blue-600 text-white text-[14px] leading-relaxed'
      )}>
        {content}
      </div>
    </div>
  );
}

function AIMessage({ message, isLatest }: { message: Message; isLatest: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 animate-slide-up">
      {/* Avatar */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
        <span className="text-[11px] font-bold text-white">CS</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Text content */}
        {message.content && (
          <p className="text-[14.5px] text-[var(--color-text-secondary)] leading-[1.7]">
            {message.content}
          </p>
        )}

        {/* Rich cards */}
        {message.cards && message.cards.length > 0 && (
          <div className="space-y-2.5">
            {message.cards.map((card, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardRenderer card={card} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardRenderer({ card }: { card: Message['cards'] extends (infer T)[] | undefined ? T : never }) {
  switch (card.type) {
    case 'priority-list':
      return <PriorityListCard data={card.data} />;
    case 'meeting-prep':
      return <MeetingPrepCard data={card.data} />;
    case 'intel-brief':
      return <IntelBriefCard data={card.data} />;
    case 'relationship-alert':
      return <RelationshipAlertCard data={card.data} />;
    case 'project-health':
      return <ProjectHealthCard data={card.data} />;
    case 'wellbeing':
      return <WellbeingCard data={card.data} />;
    case 'stat-row':
      return <StatRowCard data={card.data} />;
    case 'action-prompt':
      return <ActionPromptCard data={card.data} />;
    default:
      return null;
  }
}
