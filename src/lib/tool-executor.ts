// ============================================================================
// Tool Executor — Server-side tool execution against persona data
// Executes tools called by Claude in the chat API route
// ============================================================================

import type { Persona } from './persona';
import type { ToolResultCard } from './agent-types';

interface ToolInput {
  [key: string]: string | undefined;
}

// ─── Fuzzy text matcher ───

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  return lower.includes(q) || q.split(' ').every((word) => lower.includes(word));
}

// ─── Execute a tool and return a result card ───

export function executeTool(
  toolName: string,
  input: ToolInput,
  persona: Persona
): ToolResultCard {
  switch (toolName) {
    case 'navigate_page':
      return executeNavigate(input);
    case 'search_data':
      return executeSearch(input, persona);
    case 'draft_artifact':
      return executeDraft(input);
    case 'propose_action':
      return executeProposeAction(input);
    case 'get_summary':
      return executeGetSummary(input, persona);
    case 'get_details':
      return executeGetDetails(input, persona);
    default:
      return { type: 'summary', title: 'Unknown tool', data: { error: `Unknown tool: ${toolName}` } };
  }
}

// ─── Navigate ───

function executeNavigate(input: ToolInput): ToolResultCard {
  const page = input.page ?? 'home';
  const pageLabels: Record<string, string> = {
    home: 'Home', actions: 'Actions', inbox: 'Inbox', calendar: 'Calendar',
    analytics: 'Analytics', deals: 'Deals', relationships: 'Relationships',
    'competitive-intel': 'Competitive Intel', features: 'Features',
    'customer-feedback': 'Customer Feedback', sprints: 'Sprints',
    tickets: 'Tickets', 'pull-requests': 'Pull Requests', deployments: 'Deployments',
    budget: 'Budget', approvals: 'Approvals', forecasting: 'Forecasting',
  };
  return {
    type: 'navigation',
    title: `Navigated to ${pageLabels[page] ?? page}`,
    data: { page, label: pageLabels[page] ?? page },
  };
}

// ─── Search ───

function executeSearch(input: ToolInput, persona: Persona): ToolResultCard {
  const query = input.query ?? '';
  const category = input.category;
  const results: Array<{ type: string; name: string; detail: string; status?: string }> = [];

  try {
    if (persona === 'sales' || !category || category === 'deals' || category === 'contacts') {
      const sales = require('./persona-data/sales-data');
      if (!category || category === 'deals') {
        for (const d of (sales.DEALS ?? sales.SALES_DEALS ?? [])) {
          if (fuzzyMatch(`${d.company} ${d.stage} ${d.nextStep} ${d.owner ?? ''}`, query)) {
            results.push({ type: 'deal', name: d.company, detail: `$${(d.value / 1000).toFixed(0)}K · ${d.stage} · ${d.health}`, status: d.health });
          }
        }
      }
      if (!category || category === 'contacts') {
        for (const c of (sales.CONTACTS ?? sales.SALES_CONTACTS ?? [])) {
          if (fuzzyMatch(`${c.name} ${c.company} ${c.role} ${c.notes ?? ''}`, query)) {
            results.push({ type: 'contact', name: c.name, detail: `${c.role} at ${c.company} · ${c.health}` });
          }
        }
      }
    }

    if (persona === 'engineering' || !category || category === 'tickets' || category === 'prs') {
      const eng = require('./persona-data/engineering-data');
      if (!category || category === 'tickets') {
        for (const t of (eng.TICKETS ?? [])) {
          if (fuzzyMatch(`${t.key} ${t.title} ${t.assignee} ${t.status}`, query)) {
            results.push({ type: 'ticket', name: `${t.key}: ${t.title}`, detail: `${t.assignee} · ${t.status} · ${t.priority}`, status: t.priority });
          }
        }
      }
      if (!category || category === 'prs') {
        for (const pr of (eng.PULL_REQUESTS ?? [])) {
          if (fuzzyMatch(`${pr.title} ${pr.author} #${pr.number}`, query)) {
            results.push({ type: 'pr', name: `#${pr.number}: ${pr.title}`, detail: `${pr.author} · ${pr.status} · CI: ${pr.ciStatus}`, status: pr.ciStatus });
          }
        }
      }
    }

    if (persona === 'product' || !category || category === 'prds' || category === 'feedback') {
      const prod = require('./persona-data/product-data');
      if (!category || category === 'prds') {
        for (const p of (prod.PRD_ITEMS ?? [])) {
          if (fuzzyMatch(`${p.title} ${p.owner} ${p.status}`, query)) {
            results.push({ type: 'prd', name: p.title, detail: `${p.owner} · ${p.status} · ${p.customerRequests} requests` });
          }
        }
      }
      if (!category || category === 'feedback') {
        for (const f of (prod.FEEDBACK_THEMES ?? [])) {
          if (fuzzyMatch(`${f.theme} ${f.agentSynthesis ?? ''}`, query)) {
            results.push({ type: 'feedback', name: f.theme, detail: `${f.mentions} mentions · ${f.sentiment} · ${f.trend}` });
          }
        }
      }
    }

    if (persona === 'finance' || !category || category === 'budget' || category === 'approvals') {
      const fin = require('./persona-data/finance-persona-data');
      if (!category || category === 'budget') {
        for (const b of (fin.BUDGET_CATEGORIES ?? [])) {
          if (fuzzyMatch(`${b.name} ${b.status}`, query)) {
            const pct = Math.round((b.spent / b.allocated) * 100);
            results.push({ type: 'budget', name: b.name, detail: `$${(b.allocated / 1000).toFixed(0)}K allocated · ${pct}% spent · ${b.status}`, status: b.status });
          }
        }
      }
      if (!category || category === 'approvals') {
        for (const a of (fin.APPROVAL_ITEMS ?? [])) {
          if (fuzzyMatch(`${a.requester} ${a.description} ${a.type}`, query)) {
            results.push({ type: 'approval', name: a.description, detail: `${a.requester} · $${(a.amount / 1000).toFixed(0)}K · ${a.status}`, status: a.status });
          }
        }
      }
    }
  } catch {
    // Data file not available for this persona — return empty results
  }

  return {
    type: 'search-results',
    title: `Search results for "${query}"`,
    data: { query, results: results.slice(0, 8), totalCount: results.length },
  };
}

// ─── Draft ───

function executeDraft(input: ToolInput): ToolResultCard {
  const type = input.type ?? 'email';
  const subject = input.subject ?? 'Untitled';

  // In real implementation, Claude generates the draft content
  // Here we return the metadata; the LLM response text IS the draft
  return {
    type: 'draft-preview',
    title: `Draft ${type}: ${subject}`,
    data: { artifactType: type, subject, context: input.context ?? '' },
  };
}

// ─── Propose Action ───

function executeProposeAction(input: ToolInput): ToolResultCard {
  return {
    type: 'action-proposed',
    title: input.title ?? 'Proposed action',
    data: {
      title: input.title ?? 'Proposed action',
      description: input.description ?? '',
      reasoning: input.reasoning ?? '',
      actionType: input.action_type ?? 'create',
    },
  };
}

// ─── Get Summary ───

function executeGetSummary(input: ToolInput, persona: Persona): ToolResultCard {
  const aspect = input.aspect ?? 'all';
  const metrics: Array<{ label: string; value: string; status?: string }> = [];

  try {
    if (persona === 'sales') {
      const { SALES_SUMMARY } = require('./persona-data/sales-data');
      if (SALES_SUMMARY) {
        metrics.push(
          { label: 'Total Pipeline', value: `$${(SALES_SUMMARY.totalPipeline / 1000).toFixed(0)}K` },
          { label: 'Weighted Pipeline', value: `$${(SALES_SUMMARY.weightedPipeline / 1000).toFixed(0)}K` },
          { label: 'Win Rate', value: `${SALES_SUMMARY.winRate}%` },
          { label: 'Avg Deal Cycle', value: `${SALES_SUMMARY.avgDealCycle}d` },
          { label: 'Active Deals', value: `${SALES_SUMMARY.activeDeals ?? 'N/A'}` },
        );
      }
    } else if (persona === 'engineering') {
      const { ENGINEERING_SUMMARY } = require('./persona-data/engineering-data');
      if (ENGINEERING_SUMMARY) {
        metrics.push(
          { label: 'PRs Needing Review', value: `${ENGINEERING_SUMMARY.prsNeedingReview}` },
          { label: 'Active Incidents', value: `${ENGINEERING_SUMMARY.activeIncidents}`, status: ENGINEERING_SUMMARY.activeIncidents > 0 ? 'critical' : 'healthy' },
          { label: 'Sprint Completion', value: `${ENGINEERING_SUMMARY.sprintCompletion}%` },
          { label: 'Test Coverage', value: `${ENGINEERING_SUMMARY.testCoverage}%` },
        );
      }
    } else if (persona === 'product') {
      const { PRODUCT_SUMMARY } = require('./persona-data/product-data');
      if (PRODUCT_SUMMARY) {
        metrics.push(
          { label: 'Active PRDs', value: `${PRODUCT_SUMMARY.activePRDs}` },
          { label: 'Blocked Features', value: `${PRODUCT_SUMMARY.blockedFeatures}`, status: PRODUCT_SUMMARY.blockedFeatures > 0 ? 'warning' : 'healthy' },
          { label: 'Sprint Velocity', value: `${PRODUCT_SUMMARY.sprintVelocity} pts` },
          { label: 'NPS', value: `${PRODUCT_SUMMARY.nps}` },
          { label: 'Feedback Mentions', value: `${PRODUCT_SUMMARY.feedbackMentions}` },
        );
      }
    } else if (persona === 'finance') {
      const { FINANCE_SUMMARY } = require('./persona-data/finance-persona-data');
      if (FINANCE_SUMMARY) {
        metrics.push(
          { label: 'Total Budget', value: `$${(FINANCE_SUMMARY.totalBudget / 1e6).toFixed(1)}M` },
          { label: 'Total Spent', value: `$${(FINANCE_SUMMARY.totalSpent / 1e6).toFixed(1)}M` },
          { label: 'Monthly Burn', value: `$${(FINANCE_SUMMARY.monthlyBurn / 1000).toFixed(0)}K` },
          { label: 'Runway', value: `${FINANCE_SUMMARY.runway} months` },
          { label: 'Pending Approvals', value: `${FINANCE_SUMMARY.pendingApprovals}` },
        );
      }
    }
  } catch {
    // Data not available
  }

  return {
    type: 'summary',
    title: `${persona.charAt(0).toUpperCase() + persona.slice(1)} Summary — ${aspect}`,
    data: { persona, aspect, metrics },
  };
}

// ─── Get Details ───

function executeGetDetails(input: ToolInput, persona: Persona): ToolResultCard {
  const name = input.name ?? '';
  const entityType = input.entity_type;

  let found: Record<string, unknown> | null = null;
  let foundType = entityType ?? 'unknown';

  try {
    // Try to find the entity across data sources
    if (!entityType || entityType === 'deal' || entityType === 'contact') {
      const sales = require('./persona-data/sales-data');
      if (!found) {
        const deal = (sales.DEALS ?? sales.SALES_DEALS ?? []).find((d: { company: string }) => fuzzyMatch(d.company, name));
        if (deal) { found = deal; foundType = 'deal'; }
      }
      if (!found) {
        const contact = (sales.CONTACTS ?? sales.SALES_CONTACTS ?? []).find((c: { name: string }) => fuzzyMatch(c.name, name));
        if (contact) { found = contact; foundType = 'contact'; }
      }
    }

    if (!found && (!entityType || entityType === 'ticket' || entityType === 'pr')) {
      const eng = require('./persona-data/engineering-data');
      if (!found) {
        const ticket = (eng.TICKETS ?? []).find((t: { key: string; title: string }) => fuzzyMatch(`${t.key} ${t.title}`, name));
        if (ticket) { found = ticket; foundType = 'ticket'; }
      }
      if (!found) {
        const pr = (eng.PULL_REQUESTS ?? []).find((p: { title: string; number: number }) => fuzzyMatch(`${p.title} #${p.number}`, name));
        if (pr) { found = pr; foundType = 'pr'; }
      }
    }

    if (!found && (!entityType || entityType === 'prd')) {
      const prod = require('./persona-data/product-data');
      const prd = (prod.PRD_ITEMS ?? []).find((p: { title: string }) => fuzzyMatch(p.title, name));
      if (prd) { found = prd; foundType = 'prd'; }
    }

    if (!found && (!entityType || entityType === 'budget-item' || entityType === 'approval')) {
      const fin = require('./persona-data/finance-persona-data');
      const budget = (fin.BUDGET_CATEGORIES ?? []).find((b: { name: string }) => fuzzyMatch(b.name, name));
      if (budget) { found = budget; foundType = 'budget-item'; }
      if (!found) {
        const approval = (fin.APPROVAL_ITEMS ?? []).find((a: { description: string }) => fuzzyMatch(a.description, name));
        if (approval) { found = approval; foundType = 'approval'; }
      }
    }
  } catch {
    // Data not available
  }

  if (!found) {
    return {
      type: 'detail-view',
      title: `Not found: ${name}`,
      data: { found: false, query: name, entityType: entityType ?? 'any' },
    };
  }

  return {
    type: 'detail-view',
    title: `${foundType}: ${name}`,
    data: { found: true, entityType: foundType, entity: found },
  };
}
