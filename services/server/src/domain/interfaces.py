"""
Domain Layer - Abstract Interfaces

Defines contracts that infrastructure adapters MUST implement.
"""
from abc import ABC, abstractmethod
from src.domain.entities import GenerationRequest, GeneratedContent


class AIGeneratorInterface(ABC):
    """Contract for AI content generation."""
    
    @abstractmethod
    def generate(self, request: GenerationRequest) -> GeneratedContent:
        """Generate LaTeX content based on the request."""
        pass


class PdfExtractorInterface(ABC):
    """Contract for PDF text extraction."""
    
    @abstractmethod
    def extract_text(self, pdf_bytes: bytes) -> str:
        """Extract text content from a PDF file."""
        pass
