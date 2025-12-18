"""
Infrastructure Layer - OpenAI Adapter

Implements AIGeneratorInterface using OpenAI API.
"""
from openai import OpenAI

from src.core.config import OPENAI_API_KEY
from src.domain.entities import GenerationRequest, GeneratedContent
from src.domain.interfaces import AIGeneratorInterface


class OpenAIAdapter(AIGeneratorInterface):
    """Concrete implementation of AI generation using OpenAI."""
    
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
    
    def generate(self, request: GenerationRequest) -> GeneratedContent:
        if not self.client:
            raise RuntimeError("OpenAI API key not configured")
        
        # Build the system prompt
        system_prompt = self._build_system_prompt(request)
        
        # Call OpenAI
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.prompt},
            ],
            temperature=0.7,
        )
        
        content = response.choices[0].message.content or ""
        
        # Parse the response into files
        return self._parse_response(content, request)
    
    def _build_system_prompt(self, request: GenerationRequest) -> str:
        template_context = ""
        if request.template_files:
            template_context = "Use these LaTeX templates as reference for formatting:\n"
            for name, content in request.template_files.items():
                template_context += f"\n--- {name} ---\n{content}\n"
        
        reference_context = ""
        if request.reference_text:
            reference_context = f"\nReference Material:\n{request.reference_text}\n"
        
        return f"""You are an expert LaTeX content generator for Brazilian competitive exams.
Subject: {request.subject}
Topic: {request.topic}
Difficulty: {request.difficulty}
Number of questions: {request.num_questions}

{template_context}
{reference_context}

Generate LaTeX code for `questoes.tex` and `gabarito.tex`.
Use the exact formatting style from the templates.
Return ONLY valid LaTeX code."""
    
    def _parse_response(self, content: str, request: GenerationRequest) -> GeneratedContent:
        # Simple parsing - can be improved
        files = {
            "questoes.tex": content,
            "gabarito.tex": "% Generated answer key\n",
        }
        return GeneratedContent(
            files=files,
            metadata={"model": "gpt-4o", "num_questions": request.num_questions}
        )
