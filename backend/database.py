from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./users.db"

# connect_args={"check_same_thread": False} is required for SQLite with FastAPI
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all SQLModel tables automatically on startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency to yield database sessions."""
    with Session(engine) as session:
        yield session