import os
import re
from sqlmodel import SQLModel, create_engine, Session

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
raw_db_url = os.environ.get(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(BASE_DIR, 'users.db')}",
).strip()

# SQLAlchemy 2.0 defaults to psycopg v3 if not explicitly specified.
# Normalizing to postgresql+psycopg2:// ensures seamless compatibility with psycopg2-binary
if raw_db_url.startswith("postgres://"):
    DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif raw_db_url.startswith("postgresql://"):
    DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    DATABASE_URL = raw_db_url


# Configure engine based on database dialect
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    # Production PostgreSQL (Neon, Supabase, etc.)
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,      # Tests connection liveness before usage
        pool_recycle=300,        # Recycles idle connections every 5 mins
        pool_size=10,
        max_overflow=20,
    )

# Print safe sanitized database URL (hide credentials if present)
sanitized_url = re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", DATABASE_URL)
print(f"Database connected: {sanitized_url}")


def create_db_and_tables():
    """Create all SQLModel tables automatically on startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency to yield database sessions."""
    with Session(engine) as session:
        yield session