import json
import pandas as pd
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.generated_content import GeneratedContent
from app.models.batch_job import BatchJob, BatchItem

class DataExporter:
    @staticmethod
    def export_products_to_dict(db: Session) -> List[Dict[str, Any]]:
        products = db.query(Product).all()
        results = []
        for p in products:
            latest_content = (
                db.query(GeneratedContent)
                .filter(GeneratedContent.product_id == p.id)
                .order_by(GeneratedContent.id.desc())
                .first()
            )
            
            row = {
                "productId": p.id,
                "sku": p.sku,
                "productName": p.name,
                "brand": p.brand,
                "category": p.category,
                "price": p.price,
                "currency": p.currency,
                "features": ", ".join(p.features),
                "targetAudience": p.target_audience,
                "primaryKeywords": ", ".join(p.primary_keywords),
                "secondaryKeywords": ", ".join(p.secondary_keywords),
                "usp": p.usp,
                "imageUrl": p.image_url,
                "material": p.material,
                "dimensions": p.dimensions,
                "color": p.color,
                "weight": p.weight,
                "generatedTitle": latest_content.title if latest_content else "",
                "shortDescription": latest_content.short_description if latest_content else "",
                "fullDescription": latest_content.full_description if latest_content else "",
                "highlights": ", ".join(latest_content.highlights) if latest_content else "",
                "metaTitle": latest_content.meta_title if latest_content else "",
                "metaDescription": latest_content.meta_description if latest_content else "",
                "qualityScore": latest_content.quality_score if latest_content else 0.0,
                "seoScore": latest_content.seo_score if latest_content else 0.0,
                "status": latest_content.status if latest_content else "No Content",
                "generationSource": latest_content.generation_source if latest_content else "",
            }
            results.append(row)
        return results

    @staticmethod
    def export_products_csv(db: Session, file_path: str):
        data = DataExporter.export_products_to_dict(db)
        df = pd.DataFrame(data)
        df.to_csv(file_path, index=False)

    @staticmethod
    def export_products_json(db: Session, file_path: str):
        data = DataExporter.export_products_to_dict(db)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    @staticmethod
    def export_batch_to_dict(db: Session, batch_job_id: int) -> List[Dict[str, Any]]:
        batch_job = db.query(BatchJob).filter(BatchJob.id == batch_job_id).first()
        if not batch_job:
            return []

        results = []
        for item in batch_job.items:
            product = item.product
            gen_content = item.generated_content
            
            row = {
                "batchJobId": batch_job_id,
                "rowNumber": item.row_number,
                "status": item.status,
                "errorMessage": item.error_message or "",
                "sku": product.sku if product else "",
                "productName": product.name if product else "",
                "category": product.category if product else "",
                "generatedTitle": gen_content.title if gen_content else "",
                "shortDescription": gen_content.short_description if gen_content else "",
                "fullDescription": gen_content.full_description if gen_content else "",
                "highlights": ", ".join(gen_content.highlights) if gen_content else "",
                "metaTitle": gen_content.meta_title if gen_content else "",
                "metaDescription": gen_content.meta_description if gen_content else "",
                "qualityScore": gen_content.quality_score if gen_content else 0.0,
            }
            results.append(row)
        return results

    @staticmethod
    def export_batch_csv(db: Session, batch_job_id: int, file_path: str):
        data = DataExporter.export_batch_to_dict(db, batch_job_id)
        df = pd.DataFrame(data)
        df.to_csv(file_path, index=False)

    @staticmethod
    def export_batch_json(db: Session, batch_job_id: int, file_path: str):
        data = DataExporter.export_batch_to_dict(db, batch_job_id)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
