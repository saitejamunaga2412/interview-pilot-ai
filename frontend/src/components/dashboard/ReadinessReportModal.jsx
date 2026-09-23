import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, Printer } from 'lucide-react';

export default function ReadinessReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  const {
    targetRole = "Software Engineer",
    overallReadiness = 0,
    readinessStatus = "INSUFFICIENT DATA",
    dimensions = [],
    strongestArea = "Coding",
    weakestArea = "AI Interview",
    mainBlocker = "None",
    next7Days = [],
    formulaExplanation = ""
  } = reportData;

  const getStatusColor = (status) => {
    switch (status) {
      case "READY":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "NEARLY READY":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "NEEDS MORE PRACTICE":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-surface-2 text-text-muted border-border";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0F1629] border border-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-surface-2/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  InterviewPilot AI Intelligence
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-text-primary font-display">
                  Placement Readiness Report
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-primary-500/20 bg-gradient-to-r from-primary-950/40 via-surface to-surface">
              <div className="sm:col-span-2 space-y-1">
                <span className="text-xs text-text-secondary font-medium">Target Role Track</span>
                <h3 className="text-xl font-extrabold text-text-primary">{targetRole}</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Calibrated across coding submissions, mock interviews, aptitude drills, and resume ATS integrity.
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end justify-center border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-mono text-primary-400">{overallReadiness}%</span>
                  <span className="text-xs text-text-muted font-mono">/ 100</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-2 rounded-full font-mono text-[10px] font-bold border ${getStatusColor(readinessStatus)}`}>
                  {readinessStatus}
                </span>
              </div>
            </div>

            {/* 5 Dimensions Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-text-muted tracking-wider">
                Multi-Dimensional Competency Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dimensions.map((dim) => (
                  <div key={dim.name} className="p-3.5 rounded-xl border border-border/80 bg-surface space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-text-primary">{dim.name} ({dim.weight})</span>
                      <span className="font-mono font-bold text-primary-300">{dim.score}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted font-mono block">{dim.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses Analysis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STRONGEST DOMAIN</span>
                </div>
                <p className="text-sm font-bold text-text-primary">{strongestArea}</p>
                <p className="text-xs text-text-secondary">Consistent attempt volume and accuracy benchmarks.</p>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>NEEDS ATTENTION</span>
                </div>
                <p className="text-sm font-bold text-text-primary">{weakestArea}</p>
                <p className="text-xs text-text-secondary">{mainBlocker}</p>
              </div>
            </div>

            {/* Recommended 7 Days */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-text-muted tracking-wider">
                Recommended 7-Day Action Plan
              </h4>
              <div className="p-4 rounded-xl border border-border bg-surface space-y-2.5">
                {next7Days.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-[11px] text-text-muted leading-relaxed">
              <span className="font-bold text-text-secondary block mb-0.5">Model Explainability:</span>
              {formulaExplanation}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-surface-2/60 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
