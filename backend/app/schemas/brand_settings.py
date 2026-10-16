from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class BrandSettingsBase(BaseModel):
    brand_name: str = "CatalogCraft Retail"
    brand_voice: str = "Professional, reliable, accurate, clear, customer-centric"
    preferred_words: List[str] = Field(default_factory=lambda: ["durable", "innovative", "premium quality", "ergonomic"])
    prohibited_words: List[str] = Field(default_factory=lambda: ["best", "guaranteed", "number one", "perfect", "cheap", "miracle"])
    mandatory_disclaimer: str = "Product specifications and availability are subject to change without notice."
    content_rules: List[str] = Field(default_factory=lambda: ["No unverifiable claims", "Highlight key customer benefits", "Include dimensions and specs when available"])
    
    default_tone: str = "Professional"
    default_language: str = "English"
    default_word_count: str = "Medium"
    keyword_policy: str = "Natural Integration"
    allow_promotional_claims: bool = False
    max_keywords: int = 5
    include_feature_bullets: bool = True

class BrandSettingsUpdate(BaseModel):
    brand_name: Optional[str] = None
    brand_voice: Optional[str] = None
    preferred_words: Optional[List[str]] = None
    prohibited_words: Optional[List[str]] = None
    mandatory_disclaimer: Optional[str] = None
    content_rules: Optional[List[str]] = None
    default_tone: Optional[str] = None
    default_language: Optional[str] = None
    default_word_count: Optional[str] = None
    keyword_policy: Optional[str] = None
    allow_promotional_claims: Optional[bool] = None
    max_keywords: Optional[int] = None
    include_feature_bullets: Optional[bool] = None

class BrandSettingsResponse(BrandSettingsBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
