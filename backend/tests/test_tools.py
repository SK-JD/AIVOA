"""The 6 tools — exercised via their underlying functions (`.func`), with the LLM mocked."""
from app.tools.edit_interaction import edit_interaction
from app.tools.log_interaction import log_interaction
from app.tools.save_interaction import save_interaction
from app.tools.search_hcp import search_hcp
from app.tools.search_materials import search_materials


def _artifact(result):
    return result[1]  # (content, artifact) tuple from content_and_artifact tools


def test_edit_interaction_sets_scalar():
    _, art = edit_interaction.func(field="sentiment", value="positive", form={})
    assert art["form_patch"] == {"sentiment": "Positive"}


def test_edit_interaction_appends_to_list():
    _, art = edit_interaction.func(field="attendees", value="Dr. Lee", form={"attendees": ["Nurse Jo"]})
    assert art["form_patch"]["attendees"] == ["Nurse Jo", "Dr. Lee"]


def test_edit_interaction_unknown_field():
    content, art = edit_interaction.func(field="weather", value="sunny", form={})
    assert "couldn't map" in content.lower()
    assert art == {}


def test_search_hcp_finds_seeded_directory():
    _, art = search_hcp.func(name="smith")
    assert art["form_patch"]["hcp_name"] == "Dr. Smith"


def test_search_hcp_no_match():
    content, art = search_hcp.func(name="zzzz")
    assert "no hcp" in content.lower()
    assert "form_patch" not in art


def test_search_materials_maps_to_catalog():
    _, art = search_materials.func(name="Product X clinical study", form={})
    mats = art["form_patch"]["materials_shared"]
    assert mats[0]["type"] == "Clinical Study"


def test_log_interaction_uses_llm_extraction(monkeypatch):
    from app.services import llm

    monkeypatch.setattr(llm, "complete_json", lambda *a, **k: {
        "hcp_name": "Dr. Smith", "sentiment": "positive", "topics": "Product X",
        "materials_shared": ["a brochure"],
    })
    _, art = log_interaction.func(description="met dr smith about product x, went well, gave a brochure")
    patch = art["form_patch"]
    assert patch["hcp_name"] == "Dr. Smith"
    assert patch["sentiment"] == "Positive"
    assert patch["materials_shared"][0]["type"] == "Brochure"


def test_save_interaction_blocks_when_required_missing():
    content, art = save_interaction.func(form={"hcp_name": "Dr. Lee"})  # no topics
    assert "missing" in content.lower()
    assert "saved_id" not in art
    assert art["missing_required"] == ["Topics Discussed"]


def test_save_interaction_persists_complete_form():
    _, art = save_interaction.func(form={
        "hcp_name": "Dr. Smith", "topics": "Product X", "sentiment": "Positive",
        "materials_shared": [{"type": "Brochure", "name": "Product X Brochure"}],
        "samples_distributed": [{"name": "Product X Sample", "quantity": 2}],
    })
    assert isinstance(art["saved_id"], int)
