"""Runtime settings overlay: DB (`app_settings`) → falls back to `.env` defaults.

The Admin panel writes the Groq key/model here so they can change *without a
restart* (a deliberate departure from the reference guide's read-once config).
Effective value resolution order:  app_settings row  →  environment default.

A tiny in-memory cache avoids a DB hit on every LLM build; it is invalidated
whenever settings are saved.
"""
from typing import Optional

from app.config import settings as env_settings
from app.database.session import SessionLocal
from app.models.models import AppSetting

# keys stored in app_settings
KEY_GROQ_API_KEY = "groq_api_key"
KEY_GROQ_MODEL = "groq_model"

_cache: dict[str, str] = {}
_loaded = False


def _load() -> None:
    global _loaded
    db = SessionLocal()
    try:
        _cache.clear()
        for row in db.query(AppSetting).all():
            _cache[row.key] = row.value
        _loaded = True
    except Exception:
        # Table may not exist yet (pre-init_db). Fall back to env silently.
        _loaded = False
    finally:
        db.close()


def clear_cache() -> None:
    global _loaded
    _loaded = False
    _cache.clear()


def _get(key: str) -> Optional[str]:
    if not _loaded:
        _load()
    val = _cache.get(key)
    return val if val else None


def get_groq_api_key() -> str:
    return _get(KEY_GROQ_API_KEY) or env_settings.groq_api_key


def get_groq_model() -> str:
    return _get(KEY_GROQ_MODEL) or env_settings.groq_model


def save_settings(groq_api_key: Optional[str] = None, groq_model: Optional[str] = None) -> None:
    """Persist provided values (None = leave unchanged) and invalidate the cache."""
    db = SessionLocal()
    try:
        updates = {}
        if groq_api_key is not None and groq_api_key != "":
            updates[KEY_GROQ_API_KEY] = groq_api_key
        if groq_model is not None and groq_model != "":
            updates[KEY_GROQ_MODEL] = groq_model
        for key, value in updates.items():
            row = db.get(AppSetting, key)
            if row is None:
                db.add(AppSetting(key=key, value=value))
            else:
                row.value = value
        db.commit()
    finally:
        db.close()
    clear_cache()


def mask_key(key: str) -> str:
    """Show only enough of the key to recognise it: `gsk_...wxyz`."""
    if not key:
        return ""
    if len(key) <= 8:
        return "•" * len(key)
    return f"{key[:4]}…{key[-4:]}"
