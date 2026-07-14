"""Tool 1 (mandatory): log_interaction — natural language → structured form fields."""
from datetime import date

from langchain_core.tools import tool

from app.prompts import load_prompt
from app.services import llm
from app.tools.common import clean_patch, summarize_patch


@tool(response_format="content_and_artifact")
def log_interaction(description: str):
    """Extract ALL structured interaction details (HCP name, type, date, time, attendees,
    topics, materials shared, samples, sentiment, outcomes, follow-up) from a natural-language
    description of a meeting with a Healthcare Professional, and populate the form.
    Use this the first time the user describes an interaction."""
    system = load_prompt("json_system")
    user = load_prompt("extract", description=description, today=date.today().isoformat())
    data = llm.complete_json(system, user)
    patch = clean_patch(data)
    return summarize_patch(patch), {"form_patch": patch, "tools_used": ["log_interaction"]}
