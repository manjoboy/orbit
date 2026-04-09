// ============================================================================
// Chat Tool Definitions — Tool schemas for Claude tool-use in chat
// ============================================================================

export const CHAT_TOOLS = [
  {
    name: 'navigate_page',
    description: 'Navigate the user to a specific Orbit page. Use this when the user asks to "go to", "show me", or "open" a page.',
    input_schema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'string',
          description: 'The page ID to navigate to. Options: home, actions, inbox, calendar, analytics, deals, relationships, competitive-intel, features, customer-feedback, sprints, tickets, pull-requests, deployments, budget, approvals, forecasting',
        },
      },
      required: ['page'],
    },
  },
  {
    name: 'search_data',
    description: 'Search across the user\'s data (deals, tickets, PRDs, contacts, budget items, etc.) using a text query. Returns matching items.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query to match against names, titles, descriptions, and other fields',
        },
        category: {
          type: 'string',
          description: 'Optional category filter: deals, contacts, tickets, prs, prds, feedback, budget, approvals, deployments',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'draft_artifact',
    description: 'Generate a draft document or content piece. Use when the user asks to draft, write, compose, or create text content.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          description: 'Type of artifact: email, proposal, ticket, prd-section, summary, battle-card, board-update',
        },
        subject: {
          type: 'string',
          description: 'What the draft is about (e.g., "follow-up email to Sarah about auth dependency")',
        },
        context: {
          type: 'string',
          description: 'Additional context or instructions for the draft',
        },
      },
      required: ['type', 'subject'],
    },
  },
  {
    name: 'propose_action',
    description: 'Propose an action for the user to approve. The action will appear in their Action Queue. Use when suggesting concrete next steps.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'Short, action-oriented title (e.g., "Schedule follow-up with Acme Corp")',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what the action involves',
        },
        reasoning: {
          type: 'string',
          description: 'Why this action is recommended',
        },
        action_type: {
          type: 'string',
          description: 'Type of action: navigate, draft, search, create, escalate, schedule',
        },
      },
      required: ['title', 'description', 'action_type'],
    },
  },
  {
    name: 'get_summary',
    description: 'Get a summary of the user\'s data for their current persona. Returns key metrics and status overview.',
    input_schema: {
      type: 'object' as const,
      properties: {
        aspect: {
          type: 'string',
          description: 'What to summarize: pipeline, sprint, budget, team, projects, all',
        },
      },
      required: ['aspect'],
    },
  },
  {
    name: 'get_details',
    description: 'Get detailed information about a specific entity (deal, contact, ticket, PR, budget item, etc.) by name or ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'The name or ID of the entity to look up',
        },
        entity_type: {
          type: 'string',
          description: 'Type of entity: deal, contact, ticket, pr, prd, budget-item, approval, deployment',
        },
      },
      required: ['name'],
    },
  },
];
