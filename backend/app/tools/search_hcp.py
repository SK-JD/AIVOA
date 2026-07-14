"""Tool 3 (custom): search_hcp — resolve the HCP Name against the CRM directory."""
from langchain_core.tools import tool

from app.database.session import SessionLocal
from app.models.models import HCP


@tool(response_format="content_and_artifact")
def search_hcp(name: str):
    """Search the CRM's HCP directory by (partial) name to confirm/resolve the HCP.
    Returns matching HCPs and fills the HCP Name field with the best match. Use when the
    user references an HCP and you want to validate them against the directory."""
    db = SessionLocal()
    try:
        rows = (
            db.query(HCP)
            .filter(HCP.name.ilike(f"%{name.strip()}%"))
            .order_by(HCP.name)
            .limit(5)
            .all()
        )
    finally:
        db.close()

    if not rows:
        return f"No HCP matching '{name}' found in the directory.", {"tools_used": ["search_hcp"]}

    matches = [f"{r.name} — {r.specialty}, {r.organization}" for r in rows]
    content = "Found in directory: " + "; ".join(matches)
    return content, {
        "form_patch": {"hcp_name": rows[0].name},
        "hcp_matches": matches,
        "tools_used": ["search_hcp"],
    }
