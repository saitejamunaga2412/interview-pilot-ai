import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import LandingJourney from "../components/landing/LandingJourney";
import LandingCareerVisual from "../components/landing/LandingCareerVisual";
import LandingAIPipeline from "../components/landing/LandingAIPipeline";
import LandingPillars from "../components/landing/LandingPillars";
import LandingInteractiveStudio from "../components/landing/LandingInteractiveStudio";
import LandingCTA from "../components/landing/LandingCTA";
import LandingFooter from "../components/landing/LandingFooter";

export default function Landing() {
  useEffect(() => {
    document.title = "InterviewPilot AI";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans antialiased selection:bg-primary-500/25 selection:text-text-primary overflow-x-hidden">
      {/* Navbar */}
      <LandingNavbar />

      {/* SECTION 1: Hero */}
      <LandingHero />

      {/* SECTION 2: Everything You Need (Core Modules) */}
      <LandingPillars />

      {/* SECTION 3: Your Preparation, Visualized */}
      <LandingCareerVisual />

      {/* SECTION 4: My Journey */}
      <LandingJourney />

      {/* SECTION 5: AI Assistant */}
      <LandingAIPipeline />

      {/* SECTION 6: Practice Like the Real Thing */}
      <LandingInteractiveStudio />

      {/* SECTION 7: Final CTA */}
      <LandingCTA />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
