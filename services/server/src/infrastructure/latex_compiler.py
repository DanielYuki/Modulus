"""
Infrastructure Layer - LaTeX Compiler Adapter

Implements LatexCompilerInterface using pdflatex.
"""
import os
import subprocess
import tempfile
from pathlib import Path

from src.domain.interfaces import LatexCompilerInterface, CompilationError


class PdfLatexAdapter(LatexCompilerInterface):
    """Concrete implementation of LaTeX compilation using pdflatex."""
    
    def compile_to_pdf(self, tex_content: str, output_dir: str, filename: str) -> str:
        """
        Compile LaTeX content to PDF using pdflatex.
        
        Args:
            tex_content: The LaTeX source code
            output_dir: Directory to save the PDF
            filename: Base filename (without extension)
            
        Returns:
            Path to the generated PDF file
        """
        # Ensure output directory exists
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Create a temp directory for compilation
        with tempfile.TemporaryDirectory() as temp_dir:
            tex_path = os.path.join(temp_dir, f"{filename}.tex")
            
            # Write the tex content
            with open(tex_path, "w", encoding="utf-8") as f:
                f.write(tex_content)
            
            # Run pdflatex (twice for references)
            try:
                for _ in range(2):  # Run twice for cross-references
                    result = subprocess.run(
                        [
                            "pdflatex",
                            "-interaction=nonstopmode",
                            "-halt-on-error",
                            f"-output-directory={temp_dir}",
                            tex_path,
                        ],
                        capture_output=True,
                        text=True,
                        timeout=60,  # 60 second timeout
                    )
                    
                    if result.returncode != 0:
                        # Extract error message from log
                        error_msg = self._extract_error(result.stdout, result.stderr)
                        raise CompilationError(f"pdflatex failed: {error_msg}")
                
                # Move PDF to output directory
                temp_pdf = os.path.join(temp_dir, f"{filename}.pdf")
                final_pdf = os.path.join(output_dir, f"{filename}.pdf")
                
                if not os.path.exists(temp_pdf):
                    raise CompilationError("PDF was not generated")
                
                # Copy file to destination
                with open(temp_pdf, "rb") as src, open(final_pdf, "wb") as dst:
                    dst.write(src.read())
                
                return final_pdf
                
            except subprocess.TimeoutExpired:
                raise CompilationError("Compilation timed out after 60 seconds")
            except FileNotFoundError:
                raise CompilationError(
                    "pdflatex not found. Please install TeX Live: "
                    "brew install --cask mactex (macOS) or apt install texlive-full (Linux)"
                )
    
    def _extract_error(self, stdout: str, stderr: str) -> str:
        """Extract meaningful error message from pdflatex output."""
        # Look for error lines in stdout (pdflatex writes errors there)
        lines = stdout.split("\n")
        for i, line in enumerate(lines):
            if line.startswith("!"):
                # Return error and next few lines for context
                return "\n".join(lines[i:i+5])
        
        # Fallback to stderr or generic message
        if stderr:
            return stderr[:500]
        return "Unknown compilation error"
