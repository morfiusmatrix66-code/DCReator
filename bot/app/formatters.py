"""HTML-форматирование сообщений."""
import html

from app.models import Lead


def price(n: int) -> str:
    return f"{n:,}".replace(",", " ")


def lead_short(lead: Lead) -> str:
    date = lead.created_at.strftime("%d.%m %H:%M") if lead.created_at else "—"
    return (
        f"<b>#{lead.id}</b> · {html.escape(lead.name)}\n"
        f"🛠 {html.escape(lead.service_name)} · <b>{price(lead.total)} ₽</b> · 🕒 {date}"
    )


def lead_full(lead: Lead) -> str:
    addons = ", ".join(lead.addons) if lead.addons else "—"
    date = lead.created_at.strftime("%d.%m.%Y %H:%M") if lead.created_at else "—"
    lines = [
        f"🔥 <b>Заявка #{lead.id}</b>",
        "",
        f"👤 <b>Имя:</b> {html.escape(lead.name)}",
        f"📧 <b>Email:</b> <code>{html.escape(lead.email)}</code>",
        f"🛠 <b>Услуга:</b> {html.escape(lead.service_name)}",
        f"➕ <b>Опции:</b> {html.escape(addons)}",
        f"💰 <b>Сумма:</b> {price(lead.total)} ₽",
    ]
    if lead.message:
        lines += ["", "💬 <b>Сообщение:</b>", html.escape(lead.message)]
    lines += ["", f"🕒 {date} UTC"]
    return "\n".join(lines)


def stats_report(s: dict) -> str:
    lines = [
        "📊 <b>Статистика DCreator</b>",
        "",
        f"📋 Всего заявок: <b>{s['total']}</b>",
        f"📅 Сегодня: <b>{s['today']}</b>",
        f"💰 Потенциал: <b>{price(s['revenue'])} ₽</b>",
        f"📈 Средний чек: <b>{price(s['avg'])} ₽</b>",
    ]
    if s["by_service"]:
        lines += ["", "🛠 <b>По услугам:</b>"]
        for name, data in sorted(s["by_service"].items(), key=lambda x: -x[1]["sum"]):
            lines.append(f"  • {html.escape(name)}: {data['count']} шт · {price(data['sum'])} ₽")
    if s["addons"]:
        lines += ["", "➕ <b>Популярные опции:</b>"]
        for name, count in sorted(s["addons"].items(), key=lambda x: -x[1])[:5]:
            lines.append(f"  • {html.escape(name)}: {count}")
    return "\n".join(lines)