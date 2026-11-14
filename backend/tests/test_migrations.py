"""Миграция существующей базы."""
from sqlalchemy import create_engine, inspect, text

from app import database

LEGACY_SCHEMA = """
CREATE TABLE leads (
    id INTEGER PRIMARY KEY,
    name TEXT, email TEXT,
    service_id TEXT, service_name TEXT,
    addons TEXT, total INTEGER,
    created_at TEXT
)
"""


def _legacy_engine(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with engine.begin() as conn:
        conn.execute(text(LEGACY_SCHEMA))
        conn.execute(text(
            "INSERT INTO leads (id, name, email, service_id, service_name, addons, total) "
            "VALUES (1, 'Старая заявка', 'old@test.ru', 'web', 'Веб', '[]', 50000)"
        ))
    return engine


def test_migration_adds_message_column(tmp_path, monkeypatch):
    engine = _legacy_engine(tmp_path)
    monkeypatch.setattr(database, "engine", engine)

    database.run_migrations()

    columns = {c["name"] for c in inspect(engine).get_columns("leads")}
    assert "message" in columns
    engine.dispose()


def test_migration_preserves_existing_rows(tmp_path, monkeypatch):
    engine = _legacy_engine(tmp_path)
    monkeypatch.setattr(database, "engine", engine)

    database.run_migrations()

    with engine.connect() as conn:
        row = conn.execute(text("SELECT name, message FROM leads WHERE id = 1")).one()
    assert row.name == "Старая заявка"
    assert row.message is None
    engine.dispose()


def test_migration_is_idempotent(tmp_path, monkeypatch):
    engine = _legacy_engine(tmp_path)
    monkeypatch.setattr(database, "engine", engine)

    database.run_migrations()
    database.run_migrations()  # второй вызов не должен падать

    engine.dispose()


def test_migration_skips_when_no_table(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'empty.db'}")
    monkeypatch.setattr(database, "engine", engine)

    database.run_migrations()  # таблицы нет — просто выходим

    assert not inspect(engine).has_table("leads")
    engine.dispose()