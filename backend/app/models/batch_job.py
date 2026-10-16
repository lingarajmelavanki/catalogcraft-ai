from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class BatchJob(Base):
    __tablename__ = "batch_jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # csv, json
    
    total_products = Column(Integer, default=0)
    processed_products = Column(Integer, default=0)
    successful_products = Column(Integer, default=0)
    failed_products = Column(Integer, default=0)
    
    status = Column(String(50), default="Pending") # Pending, Processing, Completed, Failed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    items = relationship("BatchItem", back_populates="batch_job", cascade="all, delete-orphan")


class BatchItem(Base):
    __tablename__ = "batch_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_job_id = Column(Integer, ForeignKey("batch_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    
    row_number = Column(Integer, nullable=False)
    status = Column(String(50), default="Pending") # Pending, Processing, Completed, Failed
    error_message = Column(Text, nullable=True)
    generated_content_id = Column(Integer, ForeignKey("generated_contents.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    batch_job = relationship("BatchJob", back_populates="items")
    product = relationship("Product")
    generated_content = relationship("GeneratedContent")
