"""Inline-клавиатуры."""
from aiogram.types import InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from app.callbacks import LeadCB, NavCB, PageCB


def main_menu():
    b = InlineKeyboardBuilder()
    b.button(text="📋 Заявки", callback_data=NavCB(action="leads"))
    b.button(text="📊 Статистика", callback_data=NavCB(action="stats"))
    b.button(text="🔍 Поиск", callback_data=NavCB(action="find"))
    b.button(text="📤 Экспорт CSV", callback_data=NavCB(action="export"))
    b.adjust(2, 2)
    return b.as_markup()


def leads_list(leads, page: int, pages: int):
    b = InlineKeyboardBuilder()
    for lead in leads:
        title = lead.name if len(lead.name) <= 20 else lead.name[:19] + "…"
        b.button(text=f"#{lead.id} · {title}", callback_data=LeadCB(id=lead.id, page=page))
    b.adjust(1)

    nav = []
    if page > 0:
        nav.append(InlineKeyboardButton(text="←", callback_data=PageCB(n=page - 1).pack()))
    nav.append(InlineKeyboardButton(text=f"{page + 1}/{pages}", callback_data="noop"))
    if page < pages - 1:
        nav.append(InlineKeyboardButton(text="→", callback_data=PageCB(n=page + 1).pack()))
    b.row(*nav)
    b.row(InlineKeyboardButton(text="🏠 Меню", callback_data=NavCB(action="menu").pack()))
    return b.as_markup()


def lead_detail(page: int):
    b = InlineKeyboardBuilder()
    b.button(text="← К списку", callback_data=PageCB(n=page))
    b.button(text="🏠 Меню", callback_data=NavCB(action="menu"))
    b.adjust(2)
    return b.as_markup()


def back_to_menu():
    b = InlineKeyboardBuilder()
    b.button(text="🏠 Меню", callback_data=NavCB(action="menu"))
    return b.as_markup()