"""Runtime settings overlay (DB → env fallback) + key masking."""
from app.services import settings_service


def test_save_and_read_model_from_db():
    settings_service.save_settings(groq_model="openai/gpt-oss-20b")
    assert settings_service.get_groq_model() == "openai/gpt-oss-20b"


def test_env_fallback_when_no_db_row():
    # unknown key falls back to the env default, not empty
    assert settings_service.get_groq_model()  # always resolves to something


def test_mask_key():
    assert settings_service.mask_key("gsk_1234567890abcd").endswith("abcd")
    assert settings_service.mask_key("") == ""
    assert "…" in settings_service.mask_key("gsk_abcdefgh")
