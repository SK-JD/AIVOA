"""Persistence for logged interactions — used by both the save_interaction tool and the
REST endpoints (Save button + records table), so there's one place that writes the row.
"""
from app.database.session import SessionLocal
from app.models.models import Interaction


def save_interaction(form: dict) -> int:
    """Persist a form dict to the interactions table and return the new row id."""
    db = SessionLocal()
    try:
        row = Interaction(
            hcp_name=form.get("hcp_name", ""),
            interaction_type=form.get("interaction_type", "Meeting"),
            date=form.get("date", ""),
            time=form.get("time", ""),
            duration=form.get("duration", ""),
            attendees=form.get("attendees", []) or [],
            topics=form.get("topics", ""),
            materials_shared=form.get("materials_shared", []) or [],
            samples_distributed=form.get("samples_distributed", []) or [],
            sentiment=form.get("sentiment", "Neutral"),
            outcomes=form.get("outcomes", ""),
            followup_actions=form.get("followup_actions", ""),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row.id
    finally:
        db.close()


def list_interactions() -> list[dict]:
    """Return all saved interactions, newest first, as plain dicts."""
    db = SessionLocal()
    try:
        rows = db.query(Interaction).order_by(Interaction.id.desc()).all()
        return [
            {
                "id": r.id,
                "hcp_name": r.hcp_name,
                "interaction_type": r.interaction_type,
                "date": r.date,
                "time": r.time,
                "duration": r.duration,
                "attendees": r.attendees or [],
                "topics": r.topics,
                "materials_shared": r.materials_shared or [],
                "samples_distributed": r.samples_distributed or [],
                "sentiment": r.sentiment,
                "outcomes": r.outcomes,
                "followup_actions": r.followup_actions,
                "created_at": r.created_at.isoformat() if r.created_at else "",
            }
            for r in rows
        ]
    finally:
        db.close()
