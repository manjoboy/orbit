'use client';

import { useState, useRef, useCallback } from 'react';
import type { BriefingStreamState, BriefingInsight } from '@/lib/agent-types';
import type { Persona } from '@/lib/persona';

// ─── Parse insight blocks from streamed text ───

let _insightCounter = 0;

function parseInsights(rawText: string): BriefingInsight[] {
  const sections = rawText.split(/^### /m).slice(1); // split on ### headings
  const insights: BriefingInsight[] = [];

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const headline = lines[0]?.trim() ?? '';
    if (!headline) continue;

    // Extract body (lines before **Reasoning:**)
    const bodyLines: string[] = [];
    let reasoning = '';
    let urgency: 'high' | 'medium' | 'low' = 'medium';
    let sources: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('**Reasoning:**')) {
        reasoning = line.replace('**Reasoning:**', '').trim();
      } else if (line.startsWith('**Urgency:**')) {
        const u = line.replace('**Urgency:**', '').trim().toLowerCase();
        urgency = u === 'high' ? 'high' : u === 'low' ? 'low' : 'medium';
      } else if (line.startsWith('**Sources:**')) {
        sources = line.replace('**Sources:**', '').trim().split(',').map((s) => s.trim()).filter(Boolean);
      } else if (line.trim()) {
        bodyLines.push(line);
      }
    }

    const body = bodyLines.join(' ').trim();
    if (!body) continue; // Insight still streaming, body not yet available

    _insightCounter++;
    insights.push({
      id: `insight-${_insightCounter}`,
      headline,
      body,
      reasoning: reasoning || undefined,
      urgency,
      proposedActions: [
        { label: 'Take action', type: 'create', description: `Act on: ${headline}` },
      ],
      sources,
    });
  }

  return insights;
}

// ─── Extract greeting line (text before first ###) ───

function parseGreeting(rawText: string): string {
  const idx = rawText.indexOf('###');
  if (idx === -1) return rawText.trim();
  return rawText.slice(0, idx).trim();
}

// ─── Hook ───

export function useBriefingStream(persona: Persona, userName: string) {
  const [state, setState] = useState<BriefingStreamState>({
    status: 'idle',
    greeting: '',
    insights: [],
    rawText: '',
  });

  const startedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const startBriefing = useCallback(async () => {
    // Guard for React strict mode double-mount
    if (startedRef.current) return;
    startedRef.current = true;

    setState({ status: 'streaming', greeting: '', insights: [], rawText: '' });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, userName }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Briefing API error: ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const rawText = accumulated;
        const greeting = parseGreeting(rawText);
        const insights = parseInsights(rawText);
        setState({ status: 'streaming', greeting, insights, rawText });
      }

      // Final parse
      const greeting = parseGreeting(accumulated);
      const insights = parseInsights(accumulated);
      setState({ status: 'complete', greeting, insights, rawText: accumulated });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Briefing stream error:', err);
      setState((prev) => ({ ...prev, status: 'error', error: (err as Error).message }));
    } finally {
      abortRef.current = null;
    }
  }, [persona, userName]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    startedRef.current = false;
    setState({ status: 'idle', greeting: '', insights: [], rawText: '' });
  }, []);

  return { state, startBriefing, reset };
}
