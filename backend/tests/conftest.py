"""Общие фикстуры: тестовая БД, клиент, заглушка Telegram."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401 — регистрирует таблицы в Base.metadata
from app.database import Base, get_db
from app.main import app


@pytest.fixture
def db_engine():
    """Чистая in-memory SQLite на каждый тест."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture
def session_factory(db_engine):
    return sessionmaker(bind=db_engine, autoflush=False, autocommit=False)


@pytest.fixture
def db_session(session_factory):
    """Прямой доступ к БД в тестах — проверить, что реально записалось."""
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_engine, session_factory, monkeypatch):
    """TestClient с подменённой БД и отключённым Telegram."""

    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Патчим ТАМ, где функция используется, а не где объявлена
    monkeypatch.setattr("app.routers.leads.send_lead_notification", lambda lead: None)

    # Страховка: даже если lifespan запустится, он тронет только тестовую БД
    monkeypatch.setattr("app.main.engine", db_engine)
    monkeypatch.setattr("app.main.run_migrations", lambda: None)

    yield TestClient(app)

    app.dependency_overrides.clear()


@pytest.fixture
def lead_payload():
    """Валидное тело заявки."""
    return {
        "name": "Иван Петров",
        "email": "ivan@test.ru",
        "service_id": "web",
        "service_name": "Веб-разработка",
        "addons": ["seo"],
        "total": 95000,
        "message": "Нужен сайт к марту",
    }