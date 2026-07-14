"""Adding an HCP to the directory via the API."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_hcp_then_appears_in_list():
    r = client.post("/api/hcps", json={"name": "Dr. Meera Nair", "specialty": "Cardiology", "organization": "Apollo"})
    assert r.status_code == 200
    assert r.json()["name"] == "Dr. Meera Nair"

    names = [h["name"] for h in client.get("/api/hcps").json()]
    assert "Dr. Meera Nair" in names


def test_create_hcp_requires_name():
    assert client.post("/api/hcps", json={"name": "  "}).status_code == 422


def test_create_hcp_rejects_duplicate():
    client.post("/api/hcps", json={"name": "Dr. Dupe Test"})
    assert client.post("/api/hcps", json={"name": "Dr. Dupe Test"}).status_code == 409
