"""The agent node: the LLM (with tools bound) decides whether to call a tool or reply.

This is where the graph delegates the *decision* to the model — no hardcoded field
routing. The model reads the conversation and either emits `tool_calls` or a final answer.

Resilience: some Groq models occasionally emit a malformed tool call ("tool_use_failed").
If that happens we retry once on a known-reliable fallback model, so one bad generation
never fails the whole turn.
"""
from app.graph.state import AgentState
from app.services import llm
from app.tools import TOOLS

FALLBACK_MODEL = "openai/gpt-oss-20b"


def _invoke(messages, model=None):
    client = llm.get_chat_model(temperature=0.1, model=model).bind_tools(TOOLS)
    return client.invoke(messages)


def agent_node(state: AgentState) -> dict:
    messages = state["messages"]
    try:
        response = _invoke(messages)
    except Exception as exc:  # noqa: BLE001
        # Groq "tool_use_failed" → retry on a model that tool-calls reliably.
        if "tool_use_failed" in str(exc):
            response = _invoke(messages, model=FALLBACK_MODEL)
        else:
            raise
    return {"messages": [response]}
