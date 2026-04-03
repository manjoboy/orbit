'use client';

import { useState, useEffect } from 'react';
import { OrbitApp } from '@/components/orbit-app';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [onboarded, setOnboarded] = useState(true); // default true to avoid flash

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem('orbit-onboarded');
    if (stored !== 'true') {
      setOnboarded(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    window.localStorage.setItem('orbit-onboarded', 'true');
    setOnboarded(true);
  };

  // During SSR / before mount, render nothing to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <OrbitApp />;
}
