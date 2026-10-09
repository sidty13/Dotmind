def chunk_file(file_data: dict, chunk_size: int = 1200, overlap: int = 150) -> list[dict]:
    """
    Split a single file's content into overlapping chunks.
    Tracks path, character offset, and start/end line numbers.
    """
    content = file_data["content"]
    path    = file_data["path"]
    
    chunks = []
    start  = 0

    while start < len(content):
        end   = start + chunk_size
        chunk = content[start:end]

        # Calculate exact 1-indexed line numbers
        start_line = content[:start].count("\n") + 1
        end_line   = start_line + chunk.count("\n")

        chunks.append({
            "path":       path,
            "content":    chunk,
            "start":      start,
            "start_line": start_line,
            "end_line":   end_line,
        })

        start += chunk_size - overlap  

    return chunks


def chunk_all_files(files_data: list[dict], chunk_size: int = 1200, overlap: int = 150) -> list[dict]:
    """Run chunk_file() on every file. Returns flat list of all chunks."""
    all_chunks = []
    for file_data in files_data:
        all_chunks.extend(chunk_file(file_data, chunk_size, overlap))
    
    print(f"Total chunks created: {len(all_chunks)}")
    return all_chunks