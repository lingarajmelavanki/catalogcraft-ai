import React, { useEffect, useState } from 'react';
import { SettingsService } from '../api/services';
import type { BrandSettings as BrandSettingsType } from '../types';
import { useToast } from '../components/Toast';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Sliders, Save, RotateCcw, Plus, Code2, Sparkles, ShieldAlert } from 'lucide-react';

const TONES = ['Professional', 'Premium / Luxury', 'Friendly', 'Minimal', 'Technical', 'Playful', 'Eco-conscious'];

export const BrandSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<BrandSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newPrefWord, setNewPrefWord] = useState('');
  const [newProhWord, setNewProhWord] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await SettingsService.getBrandSettings();
      setSettings(res);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load brand settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      const updated = await SettingsService.updateBrandSettings(settings);
      setSettings(updated);
      showToast('Settings Saved', 'Brand voice & content rules updated in SQLite database.');
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all brand settings to enterprise defaults?')) return;
    try {
      setSaving(true);
      const res = await SettingsService.resetBrandSettings();
      setSettings(res);
      showToast('Settings Reset', 'Restored default brand rules.');
    } catch (err: any) {
      showToast('Reset Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  const promptPreview = `STRICT BRAND VOICE GUIDELINES FOR ${settings.brand_name.toUpperCase()}:
- Voice Style: ${settings.brand_voice}
- Preferred Vocabulary: [${settings.preferred_words.join(', ')}]
- Prohibited Words (Do Not Use): [${settings.prohibited_words.join(', ')}]
- Mandatory Disclaimer: "${settings.mandatory_disclaimer}"
- Style & Responsible AI Rules:
${settings.content_rules.map((r) => `  * ${r}`).join('\n')}
- Keyword Limit: Max ${settings.max_keywords} keywords (${settings.keyword_policy})
- Promotional Claims: ${settings.allow_promotional_claims ? 'Permitted' : 'Strictly Prohibited'}
`;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Brand Voice & Content Rules
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure global copywriting guidelines, vocabulary constraints, and legal disclaimers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Brand Identity & Voice
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Brand Name</label>
                <input
                  type="text"
                  value={settings.brand_name}
                  onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Brand Voice Description</label>
                <textarea
                  rows={2}
                  value={settings.brand_voice}
                  onChange={(e) => setSettings({ ...settings, brand_voice: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Words / Phrases</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. durable, ergonomic"
                    value={newPrefWord}
                    onChange={(e) => setNewPrefWord(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(),
                      newPrefWord.trim() && setSettings({ ...settings, preferred_words: [...settings.preferred_words, newPrefWord.trim()] }),
                      setNewPrefWord(''))
                    }
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPrefWord.trim()) {
                        setSettings({ ...settings, preferred_words: [...settings.preferred_words, newPrefWord.trim()] });
                        setNewPrefWord('');
                      }
                    }}
                    className="px-3 py-2 bg-emerald-50 text-emerald-600 font-semibold rounded-xl text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {settings.preferred_words.map((w, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200">
                      {w}
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, preferred_words: settings.preferred_words.filter((_, i) => i !== idx) })}
                        className="hover:text-rose-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-rose-600">
                  <ShieldAlert className="w-3.5 h-3.5" /> Prohibited Words / Phrases
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. best, guaranteed, cheap"
                    value={newProhWord}
                    onChange={(e) => setNewProhWord(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(),
                      newProhWord.trim() && setSettings({ ...settings, prohibited_words: [...settings.prohibited_words, newProhWord.trim()] }),
                      setNewProhWord(''))
                    }
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newProhWord.trim()) {
                        setSettings({ ...settings, prohibited_words: [...settings.prohibited_words, newProhWord.trim()] });
                        setNewProhWord('');
                      }
                    }}
                    className="px-3 py-2 bg-rose-50 text-rose-600 font-semibold rounded-xl text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {settings.prohibited_words.map((w, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg border border-rose-200">
                      {w}
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, prohibited_words: settings.prohibited_words.filter((_, i) => i !== idx) })}
                        className="hover:text-rose-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mandatory Legal Disclaimer</label>
                <textarea
                  rows={2}
                  value={settings.mandatory_disclaimer}
                  onChange={(e) => setSettings({ ...settings, mandatory_disclaimer: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Default Generation Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Default Tone</label>
                <select
                  value={settings.default_tone}
                  onChange={(e) => setSettings({ ...settings, default_tone: e.target.value })}
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Default Word Count</label>
                <select
                  value={settings.default_word_count}
                  onChange={(e) => setSettings({ ...settings, default_word_count: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="Short">Short</option>
                  <option value="Medium">Medium</option>
                  <option value="Long">Long</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Keywords Limit</label>
                <input
                  type="number"
                  value={settings.max_keywords}
                  onChange={(e) => setSettings({ ...settings, max_keywords: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Brand Voice Settings
          </button>
        </form>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 text-slate-300 border border-slate-900 rounded-2xl p-6 shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> Live AI System Prompt Preview
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-400 max-h-96 overflow-y-auto">
              {promptPreview}
            </pre>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Configured Tone Output Example</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-indigo-600">{settings.brand_name} AeroNoise Pro Headphones</p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Engineered with {settings.preferred_words[0] || 'premium'} craftsmanship, delivering pristine sound quality aligned with {settings.brand_name} standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
