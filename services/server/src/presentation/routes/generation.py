"""
Presentation Layer - Generation Routes

FastAPI router for content generation endpoints.
"""
from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional

from src.presentation.schemas.generation import GenerateRequest, GenerateResponse
from src.application.content_generation import GenerateContentUseCase
from src.infrastructure.openai_adapter import OpenAIAdapter
from src.infrastructure.pymupdf_adapter import PyMuPDFAdapter

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_content(
    prompt: str = Form(...),
    subject: str = Form(...),
    topic: str = Form(...),
    difficulty: str = Form("medium"),
    num_questions: int = Form(5),
    reference_pdf: Optional[UploadFile] = File(None),
    template_main: Optional[UploadFile] = File(None),
    template_questoes: Optional[UploadFile] = File(None),
):
    """
    Generate LaTeX content based on input parameters.
    
    - Upload a reference PDF for context
    - Upload template files to copy the formatting style
    - Receive generated .tex files
    """
    # Read uploaded files
    pdf_bytes = None
    if reference_pdf:
        pdf_bytes = await reference_pdf.read()
    
    template_files = {}
    if template_main:
        template_files["main.tex"] = (await template_main.read()).decode("utf-8")
    if template_questoes:
        template_files["questoes.tex"] = (await template_questoes.read()).decode("utf-8")
    
    # Wire up dependencies (Dependency Injection)
    use_case = GenerateContentUseCase(
        ai_generator=OpenAIAdapter(),
        pdf_extractor=PyMuPDFAdapter(),
    )
    
    # Execute
    result = use_case.execute(
        prompt=prompt,
        subject=subject,
        topic=topic,
        difficulty=difficulty,
        num_questions=num_questions,
        template_files=template_files,
        reference_pdf=pdf_bytes,
    )
    
    return GenerateResponse(files=result.files, metadata=result.metadata)
