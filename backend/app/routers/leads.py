"""Роутер заявок."""
from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead as LeadModel
from app.schemas.lead import Lead, LeadCreate
from app.services.telegram import send_lead_notification

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post("", response_model=Lead, status_code=status.HTTP_201_CREATED, summary="Создать заявку")
def create_lead(
    payload: LeadCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Lead:
    """Сохраняет заявку и ставит уведомление в фоновую очередь."""
    lead = LeadModel(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)

    dto = Lead.model_validate(lead)
    background_tasks.add_task(send_lead_notification, dto)
    return dto


@router.get("", response_model=list[Lead], summary="Список заявок")
def list_leads(db: Session = Depends(get_db)) -> list[Lead]:
    """Все заявки, новые сверху."""
    return db.query(LeadModel).order_by(LeadModel.created_at.desc(), LeadModel.id.desc()).all()