import API from "./api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Escapes a cell value according to RFC 4180 CSV standard.
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Export history/activities to CSV with UTF-8 BOM and RFC 4180 formatting.
 * Supports both normalized activity items and raw database records.
 *
 * @param {Array} items - List of activity items or interview records
 * @param {string} [filename] - Optional filename
 * @returns {boolean} - Returns true if export was triggered, false if empty
 */
export function exportHistoryToCsv(items = [], filename = null) {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  const isNormalized = items[0] && ("raw" in items[0] || "type" in items[0]);

  let headers = [];
  let rows = [];

  if (isNormalized) {
    headers = ["Activity Type", "Title / Role", "Details / Mode", "Score (%)", "Status", "Date"];
    rows = items.map((item) => {
      const dateStr = item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : "";
      return [
        item.type || "Interview",
        item.title || item.raw?.role || "Practice Session",
        item.description || item.metadata?.mode || "",
        item.score ?? item.raw?.overallScore ?? 0,
        item.status || "Completed",
        dateStr
      ];
    });
  } else {
    headers = ["Role", "Level", "Mode", "Overall Score (%)", "Status", "Date"];
    rows = items.map((item) => [
      item.role ?? "Software Engineer",
      item.level ?? "Standard",
      item.interviewMode ?? "Technical",
      item.overallScore ?? item.score ?? 0,
      item.status ?? "Completed",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : ""
    ]);
  }

  const csvRows = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(","))
  ];

  const csvContent = csvRows.join("\r\n");

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const defaultName = `InterviewPilot_History_${new Date().toISOString().slice(0, 10)}.csv`;
  link.download = filename || defaultName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  return true;
}

/**
 * Generates an interview evaluation report PDF directly on the client side using jsPDF.
 */
export function generateClientInterviewPdf(session = {}, questions = []) {
  const doc = new jsPDF();
  const role = session.role || "Software Engineer";
  const level = session.level || "Standard";
  const mode = session.interviewMode || "Technical";
  const score = session.overallScore ?? 0;
  const sessionId = session._id || session.id || "Report";

  // Header Banner
  doc.setFillColor(79, 70, 229); // Primary Indigo
  doc.rect(0, 0, 210, 26, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("InterviewPilot AI — Evaluation Report", 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 145, 14);

  // Meta Section
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${role} Interview`, 14, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Level: ${level}   |   Mode: ${mode}   |   Format: ${session.duration || 30} mins`, 14, 45);

  // Score Highlight Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 52, 182, 22, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Overall Performance Score:", 20, 65);

  const scoreColor = score >= 75 ? [16, 185, 129] : score >= 50 ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(...scoreColor);
  doc.setFontSize(14);
  doc.text(`${score}%`, 85, 65);

  const statusText = score >= 75 ? "Placement Ready" : score >= 50 ? "Developing" : "Needs Targeted Practice";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`(${statusText})`, 105, 65);

  // Detailed Questions Table
  const tableData = (questions && questions.length > 0)
    ? questions.map((q, idx) => [
        `Q${idx + 1}`,
        q.question || `Question ${idx + 1}`,
        `${q.score ?? 0}%`,
        q.feedback || "Good effort."
      ])
    : [[
        "1",
        "Overall Mock Evaluation",
        `${score}%`,
        "Interview completed successfully. Review detailed metrics in the dashboard."
      ]];

  autoTable(doc, {
    startY: 82,
    head: [["#", "Question", "Score", "AI Feedback"]],
    body: tableData,
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 70 },
      2: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 80 }
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Footer Note
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 260;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("InterviewPilot AI • Placement Operating System • Confidential Report", 14, Math.min(finalY, 280));

  doc.save(`Interview_Report_${sessionId}.pdf`);
  return true;
}

/**
 * Download an interview report as PDF.
 * First queries the backend endpoint; if that fails or fallbackData is provided,
 * seamlessly falls back to client-side jsPDF rendering.
 *
 * @param {string} sessionId
 * @param {Object} [fallbackData] - Optional { session, questions } for instant/offline PDF generation
 */
export async function downloadInterviewReport(sessionId, fallbackData = null) {
  try {
    const response = await API.get(
      `/result/download-report/${sessionId}`,
      {
        responseType: "blob"
      }
    );

    // If server returned a JSON error response instead of a PDF
    if (response.data && response.data.type === "application/json") {
      const text = await response.data.text();
      let errorMsg = "Failed to download PDF report";
      try {
        const json = JSON.parse(text);
        errorMsg = json.message || json.detail || errorMsg;
      } catch {
        // use default
      }
      throw new Error(errorMsg);
    }

    const blob = new Blob([response.data], {
      type: "application/pdf"
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Interview_Report_${sessionId}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.warn("Backend report download failed, attempting client-side generation:", error);
    if (fallbackData) {
      return generateClientInterviewPdf(
        fallbackData.session || fallbackData,
        fallbackData.questions || []
      );
    }
    throw error;
  }
}

/**
 * Generates an ATS Analysis PDF report using jsPDF and autoTable.
 */
export function exportAtsReportPdf(atsAnalysis = {}, targetRole = "Software Engineer") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const analysis = (atsAnalysis && typeof atsAnalysis === "object")
    ? (atsAnalysis.analysis || atsAnalysis)
    : {};
  const overallScore = Math.max(0, Math.min(100, Math.round(Number(atsAnalysis?.overallScore ?? analysis?.overall_score ?? 0))));
  const rawRole = targetRole || atsAnalysis?.targetRole || analysis?.target_role || "Software Engineer";
  const role = typeof rawRole === "string" ? rawRole : (rawRole?.title || "Software Engineer");
  const dateStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const drawHeader = (isFirstPage = false) => {
    if (isFirstPage) {
      doc.setFillColor(15, 23, 42); // Navy/Slate 900
      doc.rect(0, 0, 210, 26, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("InterviewPilot AI — Resume ATS Analysis Report", 14, 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${dateStr}`, 155, 16);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`InterviewPilot AI • Resume ATS Report: ${role}`, 14, 12);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 15, 196, 15);
    }
  };

  // Draw Page 1 header
  drawHeader(true);

  // Target Role & Score Banner
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`Target Role: ${role}`, 14, 38);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 44, 182, 24, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Overall ATS Compatibility Score:", 20, 56);

  const scoreColor = overallScore >= 80 ? [16, 185, 129] : overallScore >= 65 ? [6, 182, 212] : [245, 158, 11];
  doc.setTextColor(...scoreColor);
  doc.setFontSize(16);
  doc.text(`${overallScore}/100`, 88, 56);

  const statusLabel = overallScore >= 80 ? "High Compatibility" : overallScore >= 65 ? "Moderate Alignment" : "Needs Targeted Optimization";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`(${statusLabel})`, 128, 56);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Deterministic 8-pillar placement benchmark evaluating technical alignment and ATS parseability.", 20, 63);

  // Category Scores Table
  const categoryScores = analysis.category_scores || atsAnalysis.categoryScores || {};
  const catRows = [
    ["Keyword Match", `${categoryScores.keyword_match ?? 0}%`, "25%", categoryScores.keyword_match >= 75 ? "Optimal" : "Review Needed"],
    ["Skills Alignment", `${categoryScores.skills_alignment ?? 0}%`, "20%", categoryScores.skills_alignment >= 75 ? "Strong" : "Gaps Detected"],
    ["Experience Relevance", `${categoryScores.experience_relevance ?? 0}%`, "15%", categoryScores.experience_relevance >= 70 ? "Relevant" : "Needs Detail"],
    ["Projects Relevance", `${categoryScores.projects_relevance ?? 0}%`, "15%", categoryScores.projects_relevance >= 70 ? "Strong" : "Needs Focus"],
    ["Content Quality & Action Verbs", `${categoryScores.content_quality ?? 0}%`, "10%", categoryScores.content_quality >= 70 ? "Impactful" : "Passive"],
    ["Document Structure", `${categoryScores.structure ?? 0}%`, "5%", categoryScores.structure >= 80 ? "Standard" : "Missing Sections"],
    ["ATS Formatting Safety", `${categoryScores.formatting ?? 0}%`, "5%", categoryScores.formatting >= 80 ? "Clean" : "Warnings"],
    ["Education Relevance", `${categoryScores.education ?? 0}%`, "5%", categoryScores.education >= 70 ? "Aligned" : "Basic"]
  ];

  autoTable(doc, {
    startY: 74,
    head: [["Evaluation Category", "Score", "Weight", "Assessment"]],
    body: catRows,
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 32, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 40, halign: "center" }
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.15
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  let cursorY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 175;

  const ensureSpace = (neededHeight) => {
    if (cursorY + neededHeight > 265) {
      doc.addPage();
      drawHeader(false);
      cursorY = 24;
    }
  };

  const printWrappedLines = (lines, x = 14, lineHeight = 4.2) => {
    lines.forEach((line) => {
      if (cursorY + lineHeight > 265) {
        doc.addPage();
        drawHeader(false);
        cursorY = 24;
      }
      doc.text(line, x, cursorY);
      cursorY += lineHeight;
    });
  };

  // 1. Detected Keywords
  const rawDetected = Array.isArray(analysis.detected_keywords)
    ? analysis.detected_keywords
    : Array.isArray(atsAnalysis.detectedKeywords)
    ? atsAnalysis.detectedKeywords
    : [];
  const detected = rawDetected.slice(0, 150).join(", ") || "No specific target keywords detected.";
  ensureSpace(14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Detected Technical Keywords & Skills:", 14, cursorY);
  cursorY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const detectedLines = doc.splitTextToSize(detected, 182);
  printWrappedLines(detectedLines, 14, 4.2);
  cursorY += 5;

  // 2. Missing Keywords & Skill Gaps
  const rawMissing = Array.isArray(analysis.missing_keywords)
    ? analysis.missing_keywords
    : Array.isArray(atsAnalysis.missingKeywords)
    ? atsAnalysis.missingKeywords
    : [];
  const missing = rawMissing.slice(0, 100).join(", ") || "None. Comprehensive skill coverage detected.";
  ensureSpace(14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(220, 38, 38);
  doc.text("Missing Keywords / Recommended Target Skills:", 14, cursorY);
  cursorY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const missingLines = doc.splitTextToSize(missing, 182);
  printWrappedLines(missingLines, 14, 4.2);
  cursorY += 5;

  // 3. Identified Strengths
  const strengths = Array.isArray(analysis.strengths) && analysis.strengths.length > 0
    ? analysis.strengths
    : [
        "Well-structured resume sections with clean typography.",
        "Demonstrates solid foundational technical knowledge aligned with target role."
      ];

  ensureSpace(14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("Identified Profile Strengths:", 14, cursorY);
  cursorY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  strengths.slice(0, 10).forEach((str) => {
    ensureSpace(6);
    const bulletLines = doc.splitTextToSize(`• ${str}`, 180);
    printWrappedLines(bulletLines, 16, 4.2);
  });
  cursorY += 4;

  // 4. Recommendations & Improvements
  const recommendations = Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0
    ? analysis.recommendations
    : Array.isArray(analysis.issues) && analysis.issues.length > 0
    ? analysis.issues
    : [
        "Integrate missing high-priority target role keywords naturally into project descriptions.",
        "Quantify project outcomes with numerical metrics (e.g., latency, throughput, users served)."
      ];

  ensureSpace(14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text("Strategic Recommendations & Action Items:", 14, cursorY);
  cursorY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  recommendations.slice(0, 15).forEach((rec) => {
    ensureSpace(6);
    const text = typeof rec === "string" ? rec : rec.text || rec.issue || rec.recommendation || JSON.stringify(rec);
    const recLines = doc.splitTextToSize(`• ${text}`, 180);
    printWrappedLines(recLines, 16, 4.2);
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 282, 196, 282);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}  •  InterviewPilot AI  •  Resume Intelligence Engine`, 14, 287);
    doc.text("Confidential Report", 196, 287, { align: "right" });
  }

  const safeRole = String(role).replace(/[^a-zA-Z0-9]/g, "_") || "Software_Engineer";
  doc.save(`ATS_Report_${safeRole}.pdf`);
  return true;
}