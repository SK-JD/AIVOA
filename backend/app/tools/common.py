"""Shared helpers for the tools: field normalization, value coercion, patch cleaning.

Keeps the form contract (field names + types) in one place so every tool produces a
`form_patch` that merges cleanly into the Redux form on the frontend.
"""
import re

STRING_FIELDS = {
    "hcp_name", "interaction_type", "date", "time",
    "topics", "sentiment", "outcomes", "followup_actions",
}
LIST_FIELDS = {"attendees", "materials_shared", "samples_distributed"}
ALL_FIELDS = STRING_FIELDS | LIST_FIELDS

SENTIMENTS = {"positive": "Positive", "neutral": "Neutral", "negative": "Negative"}

# user-facing aliases → canonical field name
_ALIASES = {
    "hcp": "hcp_name", "hcp name": "hcp_name", "name": "hcp_name", "doctor": "hcp_name",
    "type": "interaction_type", "interaction type": "interaction_type",
    "date": "date", "time": "time",
    "attendee": "attendees", "attendees": "attendees",
    "topic": "topics", "topics": "topics", "topics discussed": "topics", "discussion": "topics",
    "material": "materials_shared", "materials": "materials_shared",
    "materials shared": "materials_shared", "brochure": "materials_shared", "brochures": "materials_shared",
    "sample": "samples_distributed", "samples": "samples_distributed",
    "samples distributed": "samples_distributed",
    "sentiment": "sentiment", "reaction": "sentiment", "mood": "sentiment",
    "outcome": "outcomes", "outcomes": "outcomes",
    "followup": "followup_actions", "follow-up": "followup_actions", "follow up": "followup_actions",
    "followup actions": "followup_actions", "follow-up actions": "followup_actions",
    "next steps": "followup_actions",
}


def normalize_field(field: str) -> str | None:
    key = (field or "").strip().lower()
    if key in ALL_FIELDS:
        return key
    return _ALIASES.get(key)


def _split_list(value) -> list[str]:
    if isinstance(value, list):
        items = value
    else:
        items = re.split(r",|;|\band\b", str(value))
    return [s.strip() for s in items if s and s.strip()]


def coerce_value(key: str, value):
    if key in LIST_FIELDS:
        return _split_list(value)
    if key == "sentiment":
        return SENTIMENTS.get(str(value).strip().lower(), "Neutral")
    return str(value).strip()


def clean_patch(data: dict) -> dict:
    """Keep only known fields, coerce types, and drop empties so we never clobber
    existing form values with blanks."""
    patch: dict = {}
    for key, value in (data or {}).items():
        canon = normalize_field(key)
        if not canon:
            continue
        coerced = coerce_value(canon, value)
        if coerced in ("", [], None):
            continue
        patch[canon] = coerced
    return patch


def summarize_patch(patch: dict) -> str:
    if not patch:
        return "I couldn't find any interaction details to log."
    bits = []
    if patch.get("hcp_name"):
        bits.append(f"HCP {patch['hcp_name']}")
    if patch.get("sentiment"):
        bits.append(f"{patch['sentiment'].lower()} sentiment")
    if patch.get("topics"):
        bits.append("topics")
    if patch.get("materials_shared"):
        bits.append("materials")
    if patch.get("followup_actions"):
        bits.append("a follow-up")
    filled = ", ".join(bits) if bits else "the details"
    return f"Logged the interaction — captured {filled}."
