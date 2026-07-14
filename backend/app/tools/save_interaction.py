"""Tool 5 (custom): save_interaction — persist the completed form to the database."""
from typing import Annotated

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.database.session import SessionLocal
from app.models.models import Interaction
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

    db = SessionLocal()
    try:
        row = Interaction(
            hcp_name=form.get("hcp_name", ""),
            interaction_type=form.get("interaction_type", "Meeting"),
            date=form.get("date", ""),
            time=form.get("time", ""),
            attendees=form.get("attendees", []) or [],
            topics=form.get("topics", ""),
            materials_shared=form.get("materials_shared", []) or [],
            samples_distributed=form.get("samples_distributed", []) or [],
            sentiment=form.get("sentiment", "Neutral"),
            outcomes=form.get("outcomes", ""),
            followup_actions=form.get("followup_actions", ""),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        saved_id = row.id
    finally:
        db.close()

    return (
        f"Saved the interaction with {form['hcp_name']} to the CRM (record #{saved_id}).",
        {"saved_id": saved_id, "tools_used": ["save_interaction"]},
    )
