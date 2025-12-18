"""
Domain Layer - Core Entities

Pure Python dataclasses. NO external dependencies.
"""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class GenerationRequest:
    """Represents a request to generate LaTeX content."""
    prompt: str
    subject: str
    topic: str
    difficulty: str = "medium"
    num_questions: int = 5
    reference_text: Optional[str] = None
    template_files: dict[str, str] = field(default_factory=dict)


@dataclass
class GeneratedContent:
    """Represents the AI-generated LaTeX files."""
    files: dict[str, str]  # filename -> content
    metadata: dict = field(default_factory=dict)
