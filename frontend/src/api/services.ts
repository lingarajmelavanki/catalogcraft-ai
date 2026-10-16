import { apiClient } from './client';
import type {
  Product,
  GeneratedContent,
  GenerationRequest,
  BrandSettings,
  BatchJob,
  BatchItem,
  DashboardAnalytics,
  HealthCheckResponse,
  ContentVersion,
} from '../types';

export const HealthService = {
  getHealth: async (): Promise<HealthCheckResponse> => {
    const res = await apiClient.get<HealthCheckResponse>('/health');
    return res.data;
  },
};

export const ProductService = {
  getProducts: async (params?: {
    search?: string;
    category?: string;
    brand?: string;
    tone?: string;
    status?: string;
    min_quality_score?: number;
    max_quality_score?: number;
    min_seo_score?: number;
    max_seo_score?: number;
    sort_by?: string;
    page?: number;
    limit?: number;
  }): Promise<Product[]> => {
    const res = await apiClient.get<Product[]>('/products', { params });
    return res.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await apiClient.get<Product>(`/products/${id}`);
    return res.data;
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.post<Product>('/products', product);
    return res.data;
  },

  updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.put<Product>(`/products/${id}`, product);
    return res.data;
  },

  deleteProduct: async (id: number): Promise<{ status: string; message: string }> => {
    const res = await apiClient.delete<{ status: string; message: string }>(`/products/${id}`);
    return res.data;
  },
};

export const GenerationService = {
  generateDescription: async (request: GenerationRequest): Promise<GeneratedContent> => {
    const res = await apiClient.post<GeneratedContent>('/generate-description', request);
    return res.data;
  },

  updateGeneratedContent: async (
    contentId: number,
    data: Partial<GeneratedContent>
  ): Promise<GeneratedContent> => {
    const res = await apiClient.put<GeneratedContent>(`/generated-content/${contentId}`, data);
    return res.data;
  },

  approveContent: async (contentId: number): Promise<GeneratedContent> => {
    const res = await apiClient.post<GeneratedContent>(`/generated-content/${contentId}/approve`);
    return res.data;
  },

  markNeedsReview: async (contentId: number): Promise<GeneratedContent> => {
    const res = await apiClient.post<GeneratedContent>(`/generated-content/${contentId}/needs-review`);
    return res.data;
  },

  getContentHistory: async (contentId: number): Promise<ContentVersion[]> => {
    const res = await apiClient.get<ContentVersion[]>(`/generated-content/${contentId}/history`);
    return res.data;
  },
};

export const BatchService = {
  uploadFile: async (file: File): Promise<BatchJob> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<BatchJob>('/batch/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getBatchJob: async (batchId: number): Promise<BatchJob> => {
    const res = await apiClient.get<BatchJob>(`/batch/${batchId}`);
    return res.data;
  },

  startGeneration: async (
    batchId: number,
    options?: { tone?: string; word_count?: string; language?: string; selected_item_ids?: number[] }
  ): Promise<BatchJob> => {
    const res = await apiClient.post<BatchJob>(`/batch/${batchId}/generate`, options || {});
    return res.data;
  },

  retryFailed: async (
    batchId: number,
    options?: { tone?: string; word_count?: string; language?: string }
  ): Promise<BatchJob> => {
    const res = await apiClient.post<BatchJob>(`/batch/${batchId}/retry-failed`, options || {});
    return res.data;
  },

  getBatchResults: async (batchId: number): Promise<BatchItem[]> => {
    const res = await apiClient.get<BatchItem[]>(`/batch/${batchId}/results`);
    return res.data;
  },
};

export const SettingsService = {
  getBrandSettings: async (): Promise<BrandSettings> => {
    const res = await apiClient.get<BrandSettings>('/settings/brand');
    return res.data;
  },

  updateBrandSettings: async (settings: Partial<BrandSettings>): Promise<BrandSettings> => {
    const res = await apiClient.put<BrandSettings>('/settings/brand', settings);
    return res.data;
  },

  resetBrandSettings: async (): Promise<BrandSettings> => {
    const res = await apiClient.post<BrandSettings>('/settings/brand/reset');
    return res.data;
  },
};

export const AnalyticsService = {
  getDashboardAnalytics: async (params?: { category?: string; brand?: string }): Promise<DashboardAnalytics> => {
    const res = await apiClient.get<DashboardAnalytics>('/analytics/dashboard', { params });
    return res.data;
  },
};

export const ExportService = {
  getProductsCsvUrl: (): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    return `${baseURL}/export/products.csv`;
  },
  getProductsJsonUrl: (): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    return `${baseURL}/export/products.json`;
  },
  getBatchCsvUrl: (batchId: number): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    return `${baseURL}/export/batch/${batchId}.csv`;
  },
  getBatchJsonUrl: (batchId: number): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    return `${baseURL}/export/batch/${batchId}.json`;
  },
};
