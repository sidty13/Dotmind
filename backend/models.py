from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


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
    created_at: datetime = Field(default_factory=datetime.utcnow)


# 2. Pydantic Response Schema
class UserResponse(SQLModel):
    id: int
    clerk_id: str
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime