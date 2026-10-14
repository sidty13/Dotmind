from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


def utcnow() -> datetime:
    """Timezone-aware UTC timestamp (newer SQLModel rejects naive datetimes)."""
    return datetime.now(timezone.utc)


# 1. Database Table Model
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    clerk_id: str = Field(unique=True, index=True, nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    username: Optional[str] = Field(default=None, index=True, nullable=True)
    first_name: Optional[str] = Field(default=None, nullable=True)
    last_name: Optional[str] = Field(default=None, nullable=True)
    avatar_url: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=utcnow)


# 2. User-Repository Link Table Model
class UserRepo(SQLModel, table=True):
    __tablename__ = "user_repos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)  # clerk_id
    repo_id: str = Field(index=True, nullable=False)
    owner: str = Field(default="")
    name: str = Field(default="")
    repo_url: str = Field(nullable=False)
    branch: Optional[str] = Field(default="main")
    files_count: int = Field(default=0)
    chunks_count: int = Field(default=0)
    status: str = Field(default="READY")
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow)


# 3. Retrieval Log Table Model (powers the Sources page)
class RetrievalLog(SQLModel, table=True):
    __tablename__ = "retrieval_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    repo_id: str = Field(index=True, nullable=False)
    user_id: Optional[str] = Field(default=None, index=True)  # clerk_id, None if anonymous
    query: str = Field(nullable=False)
    file_path: str = Field(index=True, nullable=False)
    start_line: Optional[int] = Field(default=None)
    end_line: Optional[int] = Field(default=None)
    score: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=utcnow, index=True)


# 4. Query History Table Model (one row per question asked)
class QueryLog(SQLModel, table=True):
    __tablename__ = "query_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    repo_id: str = Field(index=True, nullable=False)
    user_id: Optional[str] = Field(default=None, index=True)  # clerk_id, None if anonymous
    question: str = Field(nullable=False)
    answer: str = Field(default="")
    created_at: datetime = Field(default_factory=utcnow, index=True)


# 5. Pydantic Response Schema
class UserResponse(SQLModel):
    id: int
    clerk_id: str
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime