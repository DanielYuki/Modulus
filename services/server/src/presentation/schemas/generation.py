"""
Presentation Layer - Pydantic Schemas (DTOs)

Request/Response models for API endpoints.
"""
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """Request body for /api/generate endpoint."""
    prompt: str = Field(..., description="User prompt for generation")
    subject: str = Field(..., description="Subject area (e.g., Mathematics)")
    topic: str = Field(..., description="Specific topic (e.g., Logarithms)")
    difficulty: str = Field(default="medium", description="Difficulty level")
    num_questions: int = Field(default=5, ge=1, le=20)


class FileContent(BaseModel):
    """Represents a single generated file."""
    filename: str
    content: str


class GenerateResponse(BaseModel):
    """Response body for /api/generate endpoint."""
    files: dict[str, str]
    metadata: dict = {}
