"""Tool 5 (custom): save_interaction — persist the completed form to the database."""
from typing import Annotated

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.services import interaction_service
from app.services.form_logic import missing_required


@tool(response_format="content_and_artifact")
def save_interaction(form: Annotated[dict, InjectedState("form")]):
    """Persist the current interaction form to the CRM database. Use when the user asks to
    log / save / submit the interaction. Requires HCP Name and Topics Discussed; if either is
    missing, do NOT save — ask the user for it instead."""
    missing = missing_required(form)
    if missing:
        return (
            f"I can't save yet — still missing: {', '.join(missing)}. "
            "Could you provide that so I can complete the record?",
            {"tools_used": ["save_interaction"], "missing_required": missing},
        )

    saved_id = interaction_service.save_interaction(form)
    return (
        f"Saved the interaction with {form['hcp_name']} to the CRM (record #{saved_id}).",
        {"saved_id": saved_id, "tools_used": ["save_interaction"]},
    )
