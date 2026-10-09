# dotmind (0)

> **Codebase Intelligence, Multi-Repository RAG, and AI Conversational Assistant.**

dotmind is an asynchronous RAG (Retrieval-Augmented Generation) assistant that indexes GitHub repositories into FAISS vector databases and lets developers query codebases with real-time token streaming, exact GitHub line-number citations, and multi-user authentication.

---

## Features

- **Multi-Repository Isolation**: Index multiple codebases (`pallets/click`, `encode/starlette`, etc.) with dedicated FAISS vector indexes and hot-swap between them in milliseconds.
- **Asynchronous Ingestion Pipeline**: Background worker clones, parses, chunks, and embeds repositories with live stage and percentage progress tracking.
- **OpenAI Vectorization**: Powered by OpenAI `text-embedding-3-small` (1536-dimensional embeddings) and `gpt-4o-mini` for fast, cost-effective reasoning.
- **Server-Sent Events (SSE) Streaming**: Token-by-token real-time streaming endpoint (`POST /chat/stream`).
- **Exact Line-Number GitHub Links**: Generates direct GitHub permalinks to the exact code lines (e.g. `https://github.com/encode/starlette/blob/main/starlette/routing.py#L45-L68`).
- **Modern Authentication (Clerk)**: Seamless authentication with Google, GitHub, or Email via Clerk, verified using cryptographic RS256 JWKS tokens.
- **SQLModel ORM & SQLite**: Clean database persistence for users and repository metadata.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **API Framework** | FastAPI (ASGI) + Uvicorn |
| **LLM & Embeddings** | OpenAI `gpt-4o-mini` & `text-embedding-3-small` |
| **Vector Search** | FAISS (`faiss-cpu`, `IndexFlatIP`) |
| **Git Ingestion** | GitPython |
| **Authentication** | Clerk (RS256 JWT Verification via PyJWT) |
| **Database ORM** | SQLModel (SQLAlchemy + Pydantic) with SQLite |
| **Package Manager** | `uv` (Fast Python Package Manager) |

---

## Project Structure

```
dotmind/
├── backend/
│   ├── auth.py              # Clerk authentication & token verification
│   ├── chunker.py           # Sliding-window code chunker with line tracking
│   ├── database.py          # SQLModel SQLite database engine & session
│   ├── embeddings.py        # OpenAI embedding generation & FAISS indexer
│   ├── ingest_manager.py    # Async ingestion job tracker & multi-repo storage
│   ├── main.py              # FastAPI application gateway & API routes
│   ├── models.py            # SQLModel database tables & Pydantic schemas
│   ├── rag_pipeline.py      # Prompt construction & token streaming generator
│   ├── repo_loader.py       # Git cloning & code file parsing
│   ├── retrieval.py         # Cosine similarity vector retrieval
│   └── tests/               # Standalone test & verification scripts
│       ├── test_embeddings.py
│       ├── test_loader.py
│       └── test_rag.py
├── storage/                 # Per-repo FAISS indexes & chunk caches (gitignored)
├── main.py                  # Root application launcher
├── pyproject.toml           # Project dependencies & metadata
├── .env.example             # Environment variable template
└── README.md
```

---

## Quickstart

### 1. Clone & Install Dependencies

Ensure you have [`uv`](https://docs.astral.sh/uv/) installed:

```bash
git clone https://github.com/sidty13/github-rag-assistant.git
cd github-rag-assistant
uv sync
```

### 2. Configure Environment Variables

Create your `.env` file from the template:

```bash
cp .env.example .env
```

Add your API keys inside `.env`:

```env
OPENAI_API_KEY=sk-proj-...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER=https://your-app.clerk.accounts.dev
```

### 3. Start the Server

Run from the project root:

```bash
uv run python main.py
```

Or run directly with uvicorn from `backend/`:

```bash
uv run uvicorn backend.main:app --reload --port 8001
```

The server will start at **http://localhost:8001**.
Interactive Swagger documentation is available at **http://localhost:8001/docs**.

---

## API Endpoints

### Ingestion & Repositories
- `POST /ingest` — Launch background repository ingestion (`url`, optional `branch`).
- `GET /ingest/status/{job_id}` — Check real-time ingestion progress.
- `GET /repos` — List all indexed repositories in storage.
- `POST /repos/switch` — Hot-swap active repository in memory.
- `DELETE /repos/{repo_id}` — Delete a repository from storage.

### Chat & Streaming
- `POST /chat/stream` — Real-time token-by-token streaming chat (Server-Sent Events).
- `POST /chat` — Synchronous chat endpoint.

### Authentication & Profile
- `GET /auth/config` — Retrieve Clerk publishable key for frontend initialization.
- `GET /auth/me` — Retrieve profile of the authenticated user.
- `GET /health` — Check server health and loaded repository stats.

---

## License

MIT
