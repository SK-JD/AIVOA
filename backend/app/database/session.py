"""Synchronous SQLAlchemy engine/session.

We use a sync engine deliberately: the LangGraph tools run inside the graph and
touch the DB, and sync sessions keep those tools simple. FastAPI runs the (sync)
chat endpoint in a threadpool, so nothing blocks the event loop.
"""
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.models.models import Base

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    """Create all tables if they do not exist."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: yields a session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
