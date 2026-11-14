"""Тесты AI-ассистента."""


def test_chat_greeting(client):
    response = client.post("/api/chat", json={"message": "Привет"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Привет" in data["reply"] or "👋" in data["reply"]


def test_chat_pricing(client):
    response = client.post("/api/chat", json={"message": "Сколько стоит сайт?"})
    assert response.status_code == 200
    data = response.json()
    assert "80 000" in data["reply"] or "60 000" in data["reply"]


def test_chat_technologies(client):
    response = client.post("/api/chat", json={"message": "Какие технологии используете?"})
    assert response.status_code == 200
    data = response.json()
    assert "React" in data["reply"] or "FastAPI" in data["reply"]


def test_chat_unknown(client):
    response = client.post("/api/chat", json={"message": "блаблабла"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data


def test_chat_empty_message_returns_422(client):
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422


def test_chat_missing_message_returns_422(client):
    response = client.post("/api/chat", json={})
    assert response.status_code == 422