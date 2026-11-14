"""Точка входа бота."""
import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from app.config import BOT_TOKEN
from app.handlers import common, leads, stats
from app.middlewares import AdminMiddleware


async def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())

    for module in (common, leads, stats):
        module.router.message.middleware(AdminMiddleware())
        module.router.callback_query.middleware(AdminMiddleware())
        dp.include_router(module.router)

    await bot.delete_webhook(drop_pending_updates=True)
    logging.info("DCreator Admin Bot запущен")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())