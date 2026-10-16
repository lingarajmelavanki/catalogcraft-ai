from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sku = Column(String(100), index=True, nullable=True)
    name = Column(String(255), index=True, nullable=False)
    brand = Column(String(100), index=True, nullable=True)
    category = Column(String(100), index=True, nullable=False)
    price = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    
    # Stored as JSON strings
    features_json = Column("features", Text, nullable=True)
    specifications_json = Column("specifications", Text, nullable=True)
    target_audience = Column(String(255), nullable=True)
    primary_keywords_json = Column("primary_keywords", Text, nullable=True)
    secondary_keywords_json = Column("secondary_keywords", Text, nullable=True)
    usp = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    material = Column(String(100), nullable=True)
    dimensions = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    weight = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    generated_contents = relationship("GeneratedContent", back_populates="product", cascade="all, delete-orphan")

    @property
    def features(self):
        return json.loads(self.features_json) if self.features_json else []

    @features.setter
    def features(self, value):
        self.features_json = json.dumps(value) if value is not None else json.dumps([])

    @property
    def specifications(self):
        return json.loads(self.specifications_json) if self.specifications_json else {}

    @specifications.setter
    def specifications(self, value):
        self.specifications_json = json.dumps(value) if value is not None else json.dumps({})

    @property
    def primary_keywords(self):
        return json.loads(self.primary_keywords_json) if self.primary_keywords_json else []

    @primary_keywords.setter
    def primary_keywords(self, value):
        self.primary_keywords_json = json.dumps(value) if value is not None else json.dumps([])

    @property
    def secondary_keywords(self):
        return json.loads(self.secondary_keywords_json) if self.secondary_keywords_json else []

    @secondary_keywords.setter
    def secondary_keywords(self, value):
        self.secondary_keywords_json = json.dumps(value) if value is not None else json.dumps([])
