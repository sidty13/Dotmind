def chunk_file(file_data: dict, chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """
    Split a single file's content into overlapping chunks.
    Each chunk keeps the file path so we know where it came from.
    """
    content = file_data["content"]
    path    = file_data["path"]
    
    chunks = []
    start  = 0

    while start < len(content):
        end   = start + chunk_size
        chunk = content[start:end]

        chunks.append({
            "path":    path,
            "content": chunk,
            "start":   start,   
        })

        start += chunk_size - overlap  

    return chunks


def chunk_all_files(files_data: list[dict], chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """Run chunk_file() on every file. Returns one flat list of all chunks."""
    
    all_chunks = []
    
    for file_data in files_data:
        file_chunks = chunk_file(file_data, chunk_size, overlap)
        all_chunks.extend(file_chunks)
    
    print(f"Total chunks created: {len(all_chunks)}")
    return all_chunks