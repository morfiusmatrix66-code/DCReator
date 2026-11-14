"""Роутер AI-ассистента."""
import asyncio
import logging

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api", tags=["chat"])
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, examples=["Сколько стоит сайт?"])


class ChatResponse(BaseModel):
    reply: str
    delay_ms: int = 1000  # Имитация «печатает...»


@router.post("/chat", response_model=ChatResponse, summary="Получить ответ от AI-ассистента")
async def chat(payload: ChatRequest) -> ChatResponse:
    """
    Умный ответчик для портфолио.
    В продакшене здесь можно заменить логику на вызов OpenAI / Groq API.
    """
    msg = payload.message.lower()

    # Простая эвристика, имитирующая понимание контекста
    if any(word in msg for word in ["цен", "стоим", "сколько", "бюджет"]):
        reply = (
            "Стоимость зависит от задачи. Веб-разработка от 80 000 ₽, Telegram Mini Apps от 60 000 ₽. "
            "Рекомендую использовать конфигуратор на сайте для точного расчёта!"
        )
    elif any(word in msg for word in ["срок", "долго", "когда", "времени"]):
        reply = (
            "Обычно мы укладываемся в 2–4 недели для веб-проектов и 1–3 недели для TMA. "
            "Точные сроки обсуждаем после брифинга."
        )
    elif any(word in msg for word in ["привет", "здравствуй", "добрый"]):
        reply = (
            "Привет! 👋 Я AI-ассистент DCreator. Готов помочь с оценкой проекта, "
            "рассказать о стеке или оформить заявку."
        )
    elif any(word in msg for word in ["технолог", "стек", "python", "react"]):
        reply = (
            "Мы используем современный стек: React/Next.js на фронте, Python/FastAPI на бэке, "
            "PostgreSQL и Docker для надёжности. Полный список есть в разделе 'Технологии'."
        )
    else:
        reply = (
            "Отличный вопрос! Чтобы дать максимально точный ответ, мне нужно чуть больше деталей. "
            "Опишите задачу в конфигураторе, и наш менеджер свяжется с вами в течение часа."
        )

    # Имитируем задержку «печатает...» для естественности
    await asyncio.sleep(1.0)
    
    logger.info("AI chat: user='%s', reply_len=%d", payload.message[:30], len(reply))
    return ChatResponse(reply=reply, delay_ms=1000)