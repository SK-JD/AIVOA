"""Required-field reasoning + form summary."""
from app.services.form_logic import form_summary, missing_recommended, missing_required


def test_missing_required_flags_empty_fields():
    assert set(missing_required({"hcp_name": "", "topics": ""})) == {"HCP Name", "Topics Discussed"}
    assert missing_required({"hcp_name": "Dr. Smith", "topics": "Product X"}) == []


def test_missing_recommended():
    assert set(missing_recommended({})) == {"Outcomes", "Follow-up Actions"}
    assert missing_recommended({"outcomes": "Interested", "followup_actions": "Call"}) == []


def test_form_summary_renders_lists_and_objects():
    summary = form_summary({
        "hcp_name": "Dr. Smith",
        "materials_shared": [{"type": "Brochure", "name": "Product X Brochure"}],
        "attendees": ["Nurse Jo"],
        "topics": "",
    })
    assert "Dr. Smith" in summary
    assert "Product X Brochure" in summary
    assert "Nurse Jo" in summary
    assert "Topics Discussed: —" in summary  # empty shown as dash
