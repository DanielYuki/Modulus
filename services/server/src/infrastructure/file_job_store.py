"""
Infrastructure Layer - File-Based Job Store (MVP and internal testings)

Stores batch jobs as JSON files in .modulus/jobs/ directory. # ? Change directory
Provides persistence across server restarts without needing a database.
"""

import json
from pathlib import Path

from src.domain import BatchJob


class FileJobStore:
    """File-based storage for batch jobs."""

    # Store jobs in project root .modulus/jobs/
    _base_dir: Path = Path(__file__).parent.parent.parent.parent.parent / ".modulus" / "jobs"

    @classmethod
    def _ensure_dir(cls) -> None:
        """Ensure the jobs directory exists."""
        cls._base_dir.mkdir(parents=True, exist_ok=True)

    @classmethod
    def _job_path(cls, job_id: str) -> Path:
        """Get the file path for a job."""
        return cls._base_dir / f"{job_id}.json"

    @classmethod
    def create_job(cls, job: BatchJob) -> BatchJob:
        """Store a new job."""
        cls._ensure_dir()
        with open(cls._job_path(job.id), "w", encoding="utf-8") as f:
            json.dump(job.to_dict(), f, indent=2, ensure_ascii=False)
        return job

    @classmethod
    def get_job(cls, job_id: str) -> BatchJob | None:
        """Retrieve a job by ID."""
        path = cls._job_path(job_id)
        if not path.exists():
            return None
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return BatchJob.from_dict(data)

    @classmethod
    def update_job(cls, job: BatchJob) -> BatchJob:
        """Update an existing job."""
        cls._ensure_dir()
        with open(cls._job_path(job.id), "w", encoding="utf-8") as f:
            json.dump(job.to_dict(), f, indent=2, ensure_ascii=False)
        return job

    @classmethod
    def delete_job(cls, job_id: str) -> bool:
        """Delete a job by ID."""
        path = cls._job_path(job_id)
        if path.exists():
            path.unlink()
            return True
        return False

    @classmethod
    def list_jobs(cls) -> list[BatchJob]:
        """List all jobs, sorted by creation date (newest first)."""
        cls._ensure_dir()
        jobs = []
        for file_path in cls._base_dir.glob("*.json"):
            try:
                with open(file_path, encoding="utf-8") as f:
                    data = json.load(f)
                jobs.append(BatchJob.from_dict(data))
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Warning: Could not load job from {file_path}: {e}")
                continue
        return sorted(jobs, key=lambda j: j.created_at, reverse=True)

    @classmethod
    def clear_all(cls) -> None:
        """Clear all jobs (useful for testing)."""
        cls._ensure_dir()
        for file_path in cls._base_dir.glob("*.json"):
            file_path.unlink()
