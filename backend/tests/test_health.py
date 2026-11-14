"""Сервисный эндпоинт."""


def test_health_returns_200(client):
    response = client.get("/health")
    assert response.status_code == 200


def test_health_contract(client):
    data = client.get("/health").json()
    assert data["status"] == "ok"
    assert data["service"] == "dcreator-api"
    assert "version" in data