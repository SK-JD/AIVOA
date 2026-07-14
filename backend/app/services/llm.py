"""The single LLM seam — the ONLY module that imports LangChain / Groq.

Everything else (graph, tools) depends on these thin helpers, so the provider can be
swapped in one place. The Groq key/model are read from `settings_service` on every
build, so an admin change takes effect without a restart.

Two shapes for callers:
  - `complete_text`  → free-form prose
  - `complete_json`  → a parsed dict (Groq JSON mode + tolerant parser)
And `get_chat_model()` returns a raw ChatGroq for the graph's tool-calling agent node.
"""
import json
import re
from typing import Optional

from app.services import settings_service


class GroqNotConfiguredError(RuntimeError):
    """Raised when no Groq API key is available (surfaced by the API as 503)."""


def _resolve_key() -> str:
    key = settings_service.get_groq_api_key()
    if not key:
        raise GroqNotConfiguredError(
            "GROQ_API_KEY is not configured. Set it in .env or via the Admin panel."
        )
    return key


def get_chat_model(temperature: float = 0.3, json_mode: bool = False, api_key: Optional[str] = None,
                   model: Optional[str] = None):
    """Build a ChatGroq client. Imported lazily so the module stays import-light."""
    from langchain_groq import ChatGroq  # provider swap point

    kwargs = {
        "model": model or settings_service.get_groq_model(),
        "api_key": api_key or _resolve_key(),
        "temperature": temperature,
        "max_retries": 1,
        "timeout": 45,
    }
    if json_mode:
        kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}
    return ChatGroq(**kwargs)


def complete_text(system: str, user: str, temperature: float = 0.4, max_tokens: int = 500) -> str:
    from langchain_core.messages import HumanMessage, SystemMessage

    client = get_chat_model(temperature=temperature).bind(max_tokens=max_tokens)
    resp = client.invoke([SystemMessage(content=system), HumanMessage(content=user)])
    return (getattr(resp, "content", "") or "").strip()


def complete_json(system: str, user: str, temperature: float = 0.0, max_tokens: int = 800) -> dict:
    from langchain_core.messages import HumanMessage, SystemMessage

    client = get_chat_model(temperature=temperature, json_mode=True).bind(max_tokens=max_tokens)
    resp = client.invoke([SystemMessage(content=system), HumanMessage(content=user)])
    return _safe_json_parse(getattr(resp, "content", "") or "")


def test_connection(api_key: Optional[str] = None, model: Optional[str] = None) -> tuple[bool, str]:
    """Ping Groq with a trivial prompt. Returns (ok, error_message)."""
    from langchain_core.messages import HumanMessage

    try:
        key = api_key or settings_service.get_groq_api_key()
        if not key:
            return False, "No API key provided."
        client = get_chat_model(temperature=0.0, api_key=key, model=model).bind(max_tokens=5)
        client.invoke([HumanMessage(content="Reply with: OK")])
        return True, ""
    except Exception as exc:  # noqa: BLE001 — surface any provider error to the admin
        return False, str(exc)


def _safe_json_parse(text: str) -> dict:
    """Tolerant JSON parse: strips ```json fences, falls back to the outermost {...}."""
    text = text.strip()
    if not text:
        return {}
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
    return {}
