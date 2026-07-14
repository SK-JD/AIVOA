"""Tool 6 (custom): search_materials — resolve a mentioned material to the CRM catalog.

Mirrors search_hcp but for marketing collateral: maps free text ("the clinical study",
"a brochure") to a catalog type and adds it to Materials Shared as a typed preview item.
"""
from typing import Annotated

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.config.catalog import MATERIAL_TYPE_NAMES, resolve_material_type


@tool(response_format="content_and_artifact")
def search_materials(name: str, form: Annotated[dict, InjectedState("form")]):
    """Resolve a mentioned marketing material to the CRM material catalog and add it to
    Materials Shared. `name` is what the user referenced (e.g. "Product X brochure",
    "the clinical study"). The catalog types are: Brochure, Product Leaflet, Clinical Study,
    Research Paper, Product Catalogue, Presentation Deck, Safety Information, Other."""
    label = (name or "").strip()
    if not label:
        return "Which material should I add?", {"tools_used": ["search_materials"]}

    mtype = resolve_material_type(label)
    new_item = {"type": mtype, "name": label}

    existing = list(form.get("materials_shared") or [])
    if not any(isinstance(m, dict) and m.get("name") == label for m in existing):
        existing.append(new_item)

    content = f"Added '{label}' as a {mtype} to Materials Shared."
    return content, {
        "form_patch": {"materials_shared": existing},
        "catalog_types": MATERIAL_TYPE_NAMES,
        "tools_used": ["search_materials"],
    }
