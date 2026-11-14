"""Доступ только для администратора."""
from aiogram.dispatcher.middlewares import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from app.config import ADMIN_IDS


class AdminMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data):
        user = data.get("event_from_user")
        if user is None:
            return
        
        # Проверяем, есть ли ID пользователя в списке админов
        if str(user.id) not in ADMIN_IDS:
            if isinstance(event, Message):
                await event.answer("⛔ Нет доступа. Бот доступен только администраторам.")
            elif isinstance(event, CallbackQuery):
                await event.answer("⛔ Нет доступа", show_alert=True)
            return
        
        return await handler(event, data)