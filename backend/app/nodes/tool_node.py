"""The tool node: executes the tool calls the agent requested.

Uses LangGraph's prebuilt `ToolNode`, which runs each requested tool, injects graph
state where a tool declares `InjectedState`, and appends a `ToolMessage` (carrying the
tool's `artifact`, e.g. our `form_patch`) back into the conversation.
"""
from langgraph.prebuilt import ToolNode

from app.tools import TOOLS

tool_node = ToolNode(TOOLS)
