"""The tool node: executes the tool calls the agent requested, then advances form state.

Wraps LangGraph's prebuilt `ToolNode` (which runs each tool and injects graph state via
`InjectedState`) and then merges every tool's `form_patch` artifact into `state["form"]`.
This is what lets a later tool in the same turn — e.g. `save_interaction` right after
`log_interaction` — see the freshly-extracted field values instead of the stale snapshot.
"""
from langgraph.prebuilt import ToolNode

from app.graph.state import AgentState
from app.tools import TOOLS

_base = ToolNode(TOOLS)


def tool_node(state: AgentState) -> dict:
    result = _base.invoke(state)
    messages = result["messages"]

    form = dict(state.get("form") or {})
    for msg in messages:
        artifact = getattr(msg, "artifact", None)
        if isinstance(artifact, dict):
            form.update(artifact.get("form_patch", {}) or {})

    return {"messages": messages, "form": form}
