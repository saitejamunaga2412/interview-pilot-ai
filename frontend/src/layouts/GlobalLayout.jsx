import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import CommandRail, { navItems } from "../components/layout/CommandRail";
import TopProductBar from "../components/layout/TopProductBar";
import GlobalAITutor from "../components/GlobalAITutor";
import { cn } from "../utils/cn";

export default function GlobalLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isPublicPage =
    ["/login", "/register", "/forgot-password", "/reset-password", "/landing", "/privacy", "/terms", "/"].includes(location.pathname);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col antialiased">
      
      {/* 1. Integrated Top Product Bar */}
      <TopProductBar
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* 2. Main Workspace Layout with Command Rail */}
      <div className="flex-1 flex w-full relative">
        
        {/* Adaptive Desktop Command Rail */}
        <CommandRail />

        {/* Mobile Slide-Over Command Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
              />

              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-surface border-r border-border z-50 lg:hidden flex flex-col p-5 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs font-mono">
                      IP
                    </div>
                    <span className="text-sm font-bold text-text-primary tracking-tight font-display">InterviewPilot AI</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-surface-2 text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {import.meta.env ? null : null}
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.path === "/dashboard"
                        ? location.pathname === "/dashboard"
                        : location.pathname.startsWith(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                          isActive
                            ? "bg-primary-500/15 text-primary-300 border border-primary-500/30"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Contextual Workspace Canvas */}
        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

      </div>

      {/* 3. Floating Contextual AI Tutor Companion Orb */}
      <GlobalAITutor />

    </div>
  );
}
