"""
Infrastructure Layer - OpenAI Adapter

Implements AIGeneratorInterface using OpenAI API.
"""
import re
from openai import OpenAI

from src.core.config import OPENAI_API_KEY
from src.domain.entities import GenerationRequest, GeneratedContent
from src.domain.interfaces import AIGeneratorInterface


# Standard LaTeX document wrapper
LATEX_DOCUMENT_WRAPPER = r"""\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[brazil]{babel}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{enumitem}
\usepackage{booktabs}
\usepackage{geometry}
\usepackage{float}
\usepackage{tikz}
\usepackage{graphicx}
\geometry{margin=2.5cm}

\begin{document}

%CONTENT%

\end{document}
"""


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

IMPORTANT FORMATTING RULES:
1. Return ONLY the LaTeX content for questions - no markdown, no explanations
2. Do NOT include \\documentclass, \\usepackage, \\begin{{document}}, or \\end{{document}}
3. Start directly with \\section* or the question content
4. Use \\begin{{enumerate}} for question lists
5. For math, use $...$ for inline and \\[...\\] or equation environment for display

Generate the LaTeX content for questions on the given topic."""
    
    def _parse_response(self, content: str, request: GenerationRequest) -> GeneratedContent:
        """Parse AI response and create complete LaTeX documents."""
        
        # Extract LaTeX from markdown code blocks if present
        latex_content = self._extract_latex_from_markdown(content)
        
        # Wrap in document structure
        full_document = LATEX_DOCUMENT_WRAPPER.replace("%CONTENT%", latex_content)
        
        files = {
            "questoes.tex": full_document,
            "gabarito.tex": self._create_answer_key_stub(),
        }
        return GeneratedContent(
            files=files,
            metadata={"model": "gpt-4o", "num_questions": request.num_questions}
        )
    
    def _extract_latex_from_markdown(self, content: str) -> str:
        """Extract LaTeX code from markdown code blocks."""
        
        # Try to find latex code block
        latex_block_pattern = r"```(?:latex|tex)?\s*\n(.*?)```"
        matches = re.findall(latex_block_pattern, content, re.DOTALL)
        
        if matches:
            # Return all matched blocks joined
            return "\n\n".join(matches)
        
        # If no code blocks, try to clean up the text
        # Remove ### headers
        content = re.sub(r"###.*?\n", "", content)
        # Remove ``` if orphaned
        content = content.replace("```latex", "").replace("```tex", "").replace("```", "")
        # Remove common markdown phrases
        content = re.sub(r"Certainly!.*?\n", "", content)
        content = re.sub(r"Here is.*?\n", "", content)
        content = re.sub(r"Below is.*?\n", "", content)
        
        return content.strip()
    
    def _create_answer_key_stub(self) -> str:
        """Create a basic answer key document."""
        return LATEX_DOCUMENT_WRAPPER.replace(
            "%CONTENT%",
            r"""\section*{Gabarito}

\begin{center}
\textit{Respostas serão geradas automaticamente.}
\end{center}
"""
        )
