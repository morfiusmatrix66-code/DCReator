"""Telegram-уведомления о новых заявках."""
import html
import logging

import httpx

from app.config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
from app.schemas.lead import Lead

logger = logging.getLogger(__name__)


def send_lead_notification(lead: Lead) -> None:
    """Шлёт сообщение о заявке в Telegram. Никогда не роняет исключение наружу."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram не настроен — уведомление пропущено")
        return

    addons = ", ".join(lead.addons) if lead.addons else "нет"
    total = f"{lead.total:,}".replace(",", " ")
    text = (
        f"🔥 <b>Новая заявка #{lead.id}</b>\n\n"
        f"👤 <b>Имя:</b> {html.escape(lead.name)}\n"
        f"📧 <b>Email:</b> {html.escape(lead.email)}\n"
        f"🛠 <b>Услуга:</b> {html.escape(lead.service_name)}\n"
        f"➕ <b>Опции:</b> {html.escape(addons)}\n"
        f"💰 <b>Итого:</b> {total} ₽\n"
    )
    if lead.message:
        text += f"💬 <b>Сообщение:</b> {html.escape(lead.message)}\n"
    text += f"🕒 <b>Время:</b> {lead.created_at:%Y-%m-%d %H:%M} UTC"

    try:
        response = httpx.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML"},
            timeout=10,
        )
        response.raise_for_status()
        logger.info("Уведомление по заявке #%s отправлено", lead.id)
    except httpx.HTTPError as exc:
        logger.error("Не удалось отправить уведомление по заявке #%s: %s", lead.id, exc)