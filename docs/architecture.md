# SmartPath — Архитектура проекта

## Общая схема

```
frontend (Angular 21)  ──HTTP JSON──>  backend (Django + DRF)  ──>  SQLite
     :4200                                  :8000                   db.sqlite3
```

Фронт и бэк — отдельные приложения. Фронт делает HTTP запросы к API бэкенда. Бэкенд отдаёт JSON. Между ними JWT токены для авторизации.

---

## Backend (Django)

### Структура

```
backend/
├── config/          # настройки проекта
│   ├── settings.py  # БД, JWT, CORS, installed apps
│   └── urls.py      # главные роуты API
├── users/           # авторизация
│   ├── models.py    # модель User (email как логин)
│   ├── serializers.py # RegisterSerializer, UserSerializer
│   ├── views.py     # register(), me()
│   └── urls.py      # /register/, /login/, /refresh/, /me/
├── tasks/           # задачи
│   ├── models.py    # Task, ScheduleEntry
│   ├── serializers.py # TaskSerializer
│   ├── views.py     # TaskViewSet (CRUD), ai_suggest()
│   └── urls.py      # роутер для CRUD + /ai-suggest/
└── notifications/   # уведомления
```

### Как работает авторизация

1. `User` наследуется от `AbstractUser`, но `USERNAME_FIELD = 'email'` — логинимся по email, не username
2. `/api/auth/register/` — POST `{email, username, password}` -> `create_user()` хеширует пароль -> 201
3. `/api/auth/login/` — это `TokenObtainPairView` из simplejwt. POST `{email, password}` -> возвращает `{access, refresh}` (JWT токены)
4. `access` токен живёт 30 мин, `refresh` — 1 день (настроено в `SIMPLE_JWT` в settings.py)
5. `/api/auth/me/` — GET с токеном -> возвращает данные текущего юзера

### Как работают задачи

1. `Task` модель: `title, description, time, day_of_week, done, due_date, user`
2. `TaskViewSet` (ModelViewSet) — автоматически создаёт все CRUD эндпоинты:
   - `GET /api/tasks/` — список задач юзера
   - `POST /api/tasks/` — создать задачу
   - `PATCH /api/tasks/5/` — обновить (например `done: true`)
   - `DELETE /api/tasks/5/` — удалить
3. `get_queryset()` фильтрует по `user=request.user` — каждый видит только свои задачи
4. `perform_create()` автоматически привязывает задачу к текущему юзеру
5. `serializer.py` — `fields = '__all__'` + `read_only_fields = ['user', 'created_at', 'updated_at']` — юзер не может подменить владельца

### CORS

В settings.py `CORS_ALLOWED_ORIGINS = ['http://localhost:4200']` — бэкенд принимает запросы только от Angular dev server.

---

## Frontend (Angular)

### Структура

```
frontend/src/app/
├── app.ts, app.html         # корневой компонент (header + router-outlet)
├── app.config.ts            # провайдеры: router, httpClient, interceptor
├── app.routes.ts            # все роуты + authGuard
├── guards/
│   └── auth.guard.ts        # проверка токена
├── interceptors/
│   └── auth.interceptor.ts  # добавляет Bearer токен к запросам
├── services/
│   ├── auth.service.ts      # login, register, logout, состояние юзера
│   └── task.service.ts      # CRUD задач + вся логика дедлайнов и AI
├── components/
│   ├── header/              # навбар
│   └── ai-assistant/        # кнопка AI + попап с советами
└── pages/
    ├── login/               # форма логина
    ├── register/            # форма регистрации
    ├── home/                # dashboard (статистика, важные задачи)
    └── week/                # недельный вид + модалка + помодоро
```

### Как работает авторизация на фронте

1. **`auth.guard.ts`** — функция `authGuard`. Проверяет `localStorage.getItem('access_token')`. Если нет — `router.navigate(['/login'])`. Применена на `/home`, `/week`, `/notifications` в routes.

2. **`auth.interceptor.ts`** — перехватчик HTTP запросов. Берёт токен из `AuthService.getToken()` и добавляет заголовок `Authorization: Bearer <token>` ко всем запросам, кроме login/register/refresh.

3. **`auth.service.ts`**:
   - `login()` — POST на `/api/auth/login/`, сохраняет токены в localStorage, ставит `isAuthenticated = signal(true)`, загружает юзера через `/me/`
   - `logout()` — чистит localStorage, ставит `isAuthenticated = false`, редирект на `/login`
   - `checkAuth()` — при запуске проверяет есть ли токен, если да — считает залогиненным и загружает юзера
   - `isAuthenticated` — Angular signal, используется в header для показа "Log out" vs "Log in"

4. **`app.config.ts`** — `provideHttpClient(withInterceptors([authInterceptor]))` — регистрирует interceptor глобально. Все HTTP запросы через `HttpClient` автоматически получают токен.

### Как работает TaskService

Это главный сервис, singleton (`providedIn: 'root'`). Он:

1. **`buildWeek()`** — в конструкторе создаёт массив `days[]` из 7 дней (Mon-Sun) с датами текущей недели. Задачи пока пустые.

2. **`loadTasks()`** — GET `/api/tasks/` -> получает массив задач с сервера -> очищает `days[].tasks` -> раскладывает каждую задачу в `days[task.day_of_week].tasks` -> сортирует по времени.

3. **`addTask(dayIndex, task)`** — POST `/api/tasks/` с `{title, description, time, day_of_week, due_date}` -> при успехе добавляет в `days[dayIndex].tasks`.

4. **`removeTask(dayIndex, taskIndex)`** — DELETE `/api/tasks/{id}/` -> при успехе убирает из массива.

5. **`toggleDone(dayIndex, taskIndex)`** — PATCH `/api/tasks/{id}/` с `{done: !task.done}` -> при успехе меняет `task.done` локально.

6. **Утилиты дедлайнов** (работают на фронте, без API):
   - `daysUntilDeadline(task)` — считает разницу в днях между сегодня и `task.deadline`
   - `deadlineColor(task)` — `red` (<=0), `yellow` (1-2), `green` (3+)
   - `deadlineLabel(task)` — "Due today", "2d left", "3d overdue"

7. **AI логика** (тоже на фронте):
   - `getAdvice()` — анализирует все задачи, возвращает массив советов (загруженность, overdue, баланс)
   - `getPriorityAdvice()` — сортирует задачи по формуле `deadlineScore * 10000 + dayIndex * 1000 + timeScore` и говорит "Start with X, then Y"

### Страницы

- **Login** — форма email + password. Вызывает `authService.login()`. При успехе -> `/home`.
- **Register** — форма email + username + password. Вызывает `authService.register()`. При успехе -> `/login`.
- **Home** — dashboard. В `ngOnInit` вызывает `ts.loadTasks()`. Показывает: счётчики (To Do / Completed / Total), Most Important (топ-5 по дедлайну), AI Suggestion, списки To Do и Completed.
- **Week** — 7 колонок-дней. В `ngOnInit` вызывает `ts.loadTasks()`. Кнопка "+ Add task" -> модалка (title, time, deadline, description) -> `ts.addTask()`. Чекбокс -> `ts.toggleDone()`. Крестик -> `ts.removeTask()`. Помодоро таймер (50:10) внизу.

### Notifications (фронтовая логика)

`NotificationService` — не ходит на бэкенд, а работает через `TaskService`:

1. `refresh()` — берёт все задачи из `ts.getAllTasks()`, фильтрует те у которых дедлайн сегодня или завтра
2. Создаёт `AppNotification` с `urgency: 'today' | 'tomorrow'` и текстом сообщения
3. Сохраняет `read` состояние — если уведомление уже было и юзер отметил как прочитанное, при refresh оно останется read
4. `markRead(id)` / `markAllRead()` — отметить как прочитанное

`NotificationsPageComponent` — страница `/notifications`:
- Показывает список уведомлений с иконками (красный = сегодня, жёлтый = завтра)
- Кнопка "Mark all as read"
- Кнопка галочка на каждом уведомлении
- Если нет уведомлений — "No notifications, all tasks are on track!"

### Компоненты

- **Header** — навбар. Inject `AuthService`. Если залогинен -> показывает AI кнопку + "Log out". Иначе -> "Log in".
- **AI Assistant** — кнопка "AI" в хедере. По клику — попап с `taskService.getAdvice()`. Кнопка "What should I do first?" -> `taskService.getPriorityAdvice()`. Закрывается по клику вне попапа (`@HostListener('document:click')`).

---

## Поток данных (пример: добавление задачи)

```
1. User кликает "+ Add task" на Wednesday
2. week.ts: openModal(2)  ->  showModal = true, selectedDayIndex = 2
3. User заполняет форму, кликает "Add Task"
4. week.ts: addTask()  ->  ts.addTask(2, {title, time, deadline, description})
5. task.service.ts: POST http://localhost:8000/api/tasks/
   Body: { title, description, time, day_of_week: 2, due_date: "2026-04-25" }
   Header: Authorization: Bearer eyJ... (добавлен interceptor-ом)
6. Django: TaskViewSet.create() -> serializer.is_valid() -> serializer.save(user=request.user)
   -> SQLite INSERT INTO tasks_task ...
   -> Response 201 { id: 15, title, ... }
7. task.service.ts: subscribe next -> push в days[2].tasks -> sortTasks(2)
8. Angular обновляет DOM -> карточка появляется в колонке Wednesday
```
