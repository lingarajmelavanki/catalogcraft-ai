from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.product import Product
from app.models.generated_content import GeneratedContent
from app.models.batch_job import BatchJob
from app.schemas.analytics import DashboardAnalytics, KeyMetrics

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=DashboardAnalytics)
def get_dashboard_analytics(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Base queries
    prod_query = db.query(Product)
    gen_query = db.query(GeneratedContent).join(Product, GeneratedContent.product_id == Product.id)

    if category:
        prod_query = prod_query.filter(Product.category == category)
        gen_query = gen_query.filter(Product.category == category)
    if brand:
        prod_query = prod_query.filter(Product.brand == brand)
        gen_query = gen_query.filter(Product.brand == brand)

    total_products = prod_query.count()
    total_generated = gen_query.count()
    approved_count = gen_query.filter(GeneratedContent.status == "Approved").count()
    needs_review_count = gen_query.filter(GeneratedContent.status == "Needs Review").count()

    avg_seo = db.query(func.avg(GeneratedContent.seo_score)).scalar() or 0.0
    avg_quality = db.query(func.avg(GeneratedContent.quality_score)).scalar() or 0.0
    completed_batches = db.query(BatchJob).filter(BatchJob.status == "Completed").count()

    metrics = KeyMetrics(
        total_products=total_products,
        descriptions_generated=total_generated,
        approved_descriptions=approved_count,
        needs_review_count=needs_review_count,
        avg_seo_score=round(float(avg_seo), 1),
        avg_quality_score=round(float(avg_quality), 1),
        batch_jobs_completed=completed_batches
    )

    # 1. Generations over time (last 7 days)
    time_series = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = (
            gen_query.filter(func.date(GeneratedContent.generated_at) == day)
            .count()
        )
        time_series.append({"date": day.strftime("%b %d"), "count": count})

    # 2. Products by Category
    cat_counts = (
        db.query(Product.category, func.count(Product.id))
        .group_by(Product.category)
        .all()
    )
    products_by_category = [{"category": cat or "Uncategorized", "count": count} for cat, count in cat_counts]

    # 3. Quality score distribution
    q_80_100 = gen_query.filter(GeneratedContent.quality_score >= 80).count()
    q_60_79 = gen_query.filter(GeneratedContent.quality_score >= 60, GeneratedContent.quality_score < 80).count()
    q_below_60 = gen_query.filter(GeneratedContent.quality_score < 60).count()
    quality_dist = [
        {"range": "High (80-100)", "count": q_80_100},
        {"range": "Medium (60-79)", "count": q_60_79},
        {"range": "Low (<60)", "count": q_below_60}
    ]

    # 4. SEO score distribution
    s_80_100 = gen_query.filter(GeneratedContent.seo_score >= 80).count()
    s_60_79 = gen_query.filter(GeneratedContent.seo_score >= 60, GeneratedContent.seo_score < 80).count()
    s_below_60 = gen_query.filter(GeneratedContent.seo_score < 60).count()
    seo_dist = [
        {"range": "High (80-100)", "count": s_80_100},
        {"range": "Medium (60-79)", "count": s_60_79},
        {"range": "Low (<60)", "count": s_below_60}
    ]

    # 5. Tone usage
    tone_counts = (
        db.query(GeneratedContent.tone, func.count(GeneratedContent.id))
        .group_by(GeneratedContent.tone)
        .all()
    )
    tone_dist = [{"tone": t or "Professional", "count": count} for t, count in tone_counts]

    # 6. Status distribution
    status_counts = (
        db.query(GeneratedContent.status, func.count(GeneratedContent.id))
        .group_by(GeneratedContent.status)
        .all()
    )
    status_dist = [{"status": st or "Draft", "count": count} for st, count in status_counts]

    # 7. Recent activity
    recent_items = (
        gen_query.order_by(GeneratedContent.id.desc())
        .limit(10)
        .all()
    )
    recent_activity = []
    for gc in recent_items:
        prod = gc.product
        recent_activity.append({
            "id": gc.id,
            "product_id": prod.id if prod else 0,
            "product_name": prod.name if prod else "Unknown",
            "category": prod.category if prod else "Unknown",
            "quality_score": gc.quality_score,
            "seo_score": gc.seo_score,
            "status": gc.status,
            "source": gc.generation_source,
            "generated_at": gc.generated_at.isoformat() if gc.generated_at else ""
        })

    return DashboardAnalytics(
        metrics=metrics,
        generations_over_time=time_series,
        products_by_category=products_by_category,
        quality_score_distribution=quality_dist,
        seo_score_distribution=seo_dist,
        tone_usage_distribution=tone_dist,
        content_status_distribution=status_dist,
        recent_activity=recent_activity
    )

@router.get("/overview")
def get_analytics_overview(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_dashboard_analytics(category, brand, db)
