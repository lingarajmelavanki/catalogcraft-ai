import React, { useState } from 'react';
import { BatchService, ExportService } from '../api/services';
import type { BatchJob } from '../types';
import { QualityScoreBadge } from '../components/QualityScoreBadge';
import { useToast } from '../components/Toast';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Download,
  Play,
  RotateCcw,
  RefreshCw,
  FileText,
} from 'lucide-react';

const TONES = [
  'Professional',
  'Premium / Luxury',
  'Friendly',
  'Minimal',
  'Technical',
  'Playful',
  'Eco-conscious',
];

export const BatchGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [batchJob, setBatchJob] = useState<BatchJob | null>(null);
  const [processing, setProcessing] = useState(false);

  const [selectedTone, setSelectedTone] = useState('Professional');
  const [selectedWordCount, setSelectedWordCount] = useState('Medium');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const handleFileUpload = async (file: File) => {
    try {
      const job = await BatchService.uploadFile(file);
      setBatchJob(job);
      setSelectedItemIds(job.items.map((i) => i.id));
      showToast('File Uploaded', `Successfully imported ${job.total_products} records from ${file.name}.`);
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'Unable to parse batch file', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleToggleSelectAll = () => {
    if (!batchJob) return;
    if (selectedItemIds.length === batchJob.items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(batchJob.items.map((i) => i.id));
    }
  };

  const handleToggleSelectItem = (id: number) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleStartGeneration = async () => {
    if (!batchJob) return;
    try {
      setProcessing(true);
      const updatedJob = await BatchService.startGeneration(batchJob.id, {
        tone: selectedTone,
        word_count: selectedWordCount,
        language: selectedLanguage,
        selected_item_ids: selectedItemIds,
      });
      setBatchJob(updatedJob);
      showToast('Batch Generation Complete', `Successfully processed batch job #${batchJob.id}.`);
    } catch (err: any) {
      showToast('Batch Failed', err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!batchJob) return;
    try {
      setProcessing(true);
      const updatedJob = await BatchService.retryFailed(batchJob.id, {
        tone: selectedTone,
        word_count: selectedWordCount,
        language: selectedLanguage,
      });
      setBatchJob(updatedJob);
      showToast('Retry Complete', 'Retried processing failed records.');
    } catch (err: any) {
      showToast('Retry Failed', err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const sampleCsvUrl = 'http://localhost:8000/static/data/sample_products.csv';
  const sampleJsonUrl = 'http://localhost:8000/static/data/sample_products.json';

  const progressPercent = batchJob
    ? Math.round((batchJob.processed_products / (batchJob.total_products || 1)) * 100)
    : 0;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Batch Content Generator
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload CSV or JSON files to generate hundreds of product descriptions automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={sampleCsvUrl}
            download
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Download Sample CSV (50 Products)
          </a>
          <a
            href={sampleJsonUrl}
            download
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            Download Sample JSON
          </a>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-8 lg:p-12 text-center transition-all cursor-pointer space-y-4 group"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Drag & Drop CSV or JSON file here
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Supports standard e-commerce catalogue export formats up to 500 rows per batch.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition-colors">
            <FileText className="w-4 h-4" />
            Browse File from Computer
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {batchJob && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    Batch #{batchJob.id}: {batchJob.file_name}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      batchJob.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : batchJob.status === 'Processing'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {batchJob.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Total Records: {batchJob.total_products} | Successful: {batchJob.successful_products} | Failed: {batchJob.failed_products}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {batchJob.failed_products > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryFailed}
                    disabled={processing}
                    className="px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-xl border border-amber-200 dark:border-amber-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry Failed Rows ({batchJob.failed_products})
                  </button>
                )}

                {batchJob.status === 'Completed' && (
                  <>
                    <a
                      href={ExportService.getBatchCsvUrl(batchJob.id)}
                      download
                      className="px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </a>
                    <a
                      href={ExportService.getBatchJsonUrl(batchJob.id)}
                      download
                      className="px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Export JSON
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Batch Processing Progress</span>
                <span className="font-mono">{progressPercent}% ({batchJob.processed_products} / {batchJob.total_products})</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shared Tone</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Word Count</label>
                <select
                  value={selectedWordCount}
                  onChange={(e) => setSelectedWordCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="Short">Short (40-60 w)</option>
                  <option value="Medium">Medium (80-120 w)</option>
                  <option value="Long">Long (150-200 w)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Language</label>
                <input
                  type="text"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={processing || selectedItemIds.length === 0}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Batch Generation ({selectedItemIds.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Imported Items ({batchJob.items.length})</h3>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {selectedItemIds.length === batchJob.items.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.length === batchJob.items.length && batchJob.items.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded-md border-slate-300 text-indigo-600"
                      />
                    </th>
                    <th className="px-4 py-3">Row</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Quality Score</th>
                    <th className="px-4 py-3 rounded-r-lg">Details / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {batchJob.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => handleToggleSelectItem(item.id)}
                          className="rounded-md border-slate-300 text-indigo-600"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-500">#{item.row_number}</td>
                      <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                        {item.generated_content?.title || `Row ${item.row_number}`}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {item.generated_content?.title || `Imported Item ${item.row_number}`}
                      </td>
                      <td className="px-4 py-3">{item.generated_content?.tone || 'General'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : item.status === 'Failed'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : item.status === 'Processing'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.generated_content ? (
                          <QualityScoreBadge score={item.generated_content.quality_score} size="sm" />
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {item.error_message ? (
                          <span className="text-rose-600 font-medium">{item.error_message}</span>
                        ) : item.generated_content ? (
                          <span className="text-emerald-600 font-medium">Ready in Catalogue</span>
                        ) : (
                          <span>Pending Generation</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
