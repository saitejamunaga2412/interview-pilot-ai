import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Code2, FolderGit2, FileText, Bot, 
  ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Terminal, Cpu
} from "lucide-react";

const coreFeatures = [
  {
    id: "roadmaps",
    title: "Personalized Learning Roadmaps",
    category: "Learning",
    icon: BookOpen,
    color: "from-cyan-500 to-blue-600",
    borderGlow: "group-hover:border-cyan-500/40",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description:
      "Structured syllabus covering Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks, and System Design with step-by-step visualizations and AI Teacher explanations.",
    link: "/learning",
    actionText: "Explore Roadmaps",
    highlights: ["Interactive Visualizers", "Strict Teaching Sequence", "Adaptive Difficulty"]
  },
  {
    id: "coding",
    title: "Coding Practice",
    category: "Arena",
    icon: Code2,
    color: "from-indigo-500 to-purple-600",
    borderGlow: "group-hover:border-indigo-500/40",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description:
      "Execute code in Python, C++, Java, and JavaScript inside our Judge0 sandbox against hidden test cases. Benchmark time and space complexity with progressive hints and mistake tracking.",
    link: "/arena",
    actionText: "Enter Coding Arena",
    highlights: ["Judge0 Multi-Language Execution", "Hidden Test Cases", "Algorithmic Patterns"]
  },
  {
    id: "projects",
    title: "Project Management",
    category: "Portfolio",
    icon: FolderGit2,
    color: "from-emerald-500 to-teal-600",
    borderGlow: "group-hover:border-emerald-500/40",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description:
      "Manage real-world portfolio projects, organize tech stacks, track milestones, monitor completion status, and link code repositories to showcase proven engineering skills to recruiters.",
    link: "/projects",
    actionText: "Manage Projects",
    highlights: ["Milestone Tracking", "Tech Stack Architecture", "Repository & Demo Links"]
  },
  {
    id: "resume",
    title: "Resume Builder and ATS Analysis",
    category: "Career",
    icon: FileText,
    color: "from-purple-500 to-pink-600",
    borderGlow: "group-hover:border-purple-500/40",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description:
      "Extract resume content, evaluate target-role compatibility, identify missing keywords, uncover formatting errors, and generate high-impact, quantifiable bullet improvements.",
    link: "/resume",
    actionText: "Scan Resume ATS",
    highlights: ["Role-Aligned Keyword Detection", "ATS Compatibility Score", "Quantified Action Verbs"]
  },
  {
    id: "interview",
    title: "AI Mock Interviews",
    category: "Simulations",
    icon: Bot,
    color: "from-blue-500 to-indigo-600",
    borderGlow: "group-hover:border-blue-500/40",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description:
      "Participate in technical and behavioral mock interview sessions. Receive structured candidate feedback detailing what was done well, missing technical concepts, and ideal answer structure.",
    link: "/interview",
    actionText: "Start Mock Interview",
    highlights: ["Role-Specific Questions", "Rubric-Based Scoring", "Structured Concept Revision"]
  }
];

export default function LandingPillars() {
  return (
    <section id="features" className="py-24 bg-[#090D18] border-t border-border/60 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111728] border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Five Core Engines</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Everything You Need for Campus & Industry Placements
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            Five deeply connected preparation areas working seamlessly together. Every quiz, code submission, and interview response feeds directly into your personal placement readiness.
          </p>
        </div>

        {/* 5 Core Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, index) => {
            const Icon = feat.icon;
            const isWide = index === 0 || index === 3;
            return (
              <div
                key={feat.id}
                className={`group relative rounded-2xl bg-[#0E1322]/80 hover:bg-[#11182B] border border-border/70 ${feat.borderGlow} p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-cyan-950/20 backdrop-blur-md ${
                  isWide ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div>
                  {/* Top Bar with Icon and Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md border ${feat.badgeColor}`}>
                      {feat.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Highlights checklist */}
                  <div className="mt-5 space-y-1.5 pt-4 border-t border-border/40">
                    {feat.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Navigation Link */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <Link
                    to={feat.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
