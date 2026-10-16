import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '../api/services';
import type { DashboardAnalytics } from '../types';
import { QualityScoreBadge } from '../components/QualityScoreBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ShoppingBag,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Search,
  Award,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Zap,
  BarChart3,
  RefreshCw,
  ServerOff,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getDashboardAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError(err.message || 'Unable to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-black">Dashboard Analytics</h1>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 text-center space-y-4 glass-card rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
          <ServerOff className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Connecting to CatalogCraft AI Backend</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please ensure the Python FastAPI backend server is running on <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600">http://localhost:8000</code>.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={fetchDashboard}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { metrics } = analytics;

  const metricCards = [
    { title: 'Total Catalogue SKUs', value: metrics.total_products, icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/50' },
    { title: 'AI Descriptions', value: metrics.descriptions_generated, icon: Sparkles, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/50' },
    { title: 'Approved Content', value: metrics.approved_descriptions, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/50' },
    { title: 'Needs Review', value: metrics.needs_review_count, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200/50' },
    { title: 'Avg SEO Score', value: `${metrics.avg_seo_score}/100`, icon: Search, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200/50' },
    { title: 'Avg Quality Score', value: `${metrics.avg_quality_score}/100`, icon: Award, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200/50' },
    { title: 'Batch Jobs', value: metrics.batch_jobs_completed, icon: Layers, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200/50' },
  ];

  const generationsOverTime = analytics.generations_over_time || [];
  const productsByCategory = analytics.products_by_category || [];
  const qualityDist = analytics.quality_score_distribution || [];
  const toneUsage = analytics.tone_usage_distribution || [];
  const statusDist = analytics.content_status_distribution || [];
  const recentActivity = analytics.recent_activity || [];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Creative Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 lg:p-10 shadow-2xl glow-primary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-extrabold uppercase tracking-wider border border-white/15">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> TCS Technology Day AI Showcase
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Enterprise Retail Product <span className="text-gradient">Content Engine</span>
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              Transform raw product technical specifications into SEO-optimized, engaging descriptions with automated quality scoring and brand voice compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/generate"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Single Description Generator
            </Link>
            <Link
              to="/batch"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> Batch CSV Generator
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {metricCards.map((card, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-4 shadow-sm hover:-translate-y-1 transition-all duration-300 space-y-2 border"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{card.title}</p>
              <p className="text-lg lg:text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Time Series & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Time series */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Descriptions Generated Over Time
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily AI generation throughput across catalogue</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generationsOverTime}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Products by Retail Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">SKU density across product segments</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsByCategory} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Quality & SEO Score Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quality score dist */}
        <div className="glass-card rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quality Score Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={qualityDist} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={60} label>
                  {qualityDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tone usage */}
        <div className="glass-card rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tone Preference Usage</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toneUsage}>
                <XAxis dataKey="tone" stroke="#94a3b8" fontSize={9} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status dist */}
        <div className="glass-card rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Content Status Overview</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={35} outerRadius={60} label>
                  {statusDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent AI Generation Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest product descriptions created across catalogue</p>
          </div>
          <Link
            to="/catalogue"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            View Full Catalogue <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quality Score</th>
                <th className="px-4 py-3">SEO Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentActivity.map((item) => (
                <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {item.product_name}
                  </td>
                  <td className="px-4 py-3">{item.category || 'General'}</td>
                  <td className="px-4 py-3">
                    <QualityScoreBadge score={item.quality_score || 0} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(item.seo_score || 0)}/100
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'Approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : item.status === 'Needs Review'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-slate-500">{item.source}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/catalogue/${item.product_id || item.id}`}
                      className="px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

