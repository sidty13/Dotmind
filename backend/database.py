import os
from sqlmodel import SQLModel, create_engine, Session

# Absolute path next to this file, so it no longer depends on the folder
# the server is started from. Override with DATABASE_URL (e.g. Postgres later).
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(BASE_DIR, 'users.db')}",
)

# connect_args={"check_same_thread": False} is required for SQLite with FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

print(f"Database: {DATABASE_URL}")


def create_db_and_tables():
    """Create all SQLModel tables automatically on startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency to yield database sessions."""
    with Session(engine) as session:
        yield session