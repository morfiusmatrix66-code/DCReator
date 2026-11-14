"""Настройка подключения к базе данных (SQLite локально / PostgreSQL в облаке)."""
import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()  # ВАЖНО: до чтения DATABASE_URL, иначе env не подхватится

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dcreator.db")

# check_same_thread — специфичный только для SQLite аргумент
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Базовый класс для всех ORM-моделей."""


def get_db() -> Generator[Session, None, None]:
    """Сессия БД на один запрос. В тестах подменяется через dependency_overrides."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations() -> None:
    """Добавляет новые колонки в существующую базу без потери данных."""
    inspector = inspect(engine)
    if not inspector.has_table("leads"):
        return
    columns = {col["name"] for col in inspector.get_columns("leads")}
    if "message" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE leads ADD COLUMN message TEXT"))