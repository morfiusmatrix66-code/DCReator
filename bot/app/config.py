"""Конфигурация бота."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0"))

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(PROJECT_ROOT / "backend" / "dcreator.db")))
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

if not BOT_TOKEN or not ADMIN_ID:
    raise RuntimeError("Заполни BOT_TOKEN и ADMIN_ID в bot/.env")