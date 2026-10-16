from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models.product import Product
from app.models.generated_content import GeneratedContent
from app.models.brand_settings import BrandSettings
from app.models.content_version import ContentVersion
from app.schemas.generation import (
    GenerationRequest, GeneratedContentResponse, ContentUpdateSchema, ContentVersionResponse
)
from app.services.ai.claude_service import ClaudeAIService
from app.services.scoring.quality_scorer import QualityScorer

router = APIRouter(tags=["Generation"])

@router.post("/generate-description", response_model=GeneratedContentResponse)
async def generate_description(request: GenerationRequest, db: Session = Depends(get_db)):
    # 1. Save or find product
    product = None
    if request.product_id:
        product = db.query(Product).filter(Product.id == request.product_id).first()

    if not product:
        product = Product(
            sku=request.sku,
            name=request.name,
            brand=request.brand,
            category=request.category,
            price=request.price,
            currency=request.currency or "USD",
            image_url=request.image_url,
            features=request.features,
            specifications=request.specifications,
            target_audience=request.target_audience,
            usp=request.usp,
            material=request.material,
            dimensions=request.dimensions,
            color=request.color,
            weight=request.weight,
            primary_keywords=request.primary_keywords,
            secondary_keywords=request.secondary_keywords
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    # 2. Get BrandSettings
    brand_settings_obj = db.query(BrandSettings).first()
    brand_dict = {}
    if brand_settings_obj:
        brand_dict = {
            "brand_name": brand_settings_obj.brand_name,
            "brand_voice": brand_settings_obj.brand_voice,
            "preferred_words": brand_settings_obj.preferred_words,
            "prohibited_words": brand_settings_obj.prohibited_words,
            "mandatory_disclaimer": brand_settings_obj.mandatory_disclaimer,
            "content_rules": brand_settings_obj.content_rules,
        }

    # 3. Call AI Service
    ai_service = ClaudeAIService()
    output, source = await ai_service.generate(request, brand_dict)

    # 4. Calculate Scores
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

    scores = QualityScorer.calculate_scores(product_dict, output.model_dump(), brand_dict)

    # 5. Save GeneratedContent
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
        tone=request.tone,
        language=request.language,
        word_count_preference=request.word_count,
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
    db.commit()
    db.refresh(gen_content)

    # 6. Save Version History
    version = ContentVersion(
        generated_content_id=gen_content.id,
        version_number=1,
        content_snapshot=output.model_dump(),
        changed_by="AI Engine",
        change_type="Initial Generation"
    )
    db.add(version)
    db.commit()

    return gen_content

@router.post("/regenerate-description", response_model=GeneratedContentResponse)
async def regenerate_description(request: GenerationRequest, db: Session = Depends(get_db)):
    return await generate_description(request, db)

@router.put("/generated-content/{content_id}", response_model=GeneratedContentResponse)
def update_generated_content(content_id: int, update_in: ContentUpdateSchema, db: Session = Depends(get_db)):
    gc = db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
    if not gc:
        raise HTTPException(status_code=404, detail="Generated content not found")

    data = update_in.model_dump(exclude_unset=True)
    if not data:
        return gc

    for field, val in data.items():
        if field == "highlights":
            gc.highlights = val
        elif field == "suggested_keywords":
            gc.suggested_keywords = val
        elif field == "warnings":
            gc.warnings = val
        else:
            setattr(gc, field, val)

    gc.is_human_edited = True

    # Recalculate scores after manual edit
    product = gc.product
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

    brand_settings_obj = db.query(BrandSettings).first()
    brand_dict = {}
    if brand_settings_obj:
        brand_dict = {
            "brand_name": brand_settings_obj.brand_name,
            "brand_voice": brand_settings_obj.brand_voice,
            "preferred_words": brand_settings_obj.preferred_words,
            "prohibited_words": brand_settings_obj.prohibited_words,
        }

    output_dict = {
        "title": gc.title,
        "short_description": gc.short_description,
        "full_description": gc.full_description,
        "highlights": gc.highlights,
        "meta_title": gc.meta_title,
        "meta_description": gc.meta_description,
        "suggested_keywords": gc.suggested_keywords,
        "warnings": gc.warnings,
    }

    scores = QualityScorer.calculate_scores(product_dict, output_dict, brand_dict)
    gc.seo_score = scores.seo_score
    gc.readability_score = scores.readability_score
    gc.completeness_score = scores.completeness_score
    gc.brand_tone_score = scores.brand_tone_score
    gc.quality_score = scores.overall_quality_score

    # Version history entry
    v_count = db.query(ContentVersion).filter(ContentVersion.generated_content_id == gc.id).count()
    version = ContentVersion(
        generated_content_id=gc.id,
        version_number=v_count + 1,
        content_snapshot=output_dict,
        changed_by="Human Editor",
        change_type="Manual Edit"
    )
    db.add(version)

    db.commit()
    db.refresh(gc)
    return gc

@router.post("/generated-content/{content_id}/approve", response_model=GeneratedContentResponse)
def approve_content(content_id: int, db: Session = Depends(get_db)):
    gc = db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
    if not gc:
        raise HTTPException(status_code=404, detail="Generated content not found")
    gc.status = "Approved"

    v_count = db.query(ContentVersion).filter(ContentVersion.generated_content_id == gc.id).count()
    version = ContentVersion(
        generated_content_id=gc.id,
        version_number=v_count + 1,
        content_snapshot={"status": "Approved"},
        changed_by="Reviewer",
        change_type="Approval"
    )
    db.add(version)

    db.commit()
    db.refresh(gc)
    return gc

@router.post("/generated-content/{content_id}/needs-review", response_model=GeneratedContentResponse)
def mark_needs_review(content_id: int, db: Session = Depends(get_db)):
    gc = db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
    if not gc:
        raise HTTPException(status_code=404, detail="Generated content not found")
    gc.status = "Needs Review"

    v_count = db.query(ContentVersion).filter(ContentVersion.generated_content_id == gc.id).count()
    version = ContentVersion(
        generated_content_id=gc.id,
        version_number=v_count + 1,
        content_snapshot={"status": "Needs Review"},
        changed_by="Reviewer",
        change_type="Needs Review Mark"
    )
    db.add(version)

    db.commit()
    db.refresh(gc)
    return gc

@router.get("/generated-content/{content_id}/history", response_model=List[ContentVersionResponse])
def get_content_history(content_id: int, db: Session = Depends(get_db)):
    versions = (
        db.query(ContentVersion)
        .filter(ContentVersion.generated_content_id == content_id)
        .order_by(ContentVersion.version_number.desc())
        .all()
    )
    return versions
