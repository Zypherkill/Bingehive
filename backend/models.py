import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from database import Base
import enum


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    username = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Anime(Base):
    __tablename__ = "anime"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    title_en = Column(String, nullable=True)
    image_url = Column(String)
    synopsis = Column(Text)
    episodes = Column(Integer)
    mean_score = Column(Float)
    raw_data = Column(JSONB)
    cached_at = Column(DateTime(timezone=True), server_default=func.now())

class LibraryStatus(str, enum.Enum):
    watching = "watching"
    completed = "completed"
    plan_to_watch = "plan_to_watch"
    dropped = "dropped"
    on_hold = "on_hold"

class LibraryEntry(Base):
    __tablename__ = "library_entries"

    id = Column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    anime_id = Column(Integer, ForeignKey("anime.id"), unique=True, nullable=False)
    status = Column(Enum(LibraryStatus), default=LibraryStatus.plan_to_watch, nullable=False)
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserAnimeData(Base):
    __tablename__ = "user_anime_data"

    id = Column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    anime_id = Column(Integer, ForeignKey("anime.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer)
    notes = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("user_id", "anime_id"),)