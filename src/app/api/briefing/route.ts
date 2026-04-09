import { buildPersonaContext } from '@/lib/persona-context-builder';
import type { Persona } from '@/lib/persona';

// ─── System prompt for briefing generation ───

function buildBriefingSystemPrompt(persona: Persona, userName: string, context: string): string {
  return `You are Orbit, an executive AI Chief of Staff. You are generating a morning briefing for ${userName}, who works as a ${persona === 'sales' ? 'sales professional' : persona === 'product' ? 'product manager' : persona === 'engineering' ? 'engineering manager' : 'finance leader'}.

Here is their current data context:

${context}

Generate a personalized morning briefing with exactly this structure:

1. Start with a short greeting line (one sentence, addressing them by name).

2. Then generate exactly 3 insights, each formatted as:

### [Headline — short, action-oriented, 5-10 words]
[2-3 sentence body explaining the insight and why it matters]
**Reasoning:** [1-2 sentences explaining the data/logic behind this insight]
**Urgency:** [high/medium/low]
**Sources:** [comma-separated list of data sources]

Rules:
- Each insight should be specific, referencing real names, numbers, and deadlines from the data
- At least one insight should be urgency "high"
- Insights should cover different aspects (e.g., don't do 3 about the same topic)
- Be concise and actionable — this is a briefing, not an essay
- Use warm but professional tone`;
}

// ─── Mock briefings per persona ───

const MOCK_BRIEFINGS: Record<string, string> = {
  sales: `Good morning! Here's what needs your attention today.

### Acme Corp deal is stalling — action needed today
The Acme Corp deal ($420K) has been sitting in negotiation for 14 days with zero activity. Sarah Kim, your champion, hasn't responded to your last two outreach attempts. Deals that stall this long in negotiation close at 23% lower rates.
**Reasoning:** Based on your pipeline data, Acme is your second-largest open deal and the probability has dropped from 75% to 60%. The lack of response combined with competitive intel about Intercom pitching their account makes this urgent.
**Urgency:** high
**Sources:** CRM Activity Log, Deal Analytics, Competitive Intel

### Three prospects raised Intercom's AI Agent Builder this week
In discovery calls with TechVista, Global Logistics, and Pinnacle Financial, all three prospects specifically asked about Intercom's new AI Agent Builder feature. Your current competitive battle card is 6 weeks old and doesn't address this.
**Reasoning:** When 3+ prospects mention the same competitor feature in one week, it signals a market shift. Your win rate against Intercom has dropped from 68% to 52% over the last quarter.
**Urgency:** high
**Sources:** Call Transcripts, Competitive Intel, Win/Loss Analysis

### CloudScale renewal offers upsell opportunity
CloudScale's usage has grown 340% since onboarding 8 months ago. Their renewal is in 22 days, and their champion James Liu mentioned expanding to the enterprise tier in your last check-in.
**Reasoning:** High-usage accounts that expand at renewal have 94% 2-year retention rates. The enterprise tier upgrade would add approximately $180K ARR.
**Urgency:** medium
**Sources:** Usage Analytics, CRM Notes, Revenue Data`,

  product: `Good morning! Here's your product briefing for today.

### Export feature demand is surging — 47 requests in 30 days
CSV/PDF export has become your #1 feature request, with 47 unique customer requests in the last month. Three of your top-10 accounts specifically mentioned this in recent QBRs, and two flagged it as a potential churn risk.
**Reasoning:** The request volume increased 3x this month compared to last. When top accounts cite a missing feature in QBRs, it typically correlates with 15% higher churn probability within 90 days.
**Urgency:** high
**Sources:** Customer Feedback, Support Tickets, QBR Notes

### Sprint 24 has 2 unresolved blockers with 4 days remaining
The API rate limiting and SSO integration stories are blocking 3 dependent tasks (8 story points total). If not resolved by Wednesday, Sprint 24 will miss its commitment by ~30%.
**Reasoning:** Current sprint velocity is tracking at 67% of planned capacity. The SSO blocker requires a decision from engineering leadership on the authentication architecture approach.
**Urgency:** high
**Sources:** Sprint Board, Daily Standup Notes, Engineering Dependencies

### NPS dropped 4 points — onboarding experience is the driver
Your NPS score fell from 52 to 48 this month, with the largest negative sentiment cluster around "confusing initial setup" and "too many steps to see value." New user activation rate is down 12%.
**Reasoning:** 73% of negative NPS responses in the last 30 days mentioned onboarding. This correlates with a recent change to the setup wizard that added 2 extra steps.
**Urgency:** medium
**Sources:** NPS Survey Data, Customer Feedback, Product Analytics`,

  engineering: `Good morning! Here's your engineering briefing for today.

### Auth service memory leak detected in staging
Memory usage on auth-service pods has grown 340% over the last 12 hours in staging. If this build is promoted to production, expect OOM kills within 2-3 hours under normal load. The pattern matches a known issue with session cache not evicting expired tokens.
**Reasoning:** This is similar to incident INC-234 from March, which caused a 47-minute production outage. The fix involved adding TTL-based eviction to the session cache. The current staging build includes 3 new session-related changes.
**Urgency:** high
**Sources:** Datadog Alerts, Deploy Pipeline, Incident History

### Flaky payments test is blocking 3 engineers
The payments integration test has failed 4 of the last 7 CI runs on main. Engineers Alex, Maya, and Chris all have PRs waiting on green builds. Total blocked velocity: approximately 13 story points across 5 PRs.
**Reasoning:** Flaky tests that persist for more than 3 days have a compounding effect on team velocity. At the current failure rate, the team is losing ~2 hours of engineering time per day to retry loops and false-failure investigations.
**Urgency:** high
**Sources:** CI/CD Dashboard, GitHub PR Queue, Sprint Board

### PR review backlog growing — 8 PRs waiting >24 hours
Your team's PR review queue has 8 open PRs with average wait time of 31 hours. Code review turnaround SLA is 24 hours. Two PRs are from external contributors and have been waiting 3 days.
**Reasoning:** Review backlog correlates with longer cycle times and developer frustration. The external contributor PRs are particularly sensitive — slow responses reduce future open-source contributions by ~40%.
**Urgency:** medium
**Sources:** GitHub PR Queue, Team Metrics, Developer Experience Survey`,

  finance: `Good morning! Here's your finance briefing for today.

### Engineering cloud costs exceeded forecast by $34K this month
AWS infrastructure costs are running 12% over budget, driven primarily by unplanned GPU usage for ML training jobs. If this trend continues through Q2, the engineering budget will be $102K over plan.
**Reasoning:** The ML team spun up additional GPU instances without going through the procurement approval process. Monthly cloud costs have increased from $283K to $317K. The cost-per-model-training-run has also increased due to larger dataset sizes.
**Urgency:** high
**Sources:** AWS Cost Explorer, Budget Tracker, Engineering Spend Reports

### Board deck due in 5 days — 2 sections incomplete
The board meeting is next Tuesday. Revenue and customer metrics sections are complete, but operating expense breakdown and runway projections still need updating with April actuals. David needs your final numbers by Thursday.
**Reasoning:** Last quarter's board deck was delivered 1 day late, which reduced prep time for the CEO. The OpEx section requires reconciling contractor costs that were re-categorized in April.
**Urgency:** high
**Sources:** Board Prep Tracker, Financial Model, Calendar

### Three high-priority approvals pending — $287K total
You have 3 pending approval requests: a $180K headcount request from Engineering, a $72K software license renewal for Datadog, and a $35K offsite budget for the Product team. All were submitted over a week ago.
**Reasoning:** The headcount request is blocking the engineering team's Q2 hiring plan. The Datadog renewal has a contractual deadline in 8 days — missing it triggers a 15% price increase on the new term.
**Urgency:** medium
**Sources:** Approval Queue, Vendor Contracts, Hiring Plan`,
};

// ─── Mock streaming ───

function createMockBriefingStream(persona: string): ReadableStream<Uint8Array> {
  const text = MOCK_BRIEFINGS[persona] ?? MOCK_BRIEFINGS.sales;
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= text.length) {
        controller.close();
        return;
      }
      const chunkSize = Math.floor(Math.random() * 8) + 3;
      const chunk = text.slice(index, index + chunkSize);
      index += chunkSize;
      controller.enqueue(encoder.encode(chunk));
      await new Promise((resolve) => setTimeout(resolve, 12));
    },
  });
}

// ─── POST handler ───

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { persona = 'sales', userName = 'there' } = body as { persona?: Persona; userName?: string };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'sk-ant-your-key-here') {
      return new Response(createMockBriefingStream(persona), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Build context and call Claude
    const context = buildPersonaContext(persona);
    const systemPrompt = buildBriefingSystemPrompt(persona, userName, context);

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Generate my morning briefing.' }],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
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
    console.error('Briefing API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
