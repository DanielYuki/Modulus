# We should implement DSPy

"""
Infrastructure Layer - OpenAI Adapter

Implements AIGeneratorInterface using OpenAI API.
Uses a template-filling approach where the AI fills in placeholders
while preserving the entire LaTeX document structure.
"""

from openai import OpenAI

from src.core.config import OPENAI_API_KEY
from src.domain import AIGeneratorInterface, GenerationInput, GenerationOutput


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
            # NOTE: The 'responses' endpoint is preferred for GPT-5 models
            response = self.client.responses.create(
                model=self.MODEL,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                # 'reasoning_effort' controls depth vs. speed (low, medium, high)
                reasoning={"effort": "medium"},  # In this case, we don't need high reasoning
            )

            # Direct text access
            content = response.output_text

        # We should not need this, but keep it for now
        except Exception as e:
            # NOTE: Fallback to chat.completions if using an older SDK version
            print(f"Responses API failed, falling back: {e}")
            response = self.client.chat.completions.create(
                model=self.MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            content = response.choices[0].message.content

        return GenerationOutput(
            tex_content=content, metadata={"model": self.MODEL, "subject": input.subject, "api_mode": "responses"}
        )

    def _build_system_prompt(self, input: GenerationInput) -> str:
        """Build the system prompt with flexible content rules."""
        question_count = input.question_count

        return f"""You are an expert LaTeX content generator for Brazilian educational materials.

YOUR GOAL:
Generate a complete, high-quality exam/study guide on the subject: '{input.subject}'.

### RULES FOR LATEX STRUCTURE (STRICT):
1. **Preamble & Packages:** PRESERVE the `\\documentclass`, `\\usepackage`, and `\\headerBlock` definitions EXACTLY.
2. **Layout:** Do not remove the `multicols` or `tcolorbox` environments.
3. **Output:** Return ONLY the raw valid LaTeX code. No markdown blocks.

### RULES FOR CONTENT (STRICT):
1. **Question Count:** Generate EXACTLY {question_count} questions. No more, no less.
2. **No Labels:** Do NOT prefix questions with difficulty or category labels like "(Nível Básico)", "(MCUV — leitura direta)", "(Vetorial + desenho)", etc. Start questions directly with the problem text.
3. **Prioritize Text Questions:** Prefer text-based questions that do not require diagrams. Use TikZ diagrams ONLY when absolutely essential for the problem (e.g., geometry, circuits). Most questions should be solvable without visual aids.
4. **No External Images:** Do NOT use `\\includegraphics`. If a visual is essential, create it with TikZ.

### RULES FOR ANSWER SHEET (GABARITO) (STRICT):
1. The "Gabarito" section must contain ONLY the final answers.
2. Do NOT include explanations, step-by-step solutions, or reasoning.
3. Use a simple table format:
   | 1 | 2 | 3 | 4 | 5 |
   | answer | answer | answer | answer | answer |
4. For multi-part questions (a, b, c), list all parts: "a) X, b) Y, c) Z"

### CONTENT GUIDELINES:
- **Strategy Box:** Keep the style, update content for the specific topic.
- **Theory Box:** Concise, formula-heavy, academic tone.
- **Questions:** Mix of conceptual and calculation-heavy. Simulate exam questions from ITA, IME, FUVEST.
- **Language:** Portuguese (Brazilian).

SUBJECT: {input.subject}
"""

    def _build_user_prompt(self, input: GenerationInput) -> str:
        """User prompt that reinforces the 'Search' behavior."""
        question_count = input.question_count

        return f"""Subject: {input.subject}

INSTRUCTIONS:
1. Generate a complete LaTeX document for the topic above.
2. Create EXACTLY {question_count} questions (numbered 1 to {question_count}).
3. Do NOT add labels like "(Nível Básico)" or "(Vetorial)" before questions.
4. Prefer text-based questions. Use TikZ only when essential.
5. The Gabarito must be a simple table with ONLY the final answers, NO explanations.

TEMPLATE TO FILL:
{input.template}
"""
