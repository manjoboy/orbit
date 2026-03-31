'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface SectionFeedbackProps {
  sectionType: string;
  sectionTitle: string;
  children: ReactNode;
}

/**
 * Wraps a briefing section with invisible tracking for the quality loop.
 * Captures:
 * - section_viewed (intersection observer)
 * - section_skipped (scrolled past without pausing)
 * - section_time_spent (time in viewport)
 * - explicit_feedback (thumbs up/down)
 */
export function SectionFeedback({ sectionType, sectionTitle, children }: SectionFeedbackProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeInView, setTimeInView] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track viewport visibility with IntersectionObserver
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry.isIntersecting && entry.intersectionRatio > 0.3;
        setIsVisible(nowVisible);

        if (nowVisible) {
          // Signal: section_viewed
          trackSignal(sectionType, 'section_viewed');
        }
      },
      { threshold: [0, 0.3, 0.6, 1.0] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionType]);

  // Track time spent viewing
  useEffect(() => {
    if (isVisible) {
      timerRef.current = setInterval(() => {
        setTimeInView(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // When section leaves view, log total time
      if (timeInView > 0 && timeInView < 2) {
        // Less than 2 seconds = skipped
        trackSignal(sectionType, 'section_skipped', { timeSpentSeconds: timeInView });
      } else if (timeInView >= 2) {
        trackSignal(sectionType, 'section_time_spent', { timeSpentSeconds: timeInView });
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, sectionType, timeInView]);

  function handleFeedback(type: 'positive' | 'negative') {
    setFeedbackGiven(type);
    trackSignal(sectionType, 'explicit_feedback', { feedback: type });

    // Auto-hide after 2 seconds
    setTimeout(() => setShowFeedback(false), 2000);
  }

  return (
    <div
      ref={sectionRef}
      className="group relative"
      onMouseEnter={() => setShowFeedback(true)}
      onMouseLeave={() => !feedbackGiven && setShowFeedback(false)}
    >
      {children}

      {/* Floating feedback buttons — appear on hover */}
      <div
        className={cn(
          'absolute -right-1 top-0 flex flex-col gap-1',
          'transition-all duration-200',
          showFeedback ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        )}
      >
        {feedbackGiven ? (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium',
            feedbackGiven === 'positive'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          )}>
            {feedbackGiven === 'positive' ? '👍' : '👎'} Noted
          </div>
        ) : (
          <>
            <button
              onClick={() => handleFeedback('positive')}
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-lg',
                'bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)]',
                'text-[var(--color-text-muted)] hover:text-emerald-400 hover:border-emerald-500/30',
                'transition-all duration-150 shadow-sm'
              )}
              title="This was useful"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-lg',
                'bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)]',
                'text-[var(--color-text-muted)] hover:text-red-400 hover:border-red-500/30',
                'transition-all duration-150 shadow-sm'
              )}
              title="Not useful"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Send interaction signal to the feedback API.
 * In production: POST /api/feedback with the signal data.
 * The quality loop processes these to improve future briefings.
 */
function trackSignal(
  sectionType: string,
  signalType: string,
  metadata: Record<string, unknown> = {}
) {
  // Fire-and-forget — don't block the UI
  if (typeof window === 'undefined') return;

  const signal = {
    sectionType,
    signalType,
    metadata,
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
  };

  // Use sendBeacon for reliability (works even during page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/feedback', JSON.stringify(signal));
  } else {
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signal),
      keepalive: true,
    }).catch(() => {
      // Silent fail — feedback is best-effort
    });
  }
}
