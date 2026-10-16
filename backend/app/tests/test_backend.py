import pytest
import asyncio
from fastapi.testclient import TestClient
import json
import os

from app.main import app
from app.database import engine, Base
from app.schemas.product import ProductCreate
from app.schemas.brand_settings import BrandSettingsBase
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.mock_generator import MockGenerator
from app.services.scoring.quality_scorer import QualityScorer
from app.services.batch.batch_processor import BatchProcessor
from app.schemas.generation import GenerationRequest

# Ensure tables exist for tests
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ai_mode" in data

def test_product_schema_validation():
    valid = ProductCreate(
        name="Test Headphones",
        category="Electronics",
        price=99.99,
        features=["ANC", "Bluetooth"]
    )
    assert valid.name == "Test Headphones"
    assert valid.category == "Electronics"

def test_brand_settings_validation():
    settings = BrandSettingsBase(
        brand_name="Test Brand",
        prohibited_words=["cheap", "fake"]
    )
    assert settings.brand_name == "Test Brand"
    assert "cheap" in settings.prohibited_words

def test_prompt_builder():
    brand_dict = {"brand_name": "Acme", "brand_voice": "Bold", "preferred_words": ["fast"], "prohibited_words": ["slow"]}
    sys_prompt = PromptBuilder.build_system_prompt(brand_dict)
    assert "Acme" in sys_prompt
    assert "STRICT CONTENT" in sys_prompt

    req = GenerationRequest(
        name="Wireless Mouse",
        category="Electronics",
        features=["Ergonomic"]
    )
    user_prompt = PromptBuilder.build_user_prompt(req)
    assert "Wireless Mouse" in user_prompt

def test_mock_generator():
    gen = MockGenerator()
    req = GenerationRequest(
        name="Smart Coffee Mug",
        brand="Ember",
        category="Home",
        price=129.00,
        features=["Temperature control"],
        material="Ceramic",
        tone="Professional"
    )
    output, source = asyncio.run(gen.generate(req, {}))
    assert source == "mock"
    assert "Smart Coffee Mug" in output.title
    assert len(output.short_description) > 10
    assert len(output.highlights) > 0

def test_quality_scorer():
    product_dict = {
        "name": "Luxury Watch",
        "brand": "Rolex",
        "category": "Fashion",
        "price": 5000.0,
        "features": ["Waterproof"],
        "specifications": {"Dial": "Sapphire"},
        "primary_keywords": ["luxury watch"]
    }
    output_dict = {
        "title": "Rolex Luxury Watch",
        "short_description": "An exquisite luxury watch crafted for timeless precision.",
        "full_description": "The Rolex Luxury Watch brings unprecedented luxury watch styling to your wrist.",
        "highlights": ["Waterproof", "Sapphire"],
        "meta_title": "Rolex Luxury Watch - Buy Online",
        "meta_description": "Shop the Rolex Luxury Watch featuring waterproof construction.",
        "suggested_keywords": ["luxury watch"],
        "warnings": []
    }
    result = QualityScorer.calculate_scores(product_dict, output_dict)
    assert result.overall_quality_score > 50
    assert result.status_color in ["green", "yellow", "red"]

def test_batch_row_normalization():
    raw_row = {
        "productName": "Bluetooth Speaker",
        "category": "Electronics",
        "price": "49.99",
        "features": "Portable, Waterproof, 12h Battery",
        "primaryKeywords": "speaker, bluetooth"
    }
    norm = BatchProcessor._normalize_row(raw_row, 1)
    assert norm["name"] == "Bluetooth Speaker"
    assert norm["category"] == "Electronics"
    assert norm["price"] == 49.99
    assert len(norm["features"]) == 3
    assert len(norm["primary_keywords"]) == 2

def test_product_crud_endpoints():
    with TestClient(app) as test_client:
        # 1. Create product
        payload = {
            "name": "Pytest Test Product",
            "sku": "PYTEST-001",
            "category": "Electronics",
            "price": 19.99
        }
        res = test_client.post("/api/products", json=payload)
        assert res.status_code == 200
        p_data = res.json()
        p_id = p_data["id"]

        # 2. Get product
        res = test_client.get(f"/api/products/{p_id}")
        assert res.status_code == 200
        assert res.json()["name"] == "Pytest Test Product"

        # 3. Update product
        res = test_client.put(f"/api/products/{p_id}", json={"price": 29.99})
        assert res.status_code == 200
        assert res.json()["price"] == 29.99

        # 4. Delete product
        res = test_client.delete(f"/api/products/{p_id}")
        assert res.status_code == 200

def test_export_endpoints():
    with TestClient(app) as test_client:
        res_csv = test_client.get("/api/export/products.csv")
        assert res_csv.status_code == 200
        assert "text/csv" in res_csv.headers["content-type"]

        res_json = test_client.get("/api/export/products.json")
        assert res_json.status_code == 200
        assert "application/json" in res_json.headers["content-type"]
