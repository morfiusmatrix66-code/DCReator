"""Статистика."""
from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import CallbackQuery, Message

from app.callbacks import NavCB
from app.formatters import stats_report
from app.keyboards import main_menu
from app.services import get_stats

router = Router()


@router.message(Command("stats"))
async def cmd_stats(message: Message):
    await message.answer(stats_report(get_stats()), reply_markup=main_menu())


@router.callback_query(NavCB.filter(F.action == "stats"))
async def cb_stats(callback: CallbackQuery, callback_data: NavCB):
    await callback.message.edit_text(stats_report(get_stats()), reply_markup=main_menu())
    await callback.answer()