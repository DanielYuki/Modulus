"""
Infrastructure Layer - OpenAI Adapter // TODO: Implement universal AI/Agent adapter

Implements AIGeneratorInterface using OpenAI API.
Uses a template-filling approach where the AI fills in placeholders
while preserving the entire LaTeX document structure.
"""
import re
from openai import OpenAI

from src.core.config import OPENAI_API_KEY
from src.domain.entities import GenerationRequest, GeneratedContent
from src.domain.interfaces import AIGeneratorInterface


class OpenAIAdapter(AIGeneratorInterface):
    """Concrete implementation of AI generation using OpenAI."""
    
    # Model to use for generation - gpt-4-turbo is better at following complex formatting
    MODEL = "gpt-4-turbo"
    
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
    
    def generate(self, request: GenerationRequest) -> GeneratedContent:
        if not self.client:
            raise RuntimeError("OpenAI API key not configured")
        
        # Get the template content
        template_content = self._get_template_content(request)
        
        if not template_content:
            raise ValueError("No template provided for generation")
        
        # Build the prompt for template filling
        system_prompt = self._build_template_filling_prompt(request, template_content)
        user_prompt = self._build_user_prompt(request)
        
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
        
        # Parse and return the complete document
        return self._parse_response(content, request)
    
    def _get_template_content(self, request: GenerationRequest) -> str:
        """Extract template content from the request."""
        if not request.template_files:
            return ""
        
        # Get the first (and should be only) template
        if "template.tex" in request.template_files:
            return request.template_files["template.tex"]
        
        # Return the first template file found
        return list(request.template_files.values())[0] if request.template_files else ""
    
    def _build_template_filling_prompt(self, request: GenerationRequest, template: str) -> str:
        """Build the system prompt for template-filling approach."""
        
        # Extract placeholders from template for guidance
        placeholders = self._extract_placeholders(template)
        placeholder_list = "\n".join(f"  - {p}" for p in placeholders) if placeholders else "  (Analyze the template for sections to fill)"
        
        return f"""You are an expert LaTeX content generator for Brazilian educational materials and competitive exams.

YOUR TASK:
You will receive a complete LaTeX template with placeholders marked by [PLACEHOLDER_NAME] or similar patterns.
Your job is to fill in ALL placeholders with high-quality, relevant content for the given subject/topic.

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
- Maintain consistent difficulty level throughout

SUBJECT: {request.subject}
TOPIC: {request.topic}
DIFFICULTY: {request.difficulty}
NUMBER OF QUESTIONS: {request.num_questions}"""

    def _build_user_prompt(self, request: GenerationRequest) -> str:
        """Build the user prompt with template and context."""
        
        template_content = self._get_template_content(request)
        
        prompt_parts = [
            f"Generate a complete educational material for: {request.subject}",
            f"\nSpecific topic: {request.topic}",
        ]
        
        if request.reference_text:
            # Truncate if too long
            ref_text = request.reference_text[:3000] if len(request.reference_text) > 3000 else request.reference_text
            prompt_parts.append(f"\nREFERENCE MATERIAL (use for context and content ideas):\n{ref_text}")
        
        prompt_parts.append(f"\n\nTEMPLATE TO FILL:\n{template_content}")
        prompt_parts.append("\n\nReturn the complete .tex document with all placeholders filled:")
        
        return "\n".join(prompt_parts)
    

    # TODO: Review this logic
    def _extract_placeholders(self, template: str) -> list[str]:
        """Extract placeholder patterns from the template."""
        # Match [PLACEHOLDER_NAME] patterns
        pattern = r'\[([A-Z][A-Z0-9_\s/]+)\]'
        matches = re.findall(pattern, template)
        # Return unique placeholders
        return list(set(matches))
    
    def _parse_response(self, content: str, request: GenerationRequest) -> GeneratedContent:
        """Parse AI response - extract clean LaTeX document."""
        
        # Clean up the response
        latex_content = self._clean_latex_response(content)
        
        # Return as the main output file
        files = {
            "output.tex": latex_content,
        }
        
        return GeneratedContent(
            files=files,
            metadata={
                "model": self.MODEL,
                "subject": request.subject,
                "topic": request.topic,
            }
        )
    
    # TODO: This should not be necessary, but keeping it for now just for reinforcement
    def _clean_latex_response(self, content: str) -> str:
        """Clean up the AI response to extract pure LaTeX."""
        
        # Remove markdown code blocks if present
        # Handle ```latex ... ``` or ```tex ... ``` or ``` ... ```
        latex_block_pattern = r"```(?:latex|tex)?\s*\n(.*?)```"
        matches = re.findall(latex_block_pattern, content, re.DOTALL)
        
        if matches:
            # Return the first (and should be only) code block
            return matches[0].strip()
        
        # If no code blocks, clean up common AI preamble/postamble
        lines = content.split('\n')
        clean_lines = []
        in_document = False
        
        for line in lines:
            # Start capturing from \documentclass
            if line.strip().startswith('\\documentclass'):
                in_document = True
            
            if in_document:
                clean_lines.append(line)
            
            # Stop after \end{document}
            if '\\end{document}' in line:
                break
        
        if clean_lines:
            return '\n'.join(clean_lines)
        
        # If no document markers found, return as-is (might already be clean)
        return content.strip()
