import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed.seed_data import seed_database, generate_sample_files
from app.routers import (
    health, products, generation, batch, settings as settings_router, analytics, export
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create DB tables
    Base.metadata.create_all(bind=engine)

    # 2. Generate sample CSV and JSON files in data/
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    generate_sample_files(data_dir)

    # 3. Seed initial 50+ products & settings
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield

app = FastAPI(
    title="CatalogCraft AI API",
    description="Backend API for CatalogCraft AI — Retail Product Description Generator",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve sample files statically
data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
if os.path.exists(data_path):
    app.mount("/static/data", StaticFiles(directory=data_path), name="sample_data")

# Mount API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(generation.router, prefix="/api")
app.include_router(batch.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(export.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "CatalogCraft AI Backend API Running",
        "health_check": "/api/health",
        "docs": "/docs"
    }
