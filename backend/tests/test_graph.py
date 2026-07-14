"""Graph routing + the tool node's within-turn form-state merge."""
from langchain_core.messages import AIMessage, ToolMessage

from app.graph.engine import build_graph, should_continue
from app.nodes.tool_node import advance_form


def test_should_continue_routes_to_tools_when_tool_calls_present():
    ai = AIMessage(content="", tool_calls=[
        {"name": "log_interaction", "args": {"description": "x"}, "id": "1", "type": "tool_call"},
    ])
    assert should_continue({"messages": [ai]}) == "tools"


def test_should_continue_ends_on_plain_reply():
    assert should_continue({"messages": [AIMessage(content="done")]}) == "end"


def test_graph_compiles_with_expected_nodes():
    graph = build_graph()
    nodes = set(graph.get_graph().nodes.keys())
    assert {"agent", "tools"} <= nodes


def test_advance_form_merges_tool_patches_in_order():
    messages = [
        ToolMessage(content="logged", tool_call_id="1",
                    artifact={"form_patch": {"hcp_name": "Dr. Smith", "sentiment": "Positive"}}),
        ToolMessage(content="edited", tool_call_id="2",
                    artifact={"form_patch": {"sentiment": "Neutral"}}),  # later patch wins
    ]
    form = advance_form({"sentiment": "Neutral"}, messages)
    assert form["hcp_name"] == "Dr. Smith"
    assert form["sentiment"] == "Neutral"


def test_advance_form_ignores_non_artifact_messages():
    assert advance_form({"a": 1}, [AIMessage(content="hi")]) == {"a": 1}
