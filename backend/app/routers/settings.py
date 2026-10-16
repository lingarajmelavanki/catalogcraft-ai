import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.config import settings
from app.models.brand_settings import BrandSettings
from app.schemas.brand_settings import BrandSettingsResponse, BrandSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

class APIKeyRequest(BaseModel):
    api_key: str

def _get_or_create_settings(db: Session) -> BrandSettings:
    settings_obj = db.query(BrandSettings).first()
    if not settings_obj:
        settings_obj = BrandSettings(id=1)
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj

@router.get("/api-key")
def get_api_key_status():
    anthropic_key = (settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY") or "").strip()
    openrouter_key = (settings.OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY") or "").strip()
    has_key = bool(anthropic_key or openrouter_key)
    
    active_key = anthropic_key or openrouter_key
    masked = ""
    if has_key and active_key:
        if len(active_key) > 8:
            masked = active_key[:7] + "..." + active_key[-4:]
        else:
            masked = "***"

    provider_name = "Anthropic Direct" if anthropic_key else ("OpenRouter Claude" if openrouter_key else "None")
    model_name = settings.CLAUDE_MODEL if anthropic_key else settings.OPENROUTER_MODEL

    return {
        "has_key": has_key,
        "masked_key": masked,
        "ai_mode": "claude" if has_key else "mock",
        "provider": provider_name,
        "model": model_name
    }

@router.post("/api-key")
def update_api_key(body: APIKeyRequest):
    new_key = body.api_key.strip()
    is_openrouter = new_key.startswith("sk-or-")

    if is_openrouter:
        settings.OPENROUTER_API_KEY = new_key if new_key else None
    else:
        settings.ANTHROPIC_API_KEY = new_key if new_key else None
    
    # Save to backend/.env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
    try:
        lines = []
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        
        key_var = "OPENROUTER_API_KEY=" if is_openrouter else "ANTHROPIC_API_KEY="
        found = False
        new_lines = []
        for line in lines:
            if line.startswith(key_var):
                new_lines.append(f"{key_var}{new_key}\n")
                found = True
            else:
                new_lines.append(line)
        if not found:
            new_lines.append(f"{key_var}{new_key}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as exc:
        print(f"Warning: Could not update .env file: {exc}")

    has_key = bool(new_key or settings.is_live_ai_available)
    return {
        "status": "success",
        "has_key": has_key,
        "ai_mode": "claude" if has_key else "mock",
        "message": "API key saved! Application is running in Live AI mode." if has_key else "API key cleared. Application switched to Mock AI mode."
    }

@router.get("/brand", response_model=BrandSettingsResponse)
def get_brand_settings(db: Session = Depends(get_db)):
    return _get_or_create_settings(db)

@router.put("/brand", response_model=BrandSettingsResponse)
def update_brand_settings(settings_in: BrandSettingsUpdate, db: Session = Depends(get_db)):
    settings_obj = _get_or_create_settings(db)
    data = settings_in.model_dump(exclude_unset=True)

    for field, val in data.items():
        if field == "preferred_words":
            settings_obj.preferred_words = val
        elif field == "prohibited_words":
            settings_obj.prohibited_words = val
        elif field == "content_rules":
            settings_obj.content_rules = val
        else:
            setattr(settings_obj, field, val)

    db.commit()
    db.refresh(settings_obj)
    return settings_obj

@router.post("/brand/reset", response_model=BrandSettingsResponse)
def reset_brand_settings(db: Session = Depends(get_db)):
    settings_obj = _get_or_create_settings(db)
    
    settings_obj.brand_name = "CatalogCraft Retail"
    settings_obj.brand_voice = "Professional, reliable, accurate, clear, customer-centric"
    settings_obj.preferred_words = ["durable", "innovative", "premium quality", "ergonomic"]
    settings_obj.prohibited_words = ["best", "guaranteed", "number one", "perfect", "cheap", "miracle"]
    settings_obj.mandatory_disclaimer = "Product specifications and availability are subject to change without notice."
    settings_obj.content_rules = ["No unverifiable claims", "Highlight key customer benefits", "Include dimensions and specs when available"]
    settings_obj.default_tone = "Professional"
    settings_obj.default_language = "English"
    settings_obj.default_word_count = "Medium"
    settings_obj.keyword_policy = "Natural Integration"
    settings_obj.allow_promotional_claims = False
    settings_obj.max_keywords = 5
    settings_obj.include_feature_bullets = True

    db.commit()
    db.refresh(settings_obj)
    return settings_obj

