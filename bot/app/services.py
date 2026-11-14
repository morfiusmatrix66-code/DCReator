"""Запросы к базе заявок."""
import csv
import io
from datetime import datetime, timezone

from sqlalchemy import or_

from app.database import SessionLocal
from app.models import Lead

PAGE_SIZE = 5


def get_leads_page(page: int):
    with SessionLocal() as db:
        total = db.query(Lead).count()
        leads = (
            db.query(Lead)
            .order_by(Lead.created_at.desc())
            .offset(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .all()
        )
    pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
    return leads, total, pages


def get_lead(lead_id: int):
    with SessionLocal() as db:
        return db.get(Lead, lead_id)


def search_leads(query: str):
    pattern = f"%{query}%"
    with SessionLocal() as db:
        return (
            db.query(Lead)
            .filter(or_(Lead.name.ilike(pattern), Lead.email.ilike(pattern), Lead.service_name.ilike(pattern)))
            .order_by(Lead.created_at.desc())
            .limit(20)
            .all()
        )


def get_stats():
    with SessionLocal() as db:
        leads = db.query(Lead).all()

    today = datetime.now(timezone.utc).date()
    by_service, addon_count = {}, {}
    for lead in leads:
        bucket = by_service.setdefault(lead.service_name, {"count": 0, "sum": 0})
        bucket["count"] += 1
        bucket["sum"] += lead.total
        for addon in lead.addons or []:
            addon_count[addon] = addon_count.get(addon, 0) + 1

    return {
        "total": len(leads),
        "revenue": sum(l.total for l in leads),
        "today": sum(1 for l in leads if l.created_at and l.created_at.date() == today),
        "avg": round(sum(l.total for l in leads) / len(leads)) if leads else 0,
        "by_service": by_service,
        "addons": addon_count,
    }


def build_csv() -> bytes:
    with SessionLocal() as db:
        leads = db.query(Lead).order_by(Lead.id).all()
    buf = io.StringIO()
    writer = csv.writer(buf, delimiter=";")
    writer.writerow(["ID", "Имя", "Email", "Услуга", "Опции", "Сумма", "Сообщение", "Дата"])
    for l in leads:
        writer.writerow([
            l.id, l.name, l.email, l.service_name, ", ".join(l.addons or []),
            l.total, l.message or "",
            l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else "",
        ])
    return buf.getvalue().encode("utf-8-sig")