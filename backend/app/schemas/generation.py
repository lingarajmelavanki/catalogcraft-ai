from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class ClaudeStructuredOutput(BaseModel):
    title: str = Field(..., description="Compelling product title")
    short_description: str = Field(..., description="Short product description (40-60 words)")
    full_description: str = Field(..., description="Full engaging product description")
    highlights: List[str] = Field(default_factory=list, description="Key product feature bullet points")
    meta_title: str = Field(..., description="SEO meta title under 60 characters")
    meta_description: str = Field(..., description="SEO meta description around 150-160 characters")
    suggested_keywords: List[str] = Field(default_factory=list, description="Extracted & suggested SEO keywords")
    warnings: List[str] = Field(default_factory=list, description="Content or missing data warnings")

class GenerationRequest(BaseModel):
    product_id: Optional[int] = None
    name: str
    sku: Optional[str] = None
    brand: Optional[str] = None
    category: str
    price: Optional[float] = None
    currency: Optional[str] = "USD"
    image_url: Optional[str] = None
    
    features: List[str] = Field(default_factory=list)
    specifications: Dict[str, Any] = Field(default_factory=dict)
    target_audience: Optional[str] = None
    usp: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    color: Optional[str] = None
    weight: Optional[str] = None
    
    primary_keywords: List[str] = Field(default_factory=list)
    secondary_keywords: List[str] = Field(default_factory=list)
    competitor_terms: Optional[str] = None
    meta_pref: Optional[str] = None
    
    tone: str = "Professional"
    word_count: str = "Medium"
    language: str = "English"

class ContentUpdateSchema(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    highlights: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    suggested_keywords: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    status: Optional[str] = None

class GeneratedContentResponse(BaseModel):
    id: int
    product_id: int
    title: str
    short_description: str
    full_description: str
    highlights: List[str]
    meta_title: str
    meta_description: str
    suggested_keywords: List[str]
    warnings: List[str]
    
    tone: str
    language: str
    word_count_preference: str
    
    seo_score: float
    readability_score: float
    completeness_score: float
    brand_tone_score: float
    quality_score: float
    
    status: str
    generation_source: str
    is_human_edited: bool
    generated_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ContentVersionResponse(BaseModel):
    id: int
    generated_content_id: int
    version_number: int
    content_snapshot: Dict[str, Any]
    changed_by: str
    change_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
