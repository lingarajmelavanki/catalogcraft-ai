import os
import json
import pandas as pd
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.batch_job import BatchJob, BatchItem
from app.models.product import Product
from app.models.generated_content import GeneratedContent
from app.models.brand_settings import BrandSettings
from app.models.content_version import ContentVersion
from app.schemas.generation import GenerationRequest
from app.services.ai.claude_service import ClaudeAIService
from app.services.scoring.quality_scorer import QualityScorer

class BatchProcessor:
    @staticmethod
    def parse_file(file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """
        Parses CSV or JSON file into normalized list of dictionaries.
        """
        if file_type.lower() == "csv":
            df = pd.read_csv(file_path)
            # Replace NaN with None
            df = df.where(pd.notnull(df), None)
            records = df.to_dict(orient="records")
        elif file_type.lower() == "json":
            with open(file_path, "r", encoding="utf-8") as f:
                records = json.load(f)
                if isinstance(records, dict) and "products" in records:
                    records = records["products"]
        else:
            raise ValueError("Unsupported file type. Use CSV or JSON.")

        normalized_records = []
        for index, raw in enumerate(records):
            norm = BatchProcessor._normalize_row(raw, index + 1)
            normalized_records.append(norm)

        return normalized_records

    @staticmethod
    def _normalize_row(raw: Dict[str, Any], row_num: int) -> Dict[str, Any]:
        def get_val(*keys):
            for k in keys:
                if k in raw and raw[k] is not None and str(raw[k]).strip() != "":
                    return raw[k]
            return None

        name = get_val("productName", "name", "Product Name", "title")
        category = get_val("category", "Category")
        sku = get_val("sku", "SKU", "productId", "id")
        brand = get_val("brand", "Brand")
        price_val = get_val("price", "Price")
        currency = get_val("currency", "Currency") or "USD"
        
        try:
            price = float(price_val) if price_val is not None else None
        except (ValueError, TypeError):
            price = None

        # Features parsing (can be list or comma separated string)
        raw_features = get_val("features", "Features")
        features = []
        if isinstance(raw_features, list):
            features = [str(f).strip() for f in raw_features if f]
        elif isinstance(raw_features, str):
            features = [f.strip() for f in raw_features.split(";") if f.strip()]
            if len(features) <= 1:
                features = [f.strip() for f in raw_features.split(",") if f.strip()]

        # Specifications parsing (can be dict or json string)
        raw_specs = get_val("specifications", "Specifications", "specs")
        specifications = {}
        if isinstance(raw_specs, dict):
            specifications = raw_specs
        elif isinstance(raw_specs, str):
            try:
                specifications = json.loads(raw_specs)
            except Exception:
                specifications = {"details": raw_specs}

        # Keywords parsing
        def parse_kw(field_name):
            val = get_val(field_name)
            if isinstance(val, list):
                return [str(k).strip() for k in val if k]
            elif isinstance(val, str):
                return [k.strip() for k in val.split(",") if k.strip()]
            return []

        primary_kws = parse_kw("primaryKeywords") or parse_kw("primary_keywords")
        secondary_kws = parse_kw("secondaryKeywords") or parse_kw("secondary_keywords")

        return {
            "row_number": row_num,
            "sku": str(sku) if sku else f"SKU-ROW-{row_num}",
            "name": str(name) if name else None,
            "brand": str(brand) if brand else None,
            "category": str(category) if category else None,
            "price": price,
            "currency": str(currency),
            "features": features,
            "specifications": specifications,
            "target_audience": get_val("targetAudience", "target_audience"),
            "primary_keywords": primary_kws,
            "secondary_keywords": secondary_kws,
            "usp": get_val("usp", "USP"),
            "image_url": get_val("imageUrl", "image_url"),
            "material": get_val("material", "Material"),
            "dimensions": get_val("dimensions", "Dimensions"),
            "color": get_val("color", "Color"),
            "weight": get_val("weight", "Weight"),
        }

    @staticmethod
    async def process_batch_job(
        db: Session,
        batch_job_id: int,
        tone: str = "Professional",
        word_count: str = "Medium",
        language: str = "English",
        selected_item_ids: List[int] = None
    ):
        batch_job = db.query(BatchJob).filter(BatchJob.id == batch_job_id).first()
        if not batch_job:
            return

        batch_job.status = "Processing"
        db.commit()

        items_query = db.query(BatchItem).filter(BatchItem.batch_job_id == batch_job_id)
        if selected_item_ids:
            items_query = items_query.filter(BatchItem.id.in_(selected_item_ids))
        
        items = items_query.all()
        ai_service = ClaudeAIService()

        brand_settings_obj = db.query(BrandSettings).first()
        brand_settings_dict = {}
        if brand_settings_obj:
            brand_settings_dict = {
                "brand_name": brand_settings_obj.brand_name,
                "brand_voice": brand_settings_obj.brand_voice,
                "preferred_words": brand_settings_obj.preferred_words,
                "prohibited_words": brand_settings_obj.prohibited_words,
                "mandatory_disclaimer": brand_settings_obj.mandatory_disclaimer,
                "content_rules": brand_settings_obj.content_rules,
            }

        for item in items:
            item.status = "Processing"
            db.commit()
            db.refresh(item)

            if not item.product:
                item.status = "Failed"
                item.error_message = "No associated product found for this row."
                batch_job.failed_products += 1
                batch_job.processed_products += 1
                db.commit()
                continue

            product = item.product
            try:
                gen_req = GenerationRequest(
                    product_id=product.id,
                    name=product.name,
                    sku=product.sku,
                    brand=product.brand,
                    category=product.category,
                    price=product.price,
                    currency=product.currency,
                    image_url=product.image_url,
                    features=product.features,
                    specifications=product.specifications,
                    target_audience=product.target_audience,
                    usp=product.usp,
                    material=product.material,
                    dimensions=product.dimensions,
                    color=product.color,
                    weight=product.weight,
                    primary_keywords=product.primary_keywords,
                    secondary_keywords=product.secondary_keywords,
                    tone=tone,
                    word_count=word_count,
                    language=language
                )

                output, source = await ai_service.generate(gen_req, brand_settings_dict)

                product_dict = {
                    "name": product.name,
                    "brand": product.brand,
                    "category": product.category,
                    "price": product.price,
                    "features": product.features,
                    "specifications": product.specifications,
                    "target_audience": product.target_audience,
                    "primary_keywords": product.primary_keywords,
                    "usp": product.usp,
                    "image_url": product.image_url,
                }
                
                scores = QualityScorer.calculate_scores(
                    product_dict,
                    output.model_dump(),
                    brand_settings_dict
                )

                gen_content = GeneratedContent(
                    product_id=product.id,
                    title=output.title,
                    short_description=output.short_description,
                    full_description=output.full_description,
                    highlights=output.highlights,
                    meta_title=output.meta_title,
                    meta_description=output.meta_description,
                    suggested_keywords=output.suggested_keywords,
                    warnings=output.warnings,
                    tone=tone,
                    language=language,
                    word_count_preference=word_count,
                    seo_score=scores.seo_score,
                    readability_score=scores.readability_score,
                    completeness_score=scores.completeness_score,
                    brand_tone_score=scores.brand_tone_score,
                    quality_score=scores.overall_quality_score,
                    status="Draft",
                    generation_source=source,
                    is_human_edited=False
                )

                db.add(gen_content)
                db.flush()

                # Add initial version history
                version = ContentVersion(
                    generated_content_id=gen_content.id,
                    version_number=1,
                    content_snapshot=output.model_dump(),
                    changed_by="Batch Processor",
                    change_type="Batch Generation"
                )
                db.add(version)

                item.status = "Completed"
                item.error_message = None
                item.generated_content_id = gen_content.id
                batch_job.successful_products += 1

            except Exception as e:
                item.status = "Failed"
                item.error_message = str(e)
                batch_job.failed_products += 1

            batch_job.processed_products += 1
            db.commit()

        if batch_job.processed_products >= batch_job.total_products:
            batch_job.status = "Completed"
            batch_job.completed_at = pd.Timestamp.now().to_pydatetime()
            db.commit()
