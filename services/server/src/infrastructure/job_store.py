"""
Infrastructure Layer - In-Memory Job Store

Stores batch jobs in memory. Can be swapped for Redis later.
"""
from typing import Optional
from src.domain.batch_entities import BatchJob


class InMemoryJobStore:
    """In-memory storage for batch jobs."""
    
    _jobs: dict[str, BatchJob] = {}
    
    @classmethod
    def create_job(cls, job: BatchJob) -> BatchJob:
        """Store a new job."""
        cls._jobs[job.id] = job
        return job
    
    @classmethod
    def get_job(cls, job_id: str) -> Optional[BatchJob]:
        """Retrieve a job by ID."""
        return cls._jobs.get(job_id)
    
    @classmethod
    def update_job(cls, job: BatchJob) -> BatchJob:
        """Update an existing job."""
        cls._jobs[job.id] = job
        return job
    
    @classmethod
    def delete_job(cls, job_id: str) -> bool:
        """Delete a job by ID."""
        if job_id in cls._jobs:
            del cls._jobs[job_id]
            return True
        return False
    
    @classmethod
    def list_jobs(cls) -> list[BatchJob]:
        """List all jobs."""
        return list(cls._jobs.values())
    
    @classmethod
    def clear_all(cls) -> None:
        """Clear all jobs (useful for testing)."""
        cls._jobs.clear()
