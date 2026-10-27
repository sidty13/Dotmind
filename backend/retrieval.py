import os
import re
import faiss
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBEDDING_MODEL = "text-embedding-3-small"


def retrieve(
    query: str,
    index: faiss.Index,
    chunks: list[dict],
    k: int = 5
) -> list[dict]:
    """
    Embed query via OpenAI, search FAISS, apply hierarchical folder/file boosting,
    and return top-k chunks with complete coordinates (start_line, end_line, folder, file_name).
    """
    if not chunks or index is None or index.ntotal == 0:
        return []

    # 1. Embed query with text-embedding-3-small
    response = client.embeddings.create(input=[query], model=EMBEDDING_MODEL)
    q_vec = np.array([response.data[0].embedding], dtype="float32")
    faiss.normalize_L2(q_vec)

    # 2. Retrieve wider pool of candidates for hierarchical reranking
    candidate_k = min(max(k * 3, 15), index.ntotal)
    scores, indices = index.search(q_vec, candidate_k)

    # Tokenize query for path/folder intent detection
    clean_query = query.lower()
    query_tokens = set(re.findall(r"[a-zA-Z0-9_\-\.]+", clean_query))

    candidates = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1 or idx >= len(chunks):
            continue
            
        c = chunks[idx]
        path = c.get("path", "")
        folder = c.get("folder") or os.path.dirname(path) or "root"
        file_name = c.get("file_name") or os.path.basename(path)
        
        # Base cosine similarity score
        boosted_score = float(score)

        # Hierarchical boosting: check if query explicitly references file name or folder
        file_lower = file_name.lower()
        folder_lower = folder.lower()
        path_lower = path.lower()

        # Exact file name match (e.g. user asks "what is in main.py" or "Dockerfile")
        if file_lower in query_tokens or (len(file_lower) > 3 and file_lower in clean_query):
            boosted_score += 0.15

        # Directory / module match (e.g. user asks "routes in api" or "in backend folder")
        folder_parts = [p for p in folder_lower.split("/") if p and p != "root"]
        for part in folder_parts:
            if part in query_tokens:
                boosted_score += 0.08
                break

        candidates.append({
            "path": path,
            "folder": folder,
            "file_name": file_name,
            "content": c.get("content", ""),
            "start_line": c.get("start_line", 1),
            "end_line": c.get("end_line", 1),
            "score": boosted_score,
            "raw_score": float(score),
        })

    # Sort candidates by boosted score descending and take top k
    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates[:k]