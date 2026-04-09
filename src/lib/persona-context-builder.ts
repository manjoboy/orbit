// ============================================================================
// Persona Context Builder — Assembles persona data into text context for Claude
// Used by: /api/briefing, /api/chat
// ============================================================================

import type { Persona } from './persona';

// ─── Sales Context ───

function buildSalesContext(): string {
  // Dynamic import won't work server-side easily, so we inline the key data references
  const { DEALS, CONTACTS, COMPETITOR_THREATS, SALES_SUMMARY } = require('./persona-data/sales-data');
  const parts: string[] = [];

  parts.push('## Pipeline Overview');
  if (SALES_SUMMARY) {
    parts.push(`Total pipeline: $${(SALES_SUMMARY.totalPipeline / 1000).toFixed(0)}K | Weighted: $${(SALES_SUMMARY.weightedPipeline / 1000).toFixed(0)}K | Win rate: ${SALES_SUMMARY.winRate}% | Avg cycle: ${SALES_SUMMARY.avgDealCycle}d`);
  }

  parts.push('\n## Active Deals');
  for (const d of DEALS.slice(0, 6)) {
    parts.push(`- **${d.company}**: $${(d.value / 1000).toFixed(0)}K | ${d.stage} | ${d.health} health | ${d.probability}% prob | ${d.daysInStage}d in stage | Next: ${d.nextStep}`);
  }

  parts.push('\n## Key Contacts');
  for (const c of CONTACTS.slice(0, 5)) {
    parts.push(`- ${c.name} (${c.role}, ${c.company}): ${c.health} relationship | Last interaction: ${c.lastInteraction} | ${c.notes}`);
  }

  parts.push('\n## Competitive Threats');
  for (const t of COMPETITOR_THREATS.slice(0, 4)) {
    parts.push(`- [${t.threatLevel}] ${t.competitor} in ${t.deal}: ${t.context}`);
  }

  return parts.join('\n');
}

// ─── Product Context ───

function buildProductContext(): string {
  const { PRD_ITEMS, FEEDBACK_THEMES, SPRINT_ITEMS, PRODUCT_SUMMARY } = require('./persona-data/product-data');
  const parts: string[] = [];

  parts.push('## Product Overview');
  if (PRODUCT_SUMMARY) {
    parts.push(`Active PRDs: ${PRODUCT_SUMMARY.activePRDs} | Blocked: ${PRODUCT_SUMMARY.blockedFeatures} | Sprint velocity: ${PRODUCT_SUMMARY.sprintVelocity} pts | NPS: ${PRODUCT_SUMMARY.nps} | Feedback mentions: ${PRODUCT_SUMMARY.feedbackMentions}`);
  }

  parts.push('\n## PRDs & Features');
  for (const p of PRD_ITEMS.slice(0, 5)) {
    parts.push(`- **${p.title}** [${p.status}]: ${p.customerRequests} customer requests | Revenue impact: ${p.revenueImpact} | ${p.blockers.length > 0 ? 'Blockers: ' + p.blockers.join(', ') : 'No blockers'} | Insight: ${p.agentInsight}`);
  }

  parts.push('\n## Customer Feedback Themes');
  for (const f of FEEDBACK_THEMES.slice(0, 4)) {
    parts.push(`- **${f.theme}** (${f.mentions} mentions, ${f.sentiment}): ${f.agentSynthesis}`);
  }

  parts.push('\n## Current Sprint');
  for (const s of SPRINT_ITEMS.slice(0, 6)) {
    parts.push(`- [${s.priority}] ${s.title} — ${s.assignee} — ${s.status} — ${s.storyPoints}pts`);
  }

  return parts.join('\n');
}

// ─── Engineering Context ───

function buildEngineeringContext(): string {
  const { TICKETS, PULL_REQUESTS, DEPLOYMENTS, ENGINEERING_SUMMARY } = require('./persona-data/engineering-data');
  const parts: string[] = [];

  parts.push('## Engineering Overview');
  if (ENGINEERING_SUMMARY) {
    parts.push(`PRs needing review: ${ENGINEERING_SUMMARY.prsNeedingReview} | Active incidents: ${ENGINEERING_SUMMARY.activeIncidents} | Sprint completion: ${ENGINEERING_SUMMARY.sprintCompletion}% | Test coverage: ${ENGINEERING_SUMMARY.testCoverage}%`);
  }

  parts.push('\n## Open Tickets');
  for (const t of TICKETS.slice(0, 6)) {
    parts.push(`- [${t.priority}] ${t.key}: ${t.title} — ${t.assignee} — ${t.status}${t.blocked ? ' (BLOCKED by ' + t.blockedBy + ')' : ''}`);
  }

  parts.push('\n## Pull Requests');
  for (const pr of PULL_REQUESTS.slice(0, 5)) {
    parts.push(`- PR #${pr.number}: ${pr.title} by ${pr.author} — ${pr.status} — CI: ${pr.ciStatus} — +${pr.linesAdded}/-${pr.linesRemoved} — Age: ${pr.age}`);
  }

  parts.push('\n## Recent Deployments');
  for (const d of DEPLOYMENTS.slice(0, 4)) {
    parts.push(`- ${d.service} v${d.version} → ${d.environment}: ${d.status} by ${d.author} (${d.commitCount} commits)${d.agentNote ? ' — ' + d.agentNote : ''}`);
  }

  return parts.join('\n');
}

// ─── Finance Context ───

function buildFinanceContext(): string {
  const { BUDGET_CATEGORIES, APPROVAL_ITEMS, FORECAST_SCENARIOS, FINANCE_SUMMARY } = require('./persona-data/finance-persona-data');
  const parts: string[] = [];

  parts.push('## Finance Overview');
  if (FINANCE_SUMMARY) {
    parts.push(`Total budget: $${(FINANCE_SUMMARY.totalBudget / 1e6).toFixed(1)}M | Spent: $${(FINANCE_SUMMARY.totalSpent / 1e6).toFixed(1)}M | Monthly burn: $${(FINANCE_SUMMARY.monthlyBurn / 1000).toFixed(0)}K | Runway: ${FINANCE_SUMMARY.runway}mo | Team: ${FINANCE_SUMMARY.teamSize} | Open reqs: ${FINANCE_SUMMARY.openReqs} | Pending approvals: ${FINANCE_SUMMARY.pendingApprovals}`);
  }

  parts.push('\n## Budget Categories');
  for (const b of BUDGET_CATEGORIES.slice(0, 5)) {
    const pct = Math.round((b.spent / b.allocated) * 100);
    parts.push(`- **${b.name}**: $${(b.allocated / 1000).toFixed(0)}K allocated, ${pct}% spent, status: ${b.status}`);
  }

  parts.push('\n## Pending Approvals');
  for (const a of APPROVAL_ITEMS.filter((a: { status: string }) => a.status === 'pending').slice(0, 4)) {
    parts.push(`- [${a.priority}] ${a.requester}: ${a.description} ($${(a.amount / 1000).toFixed(0)}K, ${a.type}) — Agent: ${a.agentRecommendation}`);
  }

  parts.push('\n## Forecast Scenarios');
  for (const f of FORECAST_SCENARIOS.slice(0, 3)) {
    parts.push(`- **${f.label}**: ${f.hires} hires, $${(f.totalCost / 1e6).toFixed(1)}M cost, ${f.runway}mo runway, ${f.risk} risk — ${f.agentNote}`);
  }

  return parts.join('\n');
}

// ─── Main Export ───

export function buildPersonaContext(persona: Persona): string {
  switch (persona) {
    case 'sales': return buildSalesContext();
    case 'product': return buildProductContext();
    case 'engineering': return buildEngineeringContext();
    case 'finance': return buildFinanceContext();
    default: return buildSalesContext();
  }
}
