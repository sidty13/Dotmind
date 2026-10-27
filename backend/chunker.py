import os
from typing import List, Dict, Any


def get_hierarchical_metadata(path: str) -> Dict[str, str]:
    """Derive hierarchical directory and file components from relative path."""
    clean_path = path.replace("\\", "/").strip("/")
    folder = os.path.dirname(clean_path) or "root"
    file_name = os.path.basename(clean_path)
    extension = os.path.splitext(file_name)[1].lower()
    return {
        "path": clean_path,
        "folder": folder,
        "file_name": file_name,
        "extension": extension,
    }


def chunk_file(
    file_data: dict, 
    max_chars: int = 1200, 
    overlap_lines: int = 4
) -> List[Dict[str, Any]]:
    """
    Split a single file's content into line-aware, overlapping chunks.
    Preserves line boundaries and hierarchical file/directory metadata.
    """
    content = file_data.get("content", "")
    raw_path = file_data.get("path", "")
    
    if not content or not content.strip():
        return []

    meta = get_hierarchical_metadata(raw_path)
    lines = content.splitlines(keepends=True)
    total_lines = len(lines)
    
    chunks = []
    current_line_idx = 0  # 0-indexed into lines

    while current_line_idx < total_lines:
        chunk_lines = []
        chunk_chars = 0
        start_line = current_line_idx + 1  # 1-indexed
        
        # Accumulate whole lines until max_chars is reached
        idx = current_line_idx
        while idx < total_lines:
            line = lines[idx]
            
            # If adding this line exceeds max_chars and we already have lines, stop here
            if chunk_chars + len(line) > max_chars and len(chunk_lines) > 0:
                break
                
            chunk_lines.append(line)
            chunk_chars += len(line)
            idx += 1
            
            # Safety brake for single extremely long lines
            if chunk_chars >= max_chars:
                break
        
        end_line = current_line_idx + len(chunk_lines)
        chunk_text = "".join(chunk_lines)
        
        # Build hierarchical context prefix for vector embeddings
        hierarchical_header = (
            f"// Repository File: {meta['path']}\n"
            f"// Directory: {meta['folder']} | File: {meta['file_name']}\n"
            f"// Lines: {start_line}-{end_line}\n\n"
        )
        embed_text = hierarchical_header + chunk_text

        chunks.append({
            "path": meta["path"],
            "folder": meta["folder"],
            "file_name": meta["file_name"],
            "extension": meta["extension"],
            "content": chunk_text,
            "embed_text": embed_text,
            "start_line": start_line,
            "end_line": end_line,
        })
        
        # If this chunk already reached the end of the file, we are done
        if current_line_idx + len(chunk_lines) >= total_lines:
            break

        # Advance with overlap
        step = max(1, len(chunk_lines) - overlap_lines)
        current_line_idx += step


    return chunks


def chunk_all_files(
    files_data: List[dict], 
    max_chars: int = 1200, 
    overlap_lines: int = 4
) -> List[Dict[str, Any]]:
    """Run line-aware chunking on all files and return unified list of chunks."""
    all_chunks = []
    for file_data in files_data:
        all_chunks.extend(chunk_file(file_data, max_chars, overlap_lines))
    
    print(f"Total hierarchical chunks created: {len(all_chunks)}")
    return all_chunks