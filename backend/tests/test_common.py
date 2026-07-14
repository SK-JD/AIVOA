"""Field normalization, value coercion, and patch cleaning."""
from app.tools.common import clean_patch, coerce_value, normalize_field, summarize_patch


def test_normalize_field_aliases():
    assert normalize_field("HCP") == "hcp_name"
    assert normalize_field("doctor") == "hcp_name"
    assert normalize_field("next steps") == "followup_actions"
    assert normalize_field("reaction") == "sentiment"
    assert normalize_field("unknown field") is None


def test_coerce_time_to_24h():
    assert coerce_value("time", "10:30 AM") == "10:30"
    assert coerce_value("time", "2:15 PM") == "14:15"
    assert coerce_value("time", "12:00 AM") == "00:00"
    assert coerce_value("time", "09:00") == "09:00"


def test_coerce_sentiment_normalizes():
    assert coerce_value("sentiment", "positive") == "Positive"
    assert coerce_value("sentiment", "NEGATIVE") == "Negative"
    assert coerce_value("sentiment", "unsure") == "Neutral"


def test_coerce_attendees_to_objects():
    out = coerce_value("attendees", "Dr. Lee and Nurse Jo, Manager")
    assert [a["name"] for a in out] == ["Dr. Lee", "Nurse Jo", "Manager"]
    assert all("role" in a for a in out)


def test_coerce_attendees_accepts_objects_with_roles():
    out = coerce_value("attendees", [{"name": "Anitha Rao", "role": "Product Specialist"}])
    assert out == [{"name": "Anitha Rao", "role": "Product Specialist"}]


def test_coerce_materials_maps_catalog_and_dedupes():
    out = coerce_value("materials_shared", ["a brochure", "a brochure", "clinical study"])
    types = [m["type"] for m in out]
    assert types == ["Brochure", "Clinical Study"]  # duplicate brochure collapsed
    assert all("type" in m and "name" in m for m in out)


def test_coerce_materials_accepts_objects():
    out = coerce_value("materials_shared", [{"type": "Research Paper", "name": "Study A"}])
    assert out == [{"type": "Research Paper", "name": "Study A"}]


def test_coerce_samples_have_quantity():
    out = coerce_value("samples_distributed", [{"name": "Product X Sample", "quantity": 2}])
    assert out == [{"name": "Product X Sample", "quantity": 2}]
    assert coerce_value("samples_distributed", "Trial Pack") == [{"name": "Trial Pack", "quantity": 1}]


def test_clean_patch_drops_empties_and_unknowns():
    patch = clean_patch({
        "hcp_name": "Dr. Smith",
        "topics": "",              # empty → dropped
        "sentiment": "positive",
        "bogus": "x",              # unknown → dropped
        "materials_shared": [],    # empty list → dropped
    })
    assert patch == {"hcp_name": "Dr. Smith", "sentiment": "Positive"}


def test_summarize_patch_mentions_key_fields():
    text = summarize_patch({"hcp_name": "Dr. Smith", "sentiment": "Positive", "topics": "Product X"})
    assert "Dr. Smith" in text
