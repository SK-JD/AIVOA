"""SQLAlchemy ORM models — three small, normalized tables.

- HCP          : the directory of Healthcare Professionals (backs `search_hcp`).
- Interaction  : a logged HCP interaction (written by `save_interaction`).
- AppSetting   : a tiny key/value store backing the runtime settings / admin panel.

List-ish fields (attendees, materials, samples, follow-ups) are stored as JSON to
keep the schema lightweight for an assessment while staying structured.
"""
from datetime import datetime

from sqlalchemy import String, Text, JSON, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class HCP(Base):
    __tablename__ = "hcps"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    specialty: Mapped[str] = mapped_column(String(200), default="")
    organization: Mapped[str] = mapped_column(String(200), default="")


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    hcp_name: Mapped[str] = mapped_column(String(200), default="")
    interaction_type: Mapped[str] = mapped_column(String(100), default="Meeting")
    date: Mapped[str] = mapped_column(String(20), default="")
    time: Mapped[str] = mapped_column(String(20), default="")
    duration: Mapped[str] = mapped_column(String(50), default="")
    attendees: Mapped[list] = mapped_column(JSON, default=list)
    topics: Mapped[str] = mapped_column(Text, default="")
    materials_shared: Mapped[list] = mapped_column(JSON, default=list)
    samples_distributed: Mapped[list] = mapped_column(JSON, default=list)
    sentiment: Mapped[str] = mapped_column(String(20), default="Neutral")
    outcomes: Mapped[str] = mapped_column(Text, default="")
    followup_actions: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class AppSetting(Base):
    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, default="")
