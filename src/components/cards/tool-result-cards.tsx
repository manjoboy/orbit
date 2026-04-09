'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, Copy, Check, ExternalLink, Search, Zap, FileText, BarChart3, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { useState } from 'react';
import type { ToolResultCard } from '@/lib/agent-types';

// ─── Card Renderer ───

interface ToolResultCardRendererProps {
  card: ToolResultCard;
  onNavigate?: (page: string) => void;
  onViewInQueue?: () => void;
}

export function ToolResultCardRenderer({ card, onNavigate, onViewInQueue }: ToolResultCardRendererProps) {
  switch (card.type) {
    case 'search-results':
      return <SearchResultsCard card={card} />;
    case 'draft-preview':
      return <DraftPreviewCard card={card} />;
    case 'action-proposed':
      return <ActionProposedCard card={card} onViewInQueue={onViewInQueue} />;
    case 'summary':
      return <SummaryCard card={card} />;
    case 'navigation':
      return <NavigationCard card={card} onNavigate={onNavigate} />;
    case 'detail-view':
      return <DetailViewCard card={card} />;
    case 'deal-list':
    case 'ticket-list':
      return <SearchResultsCard card={card} />;
    default:
      return null;
  }
}

// ─── Search Results Card ───

function SearchResultsCard({ card }: { card: ToolResultCard }) {
  const results = (card.data.results as Array<{ type: string; name: string; detail: string; status?: string }>) ?? [];
  const totalCount = (card.data.totalCount as number) ?? results.length;

  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]">
        <Search className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{card.title}</span>
        <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{totalCount} results</span>
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {results.map((r, i) => (
          <div key={i} className="px-3 py-2 flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition-colors">
            <span className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded shrink-0">
              {r.type}
            </span>
            <span className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">{r.name}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)] truncate ml-auto">{r.detail}</span>
          </div>
        ))}
        {results.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-[var(--color-text-muted)]">
            No matching results found
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Draft Preview Card ───

function DraftPreviewCard({ card }: { card: ToolResultCard }) {
  const [copied, setCopied] = useState(false);
  const artifactType = card.data.artifactType as string;
  const subject = card.data.subject as string;

  const handleCopy = () => {
    // In a real implementation, would copy the draft content
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]">
        <FileText className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
          Draft {artifactType}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{subject}</span>
      </div>
      <div className="px-3 py-2 flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Copied!' : 'Copy draft'}
        </Button>
      </div>
    </div>
  );
}

// ─── Action Proposed Card ───

function ActionProposedCard({ card, onViewInQueue }: { card: ToolResultCard; onViewInQueue?: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent-subtle)] overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-accent)]/10">
        <Zap className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        <span className="text-[11px] font-semibold text-[var(--color-text-primary)]">
          Action proposed
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12.5px] font-medium text-[var(--color-text-primary)] mb-1">{card.data.title as string}</p>
        <p className="text-[11.5px] text-[var(--color-text-secondary)]">{card.data.description as string}</p>
        {onViewInQueue && (
          <Button variant="secondary" size="sm" className="mt-2" onClick={onViewInQueue}>
            View in Queue <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Summary Card ───

function SummaryCard({ card }: { card: ToolResultCard }) {
  const metrics = (card.data.metrics as Array<{ label: string; value: string; status?: string }>) ?? [];

  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]">
        <BarChart3 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{card.title}</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[var(--color-border-subtle)]">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[var(--color-bg-secondary)] px-3 py-2.5">
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{m.label}</p>
            <p className={cn(
              'text-[15px] font-bold tabular-nums',
              m.status === 'critical' ? 'text-[var(--color-status-critical)]' :
              m.status === 'warning' ? 'text-[var(--color-status-warning)]' :
              'text-[var(--color-text-primary)]'
            )}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Navigation Card ───

function NavigationCard({ card, onNavigate }: { card: ToolResultCard; onNavigate?: (page: string) => void }) {
  const page = card.data.page as string;
  const label = card.data.label as string;

  return (
    <div className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent-subtle)] px-3 py-2 mt-2 flex items-center gap-2">
      <Navigation className="w-3.5 h-3.5 text-[var(--color-accent)]" />
      <span className="text-[12px] font-medium text-[var(--color-text-primary)]">
        Navigated to {label}
      </span>
      {onNavigate && (
        <button
          onClick={() => onNavigate(page)}
          className="ml-auto text-[11px] font-medium text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          Go <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── Detail View Card ───

function DetailViewCard({ card }: { card: ToolResultCard }) {
  const found = card.data.found as boolean;
  const entity = card.data.entity as Record<string, unknown> | undefined;
  const entityType = card.data.entityType as string;

  if (!found || !entity) {
    return (
      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-3 py-3 mt-2">
        <p className="text-[12px] text-[var(--color-text-muted)]">No details found for this item.</p>
      </div>
    );
  }

  // Render key-value pairs from the entity
  const entries = Object.entries(entity).filter(
    ([k]) => !['id', '__typename'].includes(k)
  ).slice(0, 8);

  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]">
        <ExternalLink className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
          {entityType} details
        </span>
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {entries.map(([key, value]) => (
          <div key={key} className="px-3 py-1.5 flex items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--color-text-muted)] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-[11px] font-medium text-[var(--color-text-primary)] text-right truncate max-w-[200px]">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
