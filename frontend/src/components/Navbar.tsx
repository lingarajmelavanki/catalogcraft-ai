import React from 'react';
import { Sparkles, Sun, Moon, Cpu, Server, Menu } from 'lucide-react';
import type { HealthCheckResponse } from '../types';

interface NavbarProps {
  health?: HealthCheckResponse | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebarMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  darkMode,
  onToggleDarkMode,
  onToggleSidebarMobile,
}) => {
  const isClaude = health?.ai_mode === 'claude';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
                  CatalogCraft <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-md">
                  Retail Content Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Generate compelling, consistent, SEO-ready retail content at scale.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isClaude
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
            }`}
            title={isClaude ? 'Connected to Live Claude AI API' : 'Running in Offline Deterministic Mock AI Engine Mode'}
          >
            {isClaude ? (
              <>
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse-subtle" />
                <span className="hidden md:inline">Live Claude AI</span>
                <span className="md:hidden">Claude AI</span>
              </>
            ) : (
              <>
                <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden md:inline">Mock AI Engine (Offline)</span>
                <span className="md:hidden">Mock Engine</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
