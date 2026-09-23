import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Sparkles, Sun, Moon, ArrowRight, 
  Terminal, ShieldCheck, Layers, Bot, Compass, CheckCircle2, LogOut 
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";

const navLinks = [
  { label: "Product", href: "#placement-engine" },
  { label: "How It Works", href: "#placement-journey" },
  { label: "AI Engine", href: "#ai-pipeline" },
  { label: "Pillars", href: "#preparation-pillars" },
  { label: "Interactive Demo", href: "#interactive-studio" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-surface/85 backdrop-blur-xl border-b border-border/80 shadow-lg shadow-black/20"
            : "py-5 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-primary-500/25 group-hover:scale-105 transition-transform">
              IP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-text-primary">
                  InterviewPilot
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary-500/15 text-primary-400 border border-primary-500/30">
                  AI
                </span>
              </div>
              <span className="block text-[10px] text-text-muted font-mono tracking-wider uppercase -mt-0.5">
                AI-powered placement preparation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-2/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/60">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-md shadow-primary-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                {/* Sign In */}
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors border border-transparent cursor-pointer"
                >
                  Sign In
                </Link>

                {/* Primary Action */}
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-md shadow-primary-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Start Preparing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-surface border-l border-border z-50 p-6 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                      IP
                    </div>
                    <span className="font-bold text-sm text-text-primary">InterviewPilot AI</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="py-6 space-y-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleScrollTo(e, link.href)}
                      className="block px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 block shadow-md shadow-primary-500/20"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 block cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-text-primary bg-surface-2 border border-border block"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 block shadow-md shadow-primary-500/20"
                    >
                      Initialize Candidate Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
