import React from 'react';
import { LandingNav } from '@/components/landing/nav';
import { LandingHero } from '@/components/landing/hero';
import { LandingLiveDemo } from '@/components/landing/live-demo';
import { LandingHowItWorks } from '@/components/landing/how-it-works';
import { LandingFeaturesGrid } from '@/components/landing/features-grid';
import { LandingTechStrip } from '@/components/landing/tech-strip';
import { LandingCTA } from '@/components/landing/cta';
import { LandingFooter } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text dotted-grid flex flex-col selection:bg-signal-red selection:text-white">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingLiveDemo />
        <LandingHowItWorks />
        <LandingFeaturesGrid />
        <LandingTechStrip />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
