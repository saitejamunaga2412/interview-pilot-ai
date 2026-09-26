import React, { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import InteractiveVisualizer from "./visualizer/InteractiveVisualizer";

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function AIMessageRenderer({ content, msgIdx }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [svgSourceVisible, setSvgSourceVisible] = useState({});

  if (!content) return null;

  const handleCopy = (codeText, key) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIdx(key);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleSvgSource = (key) => {
    setSvgSourceVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Split content by fenced code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs leading-relaxed text-text-primary overflow-x-hidden">
      {parts.map((part, pIdx) => {
        const blockKey = `${msgIdx}-${pIdx}`;

        if (part.startsWith("```")) {
          const match = part.match(/^```([a-zA-Z0-9_-]*)\n?([\s\S]*?)\n?```$/);
          const rawLang = match ? match[1].trim().toLowerCase() : "";
          const codeText = match ? match[2].trim() : part.slice(3, -3).trim();
          const language = rawLang || (codeText.startsWith("<svg") ? "svg" : "code");

          // 1. Interactive Visualization (JSON)
          if (language === "visualization") {
            try {
              const visualData = JSON.parse(codeText);
              return (
                <div key={blockKey} className="my-2">
                  <InteractiveVisualizer data={visualData} />
                </div>
              );
            } catch (e) {
              console.error("Failed to parse interactive visualizer data:", e);
            }
          }

          // 2. SVG Visualization Diagram
          if (language === "svg" || codeText.trim().startsWith("<svg")) {
            const cleanSvg = DOMPurify.sanitize(codeText, {
              USE_PROFILES: { svg: true, svgFilters: true }
            });

            return (
              <div key={blockKey} className="my-3 rounded-xl border border-primary-500/30 bg-[#090D1A] overflow-hidden shadow-lg">
                <div className="bg-surface-2 px-3 py-1.5 flex justify-between items-center text-[10px] font-mono text-text-muted border-b border-border select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="uppercase font-bold text-cyan-400 tracking-wider">Visual Diagram</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSvgSource(blockKey)}
                      className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer select-none"
                      title="Toggle SVG code"
                    >
                      {svgSourceVisible[blockKey] ? <EyeOff size={11} /> : <Eye size={11} />}
                      <span>{svgSourceVisible[blockKey] ? "Hide Source" : "View Source"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(codeText, blockKey)}
                      className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer select-none"
                      title="Copy SVG XML"
                    >
                      {copiedIdx === blockKey ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedIdx === blockKey ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Rendered SVG graphic */}
                <div 
                  className="p-4 flex items-center justify-center min-h-[140px] bg-gradient-to-b from-[#090D1A] to-[#0D1326] overflow-x-auto text-text-primary [&>svg]:max-w-full [&>svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: cleanSvg }}
                />

                {/* Optional source preview */}
                {svgSourceVisible[blockKey] && (
                  <pre className="p-3 text-[10px] font-mono text-emerald-400/80 bg-black/60 border-t border-border overflow-x-auto leading-relaxed select-text">
                    <code>{codeText}</code>
                  </pre>
                )}
              </div>
            );
          }

          // 3. Regular Code Blocks (Python, JavaScript, Java, C++, SQL, etc.)
          return (
            <div key={blockKey} className="my-2.5 rounded-lg overflow-hidden bg-[#070914] border border-border shadow-sm">
              <div className="bg-surface-2 px-3 py-1 flex justify-between items-center text-[10px] font-mono text-text-muted border-b border-border select-none">
                <span className="uppercase font-bold text-primary-400 tracking-wide select-none">
                  {language || "code"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(codeText, blockKey)}
                  className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer select-none"
                  title="Copy code"
                  tabIndex={0}
                >
                  {copiedIdx === blockKey ? (
                    <Check size={11} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Copy size={11} className="shrink-0" />
                  )}
                  <span className="select-none">{copiedIdx === blockKey ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed select-text">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        // 4. Markdown Text (Headings, bold, lists, tables, inline code, and sanitized inline SVGs)
        // Check if plain text contains an inline SVG element
        if (part.includes("<svg") && part.includes("</svg>")) {
          const sanitizedWithSvg = DOMPurify.sanitize(marked.parse(part), {
            USE_PROFILES: { html: true, svg: true, svgFilters: true }
          });
          return (
            <div
              key={blockKey}
              className="prose-chat leading-relaxed text-xs [&_svg]:max-w-full [&_svg]:inline-block"
              dangerouslySetInnerHTML={{ __html: sanitizedWithSvg }}
            />
          );
        }

        // Standard rich markdown parsing
        const parsedHtml = DOMPurify.sanitize(marked.parse(part));
        return (
          <div
            key={blockKey}
            className="prose-chat leading-relaxed text-xs"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />
        );
      })}
    </div>
  );
}
