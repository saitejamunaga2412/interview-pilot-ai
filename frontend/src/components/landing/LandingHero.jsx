import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Target, Zap, 
  Bot, Code2, Calculator, Play, Terminal, Sparkles, CheckCircle2
} from "lucide-react";

export default function LandingHero() {
  // Stagger variants for entry narrative
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } }
  };

  return (
    <section id="placement-engine" className="relative min-h-[92vh] pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden bg-bg-base">
      
      {/* Background atmosphere - Fades in */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 1.2 }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1150px] h-[550px] bg-gradient-to-b from-primary-600/10 via-secondary-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/3 -left-20 w-[450px] h-[450px] bg-primary-700/5 rounded-full blur-3xl pointer-events-none -z-10" 
      />
      <div className="absolute inset-0 bg-[radial-gradient(#1a233a_1px,transparent_1px)] [background-size:32px_32px] opacity-25 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Narrative with Staggered Entrance */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 text-center lg:text-left space-y-6"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2/95 border border-border/80 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-text-primary tracking-wider uppercase">
                INTERVIEWPILOT AI
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-text-primary to-cyan-300"
            >
              Prepare Smarter.<br />
              Perform Better.<br />
              Get Interview Ready.
            </motion.h1>
 
            {/* Subtitle */}
            <motion.p 
              variants={itemVariants} 
              className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Learn, practice coding, improve aptitude, simulate interviews, optimize your resume, and track your preparation in one place.
            </motion.p>
 
            {/* CTAs */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/register"
                className="px-7 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/25 flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start Preparing Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
 
              <a
                href="#preparation-pillars"
                className="px-7 py-3.5 bg-[#0F1629] hover:bg-[#141B32] border border-border text-text-secondary hover:text-text-primary rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Explore InterviewPilot AI
              </a>
            </motion.div>
 
          </motion.div>
 
          {/* RIGHT COLUMN: 3D Visual Layered Parallax HUD Simulation */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div 
              className="relative w-full max-w-md aspect-square rounded-2xl border border-primary-500/20 bg-gradient-to-br from-[#0F1629]/90 to-[#0B1020]/90 p-4 shadow-2xl transition-all duration-300 ease-out flex items-center justify-center overflow-visible"
              style={{
                perspective: "1000px"
              }}
            >
              {/* Anime Inspired Workspace Illustration Background layer */}
              <div className="w-full h-full relative rounded-xl overflow-hidden">
                <img 
                  src="/assets/anime/landing_hero.jpg" 
                  alt="Student workspace" 
                  className="w-full h-full object-cover opacity-75 mix-blend-lighten"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070914] via-transparent to-[#070914]/20 pointer-events-none" />
              </div>
 
              {/* Layered Parallax Floating Items */}
              {/* Floating UI Item 1: Readiness */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 -left-6 bg-[#0F1629]/95 border border-primary-500/30 rounded-xl p-3 shadow-lg flex items-center gap-3 w-40 text-left"
                style={{ transform: "translateZ(60px)" }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-primary-500 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold font-mono text-text-primary">72%</span>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-primary-300 font-bold uppercase tracking-wider">Readiness</div>
                  <div className="text-[11px] font-bold text-text-primary mt-0.5">SDE Ready</div>
                </div>
              </motion.div>
 
              {/* Floating UI Item 2: Today's Mission */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/4 -right-12 bg-[#0F1629]/95 border border-cyan-500/30 rounded-xl p-3 shadow-lg w-44 text-left"
                style={{ transform: "translateZ(80px)" }}
              >
                <div className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider mb-1">Today's Mission</div>
                <div className="space-y-1">
                  <div className="text-[10px] flex items-center gap-1.5 text-text-secondary">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" /> Complete 3 Arrays
                  </div>
                  <div className="text-[10px] flex items-center gap-1.5 text-text-secondary">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" /> ATS Audit
                  </div>
                </div>
              </motion.div>
 
              {/* Floating UI Item 3: Skill Progress */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -left-8 bg-[#0F1629]/95 border border-indigo-500/30 rounded-xl p-3 shadow-lg w-40 text-left"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider mb-1">Skill Progress</div>
                <div className="w-full bg-[#141B32] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full w-[80%]" />
                </div>
                <div className="flex justify-between items-center text-[10px] mt-1 text-text-primary">
                  <span>DSA</span>
                  <span className="font-mono text-primary-400 font-bold">80%</span>
                </div>
              </motion.div>
 
              {/* Floating UI Item 4: AI Recommendation */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-8 -right-8 bg-[#0F1629]/95 border border-emerald-500/30 rounded-xl p-3 shadow-lg w-48 text-left"
                style={{ transform: "translateZ(70px)" }}
              >
                <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Bot className="w-3 h-3 text-emerald-400" /> AI Recommendation
                </div>
                <div className="text-[10px] text-text-secondary leading-relaxed">
                  "Practice quantitative speed tricks for target Google tests."
                </div>
              </motion.div>
 
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
