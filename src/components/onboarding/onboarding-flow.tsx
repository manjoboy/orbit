'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, Loader2, ArrowRight, Sparkles } from 'lucide-react';

// ─── Integration definitions ───
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Messages, channels & threads',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312z" fill="#2EB67D"/>
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.527 2.527 0 0 1-2.521-2.522 2.527 2.527 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z" fill="#ECB22E"/>
      </svg>
    ),
    color: '#E01E5A',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Emails & conversations',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
      </svg>
    ),
    color: '#EA4335',
  },
  {
    id: 'gcal',
    name: 'Google Calendar',
    description: 'Events, meetings & schedules',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path d="M18.316 5.684H24v12.632h-5.684V5.684z" fill="#1967D2"/>
        <path d="M5.684 24V5.684H0v12.632C0 20.334 1.685 22.02 3.7 22.02L5.684 24z" fill="#188038"/>
        <path d="M24 5.684V3.7C24 1.685 22.315 0 20.3 0h-1.984l-5.684 5.684H24z" fill="#1967D2"/>
        <path d="M12.632 5.684V0H3.7C1.685 0 0 1.685 0 3.7v1.984h5.684l6.948 0z" fill="#4285F4"/>
        <path d="M5.684 18.316H0V24h5.684v-5.684z" fill="#188038"/>
        <rect x="5.684" y="5.684" width="6.948" height="12.632" fill="#fff"/>
        <path d="M18.316 18.316H24V24h-3.7c-2.015 0-3.7-1.685-3.7-3.7v.016h1.716z" fill="#1967D2"/>
        <path d="M9.5 9.2h1.3v5.6H9.5V9.2zm2.5 0h1.3v5.6H12V9.2z" fill="#4285F4"/>
      </svg>
    ),
    color: '#4285F4',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issues, projects & cycles',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path d="M2.513 17.306a.618.618 0 0 1-.157-.643 10.018 10.018 0 0 1 5.282-5.281.618.618 0 0 1 .643.156l4.181 4.181a.618.618 0 0 1 .156.643 10.018 10.018 0 0 1-5.281 5.282.618.618 0 0 1-.643-.157l-4.181-4.181z" fill="#5E6AD2"/>
        <path d="M1.126 12.694a.62.62 0 0 1-.114-.675A11.94 11.94 0 0 1 11.95.012a.62.62 0 0 1 .463.17l.025.024a.62.62 0 0 1 .15.616A14.013 14.013 0 0 0 12.1 4.51c0 3.847 1.548 7.33 4.053 9.861a14.1 14.1 0 0 0 3.708 2.833.62.62 0 0 1 .14.972 11.94 11.94 0 0 1-15.774-.572l-3.1-4.91z" fill="#5E6AD2"/>
      </svg>
    ),
    color: '#5E6AD2',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repos, PRs & code reviews',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    color: '#ffffff',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Docs, wikis & knowledge base',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L2.58 2.48c-.467.047-.56.28-.374.466l2.253 1.262zm.793 2.946v13.86c0 .746.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.107c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.887zm14.337.42c.093.42 0 .84-.42.886l-.7.14v10.264c-.607.327-1.167.514-1.634.514-.746 0-.933-.234-1.493-.933l-4.572-7.186v6.953l1.447.327s0 .84-1.167.84l-3.22.186c-.092-.186 0-.653.327-.746l.84-.233V8.294L7.547 8.2c-.093-.42.14-1.026.793-1.073l3.454-.233 4.759 7.278V7.76l-1.214-.14c-.093-.514.28-.886.747-.933l3.503-.234z"/>
      </svg>
    ),
    color: '#ffffff',
  },
];

// ─── Progress step definitions ───
const GRAPH_STEPS = [
  { text: 'Scanning 847 messages across 23 channels...', target: 25 },
  { text: 'Identifying 34 key relationships...', target: 50 },
  { text: 'Mapping project dependencies...', target: 75 },
  { text: 'Generating your first briefing...', target: 100 },
];

// ─── Props ───
interface OnboardingFlowProps {
  onComplete: () => void;
}

// ─── Main Component ───
export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[var(--color-accent)] opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto px-6">
        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && <IntegrationsStep onNext={() => setStep(2)} />}
        {step === 2 && <BuildingGraphStep onNext={() => setStep(3)} />}
        {step === 3 && <ReadyStep onComplete={onComplete} />}
      </div>
    </div>
  );
}

// ─── Step 1: Welcome ───
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {/* Logo */}
      <div className="w-16 h-16 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mb-8">
        <div className="w-7 h-7 rounded-full bg-[var(--color-accent)]" />
      </div>

      <h1 className="text-[32px] font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
        Welcome to Orbit
      </h1>
      <p className="text-[15px] text-[var(--color-text-tertiary)] mt-3 max-w-sm leading-relaxed">
        Your professional world, connected
      </p>

      <button
        onClick={onNext}
        className="mt-10 flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium bg-[var(--color-accent-strong)] text-white hover:opacity-90 transition-opacity"
      >
        Get Started
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-[11px] text-[var(--color-text-muted)] mt-6">
        Takes about 2 minutes to set up
      </p>
    </div>
  );
}

// ─── Step 2: Connect Integrations ───
function IntegrationsStep({ onNext }: { onNext: () => void }) {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = useCallback((id: string) => {
    if (connected.has(id) || connecting) return;
    setConnecting(id);
    setTimeout(() => {
      setConnected((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setConnecting(null);
    }, 1500);
  }, [connected, connecting]);

  const canProceed = connected.size >= 2;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-[24px] font-bold text-[var(--color-text-primary)] tracking-tight">
          Connect your tools
        </h2>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2">
          Orbit needs at least 2 integrations to build your professional graph
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INTEGRATIONS.map((integration) => {
          const isConnected = connected.has(integration.id);
          const isConnecting = connecting === integration.id;

          return (
            <div
              key={integration.id}
              className={cn(
                'relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200',
                isConnected
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
              )}
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                {integration.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                  {integration.name}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  {integration.description}
                </p>
              </div>
              <button
                onClick={() => handleConnect(integration.id)}
                disabled={isConnected || isConnecting}
                className={cn(
                  'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : isConnecting
                    ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                    : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] hover:text-white'
                )}
              >
                {isConnected ? (
                  <Check className="w-4 h-4" />
                ) : isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center mt-8">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium transition-all duration-200',
            canProceed
              ? 'bg-[var(--color-accent-strong)] text-white hover:opacity-90'
              : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] cursor-not-allowed'
          )}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
        {!canProceed && (
          <p className="text-[11px] text-[var(--color-text-muted)] mt-3">
            Connect at least {2 - connected.size} more integration{2 - connected.size > 1 ? 's' : ''} to continue
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Building Graph ───
function BuildingGraphStep({ onNext }: { onNext: () => void }) {
  const [progress, setProgress] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([0]);

  useEffect(() => {
    let frame: number;
    let startTime: number | null = null;
    const TOTAL_DURATION = 6000; // 6 seconds total

    function tick(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      setProgress(pct);

      // Determine which step we are on
      const stepIdx = pct < 25 ? 0 : pct < 50 ? 1 : pct < 75 ? 2 : 3;
      setActiveStepIdx(stepIdx);
      setVisibleSteps((prev) => {
        if (!prev.includes(stepIdx)) return [...prev, stepIdx];
        return prev;
      });

      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        // Auto-transition after a brief pause
        setTimeout(onNext, 800);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onNext]);

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {/* Pulsing logo */}
      <div className="relative w-16 h-16 mb-10">
        <div className="absolute inset-0 rounded-full bg-[var(--color-accent)] opacity-20 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="relative w-16 h-16 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[var(--color-accent)]" />
        </div>
      </div>

      <h2 className="text-[24px] font-bold text-[var(--color-text-primary)] tracking-tight">
        Building your graph
      </h2>
      <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2 mb-8">
        Analyzing your professional world...
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-8">
        <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-2 tabular-nums">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Step labels */}
      <div className="space-y-3 w-full max-w-sm">
        {GRAPH_STEPS.map((s, i) => {
          if (!visibleSteps.includes(i)) return null;
          const isActive = i === activeStepIdx;
          const isDone = progress >= s.target;
          return (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-left animate-slide-up',
                isActive
                  ? 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]'
                  : isDone
                  ? 'opacity-50'
                  : ''
              )}
            >
              {isDone ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-[var(--color-accent)] animate-spin shrink-0" />
              )}
              <span className={cn(
                'text-[12px]',
                isActive ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'
              )}>
                {s.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: Ready ───
function ReadyStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
        <Check className="w-7 h-7 text-emerald-400" />
      </div>

      <h2 className="text-[28px] font-bold text-[var(--color-text-primary)] tracking-tight">
        Your briefing is ready
      </h2>
      <p className="text-[13px] text-[var(--color-text-tertiary)] mt-3 max-w-sm leading-relaxed">
        Orbit has mapped your professional world. Your first briefing is waiting.
      </p>

      {/* Preview thumbnail */}
      <div className="mt-8 w-full max-w-sm rounded-xl overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
        <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            </div>
            <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
              Morning Briefing
            </span>
          </div>
        </div>
        <div className="px-4 py-4 space-y-2.5">
          <div className="h-2.5 w-3/4 shimmer rounded" />
          <div className="h-2.5 w-full shimmer rounded" />
          <div className="h-2.5 w-2/3 shimmer rounded" />
          <div className="h-8 w-full shimmer rounded-lg mt-3" />
          <div className="h-2.5 w-5/6 shimmer rounded" />
          <div className="h-2.5 w-1/2 shimmer rounded" />
        </div>
      </div>

      <button
        onClick={onComplete}
        className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium bg-[var(--color-accent-strong)] text-white hover:opacity-90 transition-opacity"
      >
        View Briefing
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
