# backend/Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY app ./app

# Команда запуска: и API, и бот в одном процессе (для простоты портфолио)
# В реальном продакшене их разделяют, но для pet-проекта это идеальный баланс
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 & python -m app.main"]