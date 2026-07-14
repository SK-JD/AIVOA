"""Business reference data for the HCP interaction domain.

Kept as constants (not a DB table) to stay assessment-light while still giving the
Materials field real, catalog-backed meaning. `search_materials` matches free text
against these types; the UI renders each as a preview card with its own icon.
"""

# Marketing collateral a rep can leave with an HCP. `key` maps to a frontend icon.
MATERIAL_TYPES = [
    {"type": "Brochure", "key": "brochure"},
    {"type": "Product Leaflet", "key": "leaflet"},
    {"type": "Clinical Study", "key": "clinical"},
    {"type": "Research Paper", "key": "research"},
    {"type": "Product Catalogue", "key": "catalogue"},
    {"type": "Presentation Deck", "key": "deck"},
    {"type": "Safety Information", "key": "safety"},
    {"type": "Other Marketing Material", "key": "other"},
]

MATERIAL_TYPE_NAMES = [m["type"] for m in MATERIAL_TYPES]
DEFAULT_MATERIAL_TYPE = "Other Marketing Material"

# Keyword → catalog type, so "shared a brochure" / "left the clinical study" resolve.
_MATERIAL_KEYWORDS = {
    "brochure": "Brochure",
    "leaflet": "Product Leaflet",
    "pamphlet": "Product Leaflet",
    "clinical study": "Clinical Study",
    "clinical": "Clinical Study",
    "study": "Clinical Study",
    "trial": "Clinical Study",
    "research paper": "Research Paper",
    "research": "Research Paper",
    "paper": "Research Paper",
    "catalogue": "Product Catalogue",
    "catalog": "Product Catalogue",
    "presentation": "Presentation Deck",
    "deck": "Presentation Deck",
    "slides": "Presentation Deck",
    "safety": "Safety Information",
    "pdf": "Other Marketing Material",
}


def resolve_material_type(text: str) -> str:
    """Best-effort map of free text to a catalog material type."""
    low = (text or "").lower()
    for keyword, mtype in _MATERIAL_KEYWORDS.items():
        if keyword in low:
            return mtype
    return DEFAULT_MATERIAL_TYPE
