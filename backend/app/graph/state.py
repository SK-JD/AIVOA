"""The state the LangGraph agent operates on for one chat turn.

- `messages` : the running conversation (system + user + AI + tool messages), with the
  standard `add_messages` reducer so tool results append correctly.
- `form`     : a snapshot of the current form, injected into tools via `InjectedState("form")`
  so `edit`/`save`/`suggest_followups` can read live field values.
"""
from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    form: dict
