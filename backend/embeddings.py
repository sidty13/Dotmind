import os
import faiss
import numpy as np
from typing import Callable, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBEDDING_MODEL = "text-embedding-3-small"


def embed_chunks(
    chunks: list[dict], 
    batch_size: int = 200,
    progress_callback: Optional[Callable[[float], None]] = None
) -> np.ndarray:
    """Convert chunk contents into vectors using OpenAI embeddings with progress feedback."""
    texts = [chunk["content"] for chunk in chunks]
    if not texts:
        return np.empty((0, 1536), dtype="float32")

    all_embeddings = []
    total = len(texts)
    print(f"Embedding {total} chunks using OpenAI ({EMBEDDING_MODEL})...")

    for i in range(0, total, batch_size):
        batch = texts[i : i + batch_size]
        response = client.embeddings.create(input=batch, model=EMBEDDING_MODEL)
        batch_vecs = [item.embedding for item in response.data]
        all_embeddings.extend(batch_vecs)

        if progress_callback:
            # Report progress between 0.0 and 1.0
            fraction = min(1.0, (i + len(batch)) / total)
            progress_callback(fraction)

    vectors = np.array(all_embeddings, dtype="float32")
    faiss.normalize_L2(vectors)
    print("Embedding complete.")
    return vectors


def build_faiss_index(vectors: np.ndarray) -> faiss.IndexFlatIP:
    """Store normalized vectors in an Inner Product (cosine similarity) FAISS index."""
    dim = vectors.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(vectors)
    print(f"FAISS index built with {index.ntotal} vectors.")
    return index


def save_index(index: faiss.IndexFlatIP, path: str):
    faiss.write_index(index, path)
    print(f"Index saved to {path}")


def load_index(path: str) -> faiss.IndexFlatIP:
    index = faiss.read_index(path)
    print(f"Index loaded from {path}")
    return index