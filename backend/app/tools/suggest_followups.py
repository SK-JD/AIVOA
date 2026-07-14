"""Tool 4 (custom): suggest_followups — AI-generated next-step suggestions.

Powers the "AI Suggested Follow-ups" list shown under Follow-up Actions in the UI.
"""
from typing import Annotated

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.prompts import load_prompt
from app.services import llm


@tool(response_format="content_and_artifact")
def suggest_followups(form: Annotated[dict, InjectedState("form")], context: str = ""):
    """Generate 2–4 suggested follow-up actions based on the interaction logged so far
    (HCP, topics, sentiment, outcomes). Optionally pass extra `context`. Use when the user
    asks for follow-up ideas or next steps."""
    system = load_prompt("json_system")
    user = load_prompt(
        "followups",
        hcp_name=form.get("hcp_name", ""),
        topics=(form.get("topics", "") + (" " + context if context else "")).strip(),
        sentiment=form.get("sentiment", "Neutral"),
        outcomes=form.get("outcomes", ""),
        followup_actions=form.get("followup_actions", ""),
    )
    data = llm.complete_json(system, user)
    raw = data.get("suggestions", []) if isinstance(data, dict) else []
    suggestions = [str(s).strip() for s in raw if str(s).strip()][:4]

    if not suggestions:
        return "I couldn't generate follow-up suggestions right now.", {"tools_used": ["suggest_followups"]}

    content = "Suggested follow-ups: " + "; ".join(suggestions)
    return content, {"suggestions": suggestions, "tools_used": ["suggest_followups"]}
