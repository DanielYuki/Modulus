"""
Presentation Layer - Batch Routes

FastAPI router for batch generation endpoints.
"""
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import Optional

from src.presentation.schemas.batch_schemas import (
    BatchStatusResponse,
    BatchItemResponse,
    CreateBatchResponse,
)
from src.application.batch_generation import BatchGenerationUseCase
from src.domain.batch_entities import ItemStatus
from src.infrastructure.openai_adapter import OpenAIAdapter
from src.infrastructure.pymupdf_adapter import PyMuPDFAdapter
from src.infrastructure.latex_compiler import PdfLatexAdapter
from src.infrastructure.job_store import InMemoryJobStore

router = APIRouter()


def get_use_case() -> BatchGenerationUseCase:
    """Factory for BatchGenerationUseCase with dependencies."""
    return BatchGenerationUseCase(
        ai_generator=OpenAIAdapter(),
        pdf_extractor=PyMuPDFAdapter(),
        latex_compiler=PdfLatexAdapter(),
    )


@router.post("/batch", response_model=CreateBatchResponse)
async def create_batch(
    background_tasks: BackgroundTasks,
    subjects: str = Form(..., description="Subjects separated by newlines"),
    template: UploadFile = File(..., description="The .tex template file"),
    reference_pdf: Optional[UploadFile] = File(None, description="Optional reference PDF"),
    instructions: Optional[str] = Form(None, description="Optional instructions"),
):
    """
    Create a new batch generation job.
    
    - Upload a .tex template
    - Optionally upload a reference PDF for context
    - Provide subjects (one per line)
    - Receive a job ID to track progress
    """
    # Parse subjects
    subject_list = [s.strip() for s in subjects.split("\n") if s.strip()]
    
    if not subject_list:
        raise HTTPException(status_code=400, detail="No subjects provided")
    
    if len(subject_list) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 subjects per batch")
    
    # Read template
    template_content = (await template.read()).decode("utf-8")
    
    # Read reference PDF if provided
    pdf_bytes = None
    if reference_pdf:
        pdf_bytes = await reference_pdf.read()
    
    # Create batch job
    use_case = get_use_case()
    job = use_case.create_batch(
        subjects=subject_list,
        template_content=template_content,
        reference_pdf=pdf_bytes,
        instructions=instructions,
    )
    
    # Process in background
    background_tasks.add_task(use_case.process_batch, job.id)
    
    return CreateBatchResponse(
        job_id=job.id,
        message=f"Batch created with {len(subject_list)} subjects. Processing started.",
    )


@router.get("/batch/{job_id}", response_model=BatchStatusResponse)
async def get_batch_status(job_id: str):
    """
    Get the current status of a batch job.
    
    Returns the overall job status and status of each item.
    """
    job = InMemoryJobStore.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    items = [
        BatchItemResponse(
            index=idx,
            subject=item.subject,
            status=item.status.value,
            tex_available=item.tex_content is not None,
            pdf_available=item.pdf_path is not None,
            error=item.error,
        )
        for idx, item in enumerate(job.items)
    ]
    
    completed = sum(1 for i in job.items if i.status == ItemStatus.DONE)
    failed = sum(1 for i in job.items if i.status == ItemStatus.ERROR)
    
    return BatchStatusResponse(
        id=job.id,
        status=job.status.value,
        total_items=len(job.items),
        completed_items=completed,
        failed_items=failed,
        items=items,
    )


@router.get("/batch/{job_id}/item/{idx}/tex")
async def get_item_tex(job_id: str, idx: int):
    """
    Download the generated .tex file for a specific item.
    """
    job = InMemoryJobStore.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    if idx < 0 or idx >= len(job.items):
        raise HTTPException(status_code=404, detail=f"Item {idx} not found")
    
    item = job.items[idx]
    
    if not item.tex_content:
        raise HTTPException(status_code=404, detail="TeX content not yet available")
    
    # Return as downloadable file
    from fastapi.responses import Response
    return Response(
        content=item.tex_content,
        media_type="application/x-tex",
        headers={
            "Content-Disposition": f'attachment; filename="item_{idx}.tex"'
        }
    )


@router.get("/batch/{job_id}/item/{idx}/pdf")
async def get_item_pdf(job_id: str, idx: int):
    """
    Stream the generated PDF for a specific item.
    
    Use this URL directly in a browser tab for viewing.
    """
    job = InMemoryJobStore.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    if idx < 0 or idx >= len(job.items):
        raise HTTPException(status_code=404, detail=f"Item {idx} not found")
    
    item = job.items[idx]
    
    if not item.pdf_path:
        raise HTTPException(status_code=404, detail="PDF not yet available")
    
    if not os.path.exists(item.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")
    
    return FileResponse(
        path=item.pdf_path,
        media_type="application/pdf",
        filename=f"item_{idx}.pdf",
    )


@router.post("/batch/{job_id}/process")
async def trigger_processing(job_id: str):
    """
    Manually trigger processing for a batch job.
    
    Use this if background processing failed to start.
    """
    job = InMemoryJobStore.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    use_case = get_use_case()
    updated_job = use_case.process_batch(job_id)
    
    return {"message": "Processing complete", "status": updated_job.status.value}
