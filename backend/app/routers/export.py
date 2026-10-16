import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.services.export.exporter import DataExporter

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/products.csv")
def export_products_csv(db: Session = Depends(get_db)):
    file_path = os.path.join(settings.EXPORT_DIR, "catalog_products.csv")
    DataExporter.export_products_csv(db, file_path)
    return FileResponse(
        path=file_path,
        filename="catalog_products.csv",
        media_type="text/csv"
    )

@router.get("/products.json")
def export_products_json(db: Session = Depends(get_db)):
    file_path = os.path.join(settings.EXPORT_DIR, "catalog_products.json")
    DataExporter.export_products_json(db, file_path)
    return FileResponse(
        path=file_path,
        filename="catalog_products.json",
        media_type="application/json"
    )

@router.get("/batch/{batch_id}.csv")
def export_batch_csv(batch_id: int, db: Session = Depends(get_db)):
    file_path = os.path.join(settings.EXPORT_DIR, f"batch_{batch_id}_results.csv")
    DataExporter.export_batch_csv(db, batch_id, file_path)
    return FileResponse(
        path=file_path,
        filename=f"batch_{batch_id}_results.csv",
        media_type="text/csv"
    )

@router.get("/batch/{batch_id}.json")
def export_batch_json(batch_id: int, db: Session = Depends(get_db)):
    file_path = os.path.join(settings.EXPORT_DIR, f"batch_{batch_id}_results.json")
    DataExporter.export_batch_json(db, batch_id, file_path)
    return FileResponse(
        path=file_path,
        filename=f"batch_{batch_id}_results.json",
        media_type="application/json"
    )
