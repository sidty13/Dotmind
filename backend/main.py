import sys
import os

# Ensure backend directory is in python search path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import shutil
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import ingest_manager
from retrieval import retrieve
from rag_pipeline import generate_answer, generate_answer_stream
from database import create_db_and_tables, get_session
from sqlmodel import Session, select
import auth
from models import User, UserRepo, RetrievalLog, QueryLog

app = FastAPI(
    title="dotmind - GitHub RAG & Assistant API",
    description="Multi-Repository RAG & Streaming Assistant powered by OpenAI, FAISS, and Clerk Auth",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$|https://.*\.vercel\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
create_db_and_tables()

# Register Clerk Authentication routes (/auth/config, /auth/me)
app.include_router(auth.router)

# Active in-memory repository state
state = {
    "repo_id": None,
    "repo_url": None,
    "index": None,
    "chunks": [],
    "meta": {},
}


def build_github_url(repo_url: str, branch: Optional[str], path: str, start_line: Optional[int] = None, end_line: Optional[int] = None) -> str:
    """Constructs a clickable direct link to source code on GitHub."""
    cleaned_repo = repo_url.strip().rstrip("/").removesuffix(".git")
    b = branch if branch and branch not in ("default", "string") else "main"
    url = f"{cleaned_repo}/blob/{b}/{path.lstrip('/')}"
    if start_line and end_line:
        url += f"#L{start_line}-L{end_line}"
    elif start_line:
        url += f"#L{start_line}"
    return url


def load_active_repo(repo_id: str) -> bool:
    """Load an indexed repository into active memory."""
    index, chunks, meta = ingest_manager.load_repo_storage(repo_id)
    if index is not None and chunks is not None:
        state["repo_id"] = repo_id
        state["repo_url"] = meta.get("repo_url", repo_id)
        state["index"] = index
        state["chunks"] = chunks
        state["meta"] = meta
        print(f"Active repo switched to '{repo_id}' ({len(chunks)} chunks loaded).")
        return True
    return False


def init_storage():
    """Auto-load initial repository on startup."""
    repos = ingest_manager.list_ingested_repos()
    if repos:
        load_active_repo(repos[0]["repo_id"])


init_storage()


# Schemas
class IngestRequest(BaseModel):
    url: str
    branch: Optional[str] = None
    force_rebuild: bool = False


class SwitchRepoRequest(BaseModel):
    repo_id: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []
    repo_id: Optional[str] = None


# Endpoints
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "active_repo_id": state["repo_id"],
        "active_repo_url": state["repo_url"],
        "total_chunks_loaded": len(state["chunks"]),
    }


@app.get("/repos")
def list_repositories(
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """List ingested repositories scoped to the authenticated user."""
    if not current_user:
        # Fallback to general storage if unauthenticated
        repos = ingest_manager.list_ingested_repos()
        for r in repos:
            r["is_active"] = (r.get("repo_id") == state["repo_id"])
        return {"repositories": repos}

    # Query user's repos from database
    user_repos = session.exec(
        select(UserRepo).where(UserRepo.user_id == current_user.clerk_id)
    ).all()

    result = []
    for ur in user_repos:
        result.append({
            "id": ur.repo_id,
            "repo_id": ur.repo_id,
            "owner": ur.owner or (ur.repo_id.split("_")[0] if "_" in ur.repo_id else ""),
            "name": ur.name or (ur.repo_id.split("_")[1] if "_" in ur.repo_id else ur.repo_id),
            "url": ur.repo_url,
            "branch": ur.branch or "main",
            "files_count": ur.files_count,
            "chunks_count": ur.chunks_count,
            "status": ur.status,
            "is_active": ur.is_active or (ur.repo_id == state["repo_id"]),
        })
    return {"repositories": result}


@app.post("/repos/switch")
def switch_repository(
    req: SwitchRepoRequest,
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """Hot-swap the active in-memory repository for the user."""
    success = load_active_repo(req.repo_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Repository '{req.repo_id}' not found.")

    if current_user:
        user_repos = session.exec(
            select(UserRepo).where(UserRepo.user_id == current_user.clerk_id)
        ).all()
        for ur in user_repos:
            ur.is_active = (ur.repo_id == req.repo_id)
            session.add(ur)
        session.commit()

    return {
        "status": "success",
        "active_repo_id": state["repo_id"],
        "meta": state["meta"]
    }


@app.get("/repos/{repo_id}/citations")
def get_repo_citations(
    repo_id: str,
    limit: int = 200,
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """Return chunks retrieved for past queries on this repo (powers the Sources page)."""
    stmt = select(RetrievalLog).where(RetrievalLog.repo_id == repo_id)
    if current_user:
        stmt = stmt.where(RetrievalLog.user_id == current_user.clerk_id)
    else:
        stmt = stmt.where(RetrievalLog.user_id == None)  # noqa: E711

    rows = session.exec(
        stmt.order_by(RetrievalLog.created_at.desc()).limit(limit)
    ).all()

    return [
        {
            "filePath": r.file_path,
            "startLine": r.start_line or 1,
            "endLine": r.end_line or r.start_line or 1,
            "query": r.query,
            "score": r.score,
        }
        for r in rows
    ]


@app.get("/repos/{repo_id}/history")
def get_repo_history(
    repo_id: str,
    limit: int = 50,
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """Return past questions (and answers) asked on this repo, newest first."""
    stmt = select(QueryLog).where(QueryLog.repo_id == repo_id)
    if current_user:
        stmt = stmt.where(QueryLog.user_id == current_user.clerk_id)
    else:
        stmt = stmt.where(QueryLog.user_id == None)  # noqa: E711

    rows = session.exec(stmt.order_by(QueryLog.created_at.desc()).limit(limit)).all()
    return [
        {
            "id": r.id,
            "question": r.question,
            "answer": r.answer,
            "createdAt": r.created_at.isoformat(),
        }
        for r in rows
    ]


@app.delete("/repos/{repo_id}")
def delete_repository(
    repo_id: str,
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """Delete a repository from user's registry."""
    if current_user:
        ur = session.exec(
            select(UserRepo).where(
                UserRepo.user_id == current_user.clerk_id,
                UserRepo.repo_id == repo_id
            )
        ).first()
        if ur:
            session.delete(ur)
            session.commit()

    deleted = ingest_manager.delete_repo_storage(repo_id)
    if not deleted and not current_user:
        raise HTTPException(status_code=404, detail="Repository not found.")

    if state["repo_id"] == repo_id:
        state["repo_id"] = None
        state["repo_url"] = None
        state["index"] = None
        state["chunks"] = []
        state["meta"] = {}

    return {"status": "success", "message": f"Repository '{repo_id}' deleted."}


@app.post("/ingest")
def start_ingest(
    req: IngestRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """Trigger an asynchronous ingestion job and link to user."""
    if not req.url or "github.com" not in req.url:
        raise HTTPException(status_code=400, detail="Please provide a valid GitHub repository URL.")

    repo_id = ingest_manager.get_repo_id(req.url)
    job_id = ingest_manager.create_job(req.url, req.branch)

    # Link to authenticated user if available
    if current_user:
        existing = session.exec(
            select(UserRepo).where(
                UserRepo.user_id == current_user.clerk_id,
                UserRepo.repo_id == repo_id
            )
        ).first()

        owner, repo_name = "", repo_id
        parts = req.url.rstrip("/").removesuffix(".git").split("/")
        if len(parts) >= 2:
            owner, repo_name = parts[-2], parts[-1]

        if not existing:
            count = session.exec(
                select(UserRepo).where(UserRepo.user_id == current_user.clerk_id)
            ).all()
            new_ur = UserRepo(
                user_id=current_user.clerk_id,
                repo_id=repo_id,
                owner=owner,
                name=repo_name,
                repo_url=req.url,
                branch=req.branch or "main",
                status="INDEXING",
                is_active=(len(count) == 0),
            )
            session.add(new_ur)
            session.commit()

    background_tasks.add_task(
        ingest_manager.run_ingest_pipeline,
        job_id=job_id,
        repo_url=req.url,
        branch=req.branch,
        force_rebuild=req.force_rebuild,
    )

    return {
        "status": "accepted",
        "job_id": job_id,
        "repo_id": repo_id,
        "message": "Ingestion started in background. Poll /ingest/status/{job_id} for updates.",
    }




@app.get("/ingest/status/{job_id}")
def get_ingest_status(job_id: str, session: Session = Depends(get_session)):
    job = ingest_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job ID not found.")

    # Activate the newly indexed repository, even if another repo is active.
    if job.get("status") == "completed":
        repo_id = job.get("repo_id")

        if repo_id and repo_id != state["repo_id"]:
            if not load_active_repo(repo_id):
                raise HTTPException(
                    status_code=500,
                    detail=f"Repository '{repo_id}' was indexed but could not be loaded."
                )

        if repo_id:
            user_repo = session.exec(
                select(UserRepo).where(UserRepo.repo_id == repo_id)
            ).first()
            if user_repo and user_repo.status != "READY":
                user_repo.status = "READY"
                user_repo.files_count = job.get("result", {}).get("files_count", 0)
                user_repo.chunks_count = job.get("result", {}).get("chunks_count", 0)
                session.add(user_repo)
                session.commit()

    return job


def format_source_list(context_chunks: list[dict]) -> list[dict]:
    """Helper to attach clickable GitHub URLs to source chunks."""
    sources = []
    repo_url = state.get("repo_url") or ""
    branch = state.get("meta", {}).get("branch", "main")

    for chunk in context_chunks:
        start_line = chunk.get("start_line")
        end_line = chunk.get("end_line")
        url = build_github_url(repo_url, branch, chunk["path"], start_line, end_line)

        sources.append({
            "path": chunk["path"],
            "url": url,
            "start_line": start_line,
            "end_line": end_line,
            "score": round(float(chunk["score"]), 4),
            "preview": chunk["content"][:200] + ("..." if len(chunk["content"]) > 200 else "")
        })
    return sources


def log_retrieval(session: Session, user: Optional[User], question: str, chunks: list[dict]):
    """Persist which chunks were retrieved for a question (never breaks chat on failure)."""
    try:
        for c in chunks:
            session.add(RetrievalLog(
                repo_id=state["repo_id"],
                user_id=user.clerk_id if user else None,
                query=question,
                file_path=c["path"],
                start_line=c.get("start_line"),
                end_line=c.get("end_line"),
                score=float(c["score"]),
            ))
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Failed to log retrieval: {e}")


def save_query(repo_id: str, user_id: Optional[str], question: str, answer: str):
    """Save a question + answer using its own session (safe to call while streaming)."""
    gen = get_session()
    s = next(gen)
    try:
        s.add(QueryLog(repo_id=repo_id, user_id=user_id, question=question, answer=answer))
        s.commit()
    except Exception as e:
        s.rollback()
        print(f"Failed to save query: {e}")
    finally:
        gen.close()


@app.post("/chat")
@app.post("/ask")
def chat_with_repo(
    req: ChatRequest,
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """Standard (non-streaming) chat endpoint."""
    if req.repo_id and req.repo_id != state["repo_id"]:
        if not load_active_repo(req.repo_id):
            raise HTTPException(status_code=404, detail=f"Repository '{req.repo_id}' is not indexed.")

    if state["index"] is None or not state["chunks"]:
        raise HTTPException(status_code=400, detail="No repository loaded. Call /ingest first.")

    context_chunks = retrieve(req.question, state["index"], state["chunks"], k=5)
    log_retrieval(session, current_user, req.question, context_chunks)
    history_dicts = [{"role": m.role, "content": m.content} for m in req.history]

    answer = generate_answer(context_chunks, req.question, chat_history=history_dicts)
    save_query(state["repo_id"], current_user.clerk_id if current_user else None, req.question, answer)
    sources = format_source_list(context_chunks)

    return {
        "repo_id": state["repo_id"],
        "answer": answer,
        "sources": sources,
    }


@app.post("/chat/stream")
def chat_with_repo_stream(
    req: ChatRequest,
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
    session: Session = Depends(get_session),
):
    """Server-Sent Events (SSE) streaming chat endpoint."""
    if req.repo_id and req.repo_id != state["repo_id"]:
        if not load_active_repo(req.repo_id):
            raise HTTPException(status_code=404, detail=f"Repository '{req.repo_id}' is not indexed.")

    if state["index"] is None or not state["chunks"]:
        raise HTTPException(status_code=400, detail="No repository loaded. Call /ingest first.")

    context_chunks = retrieve(req.question, state["index"], state["chunks"], k=5)
    log_retrieval(session, current_user, req.question, context_chunks)
    history_dicts = [{"role": m.role, "content": m.content} for m in req.history]
    sources = format_source_list(context_chunks)

    repo_id_for_log = state["repo_id"]
    user_id_for_log = current_user.clerk_id if current_user else None

    def event_generator():
        answer_parts: list[str] = []
        try:
            # First event: send retrieved sources metadata
            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

            # Stream LLM tokens
            for token in generate_answer_stream(context_chunks, req.question, history_dicts):
                answer_parts.append(token)
                yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

            # Final event: done
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        finally:
            # Runs on completion or if the client stops generation (saves partial answer)
            save_query(repo_id_for_log, user_id_for_log, req.question, "".join(answer_parts))

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)