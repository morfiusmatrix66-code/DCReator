"""Настройка подключения к базе данных (SQLite локально / PostgreSQL в облаке)."""
import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()  # ВАЖНО: до чтения DATABASE_URL

# Нормализация: пробелы, кавычки, переносы строк — частые артефакты копирования
DATABASE_URL = os.getenv("DATABASE_URL", "").strip().strip('"').strip("'")

# Render/Neon могут прислать postgresql:// — для psycopg3 нужен +psycopg
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql://"):]

# Пустая переменная — локальная разработка на SQLite
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./dcreator.db"

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