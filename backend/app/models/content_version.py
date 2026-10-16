from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database import Base

class ContentVersion(Base):
    __tablename__ = "content_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    generated_content_id = Column(Integer, ForeignKey("generated_contents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    version_number = Column(Integer, nullable=False)
    content_snapshot_json = Column("content_snapshot", Text, nullable=False)
    changed_by = Column(String(100), default="System")
    change_type = Column(String(100), default="Initial Generation") # Initial Generation, Regeneration, Human Edit, Approval
    
    created_at = Column(DateTime, default=datetime.utcnow)

    generated_content = relationship("GeneratedContent", back_populates="versions")

    @property
    def content_snapshot(self):
        return json.loads(self.content_snapshot_json) if self.content_snapshot_json else {}

    @content_snapshot.setter
    def content_snapshot(self, value):
        self.content_snapshot_json = json.dumps(value) if value is not None else json.dumps({})
