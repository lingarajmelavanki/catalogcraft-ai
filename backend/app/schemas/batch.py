from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.generation import GeneratedContentResponse

class BatchItemResponse(BaseModel):
    id: int
    batch_job_id: int
    product_id: Optional[int] = None
    row_number: int
    status: str
    error_message: Optional[str] = None
    generated_content_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    generated_content: Optional[GeneratedContentResponse] = None

    model_config = ConfigDict(from_attributes=True)

class BatchJobResponse(BaseModel):
    id: int
    file_name: str
    file_type: str
    total_products: int
    processed_products: int
    successful_products: int
    failed_products: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    items: List[BatchItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class BatchGenerateRequest(BaseModel):
    tone: Optional[str] = "Professional"
    word_count: Optional[str] = "Medium"
    language: Optional[str] = "English"
    selected_item_ids: Optional[List[int]] = None
