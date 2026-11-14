"""Меню, старт, помощь."""
from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, Message

from app.callbacks import NavCB
from app.keyboards import main_menu

router = Router()

WELCOME = (
    "👋 <b>DCreator Admin</b>\n\n"
    "Панель управления заявками с сайта.\n"
    "Выбери действие:"
)

HELP = (
    "ℹ️ <b>Команды</b>\n\n"
    "/leads — список заявок\n"
    "/stats — статистика\n"
    "/find запрос — поиск\n"
    "/export — выгрузка CSV\n"
    "/menu — главное меню\n"
    "/cancel — отменить поиск"
)


@router.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer(WELCOME, reply_markup=main_menu())


@router.message(Command("menu"))
async def cmd_menu(message: Message):
    await message.answer(WELCOME, reply_markup=main_menu())


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(HELP, reply_markup=main_menu())


@router.callback_query(NavCB.filter(F.action == "menu"))
async def cb_menu(callback: CallbackQuery, callback_data: NavCB):
    await callback.message.edit_text(WELCOME, reply_markup=main_menu())
    await callback.answer()


@router.callback_query(F.data == "noop")
async def cb_noop(callback: CallbackQuery):
    await callback.answer()