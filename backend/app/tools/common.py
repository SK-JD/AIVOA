"""Shared helpers for the tools: field normalization, value coercion, patch cleaning.

Keeps the form contract (field names + types) in one place so every tool produces a
`form_patch` that merges cleanly into the Redux form on the frontend.
"""
import re

from app.config.catalog import resolve_material_type

STRING_FIELDS = {
    "hcp_name", "interaction_type", "date", "time", "duration",
    "topics", "sentiment", "outcomes", "followup_actions",
}
ATTENDEE_FIELDS = {"attendees"}             # list[{name, role}]
MATERIAL_FIELDS = {"materials_shared"}      # list[{type, name}]
SAMPLE_FIELDS = {"samples_distributed"}     # list[{name, quantity}]
LIST_FIELDS = ATTENDEE_FIELDS | MATERIAL_FIELDS | SAMPLE_FIELDS
ALL_FIELDS = STRING_FIELDS | LIST_FIELDS

SENTIMENTS = {"positive": "Positive", "neutral": "Neutral", "negative": "Negative"}

# user-facing aliases → canonical field name
_ALIASES = {
    "hcp": "hcp_name", "hcp name": "hcp_name", "name": "hcp_name", "doctor": "hcp_name",
    "type": "interaction_type", "interaction type": "interaction_type",
    "date": "date", "time": "time", "duration": "duration",
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
    return [s.strip() for s in items if isinstance(s, str) and s.strip()]


def _as_items(value) -> list:
    """Return raw items (dicts kept as-is, strings split on separators)."""
    if isinstance(value, list):
        return [i for i in value if i not in ("", None)]
    return _split_list(value)


def _as_material(item) -> dict:
    """Normalize a string or dict into a catalog-typed material {type, name}."""
    if isinstance(item, dict):
        name = str(item.get("name") or item.get("type") or "").strip()
        mtype = str(item.get("type") or "").strip() or resolve_material_type(name)
        return {"type": mtype, "name": name or mtype}
    text = str(item).strip()
    return {"type": resolve_material_type(text), "name": text}


def _as_sample(item) -> dict:
    """Normalize a string or dict into a sample {name, quantity}."""
    if isinstance(item, dict):
        name = str(item.get("name") or "").strip()
        try:
            qty = int(item.get("quantity") or 1)
        except (TypeError, ValueError):
            qty = 1
        return {"name": name, "quantity": max(qty, 1)}
    return {"name": str(item).strip(), "quantity": 1}


def _as_attendee(item) -> dict:
    """Normalize a string or dict into an attendee {name, role}."""
    if isinstance(item, dict):
        return {"name": str(item.get("name") or "").strip(), "role": str(item.get("role") or "").strip()}
    return {"name": str(item).strip(), "role": ""}


def _normalize_time(value) -> str:
    """Normalize a time to 24h HH:MM (for the native time input); leave as-is if unparseable."""
    s = str(value).strip()
    m = re.match(r"^(\d{1,2}):(\d{2})\s*([APap][Mm])?$", s)
    if not m:
        return s
    hour, minute, meridiem = int(m.group(1)), m.group(2), m.group(3)
    if meridiem:
        meridiem = meridiem.lower()
        if meridiem == "pm" and hour != 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
    return f"{hour:02d}:{minute}"


def coerce_value(key: str, value):
    if key == "time":
        return _normalize_time(value)
    if key in MATERIAL_FIELDS:
        out, seen = [], set()
        for m in (_as_material(i) for i in _as_items(value)):
            fp = (m["type"], m["name"].lower())
            if m["name"] and fp not in seen:
                seen.add(fp)
                out.append(m)
        return out
    if key in SAMPLE_FIELDS:
        return [s for s in (_as_sample(i) for i in _as_items(value)) if s["name"]]
    if key in ATTENDEE_FIELDS:
        out, seen = [], set()
        for a in (_as_attendee(i) for i in _as_items(value)):
            if a["name"] and a["name"].lower() not in seen:
                seen.add(a["name"].lower())
                out.append(a)
        return out
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
