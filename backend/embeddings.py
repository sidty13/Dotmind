import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"


model = SentenceTransformer(MODEL_NAME)


def embed_chunks(chunks: list[dict]) -> np.ndarray:
    """Convert chunk contents into vectors. Returns a numpy array."""
    
    texts = [chunk["content"] for chunk in chunks]
    
    print(f"Embedding {len(texts)} chunks...")
    vectors = model.encode(
        texts,
        show_progress_bar=True,
        batch_size=16,          # smaller batches = less memory pressure
        normalize_embeddings=True
    )
    print("Embedding complete.")
    
    return np.array(vectors).astype("float32")


def build_faiss_index(vectors: np.ndarray) -> faiss.IndexFlatL2:
    """Store vectors in a FAISS index for fast similarity search."""
    
    dim   = vectors.shape[1]        
    index = faiss.IndexFlatL2(dim)  
    
    print(f"FAISS index built with {index.ntotal} vectors.")
    return index


def save_index(index: faiss.IndexFlatL2, path: str = "vectors.index"):
    faiss.write_index(index, path)
    print(f"Index saved to {path}")


def load_index(path: str = "vectors.index") -> faiss.IndexFlatL2:
    index = faiss.read_index(path)
    print(f"Index loaded from {path}")
    return index