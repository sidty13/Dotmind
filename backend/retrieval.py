import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

def retrieve(
    query: str,
    model: SentenceTransformer,
    index: faiss.IndexFlatL2,
    chunks: list[dict],
    k: int = 5
) -> list[dict]:
    """Search FAISS index and return top-k matching chunks."""
    
    q_vec = model.encode([query], normalize_embeddings=True)
    q_vec = np.array(q_vec).astype("float32")
    
    distances, indices = index.search(q_vec, k)
    
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < len(chunks):
            results.append({
                "path": chunks[idx]["path"],
                "content": chunks[idx]["content"],
                "score": float(dist)
            })
    return results