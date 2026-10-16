from pydantic import BaseModel
from typing import List

class QualityScoreResult(BaseModel):
    completeness_score: float
    seo_score: float
    readability_score: float
    brand_tone_score: float
    overall_quality_score: float
    status_color: str # "green", "yellow", "red"
    recommendations: List[str]
