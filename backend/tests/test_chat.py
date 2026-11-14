"""Тесты AI-ассистента."""


def test_chat_greeting(client):
    """Приветствие."""
    response = client.post("/api/chat", json={"message": "Привет"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "delay_ms" in data
    assert "👋" in data["reply"] or "Привет" in data["reply"]


def test_chat_pricing(client):
    """Вопрос про цену."""
    response = client.post("/api/chat", json={"message": "Сколько стоит сайт?"})
    assert response.status_code == 200
    data = response.json()
    assert "80 000" in data["reply"] or "60 000" in data["reply"]


def test_chat_pricing_budget(client):
    """Вопрос про бюджет."""
    response = client.post("/api/chat", json={"message": "Какой бюджет нужен?"})
    assert response.status_code == 200
    data = response.json()
    assert "80 000" in data["reply"] or "бюджет" in data["reply"].lower()


def test_chat_deadline(client):
    """Вопрос про сроки."""
    response = client.post("/api/chat", json={"message": "Как долго делается проект?"})
    assert response.status_code == 200
    data = response.json()
    assert "2–4 недели" in data["reply"] or "недел" in data["reply"].lower()


def test_chat_technologies(client):
    """Вопрос про стек."""
    response = client.post("/api/chat", json={"message": "Какие технологии используете?"})
    assert response.status_code == 200
    data = response.json()
    assert "React" in data["reply"] and "FastAPI" in data["reply"]


def test_chat_python(client):
    """Упоминание Python."""
    response = client.post("/api/chat", json={"message": "Вы работаете с Python?"})
    assert response.status_code == 200
    data = response.json()
    assert "Python" in data["reply"] or "FastAPI" in data["reply"]


def test_chat_unknown(client):
    """Неизвестный вопрос — дефолтный ответ."""
    response = client.post("/api/chat", json={"message": "блаблабла"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10


def test_chat_empty_message_returns_422(client):
    """Пустое сообщение — валидация."""
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422


def test_chat_missing_message_returns_422(client):
    """Отсутствует поле message."""
    response = client.post("/api/chat", json={})
    assert response.status_code == 422


def test_chat_message_too_long_returns_422(client):
    """Сообщение длиннее 1000 символов."""
    response = client.post("/api/chat", json={"message": "x" * 1001})
    assert response.status_code == 422