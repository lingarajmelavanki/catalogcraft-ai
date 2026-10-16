import React, { useState } from 'react';
import { GenerationService } from '../api/services';
import type { GenerationRequest, GeneratedContent } from '../types';
import { QualityScorePanel } from '../components/QualityScorePanel';
import { CopyButton } from '../components/CopyButton';
import { useToast } from '../components/Toast';
import {
  Sparkles,
  RotateCcw,
  AlertCircle,
  Download,
  Edit,
  Save,
  Plus,
  Trash2,
  Package,
  Sliders,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home and Kitchen',
  'Beauty and Personal Care',
  'Sports and Fitness',
  'Grocery',
  'Furniture',
  'Travel Accessories',
];

const TONES = [
  'Professional',
  'Premium / Luxury',
  'Friendly',
  'Minimal',
  'Technical',
  'Playful',
  'Eco-conscious',
];

const WORD_COUNTS = ['Short', 'Medium', 'Long'];

const SAMPLE_INPUT: GenerationRequest = {
  name: 'AeroNoise Pro Wireless ANC Headphones',
  sku: 'ELE-9021',
  brand: 'SonicAura',
  category: 'Electronics',
  price: 249.99,
  currency: 'USD',
  image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  features: ['Active Noise Cancellation', '40-hour battery life', 'Bluetooth 5.3', 'Multipoint connection'],
  specifications: { 'Driver Size': '40mm', Weight: '250g', Charging: 'USB-C Fast Charge' },
  target_audience: 'Audiophiles, commuters, remote workers',
  usp: 'Industry-leading hybrid noise cancellation with ultra-soft memory foam earcups.',
  material: 'Brushed Aluminum & Vegan Leather',
  dimensions: '7.5 x 6.3 x 3.1 inches',
  color: 'Matte Black',
  weight: '250g',
  primary_keywords: ['wireless headphones', 'active noise cancelling'],
  secondary_keywords: ['long battery headphones', 'over ear headphones'],
  competitor_terms: 'Bose QuietComfort inspiration',
  meta_pref: 'Highlight 40h battery and hybrid active noise cancellation',
  tone: 'Professional',
  word_count: 'Medium',
  language: 'English',
};

export const GenerateDescription: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<GenerationRequest>({
    name: '',
    sku: '',
    brand: '',
    category: 'Electronics',
    price: undefined,
    currency: 'USD',
    image_url: '',
    features: [],
    specifications: {},
    target_audience: '',
    usp: '',
    material: '',
    dimensions: '',
    color: '',
    weight: '',
    primary_keywords: [],
    secondary_keywords: [],
    competitor_terms: '',
    meta_pref: '',
    tone: 'Professional',
    word_count: 'Medium',
    language: 'English',
  });

  const [newFeature, setNewFeature] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [newPrimaryKw, setNewPrimaryKw] = useState('');
  const [newSecondaryKw, setNewSecondaryKw] = useState('');

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<{
    title: string;
    short_description: string;
    full_description: string;
    meta_title: string;
    meta_description: string;
  }>({
    title: '',
    short_description: '',
    full_description: '',
    meta_title: '',
    meta_description: '',
  });

  const handleLoadSample = () => {
    setFormData(SAMPLE_INPUT);
    showToast('Sample Loaded', 'Loaded AeroNoise Pro sample product details into the form.');
  };

  const handleReset = () => {
    setFormData({
      name: '',
      sku: '',
      brand: '',
      category: 'Electronics',
      price: undefined,
      currency: 'USD',
      image_url: '',
      features: [],
      specifications: {},
      target_audience: '',
      usp: '',
      material: '',
      dimensions: '',
      color: '',
      weight: '',
      primary_keywords: [],
      secondary_keywords: [],
      competitor_terms: '',
      meta_pref: '',
      tone: 'Professional',
      word_count: 'Medium',
      language: 'English',
    });
    setResult(null);
    showToast('Form Reset', 'All input fields cleared.', 'info');
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
    setNewFeature('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setFormData({
      ...formData,
      specifications: { ...formData.specifications, [specKey.trim()]: specVal.trim() },
    });
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpec = (key: string) => {
    const updated = { ...formData.specifications };
    delete updated[key];
    setFormData({ ...formData, specifications: updated });
  };

  const handleAddPrimaryKw = () => {
    if (!newPrimaryKw.trim()) return;
    setFormData({ ...formData, primary_keywords: [...formData.primary_keywords, newPrimaryKw.trim()] });
    setNewPrimaryKw('');
  };

  const handleRemovePrimaryKw = (idx: number) => {
    setFormData({ ...formData, primary_keywords: formData.primary_keywords.filter((_, i) => i !== idx) });
  };

  const handleAddSecondaryKw = () => {
    if (!newSecondaryKw.trim()) return;
    setFormData({ ...formData, secondary_keywords: [...formData.secondary_keywords, newSecondaryKw.trim()] });
    setNewSecondaryKw('');
  };

  const handleRemoveSecondaryKw = (idx: number) => {
    setFormData({ ...formData, secondary_keywords: formData.secondary_keywords.filter((_, i) => i !== idx) });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      showToast('Validation Error', 'Product Name and Category are required.', 'error');
      return;
    }

    try {
      setGenerating(true);
      const gc = await GenerationService.generateDescription(formData);
      setResult(gc);
      setEditFields({
        title: gc.title,
        short_description: gc.short_description,
        full_description: gc.full_description,
        meta_title: gc.meta_title,
        meta_description: gc.meta_description,
      });
      setIsEditing(false);
      showToast('Generation Successful', `Generated description via ${gc.generation_source.toUpperCase()} engine.`);
    } catch (err: any) {
      showToast('Generation Failed', err.message || 'Unable to generate description', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!result) return;
    try {
      const updated = await GenerationService.updateGeneratedContent(result.id, editFields);
      setResult(updated);
      setIsEditing(false);
      showToast('Changes Saved', 'Content updated & quality score recalculated.');
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    }
  };

  const handleApprove = async () => {
    if (!result) return;
    try {
      const updated = await GenerationService.approveContent(result.id);
      setResult(updated);
      showToast('Content Approved', 'Product description status changed to Approved.');
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    }
  };

  const handleNeedsReview = async () => {
    if (!result) return;
    try {
      const updated = await GenerationService.markNeedsReview(result.id);
      setResult(updated);
      showToast('Marked Needs Review', 'Product description status set to Needs Review.');
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    }
  };

  const handleCopyAll = () => {
    if (!result) return;
    const text = `
TITLE: ${result.title}

SHORT DESCRIPTION:
${result.short_description}

FULL DESCRIPTION:
${result.full_description}

KEY HIGHLIGHTS:
${result.highlights.map((h) => `- ${h}`).join('\n')}

SEO META TITLE: ${result.meta_title}
SEO META DESCRIPTION: ${result.meta_description}
SUGGESTED KEYWORDS: ${result.suggested_keywords.join(', ')}
`.trim();

    navigator.clipboard.writeText(text);
    showToast('Copied All', 'Full output copied to clipboard.');
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const text = `PRODUCT: ${formData.name} (SKU: ${formData.sku || 'N/A'})
GENERATED TITLE: ${result.title}
STATUS: ${result.status}
QUALITY SCORE: ${result.quality_score}/100

SHORT DESCRIPTION:
${result.short_description}

FULL DESCRIPTION:
${result.full_description}

HIGHLIGHTS:
${result.highlights.map((h) => `- ${h}`).join('\n')}

META TITLE: ${result.meta_title}
META DESCRIPTION: ${result.meta_description}
KEYWORDS: ${result.suggested_keywords.join(', ')}
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name.replace(/\s+/g, '_')}_description.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${formData.name.replace(/\s+/g, '_')}_output.json`;
    a.click();
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Generate Description
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Input structured retail product specs to generate accurate, SEO-ready content.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            Load Sample Product
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleGenerate} className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Package className="w-4 h-4 text-indigo-600" />
              1. Basic Product Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AeroNoise Pro Wireless ANC Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SKU / Product ID</label>
                <input
                  type="text"
                  placeholder="e.g. ELE-9021"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. SonicAura"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="249.99"
                    value={formData.price !== undefined ? formData.price : ''}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Currency</label>
                  <input
                    type="text"
                    value={formData.currency || 'USD'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-cyan-600" />
              2. Product Details & Attributes
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Key Features</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a key feature (e.g. 40-hour battery life)"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-800"
                  >
                    {feat}
                    <button type="button" onClick={() => handleRemoveFeature(idx)} className="hover:text-rose-500">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specifications (Key-Value Pairs)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Spec Key (e.g. Driver Size)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-1/3 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 40mm)"
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpec())}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {Object.entries(formData.specifications).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs border border-slate-200 dark:border-slate-800"
                  >
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300">{k}:</strong> {String(v)}
                    </span>
                    <button type="button" onClick={() => handleRemoveSpec(k)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. Audiophiles, remote workers"
                  value={formData.target_audience || ''}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unique Selling Proposition (USP)</label>
                <input
                  type="text"
                  placeholder="e.g. Industry-leading hybrid ANC"
                  value={formData.usp || ''}
                  onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Material</label>
                <input
                  type="text"
                  placeholder="e.g. Aluminum & Vegan Leather"
                  value={formData.material || ''}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dimensions</label>
                <input
                  type="text"
                  placeholder="e.g. 7.5 x 6.3 x 3.1 inches"
                  value={formData.dimensions || ''}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Color</label>
                <input
                  type="text"
                  placeholder="e.g. Matte Black"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weight</label>
                <input
                  type="text"
                  placeholder="e.g. 250g"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="w-4 h-4 text-purple-600" />
              3. SEO & Search Configuration
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary SEO Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add primary keyword (e.g. wireless headphones)"
                  value={newPrimaryKw}
                  onChange={(e) => setNewPrimaryKw(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrimaryKw())}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddPrimaryKw}
                  className="px-3 py-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-semibold rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.primary_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg border border-purple-200 dark:border-purple-800"
                  >
                    {kw}
                    <button type="button" onClick={() => handleRemovePrimaryKw(idx)} className="hover:text-rose-500">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secondary SEO Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add secondary keyword (e.g. bluetooth headset)"
                  value={newSecondaryKw}
                  onChange={(e) => setNewSecondaryKw(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSecondaryKw())}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddSecondaryKw}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.secondary_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    {kw}
                    <button type="button" onClick={() => handleRemoveSecondaryKw(idx)} className="hover:text-rose-500">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              4. Tone & Generation Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tone / Style</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
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
                  value={formData.word_count}
                  onChange={(e) => setFormData({ ...formData, word_count: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {WORD_COUNTS.map((w) => (
                    <option key={w} value={w}>
                      {w} ({w === 'Short' ? '40-60 w' : w === 'Medium' ? '80-120 w' : '150-200 w'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Crafting AI Product Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Product Description</span>
              </>
            )}
          </button>
        </form>

        <div className="lg:col-span-5 space-y-6">
          {!result ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Ready for Generation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Fill in the structured product details on the left or click &quot;Load Sample Product&quot; to test the AI copy engine.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Status: {result.status}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400 uppercase">
                      Engine: {result.generation_source}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CopyButton text={result.full_description} label="Copy Full" />
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Copy All
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Generated Title</label>
                      <input
                        type="text"
                        value={editFields.title}
                        onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Short Description</label>
                      <textarea
                        rows={2}
                        value={editFields.short_description}
                        onChange={(e) => setEditFields({ ...editFields, short_description: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Description</label>
                      <textarea
                        rows={6}
                        value={editFields.full_description}
                        onChange={(e) => setEditFields({ ...editFields, full_description: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg inline-flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</span>
                        <CopyButton text={result.title} />
                      </div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{result.title}</h2>
                    </div>

                    <div className="space-y-1 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Short Description (40-60 w)
                        </span>
                        <CopyButton text={result.short_description} />
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {result.short_description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Description</span>
                        <CopyButton text={result.full_description} />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {result.full_description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Highlights</span>
                        <CopyButton text={result.highlights.join('\n')} />
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {result.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5" /> SEO Metadata Preview
                        </span>
                        <CopyButton text={`Meta Title: ${result.meta_title}\nMeta Description: ${result.meta_description}`} />
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-indigo-700 dark:text-indigo-400">{result.meta_title}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{result.meta_description}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Content
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={handleNeedsReview}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-lg transition-colors inline-flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Needs Review
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadTxt}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                      >
                        <Download className="w-3.5 h-3.5" /> TXT
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadJson}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                      >
                        <Download className="w-3.5 h-3.5" /> JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <QualityScorePanel
                completenessScore={result.completeness_score}
                seoScore={result.seo_score}
                readabilityScore={result.readability_score}
                brandToneScore={result.brand_tone_score}
                overallScore={result.quality_score}
                warnings={result.warnings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
