from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime
import json
from app.database import Base

class BrandSettings(Base):
    __tablename__ = "brand_settings"

    id = Column(Integer, primary_key=True, index=True, default=1)
    brand_name = Column(String(100), default="CatalogCraft Retail")
    brand_voice = Column(Text, default="Professional, reliable, accurate, clear, customer-centric")
    
    preferred_words_json = Column("preferred_words", Text, nullable=True)
    prohibited_words_json = Column("prohibited_words", Text, nullable=True)
    mandatory_disclaimer = Column(Text, default="Product specifications and availability are subject to change without notice.")
    content_rules_json = Column("content_rules", Text, nullable=True)
    
    default_tone = Column(String(50), default="Professional")
    default_language = Column(String(50), default="English")
    default_word_count = Column(String(50), default="Medium")
    
    keyword_policy = Column(String(50), default="Natural Integration")
    allow_promotional_claims = Column(Boolean, default=False)
    max_keywords = Column(Integer, default=5)
    include_feature_bullets = Column(Boolean, default=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def preferred_words(self):
        return json.loads(self.preferred_words_json) if self.preferred_words_json else ["durable", "innovative", "premium quality", "ergonomic"]

    @preferred_words.setter
    def preferred_words(self, value):
        self.preferred_words_json = json.dumps(value) if value is not None else json.dumps([])

    @property
    def prohibited_words(self):
        return json.loads(self.prohibited_words_json) if self.prohibited_words_json else ["best", "guaranteed", "number one", "perfect", "cheap", "miracle"]

    @prohibited_words.setter
    def prohibited_words(self, value):
        self.prohibited_words_json = json.dumps(value) if value is not None else json.dumps([])

    @property
    def content_rules(self):
        return json.loads(self.content_rules_json) if self.content_rules_json else ["No unverifiable claims", "Highlight key customer benefits", "Include dimensions and specs when available"]

    @content_rules.setter
    def content_rules(self, value):
        self.content_rules_json = json.dumps(value) if value is not None else json.dumps([])
