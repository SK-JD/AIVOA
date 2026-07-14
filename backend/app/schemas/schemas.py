"""Pydantic request/response models — the HTTP contract shared with the React app.

`FormState` is the single source of truth for the interaction form shape; the Redux
`formSlice` mirrors these field names exactly so a `form_patch` merges cleanly.
"""
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

Sentiment = Literal["Positive", "Neutral", "Negative"]


class Material(BaseModel):
    """A piece of marketing collateral shared with the HCP (catalog-typed)."""

    type: str = "Other Marketing Material"
    name: str = ""


class Sample(BaseModel):
    """A physical product sample handed to the HCP."""

    name: str = ""
    quantity: int = 1


class FormState(BaseModel):
    """The Log HCP Interaction form. All fields optional so a patch can be partial."""

    hcp_name: str = ""
    interaction_type: str = "Meeting"
    date: str = ""
    time: str = ""
    attendees: list[str] = Field(default_factory=list)
    topics: str = ""
    materials_shared: list[Material] = Field(default_factory=list)
    samples_distributed: list[Sample] = Field(default_factory=list)
    sentiment: Sentiment = "Neutral"
    outcomes: str = ""
    followup_actions: str = ""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """A chat turn. Send either a single `message` or the full `messages` history."""

    message: Optional[str] = None
    messages: list[ChatMessage] = Field(default_factory=list)
    form: FormState = Field(default_factory=FormState)


class ChatResponse(BaseModel):
    reply: str
    form_patch: dict[str, Any] = Field(default_factory=dict)
    suggestions: list[str] = Field(default_factory=list)
    saved_id: Optional[int] = None
    tools_used: list[str] = Field(default_factory=list)


class HCPOut(BaseModel):
    id: int
    name: str
    specialty: str
    organization: str


class SettingsOut(BaseModel):
    groq_api_key_masked: str
    groq_model: str
    has_key: bool


class SettingsIn(BaseModel):
    groq_api_key: Optional[str] = None  # None = leave unchanged
    groq_model: Optional[str] = None


class TestConnectionIn(BaseModel):
    """Optionally test a key/model *before* saving. Omit to test the saved values."""

    groq_api_key: Optional[str] = None
    groq_model: Optional[str] = None


class TestConnectionResult(BaseModel):
    ok: bool
    model: str
    error: Optional[str] = None
