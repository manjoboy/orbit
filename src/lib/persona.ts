// ============================================================================
// Persona Configuration — Core types, nav groups, and config for all 4 roles
// ============================================================================

import {
  Home, Inbox, Calendar, BarChart3,
  Briefcase, Users, Shield,
  Layers, MessageSquare, GitBranch,
  Code, Target, Rocket,
  DollarSign, FileCheck, LineChart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Core Types ───

export type Persona = 'sales' | 'product' | 'engineering' | 'finance';

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

export interface PersonaConfig {
  id: Persona;
  label: string;
  roleTitle: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;       // Tailwind color for onboarding card tint
  priorities: string[];       // Quick setup chip options
  integrationOrder: string[]; // Integration IDs in preferred order
  buildingSteps: Array<{ text: string; target: number }>;
  suggestionChips: string[];  // Chat input suggestions
}

// ─── Shared Workspace Nav ───

const SHARED_NAV: NavGroup = {
  label: 'Workspace',
  defaultOpen: true,
  items: [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'inbox', icon: Inbox, label: 'Inbox', badge: 4 },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ],
};

// ─── Persona-Specific Nav Groups ───

const PERSONA_NAV: Record<Persona, NavGroup> = {
  sales: {
    label: 'Sales',
    defaultOpen: true,
    items: [
      { id: 'deals', icon: Briefcase, label: 'Deals' },
      { id: 'relationships', icon: Users, label: 'Relationships' },
      { id: 'competitive-intel', icon: Shield, label: 'Competitive Intel' },
    ],
  },
  product: {
    label: 'Product',
    defaultOpen: true,
    items: [
      { id: 'features', icon: Layers, label: 'Features' },
      { id: 'customer-feedback', icon: MessageSquare, label: 'Feedback' },
      { id: 'sprints', icon: GitBranch, label: 'Sprints' },
    ],
  },
  engineering: {
    label: 'Engineering',
    defaultOpen: true,
    items: [
      { id: 'tickets', icon: Target, label: 'Tickets' },
      { id: 'pull-requests', icon: Code, label: 'Pull Requests' },
      { id: 'deployments', icon: Rocket, label: 'Deployments' },
    ],
  },
  finance: {
    label: 'Finance & Ops',
    defaultOpen: true,
    items: [
      { id: 'budget', icon: DollarSign, label: 'Budget' },
      { id: 'approvals', icon: FileCheck, label: 'Approvals' },
      { id: 'forecasting', icon: LineChart, label: 'Forecasting' },
    ],
  },
};

// ─── Get Nav Groups for Persona ───

export function getNavGroups(persona: Persona): NavGroup[] {
  return [SHARED_NAV, PERSONA_NAV[persona]];
}

// ─── Full Persona Configs ───

export const PERSONA_CONFIGS: Record<Persona, PersonaConfig> = {
  sales: {
    id: 'sales',
    label: 'Sales',
    roleTitle: 'Account Executive',
    description: 'Close deals faster with AI-powered pipeline intelligence',
    icon: Briefcase,
    accentColor: 'blue',
    priorities: ['Hit quota', 'Expand accounts', 'Competitive intel'],
    integrationOrder: ['slack', 'gmail', 'gcal', 'linear', 'github', 'notion'],
    buildingSteps: [
      { text: 'Scanning pipeline and deal history...', target: 25 },
      { text: 'Analyzing relationship health across contacts...', target: 50 },
      { text: 'Mapping competitive landscape...', target: 75 },
      { text: 'Preparing your sales briefing...', target: 100 },
    ],
    suggestionChips: [
      'What deals need attention?',
      'Prep me for my next call',
      'Draft a follow-up email',
    ],
  },
  product: {
    id: 'product',
    label: 'Product',
    roleTitle: 'Product Manager',
    description: 'Ship better products with customer-driven insights',
    icon: Layers,
    accentColor: 'purple',
    priorities: ['Ship on time', 'Customer feedback', 'Roadmap alignment'],
    integrationOrder: ['linear', 'slack', 'gmail', 'notion', 'github', 'gcal'],
    buildingSteps: [
      { text: 'Analyzing customer feedback signals...', target: 25 },
      { text: 'Mapping feature requests to revenue impact...', target: 50 },
      { text: 'Checking sprint health and velocity...', target: 75 },
      { text: 'Building your product briefing...', target: 100 },
    ],
    suggestionChips: [
      'What are customers saying?',
      'Show sprint status',
      'Draft a PRD section',
    ],
  },
  engineering: {
    id: 'engineering',
    label: 'Engineering',
    roleTitle: 'Software Engineer',
    description: 'Move faster with intelligent sprint and PR management',
    icon: Code,
    accentColor: 'emerald',
    priorities: ['Reduce tech debt', 'Ship features', 'Team velocity'],
    integrationOrder: ['github', 'linear', 'slack', 'notion', 'gmail', 'gcal'],
    buildingSteps: [
      { text: 'Scanning repositories and PR queue...', target: 25 },
      { text: 'Analyzing sprint velocity and blockers...', target: 50 },
      { text: 'Mapping dependency chains...', target: 75 },
      { text: 'Preparing your engineering briefing...', target: 100 },
    ],
    suggestionChips: [
      'What PRs need review?',
      'Show sprint status',
      'Summarize recent deploys',
    ],
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    roleTitle: 'Finance Lead',
    description: 'Strategic clarity through AI-powered financial analysis',
    icon: DollarSign,
    accentColor: 'amber',
    priorities: ['Budget tracking', 'Board prep', 'Forecasting'],
    integrationOrder: ['gmail', 'gcal', 'slack', 'notion', 'linear', 'github'],
    buildingSteps: [
      { text: 'Analyzing budget and spend data...', target: 25 },
      { text: 'Checking approval queue and priorities...', target: 50 },
      { text: 'Building financial models and forecasts...', target: 75 },
      { text: 'Preparing your finance briefing...', target: 100 },
    ],
    suggestionChips: [
      'Show budget status',
      'What approvals are pending?',
      'Prepare board deck summary',
    ],
  },
};

// ─── All possible persona page IDs ───

export const PERSONA_PAGE_IDS = {
  sales: ['deals', 'relationships', 'competitive-intel'] as const,
  product: ['features', 'customer-feedback', 'sprints'] as const,
  engineering: ['tickets', 'pull-requests', 'deployments'] as const,
  finance: ['budget', 'approvals', 'forecasting'] as const,
};
