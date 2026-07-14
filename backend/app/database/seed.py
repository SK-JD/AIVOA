"""Seed the HCP directory with a few sample Healthcare Professionals.

Idempotent: running it again won't duplicate rows. Invoked by the setup script
and re-runnable via `python -m app.database.seed`.
"""
from app.database.session import SessionLocal, init_db
from app.models.models import HCP

SAMPLE_HCPS = [
    {"name": "Dr. Rajesh Kumar", "specialty": "Senior Cardiologist", "organization": "Apollo Hospital, Chennai"},
    {"name": "Dr. Smith", "specialty": "Oncology", "organization": "City General Hospital"},
    {"name": "Dr. Sharma", "specialty": "Cardiology", "organization": "Apollo Clinic"},
    {"name": "Dr. Patel", "specialty": "Neurology", "organization": "Sunrise Medical Center"},
    {"name": "Dr. Johnson", "specialty": "Endocrinology", "organization": "Metro Health"},
    {"name": "Dr. Lee", "specialty": "Dermatology", "organization": "Wellness Institute"},
    {"name": "Dr. Garcia", "specialty": "Pediatrics", "organization": "Children's Care Hospital"},
]


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
        print(f"Seed complete. Added {added} HCP(s); {len(existing) + added} total.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
