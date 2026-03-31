# Chief of Staff — Technical Architecture

## System Overview

Chief of Staff is a **stateful, compounding intelligence platform** that builds a persistent
world model for each user across their professional life. Unlike stateless AI assistants,
every interaction deepens the system's understanding of the user's relationships, decisions,
patterns, and organizational context.

---

## Architecture Principles

1. **State is the moat** — Every interaction enriches the Professional Graph. The product gets
   more valuable with time, making it irreplaceable.
2. **Signals, not noise** — Raw data is worthless. The system converts data into scored,
   contextualized, actionable intelligence.
3. **Proactive > Reactive** — The system pushes insights before the user asks. Anticipation
   is the core value prop.
4. **Privacy as architecture** — Tenant isolation is not a feature; it's a structural property
   of the data layer (RLS, encryption, scoped embeddings).
5. **Integration-first** — Connectors are first-class citizens, not afterthoughts. The system
   is only as good as the data it can access.

---

## High-Level Architecture

```
                                    ┌──────────────────────┐
                                    │   Client Layer        │
                                    │  (Next.js 16 + React) │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │   API Gateway         │
                                    │  (Next.js API Routes  │
                                    │   + FastAPI)          │
                                    └──────────┬───────────┘
                                               │
                 ┌─────────────────────────────┼─────────────────────────────┐
                 │                             │                             │
    ┌────────────▼────────────┐  ┌─────────────▼──────────────┐  ┌──────────▼──────────┐
    │   Intelligence Engines  │  │   Core Services Layer      │  │  Integration Layer   │
    │                         │  │                            │  │                      │
    │  - Professional Graph   │  │  - Auth & Tenant Mgmt      │  │  - Slack Connector   │
    │  - Proactive Intel      │  │  - User Preferences        │  │  - Gmail Connector   │
    │  - Industry Intel       │  │  - Notification Service    │  │  - Calendar Connector│
    │  - Career Engine        │  │  - Search & Retrieval      │  │  - Linear Connector  │
    │  - Communication Coach  │  │  - Action Execution        │  │  - GitHub Connector  │
    │  - Deep Work Engine     │  │  - Briefing Generator      │  │  - Notion Connector  │
    │  - Team Health Engine   │  │  - Meeting Intelligence    │  │  - News Aggregator   │
    │  - Decision Support     │  │  - Task Orchestrator       │  │  - LinkedIn Scraper  │
    │  - Scenario Simulator   │  │                            │  │  - Webhook Receiver  │
    └────────────┬────────────┘  └─────────────┬──────────────┘  └──────────┬──────────┘
                 │                             │                             │
                 └─────────────────────────────┼─────────────────────────────┘
                                               │
                 ┌─────────────────────────────┼─────────────────────────────┐
                 │                             │                             │
    ┌────────────▼────────────┐  ┌─────────────▼──────────────┐  ┌──────────▼──────────┐
    │   Data Layer            │  │   Async Processing         │  │  Caching & Realtime  │
    │                         │  │                            │  │                      │
    │  PostgreSQL 16          │  │  Celery Workers            │  │  Redis 7             │
    │  + pgvector             │  │  - Ingestion Pipeline      │  │  - Session Cache     │
    │  + TimescaleDB          │  │  - Embedding Generation    │  │  - Signal Queue      │
    │  + RLS (Row-Level Sec)  │  │  - Signal Detection        │  │  - Rate Limiting     │
    │                         │  │  - Pattern Analysis        │  │  - Pub/Sub Events    │
    │  S3 / R2                │  │  - Report Generation       │  │  - Graph Cache       │
    │  - Document storage     │  │  - News Processing         │  │                      │
    │  - Attachment blobs     │  │  - Scheduled Intelligence  │  │  Server-Sent Events  │
    │                         │  │                            │  │  - Live notifications│
    └─────────────────────────┘  └────────────────────────────┘  └─────────────────────┘
```

---

## Core Data Architecture

### PostgreSQL Schema Domains

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA DOMAINS                             │
│                                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────────────┐ │
│  │ IDENTITY &      │  │ PROFESSIONAL     │  │ INTELLIGENCE               │ │
│  │ TENANCY         │  │ GRAPH            │  │ LAYER                      │ │
│  │                 │  │                  │  │                            │ │
│  │ - Organization  │  │ - Person         │  │ - Signal                   │ │
│  │ - User          │  │ - Relationship   │  │ - Insight                  │ │
│  │ - Team          │  │ - Interaction    │  │ - Pattern                  │ │
│  │ - Role          │  │ - Project        │  │ - Anomaly                  │ │
│  │ - Preferences   │  │ - Decision       │  │ - RiskAlert                │ │
│  │ - APIKey        │  │ - Commitment     │  │ - OpportunityAlert         │ │
│  │ - OAuthToken    │  │ - Topic          │  │ - IndustrySignal           │ │
│  │                 │  │ - Skill          │  │ - CompetitorEvent          │ │
│  └─────────────────┘  │ - Organization   │  │ - MarketTrend              │ │
│                        │   Node           │  │ - BenchmarkDatapoint       │ │
│  ┌─────────────────┐  └──────────────────┘  └────────────────────────────┘ │
│  │ ACTIVITY &      │                                                        │
│  │ COMMUNICATION   │  ┌──────────────────┐  ┌────────────────────────────┐ │
│  │                 │  │ CAREER &         │  │ TIME-SERIES                │ │
│  │ - Message       │  │ GROWTH           │  │ (TimescaleDB)              │ │
│  │ - Meeting       │  │                  │  │                            │ │
│  │ - MeetingNote   │  │ - SkillAssessment│  │ - ActivityMetric           │ │
│  │ - Email         │  │ - VisibilityEvent│  │ - EnergyScore              │ │
│  │ - Document      │  │ - CareerGoal     │  │ - FocusSession             │ │
│  │ - TaskItem      │  │ - InfluenceScore │  │ - CommunicationMetric      │ │
│  │ - CalendarEvent │  │ - CompBenchmark  │  │ - RelationshipHealthScore  │ │
│  │ - SlackThread   │  │ - PromotionSignal│  │ - ProjectVelocity          │ │
│  │ - PRReview      │  │ - GrowthPlan     │  │ - TeamHealthScore          │ │
│  │                 │  │                  │  │ - CognitiveLoadScore       │ │
│  └─────────────────┘  └──────────────────┘  │ - StrategicAlignmentScore  │ │
│                                              └────────────────────────────┘ │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────────────┐ │
│  │ KNOWLEDGE       │  │ TEAM HEALTH      │  │ DECISION                   │ │
│  │ BASE            │  │                  │  │ INTELLIGENCE               │ │
│  │                 │  │ - TeamMember     │  │                            │ │
│  │ - KnowledgeNode │  │ - BurnoutSignal  │  │ - DecisionBrief            │ │
│  │ - KnowledgeEdge │  │ - EngagementScore│  │ - ScenarioModel            │ │
│  │ - TribalKnowledge│ │ - TeamComposition│  │ - StakeholderPosition      │ │
│  │ - DecisionLog   │  │ - CollabPattern  │  │ - TradeoffAnalysis         │ │
│  │ - InstitMemory  │  │ - AttritionRisk  │  │ - HistoricalAnalog         │ │
│  │                 │  │ - OneOnOnePrep   │  │ - DecisionOutcome          │ │
│  └─────────────────┘  └──────────────────┘  └────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ VECTOR STORE (pgvector)                                               │  │
│  │                                                                       │  │
│  │ - MessageEmbedding    - DocumentEmbedding    - KnowledgeEmbedding    │  │
│  │ - MeetingEmbedding    - PersonEmbedding      - DecisionEmbedding     │  │
│  │ - IndustryEmbedding   - InteractionEmbedding                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Engine Architecture (Deep Dive)

### 1. Professional Graph Engine

The core intelligence substrate. Everything else reads from and writes to this graph.

```
┌─ PROFESSIONAL GRAPH ENGINE ──────────────────────────────────────────────┐
│                                                                          │
│  INGESTION LAYER                                                         │
│  ├── Slack messages → extract people, topics, sentiment, commitments     │
│  ├── Calendar events → extract relationships, meeting patterns           │
│  ├── Email → extract stakeholders, action items, decision threads        │
│  ├── Linear/Jira → extract project dependencies, velocity, blockers      │
│  ├── GitHub → extract collaboration patterns, review relationships       │
│  ├── Notion/Docs → extract knowledge artifacts, ownership, topics        │
│  └── Meeting transcripts → extract decisions, action items, sentiment    │
│                                                                          │
│  PROCESSING LAYER                                                        │
│  ├── Entity Resolution: merge "Sarah", "Sarah Chen", "sarah@acme.com"   │
│  ├── Relationship Inference: interaction frequency → relationship weight │
│  ├── Topic Clustering: group related conversations into topic threads    │
│  ├── Sentiment Analysis: track emotional tone per person per topic       │
│  ├── Commitment Extraction: "I'll have this by Friday" → tracked        │
│  └── Decision Detection: identify when decisions are made vs. discussed  │
│                                                                          │
│  GRAPH OPERATIONS                                                        │
│  ├── Shortest path: who connects you to person X?                        │
│  ├── Centrality: who are the most important people in your network?      │
│  ├── Community detection: what are the natural clusters?                  │
│  ├── Temporal decay: how fresh is each relationship?                     │
│  ├── Influence propagation: if person A is upset, who else is affected?  │
│  └── Anomaly detection: sudden changes in interaction patterns           │
│                                                                          │
│  STORAGE                                                                 │
│  ├── PostgreSQL: structured entity and relationship data                 │
│  ├── pgvector: semantic embeddings for similarity search                 │
│  ├── Redis: hot graph cache for real-time lookups                        │
│  └── TimescaleDB: time-series metrics for pattern detection              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2. Intelligence Pipeline

```
Raw Event (Slack msg, email, calendar change, PR, etc.)
    │
    ▼
┌─ STAGE 1: INGESTION ──────────────────────────────┐
│  - Webhook receiver / polling job                  │
│  - Deduplication (idempotency key)                 │
│  - Schema normalization (all sources → unified     │
│    event schema)                                   │
│  - PII detection & handling (Presidio)             │
│  - Tenant scoping (attach org_id, user_id)         │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌─ STAGE 2: ENRICHMENT ─────────────────────────────┐
│  - Entity extraction (people, projects, dates)     │
│  - Entity resolution (link to graph nodes)         │
│  - Embedding generation (text → vector)            │
│  - Sentiment scoring                               │
│  - Topic classification                            │
│  - Urgency scoring                                 │
│  - Intent classification (FYI / needs-reply /      │
│    decision-required / delegation-candidate)        │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌─ STAGE 3: GRAPH UPDATE ───────────────────────────┐
│  - Update person nodes (last contact, sentiment)   │
│  - Update relationship edges (weight, recency)     │
│  - Update project nodes (velocity, status)         │
│  - Update topic clusters                           │
│  - Track commitment progress                       │
│  - Log decision if detected                        │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌─ STAGE 4: SIGNAL DETECTION ───────────────────────┐
│  - Pattern matchers (relationship decay, velocity  │
│    drop, burnout signals, strategic drift)          │
│  - Anomaly detectors (unusual activity, sentiment  │
│    shifts, new entities)                            │
│  - Threshold alerts (deadlines, SLA breaches,      │
│    commitment expirations)                          │
│  - Cross-signal correlation (multiple weak signals │
│    → strong insight)                                │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌─ STAGE 5: INSIGHT GENERATION ─────────────────────┐
│  - LLM synthesis (combine signals + graph context  │
│    into human-readable insight)                     │
│  - Action recommendation (what should user do?)     │
│  - Priority scoring (how urgent / important?)       │
│  - Delivery routing (push notification? daily       │
│    briefing? in-app card?)                          │
│  - Deduplication (don't re-surface known insights) │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
             [ User's Briefing / Notification / In-App Card ]
```

### 3. Industry Intelligence Engine

```
┌─ INDUSTRY INTELLIGENCE ENGINE ───────────────────────────────────────────┐
│                                                                          │
│  DATA SOURCES                                                            │
│  ├── RSS/Atom feeds (TechCrunch, industry blogs, company blogs)          │
│  ├── SEC filings API (EDGAR)                                             │
│  ├── Crunchbase API (funding rounds, acquisitions)                       │
│  ├── LinkedIn API (leadership changes, job postings)                     │
│  ├── ProductHunt API (competitor launches)                               │
│  ├── Patent databases (USPTO, Google Patents)                            │
│  ├── GitHub trending (open-source movements)                             │
│  ├── Reddit/HackerNews API (community sentiment)                        │
│  ├── Google Trends API (search interest shifts)                          │
│  ├── Job boards API (Indeed, LinkedIn — hiring signals)                  │
│  └── Custom scrapers (pricing pages, feature comparisons)                │
│                                                                          │
│  PROCESSING PIPELINE                                                     │
│  ├── Deduplication: same event from multiple sources                     │
│  ├── Entity extraction: companies, people, products, amounts             │
│  ├── Event classification:                                               │
│  │   ├── FUNDING_ROUND    ├── PRODUCT_LAUNCH   ├── LEADERSHIP_CHANGE    │
│  │   ├── ACQUISITION      ├── PARTNERSHIP       ├── REGULATION_CHANGE   │
│  │   ├── LAYOFF           ├── PRICING_CHANGE    ├── PATENT_FILING       │
│  │   ├── EARNINGS_REPORT  ├── SECURITY_BREACH   ├── IPO_FILING          │
│  │   └── OPEN_SOURCE_RELEASE                                             │
│  ├── Relevance scoring (against user's industry pack + company context)  │
│  └── Impact assessment (how does this affect user's world?)              │
│                                                                          │
│  RELEVANCE SCORING ALGORITHM                                             │
│  ├── Company overlap score: Is this about a customer, prospect,          │
│  │   competitor, or partner? (weight: 0.35)                              │
│  ├── Topic overlap score: Does this relate to the user's active          │
│  │   projects or interests? (weight: 0.25)                               │
│  ├── Role relevance score: Does this matter for the user's role?         │
│  │   (weight: 0.20)                                                      │
│  ├── Temporal urgency: Is this time-sensitive? (weight: 0.10)            │
│  └── Network relevance: Does this affect people in the user's            │
│      graph? (weight: 0.10)                                               │
│                                                                          │
│  OUTPUT: IndustrySignal objects with:                                    │
│  - raw_event (what happened)                                             │
│  - affected_entities (which graph nodes are impacted)                    │
│  - relevance_score (0-1)                                                 │
│  - impact_assessment (LLM-generated analysis)                            │
│  - recommended_actions (what to do about it)                             │
│  - affected_stakeholders (who on the team should know)                   │
│  - delivery_priority (immediate / daily_briefing / weekly_digest)        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Architecture

```
┌─ CONNECTOR FRAMEWORK ───────────────────────────────────────────────────┐
│                                                                          │
│  BaseConnector (abstract)                                                │
│  ├── authenticate()          — OAuth2 / API key / webhook registration   │
│  ├── sync_full()             — Initial full data pull                    │
│  ├── sync_incremental()      — Delta sync since last checkpoint          │
│  ├── receive_webhook(event)  — Real-time event handling                  │
│  ├── execute_action(action)  — Write-back capability                     │
│  ├── health_check()          — Connection status                         │
│  └── get_rate_limits()       — Current rate limit status                 │
│                                                                          │
│  TIER 1 CONNECTORS (Day 1)                                               │
│  ├── SlackConnector                                                      │
│  │   ├── Channels: read messages, threads, reactions                     │
│  │   ├── DMs: (opt-in) read direct messages                              │
│  │   ├── Presence: online/offline patterns                               │
│  │   ├── Profiles: user metadata                                         │
│  │   └── Actions: send messages, create channels, set reminders          │
│  │                                                                       │
│  ├── GmailConnector                                                      │
│  │   ├── Messages: read inbox, sent, labels                              │
│  │   ├── Threads: conversation grouping                                  │
│  │   ├── Labels: organizational structure                                │
│  │   └── Actions: draft, send, label, archive                            │
│  │                                                                       │
│  ├── GoogleCalendarConnector                                             │
│  │   ├── Events: meetings, all-day events                                │
│  │   ├── Attendees: who's in which meetings                              │
│  │   ├── Availability: free/busy data                                    │
│  │   └── Actions: create, modify, delete events                          │
│  │                                                                       │
│  ├── LinearConnector                                                     │
│  │   ├── Issues: tasks, bugs, features                                   │
│  │   ├── Projects: groupings, milestones                                 │
│  │   ├── Cycles: sprint data                                             │
│  │   └── Actions: create, assign, update issues                          │
│  │                                                                       │
│  ├── GitHubConnector                                                     │
│  │   ├── PRs: code reviews, approvals                                    │
│  │   ├── Issues: bugs, feature requests                                  │
│  │   ├── Commits: code activity                                          │
│  │   └── Actions: review, approve, comment                               │
│  │                                                                       │
│  └── NotionConnector                                                     │
│      ├── Pages: documents, wikis                                         │
│      ├── Databases: structured data                                      │
│      └── Actions: create, update pages                                   │
│                                                                          │
│  TIER 2 CONNECTORS                                                       │
│  ├── JiraConnector, ConfluenceConnector                                  │
│  ├── AsanaConnector, MondayConnector                                     │
│  ├── HubSpotConnector, SalesforceConnector                               │
│  ├── FigmaConnector                                                      │
│  └── ZoomConnector (meeting transcripts)                                 │
│                                                                          │
│  EVENT NORMALIZATION                                                     │
│  All connector events are normalized to:                                 │
│  {                                                                       │
│    source: "slack" | "gmail" | "calendar" | ...                          │
│    event_type: "message" | "meeting" | "task_update" | ...               │
│    timestamp: ISO8601                                                    │
│    actor: { id, name, email }                                            │
│    entities: [{ type, id, name }]                                        │
│    content: { raw, sanitized }                                           │
│    metadata: { channel?, thread?, project?, ... }                        │
│    org_id: UUID                                                          │
│    user_id: UUID                                                         │
│  }                                                                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Proactive Intelligence System

```
┌─ PATTERN DETECTORS (run on schedule + event-triggered) ─────────────────┐
│                                                                          │
│  RELATIONSHIP PATTERNS                                                   │
│  ├── RelationshipDecayDetector                                           │
│  │   Input: interaction_history, relationship_weight                     │
│  │   Algorithm: exponential decay function with per-relationship         │
│  │   baseline. Alert when current_weight < (baseline * 0.6)             │
│  │                                                                       │
│  ├── SentimentShiftDetector                                              │
│  │   Input: last N interactions with a person, rolling sentiment avg     │
│  │   Algorithm: CUSUM (cumulative sum) change detection on sentiment     │
│  │   time series. Alert on statistically significant negative shift.     │
│  │                                                                       │
│  └── StakeholderBlindSpotDetector                                        │
│      Input: decision_makers for user's goals, interaction_frequency      │
│      Algorithm: compare interaction frequency with importance score.     │
│      Flag high-importance, low-interaction nodes.                        │
│                                                                          │
│  PROJECT PATTERNS                                                        │
│  ├── VelocityDropDetector                                                │
│  │   Input: task completion rate per sprint/week                         │
│  │   Algorithm: linear regression on rolling window. Alert when          │
│  │   slope < -0.15 (15% decline rate)                                    │
│  │                                                                       │
│  ├── ScopeCreepDetector                                                  │
│  │   Input: task count at project start vs. current, timeline            │
│  │   Algorithm: ratio of (added_tasks / original_tasks) with time        │
│  │   decay. Alert when ratio > 1.3 and deadline < 4 weeks.              │
│  │                                                                       │
│  └── DependencyBlockDetector                                             │
│      Input: blocked tasks, blocking tasks, team assignment               │
│      Algorithm: critical path analysis. Alert when blocking chain        │
│      exceeds 3 hops or blocks > 5 downstream tasks.                     │
│                                                                          │
│  PERSONAL PATTERNS                                                       │
│  ├── StrategicDriftDetector                                              │
│  │   Input: time allocation (from calendar + activity), stated OKRs      │
│  │   Algorithm: cosine similarity between time-weighted activity         │
│  │   vector and OKR priority vector. Alert when similarity < 0.5.       │
│  │                                                                       │
│  ├── BurnoutRiskDetector                                                 │
│  │   Input: work hours, response times, meeting density, PTO history,   │
│  │   code quality metrics, communication tone                            │
│  │   Algorithm: weighted composite score with learned per-user           │
│  │   baselines. Features fed into gradient boosted classifier trained    │
│  │   on historical burnout events (anonymized cross-company data).      │
│  │                                                                       │
│  ├── CognitiveOverloadDetector                                           │
│  │   Input: context switches per day, concurrent project count,         │
│  │   meeting fragmentation score                                         │
│  │   Algorithm: meeting_fragmentation = 1 - (largest_focus_block /      │
│  │   total_work_hours). Alert when fragmentation > 0.75 for 3+ days.   │
│  │                                                                       │
│  └── CommitmentOverrunDetector                                           │
│      Input: tracked commitments, estimated capacity, deadline distances  │
│      Algorithm: monte carlo simulation of completion probability         │
│      based on historical velocity. Alert when P(on_time) < 0.6.        │
│                                                                          │
│  ORGANIZATIONAL PATTERNS                                                 │
│  ├── DecisionReversalDetector                                            │
│  │   Input: decision log, subsequent discussions on same topic           │
│  │   Algorithm: semantic similarity between new discussion and past      │
│  │   decision. If similarity > 0.85 and decision was <30 days ago,      │
│  │   flag as potential reversal.                                         │
│  │                                                                       │
│  ├── InformationSiloDetector                                             │
│  │   Input: cross-team interaction graph                                 │
│  │   Algorithm: modularity score on team interaction graph. Alert        │
│  │   when inter-team edge density < threshold.                           │
│  │                                                                       │
│  └── MeetingEfficiencyDetector                                           │
│      Input: meeting duration, attendee count, action items generated,   │
│      decisions made, follow-up activity                                  │
│      Algorithm: efficiency_score = (decisions + action_items) /          │
│      (duration_hours * attendee_count). Flag bottom 20%.                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Security & Privacy Architecture

```
┌─ SECURITY LAYERS ────────────────────────────────────────────────────────┐
│                                                                          │
│  LAYER 1: TENANT ISOLATION                                               │
│  ├── PostgreSQL Row-Level Security (RLS) on ALL tables                   │
│  ├── org_id column on every table, enforced at DB level                  │
│  ├── Connection-level context: SET app.current_org_id = ?                │
│  ├── Vector embeddings scoped to org_id (no cross-tenant similarity)     │
│  └── Redis key namespacing: org:{org_id}:*                               │
│                                                                          │
│  LAYER 2: USER-LEVEL PRIVACY                                             │
│  ├── Users only see their own graph + shared org data                    │
│  ├── DM content opt-in only (not ingested by default)                    │
│  ├── PII detection on all ingested content (Presidio)                    │
│  ├── User can delete any data point from their graph                     │
│  ├── Data retention policies per data type                               │
│  └── Export all data (GDPR compliance)                                   │
│                                                                          │
│  LAYER 3: ENCRYPTION                                                     │
│  ├── TLS 1.3 in transit (all connections)                                │
│  ├── AES-256 at rest (database + S3)                                     │
│  ├── OAuth tokens encrypted with per-org keys                            │
│  ├── API keys hashed (bcrypt)                                            │
│  └── Embedding vectors encrypted at rest                                 │
│                                                                          │
│  LAYER 4: ACCESS CONTROL                                                 │
│  ├── RBAC: org_admin, team_admin, member, viewer                         │
│  ├── Connector permissions: user grants per-source access                │
│  ├── API rate limiting (per user, per org)                                │
│  ├── Audit log for all data access                                       │
│  └── SOC 2 Type II compliance target                                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─ PRODUCTION INFRASTRUCTURE ──────────────────────────────────────────────┐
│                                                                          │
│  ┌─ Vercel ─────────────────────────────────┐                            │
│  │  Next.js Frontend + API Routes            │                            │
│  │  (Edge functions for low-latency API)     │                            │
│  └───────────────────────────────────────────┘                            │
│                                                                          │
│  ┌─ AWS / GCP ──────────────────────────────────────────────────────┐    │
│  │                                                                   │    │
│  │  ┌─ ECS / Cloud Run ─────────────────────────────────────────┐   │    │
│  │  │  FastAPI Services (intelligence engines, heavy compute)    │   │    │
│  │  │  Auto-scaling: 2-20 instances based on queue depth         │   │    │
│  │  └────────────────────────────────────────────────────────────┘   │    │
│  │                                                                   │    │
│  │  ┌─ ECS / Cloud Run ─────────────────────────────────────────┐   │    │
│  │  │  Celery Workers (ingestion, embedding, pattern detection)  │   │    │
│  │  │  Auto-scaling: 4-50 workers based on queue depth           │   │    │
│  │  └────────────────────────────────────────────────────────────┘   │    │
│  │                                                                   │    │
│  │  ┌─ RDS / Cloud SQL ─────────────────────────────────────────┐   │    │
│  │  │  PostgreSQL 16 + pgvector + TimescaleDB                    │   │    │
│  │  │  Primary + 2 read replicas                                 │   │    │
│  │  │  Automated backups, point-in-time recovery                 │   │    │
│  │  └────────────────────────────────────────────────────────────┘   │    │
│  │                                                                   │    │
│  │  ┌─ ElastiCache / Memorystore ────────────────────────────────┐  │    │
│  │  │  Redis 7 Cluster (cache + pub/sub + task broker)           │  │    │
│  │  └────────────────────────────────────────────────────────────┘  │    │
│  │                                                                   │    │
│  │  ┌─ S3 / Cloud Storage ──────────────────────────────────────┐   │    │
│  │  │  Document storage, attachment blobs, export archives       │   │    │
│  │  └────────────────────────────────────────────────────────────┘   │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Performance Targets

| Operation | Target Latency | Strategy |
|-----------|---------------|----------|
| Daily briefing generation | < 5s | Pre-computed at 6am, cached in Redis |
| Meeting prep context pull | < 2s | Graph traversal + cached embeddings |
| "Ask anything" query | < 3s | RAG with pre-indexed vector store |
| Real-time signal detection | < 30s from event | Celery priority queue |
| Industry news relevance scoring | < 60s from ingestion | Batch processing every 15 min |
| Graph update from new event | < 5s | Async worker, optimistic UI |
| Full re-index (user onboarding) | < 30 min | Parallelized across connectors |
