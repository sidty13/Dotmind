import os
import re
import json
import uuid
import shutil
import pickle
from datetime import datetime
from typing import Dict, Any, Optional

from repo_loader import clone_repo, load_files
from chunker import chunk_all_files
from embeddings import embed_chunks, build_faiss_index, save_index, load_index

STORAGE_DIR = "storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

# In-memory job tracker: { job_id: {...} }
jobs: Dict[str, Dict[str, Any]] = {}


def get_repo_id(repo_url: str) -> str:
    """Derive a clean folder name from GitHub repo URL (e.g. pallets_click)."""
    cleaned = repo_url.strip().rstrip("/").removesuffix(".git")
    parts = cleaned.split("/")
    if len(parts) >= 2:
        owner = re.sub(r"[^a-zA-Z0-9_-]", "", parts[-2])
        repo = re.sub(r"[^a-zA-Z0-9_-]", "", parts[-1])
        return f"{owner}_{repo}".lower()
    return re.sub(r"[^a-zA-Z0-9_-]", "", parts[-1]).lower()


def get_repo_dir(repo_id: str) -> str:
    return os.path.join(STORAGE_DIR, repo_id)


def create_job(repo_url: str, branch: Optional[str] = None) -> str:
    """Create a new job record and return its UUID."""
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "job_id": job_id,
        "repo_url": repo_url,
        "repo_id": get_repo_id(repo_url),
        "branch": branch,
        "status": "queued",       # queued | in_progress | completed | failed
        "stage": "initializing",   # cloning | parsing | embedding | saving
        "progress": 0,             # 0 to 100
        "message": "Job queued for processing",
        "error": None,
        "created_at": datetime.utcnow().isoformat(),
        "result": None,
    }
    return job_id


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    return jobs.get(job_id)


def run_ingest_pipeline(job_id: str, repo_url: str, branch: Optional[str] = None, force_rebuild: bool = False):
    """Background worker function for ingestion pipeline."""
    job = jobs.get(job_id)
    if not job:
        return
    if branch and (branch.strip().lower() == "string" or not branch.strip()):
        branch = None

    repo_id = get_repo_id(repo_url)
    repo_dir = get_repo_dir(repo_id)
    meta_path = os.path.join(repo_dir, "meta.json")
    index_path = os.path.join(repo_dir, "vectors.index")
    chunks_path = os.path.join(repo_dir, "chunks.pkl")

    try:
        # Check if already cached
        if not force_rebuild and os.path.exists(meta_path) and os.path.exists(index_path) and os.path.exists(chunks_path):
            with open(meta_path, "r") as f:
                meta = json.load(f)
            job.update({
                "status": "completed",
                "stage": "done",
                "progress": 100,
                "message": "Repository was already indexed (used cached version).",
                "result": meta,
            })
            return

        job["status"] = "in_progress"

        # 1. Clone
        job.update({"stage": "cloning", "progress": 10, "message": f"Cloning {repo_url}..."})
        clone_dest = os.path.join("temp_repos", repo_id)
        if os.path.exists(clone_dest):
            shutil.rmtree(clone_dest, ignore_errors=True)

        from git import Repo
        os.makedirs("temp_repos", exist_ok=True)
        if branch:
            Repo.clone_from(repo_url, clone_dest, branch=branch)
        else:
            Repo.clone_from(repo_url, clone_dest)

        # 2. Parse & Chunk
        job.update({"stage": "parsing", "progress": 30, "message": "Parsing code files & creating chunks..."})
        files = load_files(clone_dest)
        if not files:
            raise ValueError("No supported source code files found in repository.")

        chunks = chunk_all_files(files)
        total_chunks = len(chunks)

        # 3. Embed (Progress 35% -> 85%)
        job.update({"stage": "embedding", "progress": 35, "message": f"Generating OpenAI embeddings for {total_chunks} chunks..."})

        def on_embed_progress(fraction: float):
            # Scale from 35% to 85%
            scaled = 35 + int(fraction * 50)
            job["progress"] = scaled
            job["message"] = f"Embedding chunks: {int(fraction * 100)}% complete"

        vectors = embed_chunks(chunks, progress_callback=on_embed_progress)

        # 4. Build FAISS Index & Save
        job.update({"stage": "saving", "progress": 90, "message": "Building FAISS vector index & saving..."})
        os.makedirs(repo_dir, exist_ok=True)

        index = build_faiss_index(vectors)
        save_index(index, index_path)
        with open(chunks_path, "wb") as f:
            pickle.dump(chunks, f)

        # Clean up temporary clone
        shutil.rmtree(clone_dest, ignore_errors=True)

        meta = {
            "repo_id": repo_id,
            "repo_url": repo_url,
            "branch": branch or "default",
            "files_count": len(files),
            "chunks_count": total_chunks,
            "ingested_at": datetime.utcnow().isoformat(),
        }
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)

        job.update({
            "status": "completed",
            "stage": "done",
            "progress": 100,
            "message": f"Repository successfully ingested! ({len(files)} files, {total_chunks} chunks)",
            "result": meta,
        })

    except Exception as e:
        print(f"Ingestion failed for {repo_url}: {e}")
        job.update({
            "status": "failed",
            "stage": "error",
            "error": str(e),
            "message": f"Ingestion failed: {e}",
        })


def list_ingested_repos() -> list[dict]:
    """Return metadata of all currently indexed repositories."""
    repos = []
    if not os.path.exists(STORAGE_DIR):
        return repos

    for folder in os.listdir(STORAGE_DIR):
        meta_file = os.path.join(STORAGE_DIR, folder, "meta.json")
        if os.path.exists(meta_file):
            try:
                with open(meta_file, "r") as f:
                    repos.append(json.load(f))
            except Exception:
                pass
    return repos


def load_repo_storage(repo_id: str):
    """Load index, chunks, and metadata for a given repository ID."""
    repo_dir = get_repo_dir(repo_id)
    index_path = os.path.join(repo_dir, "vectors.index")
    chunks_path = os.path.join(repo_dir, "chunks.pkl")
    meta_path = os.path.join(repo_dir, "meta.json")

    if not (os.path.exists(index_path) and os.path.exists(chunks_path)):
        return None, None, None

    index = load_index(index_path)
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    meta = {}
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            meta = json.load(f)

    return index, chunks, meta


def delete_repo_storage(repo_id: str) -> bool:
    """Delete a repository's cached data from storage."""
    repo_dir = get_repo_dir(repo_id)
    if os.path.exists(repo_dir):
        shutil.rmtree(repo_dir, ignore_errors=True)
        return True
    return False