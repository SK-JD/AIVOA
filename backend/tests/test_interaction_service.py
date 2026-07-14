"""Saving + listing interactions (the Save button + records table)."""
from app.services import interaction_service


def test_save_and_list_newest_first():
    before = len(interaction_service.list_interactions())
    sid = interaction_service.save_interaction({
        "hcp_name": "Dr. Records", "topics": "Product Z", "sentiment": "Positive",
        "duration": "20 minutes",
        "attendees": [{"name": "Anitha Rao", "role": "Product Specialist"}],
        "materials_shared": [{"type": "Brochure", "name": "Z Brochure"}],
        "samples_distributed": [{"name": "Z Sample", "quantity": 3}],
    })
    assert isinstance(sid, int)

    rows = interaction_service.list_interactions()
    assert len(rows) == before + 1
    assert rows[0]["id"] == sid  # newest first
    assert rows[0]["hcp_name"] == "Dr. Records"
    assert rows[0]["duration"] == "20 minutes"
    assert rows[0]["attendees"][0]["role"] == "Product Specialist"
    assert rows[0]["samples_distributed"][0]["quantity"] == 3
