import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wand2,
  Layers,
  ShoppingBag,
  BarChart3,
  Sliders,
  ShieldCheck,
  HelpCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Generate Description', path: '/generate', icon: Wand2 },
    { label: 'Batch Generator', path: '/batch', icon: Layers },
    { label: 'Product Catalogue', path: '/catalogue', icon: ShoppingBag },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Brand Voice & Rules', path: '/settings', icon: Sliders },
    { label: 'Responsible AI', path: '/responsible-ai', icon: ShieldCheck },
    { label: 'Help / Docs', path: '/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-950 text-slate-300 border-r border-slate-900 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside mobile sidebar */}
        <div className="flex items-center justify-between px-6 py-4 lg:hidden border-b border-slate-900">
          <span className="font-extrabold text-white text-base">Navigation</span>
          <button type="button" onClick={onCloseMobile} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Tag in Desktop Sidebar */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-slate-900">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            TCS
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Retail AI</p>
            <p className="text-[10px] text-slate-400">Content Studio v1.0</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info box */}
        <div className="p-4 m-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 text-[11px]">
          <p className="font-semibold text-slate-200">TCS Tech Day 2026</p>
          <p className="text-slate-400 leading-tight">
            AI Retail Catalogue Engine built with FastAPI + React + Claude.
          </p>
        </div>
      </aside>
    </>
  );
};
