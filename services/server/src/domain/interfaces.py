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


class LatexCompilerInterface(ABC):
    """Contract for LaTeX to PDF compilation."""
    
    @abstractmethod
    def compile_to_pdf(self, tex_content: str, output_dir: str, filename: str) -> str:
        """
        Compile LaTeX content to PDF.
        
        Args:
            tex_content: The LaTeX source code
            output_dir: Directory to save the PDF
            filename: Base filename (without extension)
            
        Returns:
            Path to the generated PDF file
            
        Raises:
            CompilationError: If pdflatex fails
        """
        pass


class CompilationError(Exception):
    """Raised when LaTeX compilation fails."""
    pass
