import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useToast } from "../ui/Toast";
import { 
  FaTimes, FaBuilding, FaLandmark, FaHistory, FaSlidersH, 
  FaGraduationCap, FaCheckCircle, FaInfoCircle, FaShieldAlt, FaRocket 
} from "react-icons/fa";

export default function TargetSelectionModal({ isOpen, onClose, activeTarget, onTargetSelected }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("company"); // 'company' | 'government' | 'previous_year' | 'general' | 'custom'
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Custom target state
  const [customForm, setCustomForm] = useState({
    companyName: "",
    examName: "",
    role: "Software Engineer",
    topics: ["Percentages", "Time & Work", "Probability"],
    difficulty: "Medium",
    questionCount: 20,
    timeLimitMinutes: 30
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatterns();
    }
  }, [isOpen]);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const res = await API.get("/exam-patterns/patterns");
      const list = res.data?.data || res.data || [];
      setPatterns(list);
    } catch (err) {
      console.error("Failed to load patterns:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectPattern = async (pattern) => {
    setSaving(true);
    try {
      const payload = {
        targetType: pattern.type,
        targetId: pattern.patternId,
        targetName: pattern.name,
        targetRole: pattern.role || "Fresher",
        patternId: pattern.patternId
      };
      const res = await API.post("/exam-patterns/targets", payload);
      const updated = res.data?.data || res.data;
      addToast(`Target set to: ${pattern.name}`, "success");
      onTargetSelected(updated);
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Failed to set target", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!customForm.companyName && !customForm.examName) {
      addToast("Please provide a Company or Exam name", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await API.post("/exam-patterns/targets/custom", customForm);
      const data = res.data?.data || res.data;
      addToast("Custom preparation target created!", "success");
      onTargetSelected(data.target);
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Failed to create custom target", "error");
    } finally {
      setSaving(false);
    }
  };

  const companyPatterns = patterns.filter(p => p.type === "company");
  const govPatterns = patterns.filter(p => p.type === "government");
  const generalPatterns = patterns.filter(p => p.type === "general");

  const getConfidenceBadge = (confidence, disclaimer) => {
    if (confidence === "high") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
          <FaShieldAlt size={9} /> High Confidence (Documented)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200">
        <FaInfoCircle size={9} /> Pattern Match (Historical/Public)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-text-primary">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg-base/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Exam-Pattern-Aware Practice
            </span>
            <h2 className="text-2xl font-black mt-0.5 text-text-primary">
              Choose Your Preparation Target
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Select your goal so questions match the exact syllabus, difficulty, and speed pressure of your target test.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-border bg-surface px-6 pt-3 gap-2 overflow-x-auto">
          {[
            { id: "company", label: "Software Companies", icon: <FaBuilding /> },
            { id: "government", label: "Government Exams", icon: <FaLandmark /> },
            { id: "previous_year", label: "Previous-Year Papers", icon: <FaHistory /> },
            { id: "general", label: "General Placement", icon: <FaGraduationCap /> },
            { id: "custom", label: "Custom Target", icon: <FaSlidersH /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-text-secondary">Loading verified exam patterns...</p>
            </div>
          ) : activeTab === "company" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyPatterns.map(p => (
                <div
                  key={p.patternId}
                  onClick={() => handleSelectPattern(p)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    activeTarget?.targetId === p.patternId
                      ? "bg-primary-50/50 dark:bg-primary-950/30 border-primary-500 ring-2 ring-primary-500/20"
                      : "bg-bg-base border-border hover:border-primary-400"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                        {p.company}
                      </span>
                      {getConfidenceBadge(p.confidence, p.disclaimer)}
                    </div>
                    <h3 className="font-bold text-base text-text-primary">{p.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{p.description}</p>
                    <p className="text-[11px] text-text-muted italic bg-surface/50 p-2 rounded-xl border border-border">
                      {p.disclaimer}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-border text-xs">
                    <span className="text-text-muted font-medium">Role: <strong>{p.role}</strong></span>
                    <button className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition-colors">
                      {activeTarget?.targetId === p.patternId ? "Active Target" : "Select Target"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "government" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {govPatterns.map(p => (
                <div
                  key={p.patternId}
                  onClick={() => handleSelectPattern(p)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    activeTarget?.targetId === p.patternId
                      ? "bg-primary-50/50 dark:bg-primary-950/30 border-primary-500 ring-2 ring-primary-500/20"
                      : "bg-bg-base border-border hover:border-primary-400"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        {p.exam}
                      </span>
                      {getConfidenceBadge(p.confidence, p.disclaimer)}
                    </div>
                    <h3 className="font-bold text-base text-text-primary">{p.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{p.description}</p>
                    <div className="flex gap-2 text-[11px] text-text-muted">
                      <span>⏱️ {p.timeLimitMinutes} mins</span>
                      <span>•</span>
                      <span>Marks: +2 / -{p.negativeMarking}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-border text-xs">
                    <span className="text-text-muted font-medium">Exam: <strong>{p.exam}</strong></span>
                    <button className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition-colors">
                      {activeTarget?.targetId === p.patternId ? "Active Target" : "Select Target"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "previous_year" ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                <FaShieldAlt className="text-emerald-600 text-base shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">100% Authenticated Previous-Year Questions</strong>
                  Practice questions sourced directly from verified past exam papers (e.g. SSC CGL 2024/2023, IBPS PO, RRB NTPC). Zero fabricated past questions.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "pyq-ssc-cgl-2024", name: "SSC CGL 2024 Tier-1 Papers", exam: "SSC CGL", year: 2024, section: "Quantitative Aptitude" },
                  { id: "pyq-ssc-cgl-2023", name: "SSC CGL 2023 Tier-1 Papers", exam: "SSC CGL", year: 2023, section: "Quantitative & Reasoning" },
                  { id: "pyq-ibps-po-2024", name: "IBPS PO 2024 Official Sample Sets", exam: "IBPS PO", year: 2024, section: "Quantitative Aptitude" }
                ].map(pyq => (
                  <div
                    key={pyq.id}
                    onClick={() => handleSelectPattern({
                      patternId: pyq.id,
                      name: pyq.name,
                      type: "previous_year",
                      exam: pyq.exam,
                      role: "Officer / Trainee"
                    })}
                    className="p-5 rounded-2xl bg-bg-base border border-border hover:border-primary-400 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Verified Past Paper ({pyq.year})
                      </span>
                      <h4 className="font-bold text-base text-text-primary mt-2">{pyq.name}</h4>
                      <p className="text-xs text-text-secondary mt-1">Authentic questions with official answer key breakdown.</p>
                    </div>
                    <div className="pt-4 mt-3 border-t border-border flex justify-between items-center text-xs">
                      <span className="text-text-muted">{pyq.section}</span>
                      <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow">
                        Practice Past Paper
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "general" ? (
            <div className="space-y-4">
              {generalPatterns.map(p => (
                <div
                  key={p.patternId}
                  onClick={() => handleSelectPattern(p)}
                  className="p-6 rounded-2xl bg-bg-base border border-border hover:border-primary-400 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <span className="text-xs font-bold uppercase text-primary-600">Standard Campus Assessment</span>
                    <h3 className="font-bold text-lg text-text-primary">{p.name}</h3>
                    <p className="text-xs text-text-secondary mt-1 max-w-xl">{p.description}</p>
                  </div>
                  <button className="px-5 py-2 bg-primary-600 text-white font-bold text-xs rounded-xl shrink-0 shadow">
                    Select General Target
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Custom Target Form */
            <form onSubmit={handleCreateCustom} className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 rounded-2xl text-xs text-primary-900 dark:text-primary-200">
                💡 <strong>Custom Target Builder:</strong> Enter your specific target company or exam. If exact pattern data is not publicly available, we will adapt using our verified General Software Placement blueprint.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Target Company</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Technologies"
                    value={customForm.companyName}
                    onChange={(e) => setCustomForm({ ...customForm, companyName: e.target.value })}
                    className="w-full bg-bg-base border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Target Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Software Engineer"
                    value={customForm.role}
                    onChange={(e) => setCustomForm({ ...customForm, role: e.target.value })}
                    className="w-full bg-bg-base border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Difficulty</label>
                  <select
                    value={customForm.difficulty}
                    onChange={(e) => setCustomForm({ ...customForm, difficulty: e.target.value })}
                    className="w-full bg-bg-base border border-border rounded-xl p-3 text-sm text-text-primary"
                  >
                    <option value="Easy">Easy (Foundation)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="Hard">Hard (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Question Count</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={customForm.questionCount}
                    onChange={(e) => setCustomForm({ ...customForm, questionCount: e.target.value })}
                    className="w-full bg-bg-base border border-border rounded-xl p-3 text-sm text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Time Limit (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={customForm.timeLimitMinutes}
                    onChange={(e) => setCustomForm({ ...customForm, timeLimitMinutes: e.target.value })}
                    className="w-full bg-bg-base border border-border rounded-xl p-3 text-sm text-text-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg hover:from-primary-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <FaRocket />
                <span>{saving ? "Creating Custom Target..." : "Create & Activate Custom Target"}</span>
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg-base/50 flex justify-between items-center text-xs text-text-muted">
          <span>Active Target: <strong>{activeTarget?.targetName || "General Placement"}</strong></span>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary font-semibold">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
