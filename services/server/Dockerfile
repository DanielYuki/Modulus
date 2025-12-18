# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files first (for caching)
COPY services/server/pyproject.toml services/server/uv.lock* ./

# Install dependencies
RUN uv sync --frozen || uv sync

# Copy source code
COPY services/server/ .

# Expose port
EXPOSE 8000

# Run with hot reload in dev
CMD ["uv", "run", "uvicorn", "src.core.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
