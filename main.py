import sys
import os

# Add backend directory to module search path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

if __name__ == "__main__":
    import uvicorn
    print("Starting dotmind API server on http://localhost:8001...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=True)

