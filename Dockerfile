FROM python:3.12-slim

# Install system dependencies (git is required by GitPython to clone repositories)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user (UID 1000) for security compliance (Hugging Face Spaces & Koyeb standard)
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

# Install Python dependencies first for caching
COPY --chown=user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code and project configuration
COPY --chown=user backend/ ./backend/
COPY --chown=user main.py ./main.py

# Switch to non-root user
USER user

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

# Expose default port (7860 for Hugging Face Spaces; dynamic $PORT used if set)
EXPOSE 7860

# Launch Uvicorn with dynamic PORT support
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
