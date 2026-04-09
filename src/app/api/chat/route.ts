import { buildPersonaContext } from '@/lib/persona-context-builder';
import { CHAT_TOOLS } from '@/lib/chat-tools';
import { executeTool } from '@/lib/tool-executor';
import type { Persona } from '@/lib/persona';

// ─── Build system prompt with persona context ───

function buildSystemPrompt(persona: Persona): string {
  let context: string;
  try {
    context = buildPersonaContext(persona);
  } catch {
    context = '(No persona data available)';
  }

  return `You are Orbit, a professional Chief of Staff AI assistant. You help the user manage their work day, prepare for meetings, track projects, and maintain relationships.

You are currently assisting a ${persona} professional. Here is their current data context:

${context}

You have access to tools that let you take actions:
- navigate_page: Navigate to Orbit pages
- search_data: Search across the user's data
- draft_artifact: Generate drafts (emails, proposals, tickets, etc.)
- propose_action: Propose actions for the user to approve in their Action Queue
- get_summary: Get persona summary metrics
- get_details: Get details about a specific entity

Guidelines:
- Be concise and actionable. Prefer bullet points for multi-item responses.
- Use tools proactively when they help answer the user's question.
- When searching for data, use the search_data tool to find specific items.
- When the user asks to see a page or navigate, use navigate_page.
- When the user asks to draft something, use draft_artifact and then write the content.
- When suggesting a concrete next step, use propose_action to create an action in their queue.
- Reference specific names, numbers, and deadlines from the context.
- Use a warm but professional tone. You are a trusted advisor.
- Keep responses focused — typically 2-4 short paragraphs or a brief list.`;
}

// ─── Mock response for when no API key is configured ───

function createMockStream(message: string, persona: string): ReadableStream<Uint8Array> {
  const lowerMessage = message.toLowerCase();

  // Mock tool results embedded as __TOOL: delimiters
  let response: string;

  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('show') && (lowerMessage.includes('deal') || lowerMessage.includes('at risk') || lowerMessage.includes('ticket'))) {
    if (persona === 'sales' || lowerMessage.includes('deal')) {
      response = `I found some relevant deals for you:\n\n__TOOL:${JSON.stringify({
        type: 'search-results',
        title: 'Search results for "deals"',
        data: {
          query: 'deals',
          results: [
            { type: 'deal', name: 'Acme Corp', detail: '$420K \u00b7 Negotiation \u00b7 at-risk', status: 'at-risk' },
            { type: 'deal', name: 'TechVista', detail: '$180K \u00b7 Discovery \u00b7 healthy', status: 'healthy' },
            { type: 'deal', name: 'CloudScale', detail: '$95K \u00b7 Proposal \u00b7 healthy', status: 'healthy' },
            { type: 'deal', name: 'Global Logistics', detail: '$310K \u00b7 Discovery \u00b7 at-risk', status: 'at-risk' },
          ],
          totalCount: 4,
        },
      })}__TOOL_END\n\nThe **Acme Corp** deal ($420K) is the most urgent \u2014 it\u2019s been stalling in negotiation for 14 days. **Global Logistics** ($310K) is also showing risk signals. Would you like me to draft a follow-up for either?`;
    } else {
      response = `Here's what I found:\n\n__TOOL:${JSON.stringify({
        type: 'search-results',
        title: 'Search results',
        data: { query: message, results: [], totalCount: 0 },
      })}__TOOL_END\n\nI didn't find specific matches. Try narrowing your search or ask me about a specific item.`;
    }
  } else if (lowerMessage.includes('draft') || lowerMessage.includes('write') || lowerMessage.includes('compose')) {
    response = `I\u2019ve drafted that for you:\n\n__TOOL:${JSON.stringify({
      type: 'draft-preview',
      title: 'Draft email',
      data: { artifactType: 'email', subject: 'Follow-up', context: message },
    })}__TOOL_END\n\n**Subject:** Quick follow-up on our discussion\n\nHi [Name],\n\nGreat speaking with you earlier. I wanted to follow up on the key points we discussed:\n\n1. **Timeline**: We agreed on a 2-week pilot starting next Monday\n2. **Scope**: Enterprise tier features with SSO integration\n3. **Next steps**: I'll send over the SOW by EOD tomorrow\n\nLet me know if you have any questions.\n\nBest,\n[Your name]`;
  } else if (lowerMessage.includes('go to') || lowerMessage.includes('navigate') || lowerMessage.includes('open')) {
    const pageMatch = lowerMessage.match(/(?:go to|navigate to|open)\s+(\w[\w\s-]*)/);
    const page = pageMatch?.[1]?.trim().replace(/\s+/g, '-') ?? 'home';
    const pageLabels: Record<string, string> = {
      'home': 'Home', 'deals': 'Deals', 'actions': 'Actions', 'inbox': 'Inbox',
      'tickets': 'Tickets', 'budget': 'Budget', 'features': 'Features',
      'analytics': 'Analytics', 'calendar': 'Calendar',
    };
    const label = pageLabels[page] ?? page;
    response = `__TOOL:${JSON.stringify({
      type: 'navigation',
      title: `Navigated to ${label}`,
      data: { page, label },
    })}__TOOL_END\n\nI've navigated you to **${label}**. Let me know if you need help with anything there.`;
  } else if (lowerMessage.includes('summary') || lowerMessage.includes('status') || lowerMessage.includes('overview')) {
    const metrics = persona === 'sales'
      ? [
          { label: 'Total Pipeline', value: '$1.2M' },
          { label: 'Weighted Pipeline', value: '$680K' },
          { label: 'Win Rate', value: '34%' },
          { label: 'Active Deals', value: '12' },
        ]
      : persona === 'engineering'
      ? [
          { label: 'PRs Needing Review', value: '8' },
          { label: 'Active Incidents', value: '1', status: 'critical' },
          { label: 'Sprint Completion', value: '67%' },
          { label: 'Test Coverage', value: '84%' },
        ]
      : persona === 'product'
      ? [
          { label: 'Active PRDs', value: '6' },
          { label: 'Blocked Features', value: '2', status: 'warning' },
          { label: 'Sprint Velocity', value: '34 pts' },
          { label: 'NPS', value: '48' },
        ]
      : [
          { label: 'Total Budget', value: '$4.2M' },
          { label: 'Total Spent', value: '$2.1M' },
          { label: 'Monthly Burn', value: '$420K' },
          { label: 'Runway', value: '18 months' },
        ];

    response = `Here's your current overview:\n\n__TOOL:${JSON.stringify({
      type: 'summary',
      title: `${persona.charAt(0).toUpperCase() + persona.slice(1)} Summary`,
      data: { persona, aspect: 'all', metrics },
    })}__TOOL_END\n\nWould you like me to dig into any of these metrics?`;
  } else if (lowerMessage.includes('priorit') || lowerMessage.includes('should i') || lowerMessage.includes('what') && lowerMessage.includes('today')) {
    response = `Based on your current data, here\u2019s what I\u2019d prioritize today:\n\n1. **Respond to urgent items** \u2014 you have 2 high-priority items that need immediate attention\n2. **Review pending actions** \u2014 there are actions in your queue waiting for approval\n3. **Prepare for upcoming meetings** \u2014 check your calendar for any meetings today\n\n__TOOL:${JSON.stringify({
      type: 'action-proposed',
      title: 'Review and approve pending actions',
      data: {
        title: 'Review and approve pending actions',
        description: 'You have pending actions in your queue that need your attention. Review and approve or dismiss them to keep your workflow moving.',
        actionType: 'navigate',
      },
    })}__TOOL_END\n\nWould you like me to prep you for any specific meeting or dive into a particular area?`;
  } else {
    response = `I'd be happy to help with that! Here are a few things I can do for you:\n\n- **Search** your data \u2014 "Show me at-risk deals" or "Find tickets about payments"\n- **Navigate** \u2014 "Go to deals" or "Open the actions page"\n- **Draft** content \u2014 "Draft a follow-up email to Sarah"\n- **Summarize** \u2014 "What's my pipeline status?" or "Show sprint summary"\n- **Propose actions** \u2014 "What should I prioritize today?"\n\nWhat would you like to work on?`;
  }

  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= response.length) {
        controller.close();
        return;
      }
      const chunkSize = Math.floor(Math.random() * 5) + 2;
      const chunk = response.slice(index, index + chunkSize);
      index += chunkSize;
      controller.enqueue(encoder.encode(chunk));
      await new Promise((resolve) => setTimeout(resolve, 15));
    },
  });
}

// ─── POST handler ───

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, persona = 'sales', history = [] } = body as {
      message: string;
      persona?: Persona;
      history?: Array<{ role: string; content: string }>;
    };

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return a helpful mock response
    if (!apiKey || apiKey === 'sk-ant-your-key-here') {
      return new Response(createMockStream(message, persona), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Build messages array with history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const h of history.slice(-10)) { // Keep last 10 messages for context
      messages.push({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content,
      });
    }
    messages.push({ role: 'user', content: message });

    // Call Anthropic API with tools
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const systemPrompt = buildSystemPrompt(persona);
    const encoder = new TextEncoder();

    // Use streaming with tool-use support
    const readableStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let currentMessages = [...messages];
          let iterations = 0;
          const MAX_ITERATIONS = 3; // Prevent infinite tool loops

          while (iterations < MAX_ITERATIONS) {
            iterations++;

            const response = await client.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1024,
              system: systemPrompt,
              messages: currentMessages,
              tools: CHAT_TOOLS as Parameters<typeof client.messages.create>[0]['tools'],
            });

            let hasToolUse = false;
            const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

            for (const block of response.content) {
              if (block.type === 'text') {
                controller.enqueue(encoder.encode(block.text));
              } else if (block.type === 'tool_use') {
                hasToolUse = true;

                // Execute the tool
                const result = executeTool(
                  block.name,
                  block.input as Record<string, string>,
                  persona
                );

                // Emit tool result as inline card for the client
                const toolDelimiter = `\n__TOOL:${JSON.stringify(result)}__TOOL_END\n`;
                controller.enqueue(encoder.encode(toolDelimiter));

                // Prepare tool result for Claude follow-up
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(result.data),
                });
              }
            }

            if (!hasToolUse || response.stop_reason !== 'tool_use') {
              // No more tool calls — we're done
              break;
            }

            // Continue conversation with tool results
            currentMessages = [
              ...currentMessages,
              { role: 'assistant' as const, content: response.content as unknown as string },
              { role: 'user' as const, content: toolResults as unknown as string },
            ];
          }

          controller.close();
        } catch (err) {
          console.error('Chat stream error:', err);
          controller.enqueue(encoder.encode('\n\nSorry, I encountered an error processing your request.'));
          controller.close();
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
