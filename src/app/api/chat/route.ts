import { BRIEFING_SECTIONS } from '@/lib/briefing-data';

// ─── Build context string from briefing data ───
function buildBriefingContext(): string {
  const parts: string[] = [];

  for (const section of BRIEFING_SECTIONS) {
    if (section.type === 'item-list' && section.items) {
      parts.push('## Priority Inbox');
      for (const item of section.items) {
        parts.push(`- [${item.urgency ? 'URGENT' : 'normal'}] ${item.from}: ${item.title} (${item.time} ago)`);
      }
    }

    if (section.type === 'meeting-list' && section.meetings) {
      parts.push('\n## Today\'s Meetings');
      for (const m of section.meetings) {
        parts.push(`- ${m.time} — ${m.title} (${m.duration}, ${m.attendeeCount} attendees)`);
        if (m.anticipations.length > 0) {
          for (const a of m.anticipations) {
            parts.push(`  * Heads up: ${a.title} — ${a.body}`);
          }
        }
        if (m.openItems.length > 0) {
          parts.push(`  * Open items: ${m.openItems.join('; ')}`);
        }
      }
    }

    if (section.type === 'project-list' && section.projects) {
      parts.push('\n## Project Health');
      for (const p of section.projects) {
        const healthPct = Math.round(p.health * 100);
        parts.push(`- ${p.name}: health ${healthPct}%, trend ${p.trend}, velocity ${p.velocity > 0 ? '+' : ''}${p.velocity}%, ${p.blockers} blockers, ${p.deadline ?? '?'}d to deadline, status ${p.status}`);
      }
    }

    if (section.type === 'intel-list' && section.signals) {
      parts.push('\n## Intelligence');
      for (const s of section.signals) {
        parts.push(`- [${s.type}${s.company ? ` — ${s.company}` : ''}] ${s.title} (relevance ${s.relevance}%)`);
        parts.push(`  Impact: ${s.impact}`);
        parts.push(`  Suggested action: ${s.action}`);
      }
    }

    if (section.type === 'people-list' && section.people) {
      parts.push('\n## Relationships');
      for (const p of section.people) {
        parts.push(`- ${p.name} (${p.role}): ${p.subtitle} — last contact ${p.days}d ago — action: ${p.action}`);
      }
    }

    if (section.type === 'wellbeing') {
      parts.push('\n## Wellbeing');
      parts.push(`Sustainability score: ${section.score}/100`);
      if (section.metrics) {
        for (const m of section.metrics) {
          parts.push(`- ${m.label}: ${m.value}${m.warn ? ' (warning)' : ''}`);
        }
      }
    }
  }

  return parts.join('\n');
}

const SYSTEM_PROMPT = `You are Orbit, a professional Chief of Staff AI assistant. You help the user manage their work day, prepare for meetings, track projects, and maintain relationships.

You have access to the user's current briefing context:

${buildBriefingContext()}

Guidelines:
- Be concise and actionable. Prefer bullet points for multi-item responses.
- Reference specific people, meetings, projects, and data from the briefing context when relevant.
- If asked about something outside your context, acknowledge what you know and suggest next steps.
- Use a warm but professional tone. You are a trusted advisor, not a generic chatbot.
- When prepping for meetings, proactively surface relevant anticipations, open items, and relationship context.
- For project questions, reference health scores, trends, blockers, and deadlines.
- Keep responses focused — typically 2-4 short paragraphs or a brief list.`;

// ─── Mock response for when no API key is configured ───
function createMockStream(message: string): ReadableStream<Uint8Array> {
  const mockResponses: Record<string, string> = {
    default: `I'd be happy to help with that. Based on your current briefing, here are a few things to note:

- **Enterprise Onboarding** is at risk (38% health, -42% velocity) with 3 blockers and 18 days to deadline
- You have **3 meetings today** — the 2pm Product Review has 3 heads-up items
- **Sarah Chen** flagged a critical auth dependency that needs a decision on workaround vs. 2-day delay
- **David Park** needs your headcount projections by EOD

Would you like me to dive deeper into any of these?`,
    prioritize: `Here's my suggested priority order for today:

1. **Submit headcount projections to David Park** — due EOD, blocks the 2pm Product Review
2. **Respond to Sarah Chen on auth dependency** — critical decision: workaround vs. 2-day delay
3. **Review Jordan's SSO architecture proposal** — she's waiting on your approval
4. **Prep for 2pm Product Review** — Mei's tone has shifted, expect pressure on Q2 goals
5. **Check on platform team opening for Jordan** — you're 6 weeks overdue on this promise

The Enterprise Onboarding project needs urgent attention too — health is at 38% and dropping.`,
    meeting: `Here's your prep for the **2pm Product Review**:

**Attendees:** Mei Zhang (VP Product), David Park (CFO), Tom Baker (Head of Sales), Sarah Chen

**Heads up:**
- Mei's sentiment has been more critical lately — possible board pressure on Q1 results
- Tom's team got questions from 3 prospects about Intercom's new AI Agent Builder — expect push to accelerate Agent Builder v2
- 2 open items from last meeting: your headcount projections (due today) and Tom's pipeline forecast (overdue)

**Last meeting summary:** Q1 OKR results were below target. Mei pushed for aggressive Q2 goals. David raised budget constraints.

**Suggested prep:** Have your headcount projections ready, and be prepared to discuss the Agent Builder v2 timeline given the Intercom competitive pressure.`,
  };

  const lowerMessage = message.toLowerCase();
  let response = mockResponses.default;
  if (lowerMessage.includes('priorit') || lowerMessage.includes('should i')) {
    response = mockResponses.prioritize;
  } else if (lowerMessage.includes('meeting') || lowerMessage.includes('prep') || lowerMessage.includes('2pm') || lowerMessage.includes('product review')) {
    response = mockResponses.meeting;
  }

  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= response.length) {
        controller.close();
        return;
      }

      // Emit 2-6 characters at a time to simulate streaming
      const chunkSize = Math.floor(Math.random() * 5) + 2;
      const chunk = response.slice(index, index + chunkSize);
      index += chunkSize;

      controller.enqueue(encoder.encode(chunk));

      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 15));
    },
  });
}

// ─── POST handler ───
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body as { message: string; context?: object };

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return a helpful mock response
    if (!apiKey || apiKey === 'sk-ant-your-key-here') {
      return new Response(createMockStream(message), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Call Anthropic API with streaming
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
