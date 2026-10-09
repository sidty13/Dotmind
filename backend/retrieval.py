import os
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
    """Embed query via OpenAI and return top-k most similar chunks from FAISS."""
    if not chunks or index is None or index.ntotal == 0:
        return []

    # Embed query
    response = client.embeddings.create(input=[query], model=EMBEDDING_MODEL)
    q_vec = np.array([response.data[0].embedding], dtype="float32")
    faiss.normalize_L2(q_vec)

    search_k = min(k, index.ntotal)
    scores, indices = index.search(q_vec, search_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx != -1 and idx < len(chunks):
            results.append({
                "path": chunks[idx]["path"],
                "content": chunks[idx]["content"],
                "score": float(score)
            })
    return results