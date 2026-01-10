# Modulus

A monorepo for generating LaTeX educational content via AI. This project enables batch generation of LaTeX documents from PDF source materials, using AI to create customized educational content based on templates.

## Overview

Modulus is designed to streamline the creation of educational materials by:

- **Extracting content** from source PDF documents (TBD)
- **Generating LaTeX** using AI (OpenAI GPT) based on customizable templates
- **Compiling PDFs** from the generated LaTeX files
- **Tracking batch jobs** with real-time progress updates via SSE (TBD)

---

## Quick Start

### Docker (WIP)

```bash
# Copy environment configuration
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-your-key-here

# Start the full stack
docker compose up
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:8000`.

---

## Manual Development (Recommended)

### Prerequisites

- **Node.js** (v18+) or **Bun** (recommended)
- **Python 3.11+** with **uv** package manager
- **pdflatex** (for LaTeX compilation)

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Configure your API keys in .env
```

### 2. Install Backend Dependencies

```bash
cd services/server

# Install Python dependencies with uv (creates virtual environment automatically)
uv sync
```

### 3. Start the Backend Server

```bash
# Start the development server with auto-reload
uv run uvicorn src.core.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 4. Install Frontend Dependencies

```bash
cd services/client

# Install dependencies using Bun
bun install
```

### 5. Start the Frontend Client

```bash
# Start the development server with HMR (Hot Module Replacement)
bun dev
```

The client will be available at `http://localhost:5173`.

---

## Project Structure

```
modulus/
├── services/
│   ├── client/                    # React 19 + Vite Frontend
│   │   ├── src/
│   │   │   ├── app/               # Application modules & pages
│   │   │   ├── atomic/            # Atomic design components (atoms, molecules, organisms)
│   │   │   ├── assets/            # CSS, fonts, and static assets
│   │   │   ├── root.router.tsx    # Application routing
│   │   │   └── main.tsx           # Entry point
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── server/                    # FastAPI Backend (Clean Architecture)
│       ├── src/
│       │   ├── core/              # App configuration & entry point
│       │   ├── domain/            # Business entities & interfaces
│       │   ├── application/       # Use cases & business logic
│       │   ├── infrastructure/    # External services (OpenAI, file storage)
│       │   └── presentation/      # API routes & controllers
│       ├── pyproject.toml
│       └── Dockerfile
│
├── shared/                        # Shared assets & templates
│   └── template.tex               # Default LaTeX template
│
├── .modulus/                      # Runtime data (jobs, generated files)
│   └── jobs/                      # Persisted batch job data
│
├── docker-compose.yml             # Container orchestration
├── .env.example                   # Environment template
└── README.md
```

---

## Architecture

### Frontend (React 19 + Vite)

- **Atomic Design**: Components organized as atoms → molecules → organisms
- **TanStack Query**: Server state management with caching
- **React Router v7**: Client-side routing
- **Tailwind CSS v4**: Utility-first styling

### Backend (FastAPI + Clean Architecture)

- **Domain Layer**: Business entities (`GenerationInput`, `GenerationOutput`)
- **Application Layer**: Use cases (`BatchGenerationUseCase`)
- **Infrastructure Layer**: Adapters for OpenAI, file storage
- **Presentation Layer**: REST API endpoints

---

## Environment Variables

| Variable         | Description                 | Required |
| ---------------- | --------------------------- | -------- |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4    | Yes      |
| `VITE_API_URL`   | Backend URL for the client  | Yes      |
| `SERVER_PORT`    | Backend server port         | No       |
| `SERVER_HOST`    | Backend server host         | No       |
| `SHARED_DIR`     | Path to shared assets       | No       |

---

## Development Scripts

### Client (Frontend)

All commands should be run from `services/client/`:

```bash
# Development
bun dev              # Start dev server with HMR on http://localhost:5173
bun build            # Production build (type-check + build)
bun preview          # Preview production build locally

# Code Quality
bun check            # Run Biome linter + formatter (auto-fix)
bun lint             # Run Biome linter only (no auto-fix)
```

### Server (Backend)

All commands should be run from `services/server/`:

```bash
# Development
uv sync                                            # Install/sync dependencies
uv sync --group dev                                # Install dev dependencies (ruff, pytest)
uv run uvicorn src.core.main:app --reload          # Start dev server with auto-reload

# Code Quality
uv run ruff check .                                # Check for linting errors
uv run ruff check --fix .                          # Auto-fix linting errors
uv run ruff format .                               # Format code with Ruff
```
