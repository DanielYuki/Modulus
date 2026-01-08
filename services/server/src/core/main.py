"""
Modulus Server - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.presentation.routes import batch_router

app = FastAPI(
    title="Modulus API",
    description="LaTeX Content Generation Engine",
    version="0.1.0",
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(batch_router, prefix="/api", tags=["Batch"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
