import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from repo_loader import clone_repo, load_files
from chunker import chunk_all_files
from embeddings import embed_chunks, build_faiss_index, save_index


# Step 1: Load files (reuse from Step 2)
repo_path = "repo"   # already cloned — no need to re-clone
files     = load_files(repo_path)

# Step 2: Chunk them
chunks = chunk_all_files(files)

# Step 3: Embed
vectors = embed_chunks(chunks)
print(f"Vector shape: {vectors.shape}")   # should be (num_chunks, 384)

# Step 4: Store in FAISS
index = build_faiss_index(vectors)

# Step 5: Save to disk
save_index(index)

print("\nAll done! Files created:")
print("  vectors.index  — your searchable vector database")