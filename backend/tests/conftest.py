"""Pytest setup: point the app at a throwaway SQLite DB *before* importing anything,
so tests never touch Postgres or need Groq. LLM calls are monkeypatched per-test.
"""
import os
import pathlib
import tempfile

_DB = pathlib.Path(tempfile.gettempdir()) / "aivao_test.db"
if _DB.exists():
    _DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{_DB}"
os.environ.setdefault("GROQ_API_KEY", "test-key")

import pytest  # noqa: E402

from app.database.session import SessionLocal, init_db  # noqa: E402
from app.models.models import HCP  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _setup_db():
    init_db()
    db = SessionLocal()
    if not db.query(HCP).first():
        db.add_all([
            HCP(name="Dr. Smith", specialty="Oncology", organization="City General Hospital"),
            HCP(name="Dr. Sharma", specialty="Cardiology", organization="Apollo Clinic"),
        ])
        db.commit()
    db.close()
    yield


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
