from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.generation import GeneratedContentResponse

class ProductBase(BaseModel):
    sku: Optional[str] = None
    name: str = Field(..., min_length=1, description="Product name")
    brand: Optional[str] = None
    category: str = Field(..., min_length=1, description="Product category")
    price: Optional[float] = None
    currency: Optional[str] = "USD"
    features: List[str] = Field(default_factory=list)
    specifications: Dict[str, Any] = Field(default_factory=dict)
    target_audience: Optional[str] = None
    primary_keywords: List[str] = Field(default_factory=list)
    secondary_keywords: List[str] = Field(default_factory=list)
    usp: Optional[str] = None
    image_url: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    color: Optional[str] = None
    weight: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    features: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    target_audience: Optional[str] = None
    primary_keywords: Optional[List[str]] = None
    secondary_keywords: Optional[List[str]] = None
    usp: Optional[str] = None
    image_url: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    color: Optional[str] = None
    weight: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    latest_generated_content: Optional[GeneratedContentResponse] = None

    model_config = ConfigDict(from_attributes=True)
