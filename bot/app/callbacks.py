"""Типизированные callback-данные."""
from aiogram.filters.callback_data import CallbackData


class NavCB(CallbackData, prefix="nav"):
    action: str


class LeadCB(CallbackData, prefix="lead"):
    id: int
    page: int = 0


class PageCB(CallbackData, prefix="page"):
    n: int