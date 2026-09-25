import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Map, BookOpen, Calculator, Code2,
  Bot, Compass, FileText, BarChart3, UserCheck, Settings, FolderGit2
} from "lucide-react";
import { cn } from "../../utils/cn";

export const navGroups = [
  {
    category: "HOME",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: Map, label: "My Journey", path: "/journey" }
    ]
  },
  {
    category: "PREPARE",
    items: [
      { icon: BookOpen, label: "Learn", path: "/learning" },
      { icon: Calculator, label: "Aptitude", path: "/aptitude" },
      { icon: Code2, label: "Coding", path: "/arena" },
      { icon: Bot, label: "AI Interview", path: "/interview" }
    ]
  },
  {
    category: "CAREER",
    items: [
      { icon: FileText, label: "Resume", path: "/resume" },
      { icon: FolderGit2, label: "Projects", path: "/projects" },
      { icon: Compass, label: "Career Advisor", path: "/advisor" },
      { icon: BarChart3, label: "Analytics", path: "/history" }
    ]
  },
  {
    category: "PROFILE",
    items: [
      { icon: UserCheck, label: "Profile", path: "/profile" },
      { icon: Settings, label: "Settings", path: "/settings" }
    ]
  }
];

export const navItems = navGroups.reduce((acc, g) => [...acc, ...g.items], []);

export default function CommandRail() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col justify-between w-60 bg-surface/95 border-r border-border/70 py-5 px-3.5 z-40 backdrop-blur-xl shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto no-scrollbar">
      
      {/* Grouped Navigation */}
      <nav className="flex flex-col gap-5 w-full" aria-label="InterviewPilot AI Navigation">
        {navGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            {/* Category header */}
            <span className="text-[10px] font-mono font-semibold text-text-muted/60 tracking-wider px-2.5 uppercase">
              {group.category}
            </span>

            <div className="space-y-0.5">
              {group.items.map((item) => {
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
                      "group flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer relative",
                      isActive
                        ? "bg-primary-500/12 text-primary-300 font-semibold shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/60"
                    )}
                  >
                    {/* Active Left Accent Pill */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary-400" />
                    )}

                    <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary-400" : "text-text-muted group-hover:text-text-secondary")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Subtle Bottom Brand Node */}
      <div className="pt-4 border-t border-border/40 px-2 flex items-center justify-between text-[11px] text-text-muted font-mono">
        <span>InterviewPilot AI</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>

    </aside>
  );
}
