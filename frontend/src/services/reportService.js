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
  const doc = new jsPDF();
  const analysis = atsAnalysis?.analysis || atsAnalysis || {};
  const overallScore = atsAnalysis?.overallScore ?? analysis?.overall_score ?? 0;
  const role = targetRole || atsAnalysis?.targetRole || "Software Engineer";

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 26, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("InterviewPilot AI — Resume ATS Analysis Report", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 15);

  // Target Role & Score Card
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Target Role: ${role}`, 14, 38);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 46, 182, 22, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("ATS Compatibility Score:", 20, 60);

  const scoreColor = overallScore >= 80 ? [16, 185, 129] : overallScore >= 65 ? [6, 182, 212] : [245, 158, 11];
  doc.setTextColor(...scoreColor);
  doc.setFontSize(14);
  doc.text(`${overallScore}/100`, 75, 60);

  // Category Scores Table
  const categoryScores = analysis.category_scores || {};
  const catRows = [
    ["Keyword Match", `${categoryScores.keyword_match ?? 0}%`, "25%"],
    ["Skills Alignment", `${categoryScores.skills_alignment ?? 0}%`, "20%"],
    ["Experience Relevance", `${categoryScores.experience_relevance ?? 0}%`, "15%"],
    ["Projects Relevance", `${categoryScores.projects_relevance ?? 0}%`, "15%"],
    ["Education", `${categoryScores.education ?? 0}%`, "5%"],
    ["Structure", `${categoryScores.structure ?? 0}%`, "5%"],
    ["Formatting", `${categoryScores.formatting ?? 0}%`, "5%"],
    ["Content Quality", `${categoryScores.content_quality ?? 0}%`, "10%"]
  ];

  autoTable(doc, {
    startY: 76,
    head: [["Evaluation Category", "Score", "Weight"]],
    body: catRows,
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 40, halign: "center", fontStyle: "bold" }, 2: { cellWidth: 40, halign: "center" } },
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [51, 65, 85] }
  });

  // Keywords section
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 180;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Detected Keywords:", 14, finalY);

  const detected = (analysis.detected_keywords || []).slice(0, 15).join(", ") || "None";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(doc.splitTextToSize(detected, 180), 14, finalY + 6);

  const missingY = finalY + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38);
  doc.text("Missing Keywords / Recommended Skills:", 14, missingY);

  const missing = (analysis.missing_keywords || []).slice(0, 12).join(", ") || "None";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(doc.splitTextToSize(missing, 180), 14, missingY + 6);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("InterviewPilot AI • Resume Intelligence Engine • Confidential", 14, 280);

  doc.save(`ATS_Report_${role.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  return true;
}