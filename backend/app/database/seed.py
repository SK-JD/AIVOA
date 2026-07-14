"""Initialize the database schema.

The HCP directory is user-managed — add HCPs from the HCP Directory page (or
POST /api/hcps) — so no sample HCPs are seeded. This just ensures the tables exist.
Invoked by the setup script and re-runnable via `python -m app.database.seed`.
"""
from app.database.session import SessionLocal, init_db
from app.models.models import HCP

# HCPs are added via the UI, not seeded. Add entries here if you want sample data.
SAMPLE_HCPS: list[dict] = []


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        existing = {name for (name,) in db.query(HCP.name).all()}
        added = 0
        for row in SAMPLE_HCPS:
            if row["name"] not in existing:
                db.add(HCP(**row))
                added += 1
        db.commit()
        print(f"Database ready. Seeded {added} HCP(s); {len(existing) + added} in directory.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
