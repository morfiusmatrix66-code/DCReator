# DCreator — Digital Development Studio

Полноценный full-stack сайт веб-студии с приёмом заявок, AI-ассистентом и Telegram-админкой.

## 🌐 Ссылки
- **Сайт:** [https://dcreator-...vercel.app](https://dcreator-...vercel.app)
- **API Docs:** [https://dcreator-api.onrender.com/docs](https://dcreator-api.onrend.com/docs)
- **Telegram-бот:** [@твой_бот](https://t.me/твой_бот)

## 🛠 Стек
- **Frontend:** React 19, Vite, Framer Motion, Tailwind/CSS
- **Backend:** Python 3.13, FastAPI, SQLAlchemy, Pydantic v2
- **Database:** PostgreSQL (Neon)
- **Bot:** aiogram 3
- **Tests:** pytest (94% coverage)
- **Deploy:** Vercel + Render + Docker

## 🚀 Локальный запуск
```bash
# Терминал 1: Фронтенд
npm install && npm run dev

# Терминал 2: Бэкенд
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# Терминал 3: Бот
cd bot && pip install -r requirements.txt && python -m app.main