"""Build and compile the LangGraph agent — the canonical tool-calling (ReAct) loop.

    ┌──────────────────────────────────────────────┐
    │  agent ──should_continue──▶ tools ──▶ agent   │  (loop until no tool calls)
    │    │                                          │
    │    └── "end" ──▶ END                          │
    └──────────────────────────────────────────────┘

The graph orchestrates the tools: the agent (LLM) decides which tool to call, the tool
node runs it, and control returns to the agent until it produces a plain reply. There is
no hardcoded conditional logic mapping user text to fields — that reasoning lives in the LLM.
"""
from langgraph.graph import END, StateGraph

from app.graph.state import AgentState
from app.nodes.agent_node import agent_node
from app.nodes.tool_node import tool_node

_compiled = None


def should_continue(state: AgentState) -> str:
    """Route to the tools node if the last AI message requested tool calls, else finish."""
    last = state["messages"][-1]
    if getattr(last, "tool_calls", None):
        return "tools"
    return "end"


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", "end": END})
    graph.add_edge("tools", "agent")

    return graph.compile()


def get_graph():
    """Return the process-wide compiled graph (built once, reused for every turn)."""
    global _compiled
    if _compiled is None:
        _compiled = build_graph()
    return _compiled
