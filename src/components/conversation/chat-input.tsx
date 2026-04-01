'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isDisabled: boolean;
}

const SUGGESTIONS = [
  'Prep me for my 2pm meeting',
  "What's the risk on the onboarding project?",
  'Draft a reply to Sarah about the auth issue',
  "What's the most important thing I don't know?",
];

export function ChatInput({ onSend, isDisabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  function handleSubmit() {
    if (!value.trim() || isDisabled) return;
    onSend(value.trim());
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="shrink-0 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">
      {/* Suggestion chips */}
      <div className="max-w-3xl mx-auto px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setValue(s);
                textareaRef.current?.focus();
              }}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                'text-[12px] text-[var(--color-text-tertiary)]',
                'border border-[var(--color-border-primary)]',
                'hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]',
                'transition-all duration-150'
              )}
            >
              <Sparkles className="w-3 h-3" />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto px-4 pb-5 pt-1">
        <div className={cn(
          'relative flex items-end gap-2 px-4 py-3 rounded-2xl',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]',
          'focus-within:border-[var(--color-border-focus)] focus-within:shadow-[0_0_0_1px_var(--color-border-focus)]',
          'transition-all duration-200'
        )}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Chief of Staff anything..."
            rows={1}
            disabled={isDisabled}
            className={cn(
              'flex-1 resize-none bg-transparent text-[14px] text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-muted)]',
              'outline-none max-h-40',
              'disabled:opacity-50'
            )}
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isDisabled}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-xl shrink-0',
              'transition-all duration-200',
              value.trim() && !isDisabled
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-2">
          Powered by your professional graph &middot; 23 signals detected today
        </p>
      </div>
    </div>
  );
}
