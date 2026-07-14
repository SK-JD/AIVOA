"""Tool 2 (mandatory): edit_interaction — conversational single-field corrections."""
from typing import Annotated

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.tools.common import LIST_FIELDS, coerce_value, normalize_field


@tool(response_format="content_and_artifact")
def edit_interaction(field: str, value: str, form: Annotated[dict, InjectedState("form")]):
    """Update a SINGLE field of the interaction form based on a user correction, e.g.
    "change the sentiment to neutral", "set the date to 2025-04-20", "add Dr. Jones to attendees".
    `field` is the form field to change and `value` is the new value."""
    key = normalize_field(field)
    if key is None:
        return f"I couldn't map '{field}' to a form field.", {}

    coerced = coerce_value(key, value)
    # For list fields, append to what's already there (dedup) rather than replacing.
    if key in LIST_FIELDS:
        existing = form.get(key) or []
        merged = list(existing)
        for item in coerced:
            if item not in merged:
                merged.append(item)
        coerced = merged

    label = key.replace("_", " ")
    return f"Updated {label}.", {"form_patch": {key: coerced}, "tools_used": ["edit_interaction"]}
