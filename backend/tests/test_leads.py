"""Приём, валидация и хранение заявок."""
import pytest

from app.models import Lead


def test_empty_list_initially(client):
    response = client.get("/api/leads")
    assert response.status_code == 200
    assert response.json() == []


def test_create_returns_201(client, lead_payload):
    response = client.post("/api/leads", json=lead_payload)
    assert response.status_code == 201


def test_create_echoes_data(client, lead_payload):
    data = client.post("/api/leads", json=lead_payload).json()
    assert data["name"] == lead_payload["name"]
    assert data["email"] == lead_payload["email"]
    assert data["total"] == lead_payload["total"]
    assert data["addons"] == lead_payload["addons"]


def test_server_assigns_id_and_created_at(client, lead_payload):
    data = client.post("/api/leads", json=lead_payload).json()
    assert isinstance(data["id"], int)
    assert data["created_at"]


def test_lead_is_written_to_database(client, lead_payload, db_session):
    created = client.post("/api/leads", json=lead_payload).json()
    row = db_session.get(Lead, created["id"])
    assert row is not None
    assert row.email == lead_payload["email"]
    assert row.message == lead_payload["message"]


def test_created_lead_appears_in_list(client, lead_payload):
    created = client.post("/api/leads", json=lead_payload).json()
    items = client.get("/api/leads").json()
    assert len(items) == 1
    assert items[0]["id"] == created["id"]


def test_list_is_newest_first(client, lead_payload):
    first = client.post("/api/leads", json=lead_payload).json()
    second = client.post("/api/leads", json={**lead_payload, "name": "Пётр Сидоров"}).json()
    items = client.get("/api/leads").json()
    assert [item["id"] for item in items] == [second["id"], first["id"]]


def test_message_is_optional(client, lead_payload):
    response = client.post("/api/leads", json={**lead_payload, "message": None})
    assert response.status_code == 201
    assert response.json()["message"] is None


def test_addons_default_to_empty_list(client, lead_payload):
    payload = {k: v for k, v in lead_payload.items() if k != "addons"}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    assert response.json()["addons"] == []


def test_client_cannot_override_id(client, lead_payload):
    response = client.post("/api/leads", json={**lead_payload, "id": 999})
    assert response.status_code == 201
    assert response.json()["id"] != 999


@pytest.mark.parametrize(
    "field,value",
    [
        ("name", "Я"),
        ("name", "x" * 101),
        ("email", "не-почта"),
        ("email", "ivan@"),
        ("total", -1),
        ("total", "дорого"),
        ("message", "x" * 2001),
    ],
)
def test_invalid_payload_returns_422(client, lead_payload, field, value):
    response = client.post("/api/leads", json={**lead_payload, field: value})
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any(field in item["loc"] for item in detail)


@pytest.mark.parametrize("missing", ["name", "email", "service_id", "service_name", "total"])
def test_missing_required_field_returns_422(client, lead_payload, missing):
    payload = {k: v for k, v in lead_payload.items() if k != missing}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 422


def test_invalid_json_returns_422(client):
    response = client.post(
        "/api/leads",
        content="не json",
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 422


def test_each_test_starts_with_clean_db(client):
    """Если фикстура течёт — здесь будут заявки от предыдущих тестов."""
    assert client.get("/api/leads").json() == []