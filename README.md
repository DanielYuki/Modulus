# Modulus Monorepo

A Docker-orchestrated monorepo for generating LaTeX educational content via AI.

## Quick Start

```bash
# Full Stack (Docker)
docker compose up

# Manual Development
cd services/client && bun dev
cd services/server && uv run uvicorn src.core.main:app --reload
```

## Structure

```
├── services/
│   ├── client/   # React 19 Dashboard
│   └── server/   # FastAPI Generation Engine
├── shared/       # LaTeX Templates & Assets
└── .env          # Configuration (copy from .env.example)
```
