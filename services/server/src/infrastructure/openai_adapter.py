# We should definitely implement DSPy

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
    # Use the specific snapshot or the alias 'gpt-5-mini'
    MODEL = "gpt-5-mini-2025-08-07"
    
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
    
    def generate(self, input: GenerationInput) -> GenerationOutput:
        if not self.client:
            raise RuntimeError("OpenAI API key not configured")
        
        system_prompt = self._build_system_prompt(input)
        user_prompt = self._build_user_prompt(input)
        
        # GPT-5 / Reasoning Model Call
        try:
            # The 'responses' endpoint is preferred for GPT-5 models
            response = self.client.responses.create(
                model=self.MODEL,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                # 'reasoning_effort' controls depth vs. speed (low, medium, high)
                reasoning={"effort": "medium"}, # In this case, we don't need high reasoning
            )
            
            # Direct text access
            content = response.output_text
            
        except Exception as e:
            # Fallback to chat.completions if using an older SDK version
            print(f"Responses API failed, falling back: {e}")
            response = self.client.chat.completions.create(
                model=self.MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            content = response.choices[0].message.content

        tex_content = self._clean_latex_response(content)
        
        return GenerationOutput(
            tex_content=tex_content,
            metadata={
                "model": self.MODEL,
                "subject": input.subject,
                "api_mode": "responses"
            }
        )
    
    def _build_system_prompt(self, input: GenerationInput) -> str:
        """Build the system prompt with flexible content rules."""
        
        return f"""You are an expert LaTeX content generator for Brazilian educational materials.

        YOUR GOAL:
        Generate a complete, high-quality exam/study guide on the subject: '{input.subject}'.

        ### RULES FOR LATEX STRUCTURE (STRICT):
        1. **Preamble & Packages:** PRESERVE the `\\documentclass`, `\\usepackage`, and `\\headerBlock` definitions EXACTLY.
        2. **Layout:** Do not remove the `multicols` or `tcolorbox` environments.
        3. **Output:** Return ONLY the raw valid LaTeX code. No markdown blocks.

        ### RULES FOR CONTENT (FLEXIBLE):
        1. **Question Count:** The template contains placeholders or example questions. **IGNORE the specific number of items.**
        - You must generate a **comprehensive set** (e.g., 8-12 questions depending on complexity).
        - You are authorized to ADD or REMOVE `\\item` entries in the `enumerate` lists.
        2. **Diversity:** Use the template's example styles (TikZ graphs, tabular options) as a *reference*, but create NEW visual elements if the question requires it.
        3. **Simulation:** The user wants "real world" exam questions. Simulate the retrieval of questions from institutions like ITA, IME, FUVEST, or SAT if relevant to the subject.

        ### CONTENT GUIDELINES:
        - **Theory:** Concise, formula-heavy, academic tone.
        - **Questions:** Mix of conceptual (text), visual (TikZ/graphs), and calculation-heavy.
        - **Language:** Portuguese (Brazilian).

        SUBJECT: {input.subject}
        """

    def _build_user_prompt(self, input: GenerationInput) -> str:
        """User prompt that reinforces the 'Search' behavior."""

        return f"""
        Subject: {input.subject}

        INSTRUCTIONS:
        1. Act as if you are searching for the best, most recent exam questions on this topic.
        2. Select questions that test deep understanding.
        3. Fill the LaTeX template below.
        4. **IMPORTANT:** The template shows specific example questions (Q1..Q7). REPLACE these with your new questions. You can generate more or fewer than shown, provided they fit the layout.

        TEMPLATE TO FILL:
        {input.template}
        """

    # IDEALLY WE SHOULD NOT NEED THIS
    def _extract_placeholders(self, template: str) -> list[str]:
        """Extract placeholder patterns from the template."""
        # Match [PLACEHOLDER_NAME] patterns
        pattern = r'\[([A-Z][A-Z0-9_\s/]+)\]'
        matches = re.findall(pattern, template)
        # Return unique placeholders
        return list(set(matches))
    
    # NOR THIS
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
