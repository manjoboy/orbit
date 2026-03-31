'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface CommandBarProps {
  onClose: () => void;
}

const SUGGESTIONS = [
  { icon: MessageSquare, text: 'What did Sarah discuss in #product yesterday?', category: 'search' },
  { icon: Users, text: 'Who should I talk to about the budget decision?', category: 'graph' },
  { icon: Calendar, text: 'Prep me for my next meeting', category: 'meeting' },
  { icon: FileText, text: 'Draft a follow-up to the engineering review', category: 'draft' },
  { icon: TrendingUp, text: 'How is the enterprise onboarding project doing?', category: 'project' },
  { icon: Sparkles, text: "What's the most important thing I don't know?", category: 'insight' },
];

export function CommandBar({ onClose }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(text?: string) {
    const q = text ?? query;
    if (!q.trim()) return;

    setQuery(q);
    setIsProcessing(true);
    setResponse(null);

    // Simulate AI response (in production: calls /api/ask)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setResponse(
      "Based on your recent interactions and project data, here's what I found..."
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Bar */}
      <div
        className={cn(
          'relative w-full max-w-2xl mx-4',
          'bg-[var(--color-bg-elevated)] border border-[var(--color-border-secondary)]',
          'rounded-2xl shadow-2xl overflow-hidden',
          'animate-slide-up'
        )}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-primary)]">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-blue-400 shrink-0 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ask anything about your work..."
            className={cn(
              'flex-1 bg-transparent text-[15px] text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-muted)]',
              'outline-none'
            )}
          />
          {query && (
            <button
              onClick={() => handleSubmit()}
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-lg',
                'bg-blue-500 text-white hover:bg-blue-600',
                'transition-colors duration-150'
              )}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Response */}
        {response && (
          <div className="px-5 py-4 border-b border-[var(--color-border-primary)]">
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {response}
              </p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!response && !isProcessing && (
          <div className="px-2 py-2 max-h-[320px] overflow-y-auto">
            <div className="px-3 py-1.5">
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Suggested
              </span>
            </div>
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(suggestion.text)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
                  'text-left text-sm text-[var(--color-text-secondary)]',
                  'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
                  'transition-colors duration-100',
                  'stagger-item animate-fade-in opacity-0'
                )}
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
              >
                <suggestion.icon className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                <span className="flex-1">{suggestion.text}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400"
                  style={{
                    animation: 'pulse 1s ease-in-out infinite',
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Searching across your Slack, email, meetings, and documents...
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[10px]">↵</kbd>
              Submit
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[10px]">esc</kbd>
              Close
            </span>
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            Powered by your professional graph
          </span>
        </div>
      </div>
    </div>
  );
}
