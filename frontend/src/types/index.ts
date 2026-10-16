export interface Product {
  id: number;
  sku?: string;
  name: string;
  brand?: string;
  category: string;
  price?: number;
  currency?: string;
  features: string[];
  specifications: Record<string, any>;
  target_audience?: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  usp?: string;
  image_url?: string;
  material?: string;
  dimensions?: string;
  color?: string;
  weight?: string;
  created_at: string;
  updated_at: string;
  latest_generated_content?: GeneratedContent;
}

export interface GeneratedContent {
  id: number;
  product_id: number;
  title: string;
  short_description: string;
  full_description: string;
  highlights: string[];
  meta_title: string;
  meta_description: string;
  suggested_keywords: string[];
  warnings: string[];
  tone: string;
  language: string;
  word_count_preference: string;
  seo_score: number;
  readability_score: number;
  completeness_score: number;
  brand_tone_score: number;
  quality_score: number;
  status: 'Draft' | 'Approved' | 'Needs Review';
  generation_source: 'claude' | 'mock';
  is_human_edited: boolean;
  generated_at: string;
  updated_at: string;
}

export interface ContentVersion {
  id: number;
  generated_content_id: number;
  version_number: number;
  content_snapshot: Record<string, any>;
  changed_by: string;
  change_type: string;
  created_at: string;
}

export interface GenerationRequest {
  product_id?: number;
  name: string;
  sku?: string;
  brand?: string;
  category: string;
  price?: number;
  currency?: string;
  image_url?: string;
  features: string[];
  specifications: Record<string, any>;
  target_audience?: string;
  usp?: string;
  material?: string;
  dimensions?: string;
  color?: string;
  weight?: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  competitor_terms?: string;
  meta_pref?: string;
  tone: string;
  word_count: string;
  language: string;
}

export interface BrandSettings {
  id: number;
  brand_name: string;
  brand_voice: string;
  preferred_words: string[];
  prohibited_words: string[];
  mandatory_disclaimer: string;
  content_rules: string[];
  default_tone: string;
  default_language: string;
  default_word_count: string;
  keyword_policy: string;
  allow_promotional_claims: boolean;
  max_keywords: number;
  include_feature_bullets: boolean;
  updated_at: string;
}

export interface BatchItem {
  id: number;
  batch_job_id: number;
  product_id?: number;
  row_number: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  error_message?: string;
  generated_content_id?: number;
  created_at: string;
  updated_at: string;
  generated_content?: GeneratedContent;
}

export interface BatchJob {
  id: number;
  file_name: string;
  file_type: 'csv' | 'json';
  total_products: number;
  processed_products: number;
  successful_products: number;
  failed_products: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  created_at: string;
  completed_at?: string;
  items: BatchItem[];
}

export interface DashboardAnalytics {
  metrics: {
    total_products: number;
    descriptions_generated: number;
    approved_descriptions: number;
    needs_review_count: number;
    avg_seo_score: number;
    avg_quality_score: number;
    batch_jobs_completed: number;
  };
  generations_over_time: Array<{ date: string; count: number }>;
  products_by_category: Array<{ category: string; count: number }>;
  quality_score_distribution: Array<{ range: string; count: number }>;
  seo_score_distribution: Array<{ range: string; count: number }>;
  tone_usage_distribution: Array<{ tone: string; count: number }>;
  content_status_distribution: Array<{ status: string; count: number }>;
  recent_activity: Array<{
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    quality_score: number;
    seo_score: number;
    status: string;
    source: string;
    generated_at: string;
  }>;
}

export interface HealthCheckResponse {
  status: string;
  app_name: string;
  environment: string;
  ai_mode: 'claude' | 'mock';
  database: string;
}
