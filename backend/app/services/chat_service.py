"""Drive one chat turn through the LangGraph agent and project the result to the API shape.

Flow: build messages (system + history + latest) → `graph.invoke(state)` → harvest each
tool's `artifact` (our `form_patch` / suggestions / saved_id) off the ToolMessages → return
the agent's final reply plus the merged form patch for Redux to apply.
"""
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

from app.graph.engine import get_graph
from app.prompts import load_prompt
from app.schemas import ChatRequest, ChatResponse
from app.services.llm import GroqNotConfiguredError

FALLBACK_REPLY = "Sorry, I hit a brief hiccup processing that — could you try rephrasing?"


def _build_messages(req: ChatRequest) -> list:
    messages: list = [SystemMessage(content=load_prompt("system"))]
    for m in req.messages:
        if m.role == "user":
            messages.append(HumanMessage(content=m.content))
        else:
            messages.append(AIMessage(content=m.content))
    if req.message:
        messages.append(HumanMessage(content=req.message))
    return messages


def _harvest(messages: list) -> tuple[dict, list, int | None, list]:
    """Merge artifacts from every ToolMessage produced during the turn."""
    form_patch: dict = {}
    suggestions: list = []
    saved_id: int | None = None
    tools_used: list = []

    for msg in messages:
        if not isinstance(msg, ToolMessage):
            continue
        artifact = getattr(msg, "artifact", None)
        if not isinstance(artifact, dict):
            continue
        form_patch.update(artifact.get("form_patch", {}) or {})
        if artifact.get("suggestions"):
            suggestions = artifact["suggestions"]
        if artifact.get("saved_id") is not None:
            saved_id = artifact["saved_id"]
        tools_used.extend(artifact.get("tools_used", []) or [])
    return form_patch, suggestions, saved_id, tools_used


def _final_reply(messages: list) -> str:
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and not getattr(msg, "tool_calls", None):
            text = (msg.content or "").strip()
            if text:
                return text
    return "Done."


def run_chat(req: ChatRequest) -> ChatResponse:
    if not req.message and not req.messages:
        return ChatResponse(reply="What interaction would you like to log?")

    state = {"messages": _build_messages(req), "form": req.form.model_dump()}

    try:
        result = get_graph().invoke(state)
    except GroqNotConfiguredError:
        raise  # surfaced by the router as 503
    except Exception:  # noqa: BLE001 — never 500 a turn
        return ChatResponse(reply=FALLBACK_REPLY)

    form_patch, suggestions, saved_id, tools_used = _harvest(result["messages"])
    return ChatResponse(
        reply=_final_reply(result["messages"]),
        form_patch=form_patch,
        suggestions=suggestions,
        saved_id=saved_id,
        tools_used=tools_used,
    )
