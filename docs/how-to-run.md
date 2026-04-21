# SmartPath — Как запускать

## Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Откроется на `http://localhost:8000`

## Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

Откроется на `http://localhost:4200`

## Тестовые аккаунты

- Admin: `admin@smartpath.local` / `123456`
- Или зарегистрируй нового через `/register`

## Полный флоу

1. `/` -> редирект на `/login`
2. Login или Register
3. После логина -> `/home` (dashboard)
4. `/week` — недельный вид, добавление/удаление задач
5. `/notifications` — уведомления по дедлайнам
6. Header: AI assistant + Log out
