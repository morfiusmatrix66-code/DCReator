"""DCreator API — точка входа приложения."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, run_migrations
from app.routers import leads

# ... существующие импорты ...
from app.routers import leads, chat  # ← ДОБАВИТЬ chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations()
    yield


app = FastAPI(
    title="DCreator API",
    description="Бэкенд портфолио-сайта DCreator: приём заявок из конфигуратора",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(chat.router)


@app.get("/health", tags=["service"])
def health_check() -> dict:
    return {"status": "ok", "service": "dcreator-api", "version": "0.3.0"}