import os
import faiss
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from repo_loader import clone_repo, load_files
from chunker import chunk_all_files
from embeddings import embed_chunks, build_faiss_index
from retrieval import retrieve
from rag_pipeline import generate_answer

app = FastAPI(title="GitHub RAG Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state (single user MVP)
state = {
    "index": None,
    "chunks": [],
    "model": SentenceTransformer("all-MiniLM-L6-v2"),
    "repo_url": None,
}

class RepoRequest(BaseModel):
    url: str

class QueryRequest(BaseModel):
    question: str

@app.post("/load-repo")
def load_repo(req: RepoRequest):
    try:
        print(f"Loading repo: {req.url}")
        
        # Step 1: Clone
        repo_path = clone_repo(req.url)
        
        # Step 2: Load files
        files = load_files(repo_path)
        if not files:
            raise HTTPException(status_code=400, detail="No supported files found in repo.")
        
        # Step 3: Chunk
        chunks = chunk_all_files(files)
        
        # Step 4: Embed (uses YOUR embed_chunks which takes list[dict])
        vectors = embed_chunks(chunks)
        
        # Step 5: Build FAISS index
        index = build_faiss_index(vectors)
        index.add(vectors)  # add vectors after building
        
        # Step 6: Save state
        state["index"] = index
        state["chunks"] = chunks
        state["repo_url"] = req.url

        return {
            "status": "success",
            "repo": req.url,
            "files_loaded": len(files),
            "chunks_created": len(chunks),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask")
def ask_question(req: QueryRequest):
    if state["index"] is None:
        raise HTTPException(
            status_code=400,
            detail="No repo loaded. Call /load-repo first."
        )
    
    # Retrieve top chunks
    context_chunks = retrieve(
        req.question,
        state["model"],
        state["index"],
        state["chunks"],
    )
    
    # Generate answer via Groq
    answer = generate_answer(context_chunks, req.question)
    
    return {
        "answer": answer,
        "sources": [
            {"file": c["path"], "preview": c["content"][:200]}
            for c in context_chunks[:3]
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "repo_loaded": state["index"] is not None,
        "repo_url": state["repo_url"],
        "chunks": len(state["chunks"]),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)