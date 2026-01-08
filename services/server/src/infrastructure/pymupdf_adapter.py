"""
Infrastructure Layer - PyMuPDF Adapter -> TODO: Test it further

Implements PdfExtractorInterface using PyMuPDF (fitz).
"""

import fitz  # PyMuPDF

from src.domain import PdfExtractorInterface


# Not properly used yet
class PyMuPDFAdapter(PdfExtractorInterface):
    """Concrete implementation of PDF extraction using PyMuPDF."""

    def extract_text(self, pdf_bytes: bytes) -> str:
        """Extract all text content from a PDF file."""
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_parts = []

        for page_num, page in enumerate(doc, start=1):
            text = page.get_text()
            if text.strip():
                text_parts.append(f"--- Page {page_num} ---\n{text}")

        doc.close()
        return "\n\n".join(text_parts)
