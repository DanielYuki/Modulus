"""
Domain Layer - Batch Entities

Pure Python dataclasses for batch generation. NO external dependencies.
"""
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


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
    
    def __post_init__(self):
        """Initialize items from subjects if not provided."""
        if not self.items and self.subjects:
            self.items = [BatchItem(subject=s) for s in self.subjects]
