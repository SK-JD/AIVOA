"""The agent node: the LLM (with tools bound) decides whether to call a tool or reply.

This is where the graph delegates the *decision* to the model — no hardcoded field
routing. The model reads the conversation and either emits `tool_calls` or a final answer.
"""
from app.graph.state import AgentState
from app.services import llm
from app.tools import TOOLS


def agent_node(state: AgentState) -> dict:
    model = llm.get_chat_model(temperature=0.2).bind_tools(TOOLS)
    response = model.invoke(state["messages"])
    return {"messages": [response]}
