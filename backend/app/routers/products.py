from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional
import json

from app.database import get_db
from app.models.product import Product
from app.models.generated_content import GeneratedContent
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.generation import GeneratedContentResponse

router = APIRouter(prefix="/products", tags=["Products"])

def _format_product(p: Product, db: Session) -> ProductResponse:
    latest_gc = (
        db.query(GeneratedContent)
        .filter(GeneratedContent.product_id == p.id)
        .order_by(GeneratedContent.id.desc())
        .first()
    )

    gc_res = None
    if latest_gc:
        gc_res = GeneratedContentResponse.model_validate(latest_gc)

    res = ProductResponse(
        id=p.id,
        sku=p.sku,
        name=p.name,
        brand=p.brand,
        category=p.category,
        price=p.price,
        currency=p.currency,
        features=p.features,
        specifications=p.specifications,
        target_audience=p.target_audience,
        primary_keywords=p.primary_keywords,
        secondary_keywords=p.secondary_keywords,
        usp=p.usp,
        image_url=p.image_url,
        material=p.material,
        dimensions=p.dimensions,
        color=p.color,
        weight=p.weight,
        created_at=p.created_at,
        updated_at=p.updated_at,
        latest_generated_content=gc_res
    )
    return res

@router.get("", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    tone: Optional[str] = None,
    status: Optional[str] = None,
    min_quality_score: Optional[float] = None,
    max_quality_score: Optional[float] = None,
    min_seo_score: Optional[float] = None,
    max_seo_score: Optional[float] = None,
    sort_by: str = "newest", # newest, oldest, name, quality_score, seo_score
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Product).outerjoin(GeneratedContent, Product.id == GeneratedContent.product_id)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(s),
                Product.sku.ilike(s),
                Product.brand.ilike(s),
                Product.category.ilike(s)
            )
        )

    if category:
        query = query.filter(Product.category == category)
    if brand:
        query = query.filter(Product.brand == brand)
    if tone:
        query = query.filter(GeneratedContent.tone == tone)
    if status:
        query = query.filter(GeneratedContent.status == status)
    if min_quality_score is not None:
        query = query.filter(GeneratedContent.quality_score >= min_quality_score)
    if max_quality_score is not None:
        query = query.filter(GeneratedContent.quality_score <= max_quality_score)
    if min_seo_score is not None:
        query = query.filter(GeneratedContent.seo_score >= min_seo_score)
    if max_seo_score is not None:
        query = query.filter(GeneratedContent.seo_score <= max_seo_score)

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(asc(Product.id))
    elif sort_by == "name":
        query = query.order_by(asc(Product.name))
    elif sort_by == "quality_score":
        query = query.order_by(desc(GeneratedContent.quality_score))
    elif sort_by == "seo_score":
        query = query.order_by(desc(GeneratedContent.seo_score))
    else: # newest
        query = query.order_by(desc(Product.id))

    # Distinct product query
    products = query.offset((page - 1) * limit).limit(limit).all()
    return [_format_product(p, db) for p in products]

@router.post("", response_model=ProductResponse)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    product = Product(
        sku=product_in.sku,
        name=product_in.name,
        brand=product_in.brand,
        category=product_in.category,
        price=product_in.price,
        currency=product_in.currency,
        features_json=json.dumps(product_in.features),
        specifications_json=json.dumps(product_in.specifications),
        target_audience=product_in.target_audience,
        primary_keywords_json=json.dumps(product_in.primary_keywords),
        secondary_keywords_json=json.dumps(product_in.secondary_keywords),
        usp=product_in.usp,
        image_url=product_in.image_url,
        material=product_in.material,
        dimensions=product_in.dimensions,
        color=product_in.color,
        weight=product_in.weight
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _format_product(product, db)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return _format_product(p, db)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    data = product_in.model_dump(exclude_unset=True)
    for field, val in data.items():
        if field == "features":
            p.features = val
        elif field == "specifications":
            p.specifications = val
        elif field == "primary_keywords":
            p.primary_keywords = val
        elif field == "secondary_keywords":
            p.secondary_keywords = val
        else:
            setattr(p, field, val)

    db.commit()
    db.refresh(p)
    return _format_product(p, db)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return {"status": "success", "message": f"Product {product_id} deleted."}
