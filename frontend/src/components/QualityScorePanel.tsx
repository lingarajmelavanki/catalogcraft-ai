import React, { useState } from 'react';
import { QualityScoreBadge } from './QualityScoreBadge';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Search,
  FileText,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface QualityScorePanelProps {
  completenessScore: number;
  seoScore: number;
  readabilityScore: number;
  brandToneScore: number;
  overallScore: number;
  warnings?: string[];
  recommendations?: string[];
}

export const QualityScorePanel: React.FC<QualityScorePanelProps> = ({
  completenessScore,
  seoScore,
  readabilityScore,
  brandToneScore,
  overallScore,
  warnings = [],
  recommendations = [],
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'warnings' | 'recommendations'>('breakdown');

  const scores = [
    { label: 'Data Completeness', weight: '30%', score: completenessScore, icon: CheckCircle2, desc: 'Evaluates key input attributes like features, specs, USP & materials.' },
    { label: 'SEO Optimization', weight: '30%', score: seoScore, icon: Search, desc: 'Validates primary keyword placement, title length & meta descriptions.' },
    { label: 'Readability & Structure', weight: '20%', score: readabilityScore, icon: FileText, desc: 'Measures sentence length, paragraph flow & vocabulary accessibility.' },
    { label: 'Brand Voice Alignment', weight: '20%', score: brandToneScore, icon: ShieldCheck, desc: 'Ensures compliance with brand vocabulary rules & prohibited words.' },
  ];

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, overallScore)) / 100) * circumference;

  let scoreColorClass = 'text-emerald-500 stroke-emerald-500';
  if (overallScore < 60) scoreColorClass = 'text-rose-500 stroke-rose-500';
  else if (overallScore < 80) scoreColorClass = 'text-amber-500 stroke-amber-500';

  return (
    <div className="glass-card rounded-3xl p-6 shadow-xl space-y-6 border border-slate-200/80 dark:border-slate-800/80">
      {/* Top Section: Score Circular Gauge + Overall Rating */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
          {/* Circular SVG Meter */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className={`transition-all duration-1000 ease-out ${scoreColorClass}`}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {Math.round(overallScore)}
              </span>
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Score</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">AI Content Audit Score</h3>
              <QualityScoreBadge score={overallScore} size="sm" showIcon={false} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Weighted composite quality index based on structured completeness, search readiness, readability, and voice compliance.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'breakdown'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Breakdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('warnings')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'warnings'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Warnings ({warnings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tips ({recommendations.length})
          </button>
        </div>
      </div>

      {/* Tab Content 1: Detailed Meters */}
      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scores.map((s, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 transition-all space-y-2 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{s.label}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Weight: {s.weight}</span>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-slate-900 dark:text-white">{Math.round(s.score)}%</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ease-out ${
                    s.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : s.score >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, s.score))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Warnings */}
      {activeTab === 'warnings' && (
        <div className="p-5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Missing Spec & Content Warnings ({warnings.length})</span>
          </div>
          {warnings.length === 0 ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">No content warnings detected! Product data is fully structured.</p>
          ) : (
            <div className="space-y-2">
              {warnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                  <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="p-5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/50 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-xs">
            <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>AI Copywriting Optimization Recommendations</span>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-xs text-indigo-700 dark:text-indigo-400">High quality copy! Ready for e-commerce publishing.</p>
          ) : (
            <div className="space-y-2">
              {recommendations.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30">
                  <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
