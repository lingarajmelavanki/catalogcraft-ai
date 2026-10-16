from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    ai_mode = "claude" if settings.is_live_ai_available else "mock"
    return {
        "status": "healthy",
        "app_name": "CatalogCraft AI",
        "environment": settings.APP_ENV,
        "ai_mode": ai_mode,
        "database": settings.DATABASE_URL.split(":")[0]
    }

