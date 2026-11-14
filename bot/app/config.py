"""Конфигурация бота."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_IDS = os.getenv("ADMIN_IDS", "").split(",")

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(PROJECT_ROOT / "backend" / "dcreator.db")))
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

if not BOT_TOKEN:
    raise RuntimeError("Заполни BOT_TOKEN в .env")
if not ADMIN_IDS:
    raise RuntimeError("Заполни ADMIN_IDS в .env (список ID через запятую)")
if not DATABASE_URL:
    raise RuntimeError("Заполни DATABASE_URL в .env")