'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { useOrbit } from '../orbit-app';
import { PERSONA_CONFIGS } from '@/lib/persona';

interface ChatInputProps { onSend: (text: string) => void; isDisabled: boolean; }

export function ChatInput({ onSend, isDisabled }: ChatInputProps) {
  const { sendMessage, isStreaming, persona } = useOrbit();
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const disabled = isDisabled || isStreaming;
  const suggestions = PERSONA_CONFIGS[persona]?.suggestionChips ?? [
    'Prep me for my 2pm meeting',
    'What should I prioritize today?',
    'Draft a reply to Sarah',
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [value]);

  function submit() {
    if (!value.trim() || disabled) return;
    sendMessage(value.trim());
    setValue('');
  }

  return (
    <div className="shrink-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
      {/* Suggestion chips */}
      <div className="max-w-2xl mx-auto px-3 md:px-5 pt-2 md:pt-2.5 pb-1">
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1.5">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setValue(s); ref.current?.focus(); }}
              className={cn(
                'shrink-0 px-3 py-1 rounded-full text-[12px]',
                'text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)]',
                'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]',
                'transition-colors'
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-3 md:px-5 pb-3 md:pb-4 pt-0.5">
        <div className={cn(
          'flex items-end gap-2 px-3 md:px-3.5 py-2 md:py-2.5 rounded-xl',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]',
          'focus-within:border-[var(--color-border-strong)]',
          'transition-colors'
        )}>
          {/* Orbit icon */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-white/90" />
          </div>
          <textarea ref={ref} value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="What should I prioritize today?" rows={1} disabled={disabled}
            className="flex-1 resize-none bg-transparent text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none max-h-36 disabled:opacity-40" />
          <button onClick={submit} disabled={!value.trim() || disabled}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150',
              value.trim() && !disabled
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 active:scale-95'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
            )}>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
