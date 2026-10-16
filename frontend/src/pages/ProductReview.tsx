import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductService, GenerationService } from '../api/services';
import type { Product, GeneratedContent, ContentVersion } from '../types';
import { QualityScorePanel } from '../components/QualityScorePanel';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Edit,
  Save,
  Clock,
  UserCheck,
} from 'lucide-react';

export const ProductReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [history, setHistory] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    title: '',
    short_description: '',
    full_description: '',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    if (id) fetchProductDetails(parseInt(id, 10));
  }, [id]);

  const fetchProductDetails = async (productId: number) => {
    try {
      setLoading(true);
      const p = await ProductService.getProductById(productId);
      setProduct(p);
      if (p.latest_generated_content) {
        setContent(p.latest_generated_content);
        setEditFields({
          title: p.latest_generated_content.title,
          short_description: p.latest_generated_content.short_description,
          full_description: p.latest_generated_content.full_description,
          meta_title: p.latest_generated_content.meta_title,
          meta_description: p.latest_generated_content.meta_description,
        });

        const vers = await GenerationService.getContentHistory(p.latest_generated_content.id);
        setHistory(vers);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Product not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!content) return;
    try {
      const updated = await GenerationService.updateGeneratedContent(content.id, editFields);
      setContent(updated);
      setIsEditing(false);
      const vers = await GenerationService.getContentHistory(content.id);
      setHistory(vers);
      showToast('Saved', 'Content updated & saved to database.');
    } catch (err: any) {
      showToast('Save Error', err.message, 'error');
    }
  };

  const handleApprove = async () => {
    if (!content) return;
    try {
      const updated = await GenerationService.approveContent(content.id);
      setContent(updated);
      const vers = await GenerationService.getContentHistory(content.id);
      setHistory(vers);
      showToast('Approved', 'Content marked as Approved.');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleNeedsReview = async () => {
    if (!content) return;
    try {
      const updated = await GenerationService.markNeedsReview(content.id);
      setContent(updated);
      const vers = await GenerationService.getContentHistory(content.id);
      setHistory(vers);
      showToast('Marked Needs Review', 'Content marked as Needs Review.');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  if (loading || !product) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/catalogue')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </button>

        {content && (
          <div className="flex items-center gap-2">
            {content.is_human_edited && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <UserCheck className="w-3.5 h-3.5" /> Human Edited
              </span>
            )}
            <button
              type="button"
              onClick={handleApprove}
              className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Approve Content
            </button>
            <button
              type="button"
              onClick={handleNeedsReview}
              className="px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-xl border border-amber-200 dark:border-amber-800 transition-colors inline-flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" /> Needs Review
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {product.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{product.name}</h3>
                <p className="text-xs text-slate-500">
                  SKU: {product.sku || 'N/A'} | Brand: {product.brand || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
                  <p className="font-semibold">{product.category}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Price</span>
                  <p className="font-mono font-bold">{product.price ? `${product.currency} ${product.price}` : 'N/A'}</p>
                </div>
              </div>

              {product.features.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Input Key Features</span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 dark:text-slate-400">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Object.keys(product.specifications).length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Specifications</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="font-bold">{k}:</span> {String(v)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.target_audience && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Target Audience</span>
                  <p className="text-slate-600 dark:text-slate-400">{product.target_audience}</p>
                </div>
              )}

              {product.usp && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">USP</span>
                  <p className="text-slate-600 dark:text-slate-400">{product.usp}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {!content ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Generated Content Found</p>
              <button
                type="button"
                onClick={() => navigate('/generate')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
              >
                Generate Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Status: {content.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Tone: {content.tone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg inline-flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Fields
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Title</label>
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Generated Product Title</span>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{content.title}</h2>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Short Summary</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{content.short_description}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Full Description</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {content.full_description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Highlights</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        {content.highlights.map((h, idx) => (
                          <li key={idx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <QualityScorePanel
                completenessScore={content.completeness_score}
                seoScore={content.seo_score}
                readabilityScore={content.readability_score}
                brandToneScore={content.brand_tone_score}
                overallScore={content.quality_score}
                warnings={content.warnings}
              />

              {history.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Version History & Audit Log ({history.length})
                  </h3>

                  <div className="space-y-3">
                    {history.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs border border-slate-100 dark:border-slate-800"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            Version #{v.version_number} — {v.change_type}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            By {v.changed_by} on {new Date(v.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
