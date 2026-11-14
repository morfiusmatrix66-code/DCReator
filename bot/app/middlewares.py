"""Доступ только для администратора."""
from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message, TelegramObject

from app.config import ADMIN_ID


class AdminMiddleware(BaseMiddleware):
    async def __call__(self, handler, event: TelegramObject, data: dict):
        user = data.get("event_from_user")
        if user is None or user.id != ADMIN_ID:
            if isinstance(event, CallbackQuery):
                await event.answer("⛔ Нет доступа", show_alert=True)
            elif isinstance(event, Message):
                await event.answer("⛔ Бот доступен только администратору.")
            return
        return await handler(event, data)