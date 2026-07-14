"""Tool 2 (mandatory): edit_interaction — conversational field edits.

Supports four actions so the assistant can genuinely change the form:
  - set    : replace the field's value (default)
  - add    : append to a list field (attendees / materials / samples)
  - remove : remove a matching item from a list field
  - clear  : empty the field
"""
from typing import Annotated, Literal

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.tools.common import LIST_FIELDS, coerce_value, normalize_field

Action = Literal["set", "add", "remove", "clear"]


def _item_key(item) -> str:
    if isinstance(item, dict):
        return str(item.get("name") or item.get("type") or "").strip().lower()
    return str(item).strip().lower()


@tool(response_format="content_and_artifact")
def edit_interaction(
    field: str,
    form: Annotated[dict, InjectedState("form")],
    value: str = "",
    action: Action = "set",
):
    """Edit ONE field of the interaction form.
    - action="set": replace the field (e.g. "change sentiment to neutral").
    - action="add": append to a list field (e.g. "add Dr. Sharma to attendees").
    - action="remove": remove a matching item from a list field (e.g. "remove Dr. Sharma from attendees").
    - action="clear": empty the field entirely (e.g. "clear the attendees", "remove all materials").
    `field` is the form field; `value` is the new/target value (ignored for clear)."""
    key = normalize_field(field)
    if key is None:
        return f"I couldn't map '{field}' to a form field.", {}

    label = key.replace("_", " ")

    if action == "clear":
        empty = [] if key in LIST_FIELDS else ""
        return f"Cleared {label}.", {"form_patch": {key: empty}, "tools_used": ["edit_interaction"]}

    if key not in LIST_FIELDS:
        return f"Updated {label}.", {
            "form_patch": {key: coerce_value(key, value)},
            "tools_used": ["edit_interaction"],
        }

    # List fields
    existing = list(form.get(key) or [])
    incoming = coerce_value(key, value)

    if action == "remove":
        targets = {_item_key(i) for i in incoming}
        kept = [item for item in existing if _item_key(item) not in targets]
        removed = len(existing) - len(kept)
        msg = f"Removed {removed} item(s) from {label}." if removed else f"Nothing matching in {label} to remove."
        return msg, {"form_patch": {key: kept}, "tools_used": ["edit_interaction"]}

    if action == "set":
        return f"Updated {label}.", {"form_patch": {key: incoming}, "tools_used": ["edit_interaction"]}

    # add (default for list growth)
    merged = list(existing)
    seen = {_item_key(i) for i in existing}
    for item in incoming:
        if _item_key(item) not in seen:
            merged.append(item)
            seen.add(_item_key(item))
    return f"Updated {label}.", {"form_patch": {key: merged}, "tools_used": ["edit_interaction"]}
