"""
Presentation Layer - Batch Schemas (DTOs)

Request/Response models for batch API endpoints.
"""

from pydantic import BaseModel, Field


class CreateBatchRequest(BaseModel):
    """Request body for POST /api/batch endpoint."""

    subjects: list[str] = Field(..., description="List of subjects to generate content for")
    instructions: str | None = Field(None, description="Optional instructions for generation")


class BatchItemResponse(BaseModel):
    """Response model for a single batch item."""

    index: int
    subject: str
    status: str  # pending, generating, compiling, done, error
    tex_available: bool = False
    pdf_available: bool = False
    error: str | None = None


class BatchStatusResponse(BaseModel):
    """Response body for GET /api/batch/{job_id} endpoint."""

    id: str
    status: str  # pending, processing, completed, failed
    total_items: int
    completed_items: int
    failed_items: int
    items: list[BatchItemResponse]


class CreateBatchResponse(BaseModel):
    """Response body for POST /api/batch endpoint."""

    job_id: str
    message: str


class BatchListItem(BaseModel):
    """Summary of a batch for list view."""

    id: str
    status: str  # pending, processing, completed, failed
    total_items: int
    completed_items: int
    failed_items: int
    created_at: str  # ISO format timestamp
