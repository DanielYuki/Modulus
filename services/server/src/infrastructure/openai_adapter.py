"""
Infrastructure Layer - OpenAI Adapter

Implements AIGeneratorInterface using OpenAI API.
Uses a template-filling approach where the AI fills in placeholders
while preserving the entire LaTeX document structure.
"""
import re
from openai import OpenAI

from src.core.config import OPENAI_API_KEY
from src.domain.interfaces import AIGeneratorInterface, GenerationInput, GenerationOutput


class OpenAIAdapter(AIGeneratorInterface):
    """Concrete implementation of AI generation using OpenAI."""
    
    # Model to use for generation - gpt-4-turbo is better at following complex formatting
    MODEL = "gpt-4-turbo"
    
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
    
    def generate(self, input: GenerationInput) -> GenerationOutput:
        if not self.client:
            raise RuntimeError("OpenAI API key not configured")
        
        if not input.template:
            raise ValueError("No template provided for generation")
        
        # Build the prompts
        system_prompt = self._build_system_prompt(input)
        user_prompt = self._build_user_prompt(input)
        
        # Call OpenAI
        response = self.client.chat.completions.create(
            model=self.MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=4096,  # gpt-4-turbo max is 4096
        )
        
        content = response.choices[0].message.content or ""
        
        # Clean and return the LaTeX content
        tex_content = self._clean_latex_response(content)
        
        return GenerationOutput(
            tex_content=tex_content,
            metadata={
                "model": self.MODEL,
                "subject": input.subject,
            }
        )
    
    def _build_system_prompt(self, input: GenerationInput) -> str:
        """Build the system prompt for template-filling approach."""
        
        # Extract placeholders from template for guidance
        placeholders = self._extract_placeholders(input.template)
        placeholder_list = "\n".join(f"  - {p}" for p in placeholders) if placeholders else "  (Analyze the template for sections to fill)"
        
        return f"""You are an expert LaTeX content generator for Brazilian educational materials and competitive exams.

YOUR TASK:
You will receive a complete LaTeX template with placeholders marked by [PLACEHOLDER_NAME] or similar patterns.
Your job is to fill in ALL placeholders with high-quality, relevant content for the given subject.

CRITICAL RULES:
1. Return ONLY the complete .tex file - no markdown code blocks, no explanations, no extra text
2. PRESERVE ALL LaTeX commands, packages, environments, and document structure EXACTLY as provided
3. DO NOT modify any \\usepackage, \\documentclass, \\newcommand, or \\newtcolorbox definitions
4. DO NOT add or remove any LaTeX environments - only fill in the content within them
5. All placeholder text like [PLACEHOLDER] should be replaced with appropriate content
6. The output MUST be a valid, directly compilable LaTeX document
7. Write content in Portuguese (Brazilian) unless specified otherwise

PLACEHOLDERS TO FILL:
{placeholder_list}

CONTENT GUIDELINES:
- For theory sections: Provide clear, concise explanations with formulas
- For questions: Create challenging, exam-style questions appropriate for competitive exams
- For answer keys: Provide correct answers matching the questions
- For strategy sections: Include practical tips and methods

SUBJECT: {input.subject}"""

    def _build_user_prompt(self, input: GenerationInput) -> str:
        """Build the user prompt with template and context."""
        
        prompt_parts = [
            f"Generate a complete educational material for: {input.subject}",
        ]
        
        if input.instructions:
            prompt_parts.append(f"\nAdditional instructions: {input.instructions}")
        
        if input.reference_text:
            # Truncate if too long
            ref_text = input.reference_text[:3000] if len(input.reference_text) > 3000 else input.reference_text
            prompt_parts.append(f"\nREFERENCE MATERIAL (use for context and content ideas):\n{ref_text}")
        
        prompt_parts.append(f"\n\nTEMPLATE TO FILL:\n{input.template}")
        prompt_parts.append("\n\nReturn the complete .tex document with all placeholders filled:")
        
        return "\n".join(prompt_parts)

    def _extract_placeholders(self, template: str) -> list[str]:
        """Extract placeholder patterns from the template."""
        # Match [PLACEHOLDER_NAME] patterns
        pattern = r'\[([A-Z][A-Z0-9_\s/]+)\]'
        matches = re.findall(pattern, template)
        # Return unique placeholders
        return list(set(matches))
    
    def _clean_latex_response(self, content: str) -> str:
        """Clean up the AI response to extract pure LaTeX."""
        
        # Remove markdown code blocks if present
        latex_block_pattern = r"```(?:latex|tex)?\s*\n(.*?)```"
        matches = re.findall(latex_block_pattern, content, re.DOTALL)
        
        if matches:
            return matches[0].strip()
        
        # If no code blocks, clean up common AI preamble/postamble
        lines = content.split('\n')
        clean_lines = []
        in_document = False
        
        for line in lines:
            if line.strip().startswith('\\documentclass'):
                in_document = True
            
            if in_document:
                clean_lines.append(line)
            
            if '\\end{document}' in line:
                break
        
        if clean_lines:
            return '\n'.join(clean_lines)
        
        return content.strip()

