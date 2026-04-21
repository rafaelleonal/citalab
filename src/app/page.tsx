import { LandingNav } from "./_components/landing/nav";
import { LandingHero } from "./_components/landing/hero";
import { LandingProblem } from "./_components/landing/problem";
import { LandingFeatures } from "./_components/landing/features";
import { LandingFlow } from "./_components/landing/flow";
import { LandingQuote } from "./_components/landing/quote";
import { LandingPricing } from "./_components/landing/pricing";
import { LandingRoadmap } from "./_components/landing/roadmap";
import { LandingFaq } from "./_components/landing/faq";
import { LandingCta } from "./_components/landing/cta";
import { LandingFooter } from "./_components/landing/footer";

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-bg-warm text-[15px] leading-[1.55] text-ink">
      <LandingNav />
      <LandingHero />
      <LandingProblem />
      <LandingFeatures />
      <LandingFlow />
      <LandingQuote />
      <LandingPricing />
      <LandingRoadmap />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
      <style>{`@keyframes cl-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
