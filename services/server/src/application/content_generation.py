"""
Application Layer - Content Generation Use Case

Orchestrates the generation flow using domain interfaces.
"""
from src.domain.entities import GenerationRequest, GeneratedContent
from src.domain.interfaces import AIGeneratorInterface, PdfExtractorInterface


class GenerateContentUseCase:
    """Use Case: Generate LaTeX content from input."""
    
    def __init__(
        self,
        ai_generator: AIGeneratorInterface,
        pdf_extractor: PdfExtractorInterface,
    ):
        self.ai_generator = ai_generator
        self.pdf_extractor = pdf_extractor
    
    def execute(
        self,
        prompt: str,
        subject: str,
        topic: str,
        difficulty: str = "medium",
        num_questions: int = 5,
        template_files: dict[str, str] | None = None,
        reference_pdf: bytes | None = None,
    ) -> GeneratedContent:
        """Execute the content generation pipeline."""
        
        # Extract text from PDF if provided
        reference_text = None
        if reference_pdf:
            reference_text = self.pdf_extractor.extract_text(reference_pdf)
        
        # Build the request
        request = GenerationRequest(
            prompt=prompt,
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions,
            reference_text=reference_text,
            template_files=template_files or {},
        )
        
        # Generate content
        return self.ai_generator.generate(request)
