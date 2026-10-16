import React from 'react';
import { FileSpreadsheet, FileCode, Sparkles, BookOpen } from 'lucide-react';

export const HelpDocs: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          CatalogCraft AI — User Manual & Judge Guide
        </h1>
        <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
          Complete prototype documentation, quick start steps, and presentation guide for TCS Tech Day.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Start Workflow</h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <li>
            <strong>Single Product Generation:</strong> Navigate to <span className="text-indigo-600 font-bold">Generate Description</span>, click <em>&quot;Load Sample Product&quot;</em>, select tone/word count, and click <em>&quot;Generate Description&quot;</em>.
          </li>
          <li>
            <strong>Batch Upload:</strong> Go to <span className="text-indigo-600 font-bold">Batch Generator</span>, download <em>sample_products.csv</em>, drag and drop it into the upload box, select items, and click <em>&quot;Start Batch Generation&quot;</em>.
          </li>
          <li>
            <strong>Review & Approval:</strong> Go to <span className="text-indigo-600 font-bold">Product Catalogue</span>, click <em>&quot;Review&quot;</em> on any product to see original input vs AI output side-by-side. Edit inline and click <em>&quot;Approve&quot;</em>.
          </li>
          <li>
            <strong>Brand Voice Rules:</strong> Go to <span className="text-indigo-600 font-bold">Brand Voice &amp; Rules</span> to customize prohibited words (e.g. &quot;cheap&quot;) and watch the live prompt update instantly!
          </li>
        </ol>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Downloadable Sample Data Files
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="http://localhost:8000/static/data/sample_products.csv"
            download
            className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Download sample_products.csv (50 items)
          </a>
          <a
            href="http://localhost:8000/static/data/sample_products.json"
            download
            className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <FileCode className="w-4 h-4 text-indigo-600" /> Download sample_products.json
          </a>
        </div>
      </div>
    </div>
  );
};
