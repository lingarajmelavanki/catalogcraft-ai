import React, { useEffect, useState } from 'react';
import { ProductService, ExportService } from '../api/services';
import type { Product } from '../types';
import { QualityScoreBadge } from '../components/QualityScoreBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import {
  Search,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'All Categories',
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
  'All Tones',
  'Professional',
  'Premium / Luxury',
  'Friendly',
  'Minimal',
  'Technical',
  'Playful',
  'Eco-conscious',
];

const STATUSES = ['All Statuses', 'Draft', 'Approved', 'Needs Review'];

export const ProductCatalogue: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [tone, setTone] = useState('All Tones');
  const [status, setStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [search, category, tone, status, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { sort_by: sortBy };
      if (search.trim()) params.search = search.trim();
      if (category !== 'All Categories') params.category = category;
      if (tone !== 'All Tones') params.tone = tone;
      if (status !== 'All Statuses') params.status = status;

      const data = await ProductService.getProducts(params);
      setProducts(data);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch catalogue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await ProductService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast('Product Deleted', `Removed ${name} from catalogue.`);
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Product Catalogue
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, filter, and review all AI-generated retail descriptions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={ExportService.getProductsCsvUrl()}
            download
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </a>
          <a
            href={ExportService.getProductsJsonUrl()}
            download
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" /> Export JSON
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Product Name (A-Z)</option>
              <option value="quality_score">Highest Quality Score</option>
              <option value="seo_score">Highest SEO Score</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No products found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Quality Score</th>
                  <th className="px-4 py-3">SEO Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => {
                  const gc = p.latest_generated_content;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-snug">{p.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">SKU: {p.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.category}</td>
                      <td className="px-4 py-3 text-slate-500">{p.brand || 'Generic'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {p.price ? `${p.currency || 'USD'} ${p.price.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {gc ? (
                          <QualityScoreBadge score={gc.quality_score} size="sm" />
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {gc ? `${Math.round(gc.seo_score)}/100` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {gc ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              gc.status === 'Approved'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : gc.status === 'Needs Review'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {gc.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No Content</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/catalogue/${p.id}`}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="Review & Edit"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
