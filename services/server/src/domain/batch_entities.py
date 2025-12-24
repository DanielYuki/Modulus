"""
Domain Layer - Batch Entities

Pure Python dataclasses for batch generation. NO external dependencies.
"""
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum
from datetime import datetime


class JobStatus(str, Enum):
    """Status of a batch job."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ItemStatus(str, Enum):
    """Status of a single batch item."""
    PENDING = "pending"
    GENERATING = "generating"
    COMPILING = "compiling"
    DONE = "done"
    ERROR = "error"


@dataclass
class BatchItem:
    """Single subject within a batch."""
    subject: str
    status: ItemStatus = ItemStatus.PENDING
    tex_content: Optional[str] = None
    pdf_path: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self) -> dict:
        """Serialize to dictionary for JSON storage."""
        return {
            "subject": self.subject,
            "status": self.status.value,
            "tex_content": self.tex_content,
            "pdf_path": self.pdf_path,
            "error": self.error,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "BatchItem":
        """Deserialize from dictionary."""
        return cls(
            subject=data["subject"],
            status=ItemStatus(data["status"]),
            tex_content=data.get("tex_content"),
            pdf_path=data.get("pdf_path"),
            error=data.get("error"),
        )


@dataclass
class BatchJob:
    """Represents a batch generation job."""
    id: str
    subjects: list[str]
    template_content: str
    source_pdf_text: Optional[str] = None
    status: JobStatus = JobStatus.PENDING
    items: list[BatchItem] = field(default_factory=list)
    instructions: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        """Initialize items from subjects if not provided."""
        if not self.items and self.subjects:
            self.items = [BatchItem(subject=s) for s in self.subjects]

    def to_dict(self) -> dict:
        """Serialize to dictionary for JSON storage."""
        return {
            "id": self.id,
            "subjects": self.subjects,
            "template_content": self.template_content,
            "source_pdf_text": self.source_pdf_text,
            "status": self.status.value,
            "items": [item.to_dict() for item in self.items],
            "instructions": self.instructions,
            "created_at": self.created_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "BatchJob":
        """Deserialize from dictionary."""
        job = cls(
            id=data["id"],
            subjects=data["subjects"],
            template_content=data["template_content"],
            source_pdf_text=data.get("source_pdf_text"),
            status=JobStatus(data["status"]),
            items=[BatchItem.from_dict(i) for i in data.get("items", [])],
            instructions=data.get("instructions"),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else datetime.now(),
        )
        return job
