from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database import Base

class GeneratedContent(Base):
    __tablename__ = "generated_contents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    
    # Stored as JSON strings
    highlights_json = Column("highlights", Text, nullable=True)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    suggested_keywords_json = Column("suggested_keywords", Text, nullable=True)
    warnings_json = Column("warnings", Text, nullable=True)
    
    tone = Column(String(50), default="Professional")
    language = Column(String(50), default="English")
    word_count_preference = Column(String(50), default="Medium")
    
    seo_score = Column(Float, default=0.0)
    readability_score = Column(Float, default=0.0)
    completeness_score = Column(Float, default=0.0)
    brand_tone_score = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)
    
    status = Column(String(50), default="Draft") # Draft, Approved, Needs Review
    generation_source = Column(String(50), default="mock") # claude, mock
    is_human_edited = Column(Boolean, default=False)
    
    generated_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="generated_contents")
    versions = relationship("ContentVersion", back_populates="generated_content", cascade="all, delete-orphan")

    @property
    def highlights(self):
        return json.loads(self.highlights_json) if self.highlights_json else []

    @highlights.setter
    def highlights(self, value):
        self.highlights_json = json.dumps(value) if value is not None else json.dumps([])

    @property
    def suggested_keywords(self):
        return json.loads(self.suggested_keywords_json) if self.suggested_keywords_json else []

    @suggested_keywords.setter
    def suggested_keywords(self, value):
        self.suggested_keywords_json = json.dumps(value) if value is not None else json.dumps([])

    @property
    def warnings(self):
        return json.loads(self.warnings_json) if self.warnings_json else []

    @warnings.setter
    def warnings(self, value):
        self.warnings_json = json.dumps(value) if value is not None else json.dumps([])
