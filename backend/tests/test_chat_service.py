"""Harvesting tool artifacts and picking the final reply."""
from langchain_core.messages import AIMessage, ToolMessage

from app.services.chat_service import _final_reply, _harvest, _system_message


def test_harvest_merges_artifacts():
    messages = [
        ToolMessage(content="logged", tool_call_id="1",
                    artifact={"form_patch": {"hcp_name": "Dr. Smith"}, "tools_used": ["log_interaction"]}),
        ToolMessage(content="saved", tool_call_id="2",
                    artifact={"saved_id": 7, "tools_used": ["save_interaction"]}),
        ToolMessage(content="ideas", tool_call_id="3",
                    artifact={"suggestions": ["Call in 2 weeks"], "tools_used": ["suggest_followups"]}),
    ]
    patch, suggestions, saved_id, tools_used = _harvest(messages)
    assert patch == {"hcp_name": "Dr. Smith"}
    assert saved_id == 7
    assert suggestions == ["Call in 2 weeks"]
    assert set(tools_used) == {"log_interaction", "save_interaction", "suggest_followups"}


def test_final_reply_skips_tool_call_messages():
    messages = [
        AIMessage(content="", tool_calls=[{"name": "x", "args": {}, "id": "1", "type": "tool_call"}]),
        AIMessage(content="All set — logged the meeting."),
    ]
    assert _final_reply(messages) == "All set — logged the meeting."


def test_system_message_injects_missing_required():
    msg = _system_message({"hcp_name": "", "topics": ""})
    assert "HCP Name" in msg.content
    assert "Topics Discussed" in msg.content
