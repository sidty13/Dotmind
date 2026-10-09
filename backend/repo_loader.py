import os
import stat
import shutil
from git import Repo

CLONE_DIR = "repo"
SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx",
    ".cpp", ".c", ".h", ".java", ".go",
    ".md", ".txt", ".json", ".yaml", ".yml"
}

def force_remove(func, path, exc_info):
    """Force delete read-only files on Windows."""
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clone_repo(repo_url: str) -> str:
    if os.path.exists(CLONE_DIR):
        shutil.rmtree(CLONE_DIR, onexc=force_remove)
    
    print(f"Cloning repository from {repo_url} to {CLONE_DIR}...")
    Repo.clone_from(repo_url, CLONE_DIR)
    print("Clone complete.")
    return CLONE_DIR

def load_files(repo_path: str) -> list[dict]:
    """
    Walk the repo and read all supported files.
    Returns a list of dicts: { "path": ..., "content": ... }
    """
    
    files_data = []
    
    SKIP_DIRS = {
        ".git", "node_modules", "__pycache__", ".venv", "venv", 
        "dist", "build", "tests", "docs", ".github", ".devcontainer"
    }
    SKIP_FILES = {"CHANGES.md", "CHANGELOG.md"}
    
    for root, dirs, files in os.walk(repo_path):
        
        # Skip irrelevant folders
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for file in files:
            if file in SKIP_FILES:
                continue

            ext = os.path.splitext(file)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue
            
            full_path = os.path.join(root, file)
            relative_path = os.path.relpath(full_path, repo_path)
            
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                
                # Skip empty files
                if not content.strip():
                    continue
                
                files_data.append({
                    "path": relative_path,
                    "content": content
                })
                
            except Exception as e:
                print(f"Could not read {relative_path}: {e}")
    
    return files_data