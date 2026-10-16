import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { HealthService } from '../api/services';
import type { HealthCheckResponse } from '../types';

export const RootLayout: React.FC = () => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchHealth = async () => {
    try {
      const data = await HealthService.getHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend server not reachable yet or offline');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Navbar
            health={health}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onToggleSidebarMobile={() => setMobileSidebarOpen(true)}
          />

          <main className="flex-1">
            <Outlet />
          </main>

          <footer className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
            CatalogCraft AI &copy; 2026 TCS Technology Day Prototype | High-Performance Retail Copy Engine
          </footer>
        </div>
      </div>
    </div>
  );
};
