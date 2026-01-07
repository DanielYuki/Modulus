"""
Modulus Server - Configuration Module

Loads environment variables from the root .env file.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Resolve path to root .env (works for both Docker and local)
# Path: config.py -> core -> src -> server -> services -> root
_env_path = Path(__file__).parents[4] / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

# --- AI Provider ---
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

# --- Paths ---
# Docker sets SHARED_DIR=/app/shared; local defaults to relative
SHARED_DIR: Path = Path(os.getenv("SHARED_DIR", str(Path(__file__).parents[2] / "shared")))

# --- Server ---
SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
