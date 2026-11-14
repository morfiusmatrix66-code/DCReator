"""Схемы заявок (DTO)."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LeadCreate(BaseModel):
    """Контракт ВХОДА: что принимает API."""

    name: str = Field(..., min_length=2, max_length=100, examples=["Иван Петров"])
    email: EmailStr = Field(..., examples=["ivan@example.com"])
    service_id: str = Field(..., examples=["web"])
    service_name: str = Field(..., examples=["Веб-разработка"])
    addons: list[str] = Field(default_factory=list, examples=[["seo", "admin"]])
    total: int = Field(..., ge=0, examples=[120000])


class Lead(LeadCreate):
    """Контракт ВЫХОДА: серверные поля."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
"""Схемы заявок (DTO)."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Иван Петров"])
    email: EmailStr = Field(..., examples=["ivan@example.com"])
    service_id: str = Field(..., examples=["web"])
    service_name: str = Field(..., examples=["Веб-разработка"])
    addons: list[str] = Field(default_factory=list, examples=[["seo", "admin"]])
    total: int = Field(..., ge=0, examples=[120000])
    message: str | None = Field(default=None, max_length=2000, examples=["Нужен магазин к марту"])


class Lead(LeadCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)