"""Список, карточка, поиск заявок."""
from aiogram import F, Router
from aiogram.filters import Command, CommandObject
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import BufferedInputFile, CallbackQuery, Message

from app.callbacks import LeadCB, NavCB, PageCB
from app.formatters import lead_full, lead_short
from app.keyboards import back_to_menu, lead_detail, leads_list, main_menu
from app.services import build_csv, get_lead, get_leads_page, search_leads

router = Router()


class SearchSG(StatesGroup):
    query = State()


async def _show_page(target, page: int, edit: bool = False):
    leads, total, pages = get_leads_page(page)
    page = min(page, pages - 1)
    if not leads:
        text = "📭 Заявок пока нет. Отправь тестовую с сайта!"
        kb = main_menu()
    else:
        text = f"📋 <b>Заявки</b> (всего {total})\n\n" + "\n\n".join(lead_short(l) for l in leads)
        kb = leads_list(leads, page, pages)
    if edit:
        await target.edit_text(text, reply_markup=kb)
    else:
        await target.answer(text, reply_markup=kb)


@router.message(Command("leads"))
async def cmd_leads(message: Message):
    await _show_page(message, 0)


@router.callback_query(NavCB.filter(F.action == "leads"))
async def cb_leads(callback: CallbackQuery, callback_data: NavCB):
    await _show_page(callback.message, 0, edit=True)
    await callback.answer()


@router.callback_query(PageCB.filter())
async def cb_page(callback: CallbackQuery, callback_data: PageCB):
    await _show_page(callback.message, callback_data.n, edit=True)
    await callback.answer()


@router.callback_query(LeadCB.filter())
async def cb_lead(callback: CallbackQuery, callback_data: LeadCB):
    lead = get_lead(callback_data.id)
    if not lead:
        await callback.answer("Заявка не найдена", show_alert=True)
        return
    await callback.message.edit_text(lead_full(lead), reply_markup=lead_detail(callback_data.page))
    await callback.answer()


@router.callback_query(NavCB.filter(F.action == "find"))
async def cb_find(callback: CallbackQuery, state: FSMContext):
    await state.set_state(SearchSG.query)
    await callback.message.edit_text(
        "🔍 Отправь запрос: имя, email или услуга.\nДля отмены — /cancel",
        reply_markup=back_to_menu(),
    )
    await callback.answer()


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext):
    await state.clear()
    await message.answer("Отменено.", reply_markup=main_menu())


@router.message(Command("find"))
async def cmd_find(message: Message, command: CommandObject):
    if not command.args:
        await message.answer("Использование: /find Иван")
        return
    await _run_search(message, command.args)


@router.message(SearchSG.query)
async def search_input(message: Message, state: FSMContext):
    await state.clear()
    await _run_search(message, message.text or "")


async def _run_search(message: Message, query: str):
    results = search_leads(query.strip())
    if not results:
        await message.answer(f"🔍 По запросу «{query}» ничего не найдено.", reply_markup=main_menu())
        return
    text = f"🔍 <b>Найдено: {len(results)}</b>\n\n" + "\n\n".join(lead_short(l) for l in results)
    await message.answer(text, reply_markup=main_menu())


@router.message(Command("export"))
async def cmd_export(message: Message):
    await _send_csv(message)


@router.callback_query(NavCB.filter(F.action == "export"))
async def cb_export(callback: CallbackQuery, callback_data: NavCB):
    await _send_csv(callback.message)
    await callback.answer()


async def _send_csv(target):
    data = build_csv()
    await target.answer_document(
        BufferedInputFile(data, filename="dcreator_leads.csv"),
        caption="📤 Выгрузка всех заявок",
    )