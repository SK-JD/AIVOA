"""The tool registry the LangGraph agent orchestrates.

Five tools — two mandatory (log/edit) + three custom CRM tools — all bound to the
LLM so the graph decides which to call from natural language, with no hardcoded routing.
"""
from app.tools.edit_interaction import edit_interaction
from app.tools.log_interaction import log_interaction
from app.tools.save_interaction import save_interaction
from app.tools.search_hcp import search_hcp
from app.tools.suggest_followups import suggest_followups

TOOLS = [
    log_interaction,
    edit_interaction,
    search_hcp,
    suggest_followups,
    save_interaction,
]

__all__ = ["TOOLS"]
