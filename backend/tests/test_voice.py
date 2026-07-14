"""Groq Whisper transcription (with the Groq SDK mocked)."""
import pytest

from app.services import voice
from app.services.llm import GroqNotConfiguredError


def test_transcribe_returns_text(monkeypatch):
    class FakeTranscriptions:
        def create(self, **kwargs):
            assert kwargs["model"] == voice.WHISPER_MODEL
            return "  met dr smith about product x  "

    class FakeGroq:
        def __init__(self, api_key=None):
            self.audio = type("A", (), {"transcriptions": FakeTranscriptions()})()

    monkeypatch.setattr(voice, "Groq", FakeGroq)
    monkeypatch.setattr(voice.settings_service, "get_groq_api_key", lambda: "test-key")

    text = voice.transcribe(b"audio-bytes", "note.webm")
    assert text == "met dr smith about product x"  # trimmed


def test_transcribe_requires_key(monkeypatch):
    monkeypatch.setattr(voice.settings_service, "get_groq_api_key", lambda: "")
    with pytest.raises(GroqNotConfiguredError):
        voice.transcribe(b"audio")
