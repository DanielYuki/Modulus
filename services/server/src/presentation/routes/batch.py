"""
Presentation Layer - Batch Routes

FastAPI router for batch generation endpoints.
"""

import io
import os
import zipfile

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse

from src.application.batch_generation import BatchGenerationUseCase
from src.domain.batch_entities import ItemStatus
from src.infrastructure.file_job_store import FileJobStore
from src.infrastructure.latex_compiler import PdfLatexAdapter
from src.infrastructure.openai_adapter import OpenAIAdapter
from src.infrastructure.pymupdf_adapter import PyMuPDFAdapter
from src.presentation.schemas.batch_schemas import (
    BatchItemResponse,
    BatchListItem,
    BatchStatusResponse,
    CreateBatchResponse,
)

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
    reference_pdf: UploadFile | None = File(None, description="Optional reference PDF"),
    instructions: str | None = Form(None, description="Optional instructions"),
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


@router.get("/batch", response_model=list[BatchListItem])
async def list_batches():
    """
    List all batch jobs.

    Returns a summary of each batch, sorted by creation date (newest first).
    """
    jobs = FileJobStore.list_jobs()
    return [
        BatchListItem(
            id=job.id,
            status=job.status.value,
            total_items=len(job.items),
            completed_items=sum(1 for i in job.items if i.status == ItemStatus.DONE),
            failed_items=sum(1 for i in job.items if i.status == ItemStatus.ERROR),
            created_at=job.created_at.isoformat(),
        )
        for job in jobs
    ]


@router.get("/batch/{job_id}", response_model=BatchStatusResponse)
async def get_batch_status(job_id: str):
    """
    Get the current status of a batch job.

    Returns the overall job status and status of each item.
    """
    job = FileJobStore.get_job(job_id)

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
    job = FileJobStore.get_job(job_id)

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
        headers={"Content-Disposition": f'attachment; filename="item_{idx}.tex"'},
    )


@router.get("/batch/{job_id}/item/{idx}/pdf")
async def get_item_pdf(job_id: str, idx: int, download: bool = False):
    """
    Stream the generated PDF for a specific item.

    - Use without ?download for inline viewing (preview in browser)
    - Use with ?download=true to force download
    """
    job = FileJobStore.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    if idx < 0 or idx >= len(job.items):
        raise HTTPException(status_code=404, detail=f"Item {idx} not found")

    item = job.items[idx]

    if not item.pdf_path:
        raise HTTPException(status_code=404, detail="PDF not yet available")

    if not os.path.exists(item.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")

    # If download=true, include filename to trigger download
    # Otherwise, omit filename for inline viewing
    if download:
        return FileResponse(
            path=item.pdf_path,
            media_type="application/pdf",
            filename=f"{item.subject}.pdf",
        )
    else:
        return FileResponse(
            path=item.pdf_path,
            media_type="application/pdf",
        )


@router.post("/batch/{job_id}/process")
async def trigger_processing(job_id: str):
    """
    Manually trigger processing for a batch job.

    Use this if background processing failed to start.
    """
    job = FileJobStore.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    use_case = get_use_case()
    updated_job = use_case.process_batch(job_id)

    return {"message": "Processing complete", "status": updated_job.status.value}


@router.get("/batch/{job_id}/download-all")
async def download_all_pdfs(job_id: str):
    """
    Download all available PDFs from a batch as a single zip file.
    """
    job = FileJobStore.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    # Collect all available PDFs
    available_pdfs = [
        (item.subject, item.pdf_path) for item in job.items if item.pdf_path and os.path.exists(item.pdf_path)
    ]

    if not available_pdfs:
        raise HTTPException(status_code=404, detail="No PDFs available for download")

    # Create zip in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for subject, pdf_path in available_pdfs:
            # Use subject as filename, sanitize for filesystem
            safe_name = "".join(c for c in subject if c.isalnum() or c in (" ", "-", "_")).strip()
            zip_file.write(pdf_path, f"{safe_name}.pdf")

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="batch_{job_id[:8]}.zip"'},
    )
