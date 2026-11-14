"""Роутер для работы с заявками."""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import Lead
from app.schemas.lead import LeadCreate, LeadResponse
from app.services.telegram import send_telegram_notification

router = APIRouter(prefix="/api", tags=["leads"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/leads", response_model=list[LeadResponse], summary="Получить список заявок")
def get_leads(db: Session = Depends(get_db)):
    """Возвращает все заявки, отсортированные по дате создания (новые сверху)."""
    return db.query(Lead).order_by(Lead.created_at.desc()).all()


@limiter.limit("5/minute")  # Максимум 5 заявок в минуту с одного IP
@router.post("/leads", response_model=LeadResponse, status_code=201, summary="Создать новую заявку")
async def create_lead(payload: LeadCreate, request: Request, db: Session = Depends(get_db)):
    """
    Создаёт новую заявку и отправляет уведомление в Telegram.
    Лимит: 5 заявок в минуту с одного IP-адреса.
    """
    lead = Lead(
        name=payload.name,
        email=payload.email,
        service_id=payload.service_id,
        service_name=payload.service_name,
        addons=payload.addons or [],
        total=payload.total,
        message=payload.message,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # Фоновая отправка уведомления (не блокирует ответ)
    send_telegram_notification(lead)

    return lead