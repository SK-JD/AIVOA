"""Speech-to-text via Groq Whisper.

Kept separate from the chat LLM seam because audio transcription isn't part of the
LangChain chat interface — it uses the Groq SDK's audio endpoint directly. The API key
is the same one resolved by settings_service (env or admin panel). The resulting
transcript is fed back through the normal chat agent, so the voice path reuses the
whole extraction/clarify/validate workflow.
"""
from groq import Groq

from app.services import settings_service
from app.services.llm import GroqNotConfiguredError

WHISPER_MODEL = "whisper-large-v3-turbo"


def transcribe(audio: bytes, filename: str = "audio.webm") -> str:
    """Transcribe recorded audio bytes to text using Groq Whisper."""
    key = settings_service.get_groq_api_key()
    if not key:
        raise GroqNotConfiguredError(
            "GROQ_API_KEY is not configured. Set it in .env or via the Admin panel."
        )
    client = Groq(api_key=key)
    result = client.audio.transcriptions.create(
        file=(filename, audio),
        model=WHISPER_MODEL,
        response_format="text",
    )
    return str(result).strip()
