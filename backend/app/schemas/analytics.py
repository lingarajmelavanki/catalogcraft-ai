from pydantic import BaseModel
from typing import List, Dict, Any

class KeyMetrics(BaseModel):
    total_products: int
    descriptions_generated: int
    approved_descriptions: int
    needs_review_count: int
    avg_seo_score: float
    avg_quality_score: float
    batch_jobs_completed: int

class TimeSeriesPoint(BaseModel):
    date: str
    count: int

class CategoryDistribution(BaseModel):
    category: str
    count: int

class ScoreDistributionBucket(BaseModel):
    range: str # e.g. "80-100", "60-79", "<60"
    count: int

class ToneUsage(BaseModel):
    tone: str
    count: int

class ContentStatusDistribution(BaseModel):
    status: str
    count: int

class DashboardAnalytics(BaseModel):
    metrics: KeyMetrics
    generations_over_time: List[TimeSeriesPoint]
    products_by_category: List[CategoryDistribution]
    quality_score_distribution: List[ScoreDistributionBucket]
    seo_score_distribution: List[ScoreDistributionBucket]
    tone_usage_distribution: List[ToneUsage]
    content_status_distribution: List[ContentStatusDistribution]
    recent_activity: List[Dict[str, Any]]
