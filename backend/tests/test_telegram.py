"""Уведомления: формат, экранирование, отказоустойчивость."""
from datetime import datetime

import httpx
import pytest

from app.schemas.lead import Lead
from app.services import telegram


def make_lead(**overrides) -> Lead:
    data = {
        "id": 1,
        "name": "Иван Петров",
        "email": "ivan@test.ru",
        "service_id": "web",
        "service_name": "Веб-разработка",
        "addons": ["seo"],
        "total": 95000,
        "message": None,
        "created_at": datetime(2026, 11, 14, 12, 0),
    }
    data.update(overrides)
    return Lead(**data)


class FakeResponse:
    def raise_for_status(self):
        pass


@pytest.fixture
def configured(monkeypatch):
    monkeypatch.setattr(telegram, "TELEGRAM_BOT_TOKEN", "123:ABC")
    monkeypatch.setattr(telegram, "TELEGRAM_CHAT_ID", "42")


def test_notification_scheduled_on_create(client, lead_payload, monkeypatch):
    sent = []
    monkeypatch.setattr("app.routers.leads.send_lead_notification", sent.append)
    response = client.post("/api/leads", json=lead_payload)
    assert response.status_code == 201
    assert len(sent) == 1
    assert sent[0].email == lead_payload["email"]


def test_sends_to_correct_chat(configured, monkeypatch):
    captured = {}

    def fake_post(url, json, timeout):
        captured.update(url=url, payload=json)
        return FakeResponse()

    monkeypatch.setattr(telegram.httpx, "post", fake_post)
    telegram.send_lead_notification(make_lead())

    assert "123:ABC" in captured["url"]
    assert captured["payload"]["chat_id"] == "42"
    assert captured["payload"]["parse_mode"] == "HTML"
    assert "Иван Петров" in captured["payload"]["text"]
    assert "95 000" in captured["payload"]["text"]


def test_message_included_when_present(configured, monkeypatch):
    captured = {}
    monkeypatch.setattr(
        telegram.httpx, "post",
        lambda url, json, timeout: captured.update(payload=json) or FakeResponse(),
    )
    telegram.send_lead_notification(make_lead(message="Нужен магазин"))
    assert "Нужен магазин" in captured["payload"]["text"]


def test_html_is_escaped(configured, monkeypatch):
    captured = {}
    monkeypatch.setattr(
        telegram.httpx, "post",
        lambda url, json, timeout: captured.update(payload=json) or FakeResponse(),
    )
    telegram.send_lead_notification(make_lead(name="<b>hack</b>"))
    text = captured["payload"]["text"]
    assert "&lt;b&gt;hack&lt;/b&gt;" in text
    assert "<b>hack</b>" not in text


def test_skipped_when_not_configured(monkeypatch):
    monkeypatch.setattr(telegram, "TELEGRAM_BOT_TOKEN", "")
    called = False

    def fake_post(*args, **kwargs):
        nonlocal called
        called = True
        return FakeResponse()

    monkeypatch.setattr(telegram.httpx, "post", fake_post)
    telegram.send_lead_notification(make_lead())
    assert called is False


def test_http_error_does_not_raise(configured, monkeypatch):
    def fake_post(*args, **kwargs):
        raise httpx.ConnectError("telegram недоступен")

    monkeypatch.setattr(telegram.httpx, "post", fake_post)
    telegram.send_lead_notification(make_lead())  # не должно бросить исключение


def test_lead_survives_telegram_failure(client, lead_payload, monkeypatch):
    """Заявка сохраняется, даже если Telegram недоступен."""
    # Фикстура client подменила уведомление заглушкой — возвращаем настоящую функцию,
    # чтобы проверить её собственную обработку ошибок.
    monkeypatch.setattr(
        "app.routers.leads.send_lead_notification",
        telegram.send_lead_notification,
    )
    monkeypatch.setattr(telegram, "TELEGRAM_BOT_TOKEN", "123:ABC")
    monkeypatch.setattr(telegram, "TELEGRAM_CHAT_ID", "42")

    def fake_post(*args, **kwargs):
        raise httpx.ConnectError("telegram недоступен")

    monkeypatch.setattr(telegram.httpx, "post", fake_post)

    response = client.post("/api/leads", json=lead_payload)
    assert response.status_code == 201
    assert len(client.get("/api/leads").json()) == 1