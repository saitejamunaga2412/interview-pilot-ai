import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import LandingPillars from "../components/landing/LandingPillars";
import LandingJourney from "../components/landing/LandingJourney";
import LandingAIPipeline from "../components/landing/LandingAIPipeline";
import LandingCareerVisual from "../components/landing/LandingCareerVisual";
import LandingInteractiveStudio from "../components/landing/LandingInteractiveStudio";
import LandingCTA from "../components/landing/LandingCTA";
import LandingFooter from "../components/landing/LandingFooter";

export default function Landing() {
  useEffect(() => {
    document.title = "InterviewPilot AI — Placement Operating System";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#070A13] text-text-primary font-sans antialiased selection:bg-cyan-500/25 selection:text-white overflow-x-hidden">
      {/* 1. Navigation */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <LandingHero />

      {/* 3. Core Features (5 Core Pillars) */}
      <LandingPillars />

      {/* 4 & 5. How It Works & Personalized Learning Section */}
      <LandingJourney />

      {/* 6. AI Interview Section */}
      <LandingAIPipeline />

      {/* 7. Analytics & Real Progress Tracking */}
      <LandingCareerVisual />

      {/* Interactive Studio Preview */}
      <LandingInteractiveStudio />

      {/* 8. Final CTA */}
      <LandingCTA />

      {/* 9. Footer */}
      <LandingFooter />
    </div>
  );
}
