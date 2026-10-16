import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.config import settings
from app.models.batch_job import BatchJob, BatchItem
from app.models.product import Product
from app.schemas.batch import BatchJobResponse, BatchItemResponse, BatchGenerateRequest
from app.services.batch.batch_processor import BatchProcessor

router = APIRouter(prefix="/batch", tags=["Batch"])

@router.post("/upload", response_model=BatchJobResponse)
async def upload_batch_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    filename = file.filename or "upload.csv"
    ext = filename.split(".")[-1].lower()
    if ext not in ["csv", "json"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV and JSON are supported.")

    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        records = BatchProcessor.parse_file(file_path, ext)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if not records:
        raise HTTPException(status_code=400, detail="Uploaded file is empty or contains no product rows.")

    # Create BatchJob
    batch_job = BatchJob(
        file_name=filename,
        file_type=ext,
        total_products=len(records),
        processed_products=0,
        successful_products=0,
        failed_products=0,
        status="Pending"
    )
    db.add(batch_job)
    db.commit()
    db.refresh(batch_job)

    # Process items and save initial products
    batch_items = []
    for row in records:
        product_id = None
        error_msg = None
        item_status = "Pending"

        if not row.get("name") or not row.get("category"):
            item_status = "Failed"
            error_msg = f"Missing required fields: {'productName' if not row.get('name') else ''} {'category' if not row.get('category') else ''}".strip()
            batch_job.failed_products += 1

        else:
            # Create product record
            product = Product(
                sku=row.get("sku"),
                name=row["name"],
                brand=row.get("brand"),
                category=row["category"],
                price=row.get("price"),
                currency=row.get("currency") or "USD",
                features=row.get("features", []),
                specifications=row.get("specifications", {}),
                target_audience=row.get("target_audience"),
                primary_keywords=row.get("primary_keywords", []),
                secondary_keywords=row.get("secondary_keywords", []),
                usp=row.get("usp"),
                image_url=row.get("image_url"),
                material=row.get("material"),
                dimensions=row.get("dimensions"),
                color=row.get("color"),
                weight=row.get("weight")
            )
            db.add(product)
            db.flush()
            product_id = product.id

        batch_item = BatchItem(
            batch_job_id=batch_job.id,
            product_id=product_id,
            row_number=row["row_number"],
            status=item_status,
            error_message=error_msg
        )
        db.add(batch_item)

    db.commit()
    db.refresh(batch_job)
    return batch_job

@router.get("/{batch_id}", response_model=BatchJobResponse)
def get_batch_job(batch_id: int, db: Session = Depends(get_db)):
    job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    return job

@router.post("/{batch_id}/generate", response_model=BatchJobResponse)
async def start_batch_generation(
    batch_id: int,
    request: BatchGenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")

    # Run processing directly in async task
    await BatchProcessor.process_batch_job(
        db,
        batch_id,
        tone=request.tone or "Professional",
        word_count=request.word_count or "Medium",
        language=request.language or "English",
        selected_item_ids=request.selected_item_ids
    )

    db.refresh(job)
    return job

@router.post("/{batch_id}/retry-failed", response_model=BatchJobResponse)
async def retry_failed_batch_items(
    batch_id: int,
    request: BatchGenerateRequest,
    db: Session = Depends(get_db)
):
    job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")

    failed_items = (
        db.query(BatchItem)
        .filter(BatchItem.batch_job_id == batch_id, BatchItem.status == "Failed")
        .all()
    )

    if not failed_items:
        return job

    failed_ids = [item.id for item in failed_items]
    await BatchProcessor.process_batch_job(
        db,
        batch_id,
        tone=request.tone or "Professional",
        word_count=request.word_count or "Medium",
        language=request.language or "English",
        selected_item_ids=failed_ids
    )

    db.refresh(job)
    return job

@router.get("/{batch_id}/results", response_model=List[BatchItemResponse])
def get_batch_results(batch_id: int, db: Session = Depends(get_db)):
    job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    return job.items
