"""
Application Layer - Batch Generation Use Case

Orchestrates batch generation of LaTeX content for multiple subjects.
"""
import uuid
import os
from typing import Optional

from src.domain.batch_entities import BatchJob, BatchItem, JobStatus, ItemStatus
from src.domain.interfaces import (
    AIGeneratorInterface,
    PdfExtractorInterface,
    LatexCompilerInterface,
    CompilationError,
    GenerationInput,
)
from src.infrastructure.file_job_store import FileJobStore


class BatchGenerationUseCase:
    """Use Case: Generate LaTeX content for multiple subjects in batch."""
    
    def __init__(
        self,
        ai_generator: AIGeneratorInterface,
        pdf_extractor: PdfExtractorInterface,
        latex_compiler: LatexCompilerInterface,
        output_dir: str = "/tmp/modulus_output",
    ):
        self.ai_generator = ai_generator
        self.pdf_extractor = pdf_extractor
        self.latex_compiler = latex_compiler
        self.output_dir = output_dir
    
    def create_batch(
        self,
        subjects: list[str],
        template_content: str,
        reference_pdf: Optional[bytes] = None,
        instructions: Optional[str] = None,
    ) -> BatchJob:
        """
        Create a new batch job.
        
        Args:
            subjects: List of subjects to generate content for
            template_content: The .tex template content
            reference_pdf: Optional PDF bytes for context extraction
            instructions: Optional user instructions
            
        Returns:
            The created BatchJob
        """
        # Extract text from PDF if provided
        source_pdf_text = None
        if reference_pdf:
            source_pdf_text = self.pdf_extractor.extract_text(reference_pdf)
        
        # Create job
        job = BatchJob(
            id=str(uuid.uuid4()),
            subjects=subjects,
            template_content=template_content,
            source_pdf_text=source_pdf_text,
            instructions=instructions,
        )
        
        # Store job
        FileJobStore.create_job(job)
        
        return job
    
    def process_batch(self, job_id: str) -> BatchJob:
        """
        Process all items in a batch job.
        
        Args:
            job_id: The job ID to process
            
        Returns:
            The updated BatchJob
        """
        job = FileJobStore.get_job(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        job.status = JobStatus.PROCESSING
        FileJobStore.update_job(job)
        
        # Create job output directory
        job_output_dir = os.path.join(self.output_dir, job_id)
        os.makedirs(job_output_dir, exist_ok=True)
        
        all_succeeded = True
        
        for idx, item in enumerate(job.items):
            try:
                # Generate tex content
                item.status = ItemStatus.GENERATING
                FileJobStore.update_job(job)
                
                tex_content = self._generate_tex_for_subject(
                    subject=item.subject,
                    template=job.template_content,
                    reference_text=job.source_pdf_text,
                    instructions=job.instructions,
                )
                item.tex_content = tex_content
                
                # Compile to PDF
                item.status = ItemStatus.COMPILING
                FileJobStore.update_job(job)
                
                filename = f"item_{idx}_{self._sanitize_filename(item.subject)}"
                pdf_path = self.latex_compiler.compile_to_pdf(
                    tex_content=tex_content,
                    output_dir=job_output_dir,
                    filename=filename,
                )
                item.pdf_path = pdf_path
                item.status = ItemStatus.DONE
                
            except CompilationError as e:
                item.status = ItemStatus.ERROR
                item.error = str(e)
                all_succeeded = False
            except Exception as e:
                item.status = ItemStatus.ERROR
                item.error = f"Generation failed: {str(e)}"
                all_succeeded = False
            
            FileJobStore.update_job(job)
        
        job.status = JobStatus.COMPLETED if all_succeeded else JobStatus.FAILED
        FileJobStore.update_job(job)
        
        return job
    
    def get_status(self, job_id: str) -> Optional[BatchJob]:
        """Get the current status of a batch job."""
        return FileJobStore.get_job(job_id)
    
    def retry_item(self, job_id: str, item_index: int) -> BatchJob:
        """
        Retry a failed item, passing the previous error to the AI for context.
        
        Args:
            job_id: The job ID
            item_index: Index of the item to retry
            
        Returns:
            The updated BatchJob
        """
        job = FileJobStore.get_job(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        if item_index < 0 or item_index >= len(job.items):
            raise ValueError(f"Item {item_index} not found in job")
        
        item = job.items[item_index]
        previous_error = item.error
        
        # Reset item state
        item.status = ItemStatus.PENDING
        item.error = None
        item.tex_content = None
        item.pdf_path = None
        
        # Update job status to processing
        job.status = JobStatus.PROCESSING
        FileJobStore.update_job(job)
        
        # Create job output directory
        job_output_dir = os.path.join(self.output_dir, job_id)
        os.makedirs(job_output_dir, exist_ok=True)
        
        try:
            # Generate tex content with error context
            item.status = ItemStatus.GENERATING
            FileJobStore.update_job(job)
            
            # Build enhanced instructions with error context
            retry_instructions = job.instructions or ""
            if previous_error:
                retry_instructions += f"\n\nPREVIOUS ATTEMPT FAILED with error:\n{previous_error}\n\nPlease fix the issue that caused this error. Ensure the LaTeX is valid and compilable."
            
            tex_content = self._generate_tex_for_subject(
                subject=item.subject,
                template=job.template_content,
                reference_text=job.source_pdf_text,
                instructions=retry_instructions.strip() or None,
            )
            item.tex_content = tex_content
            
            # Compile to PDF
            item.status = ItemStatus.COMPILING
            FileJobStore.update_job(job)
            
            filename = f"item_{item_index}_{self._sanitize_filename(item.subject)}"
            pdf_path = self.latex_compiler.compile_to_pdf(
                tex_content=tex_content,
                output_dir=job_output_dir,
                filename=filename,
            )
            item.pdf_path = pdf_path
            item.status = ItemStatus.DONE
            
        except CompilationError as e:
            item.status = ItemStatus.ERROR
            item.error = str(e)
        except Exception as e:
            item.status = ItemStatus.ERROR
            item.error = f"Generation failed: {str(e)}"
        
        FileJobStore.update_job(job)
        
        # Update overall job status
        all_done = all(i.status == ItemStatus.DONE for i in job.items)
        any_error = any(i.status == ItemStatus.ERROR for i in job.items)
        
        if all_done:
            job.status = JobStatus.COMPLETED
        elif any_error:
            job.status = JobStatus.FAILED
        else:
            job.status = JobStatus.PROCESSING
        
        FileJobStore.update_job(job)
        
        return job
    
    def _generate_tex_for_subject(
        self,
        subject: str,
        template: str,
        reference_text: Optional[str],
        instructions: Optional[str],
    ) -> str:
        """
        Generate a complete LaTeX document for a single subject.
        
        Uses the template-filling approach where the AI fills in all
        placeholders while preserving the entire document structure.
        """
        # Create the generation input
        gen_input = GenerationInput(
            subject=subject,
            template=template,
            reference_text=reference_text,
            instructions=instructions,
        )
        
        # Generate the content
        result = self.ai_generator.generate(gen_input)
        
        return result.tex_content
    
    def _sanitize_filename(self, name: str) -> str:
        """Sanitize a string for use in filenames."""
        # Remove/replace invalid characters
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            name = name.replace(char, '_')
        # Limit length and strip whitespace
        return name[:50].strip().replace(' ', '_')
