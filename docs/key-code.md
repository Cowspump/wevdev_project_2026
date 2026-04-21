# SmartPath — Ключевые строки кода

6 файлов которые нужно знать наизусть. Остальное — конфиг или HTML/CSS.

---

## 1. `backend/users/models.py`

```python
class User(AbstractUser):                    # наследуем от встроенного User Django
    email = models.EmailField(unique=True)   # email уникальный, два юзера с одним email не могут быть
    role = models.CharField(...)             # student или admin

    USERNAME_FIELD = 'email'                 # логинимся по email, не по username
    REQUIRED_FIELDS = ['username']           # username тоже обязателен при createsuperuser
```

---

## 2. `backend/users/serializers.py`

```python
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # пароль только на запись, в ответе не вернётся

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'role']  # какие поля принимаем

    def create(self, validated_data):
        user = User.objects.create_user(       # create_user хеширует пароль!
            email=validated_data['email'],     # если написать .create() — пароль будет plain text
            username=validated_data['username'],
            password=validated_data['password'],
        )
        return user

class UserSerializer(serializers.ModelSerializer):  # для GET /me/
    fields = ['id', 'email', 'username', 'role']    # что возвращаем о юзере
```

---

## 3. `backend/tasks/views.py`

```python
class TaskViewSet(viewsets.ModelViewSet):          # ModelViewSet = GET, POST, PUT, PATCH, DELETE автоматом
    serializer_class = TaskSerializer              # какой serializer использовать
    permission_classes = [IsAuthenticated]         # без токена -> 401

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)  # каждый видит ТОЛЬКО свои задачи
        # .order_by('-created_at')                          # новые сверху

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)    # автоматически привязывает задачу к юзеру
                                                   # юзер не может подменить поле user через API
```

Если спросят "а где код для DELETE?" — ответ: `ModelViewSet` наследует от `DestroyModelMixin`, всё встроено. Мы пишем только то, что нужно кастомизировать.

---

## 4. `frontend/src/app/services/auth.service.ts`

```typescript
// login — отправляем email+password, получаем токены
login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, { email: username, password })
        .pipe(
            tap(response => {                                    // tap = побочный эффект
                localStorage.setItem('access_token', response.access);  // сохраняем токен
                localStorage.setItem('refresh_token', response.refresh);
                this.isAuthenticated.set(true);                  // signal -> header обновляется
                this.fetchCurrentUser();                         // загружаем данные юзера
            })
        );
}

// logout — чистим всё
logout(): void {
    localStorage.removeItem('access_token');
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
}

// при старте приложения — проверяем есть ли токен
private checkAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
        this.isAuthenticated.set(true);   // считаем залогиненным
        this.fetchCurrentUser();          // проверяем токен запросом к /me/
    }
}
```

---

## 5. `frontend/src/app/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = authService.getToken();  // берём токен из localStorage

    // НЕ добавляем токен к login/register/refresh — они публичные
    if (token && !req.url.includes('/login/')) {
        req = req.clone({                  // clone потому что request immutable
            setHeaders: {
                Authorization: `Bearer ${token}`  // формат JWT: "Bearer eyJ..."
            }
        });
    }

    return next(req);  // передаём запрос дальше
};
```

**Зачем:** без этого пришлось бы в КАЖДОМ HTTP запросе писать `headers: { Authorization: ... }`. Interceptor делает это автоматически.

---

## 6. `frontend/src/app/services/task.service.ts` — 3 ключевых метода

```typescript
// ЗАГРУЗКА — GET /api/tasks/ -> раскладка по дням
loadTasks(): void {
    this.http.get<ApiTask[]>(`${this.apiUrl}/`).subscribe({
        next: (apiTasks) => {
            for (const day of this.days) { day.tasks = []; }   // очистили
            for (const t of apiTasks) {
                this.days[t.day_of_week].tasks.push({...});    // task с day_of_week=2 -> Wednesday
            }
        }
    });
}

// СОЗДАНИЕ — POST /api/tasks/
addTask(dayIndex: number, task: Task): void {
    const body = {
        title: task.title,
        day_of_week: dayIndex,           // фронт передаёт индекс дня
        due_date: task.deadline || null   // фронт: deadline -> бэк: due_date
    };
    this.http.post(`${this.apiUrl}/`, body).subscribe({
        next: (created) => {
            this.days[dayIndex].tasks.push({...created});  // добавляем локально
        }
    });
}

// TOGGLE DONE — PATCH /api/tasks/5/ {done: true}
toggleDone(dayIndex: number, taskIndex: number): void {
    const newDone = !task.done;
    this.http.patch(`${this.apiUrl}/${task.id}/`, { done: newDone }).subscribe({
        next: () => { task.done = newDone; }  // обновляем локально
    });
}
```

---

## Дедлайны — цветовая логика

```typescript
// task.service.ts
daysUntilDeadline(task: Task): number | null {
    if (!task.deadline) return null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dl = new Date(task.deadline + 'T00:00:00');
    return Math.floor((dl.getTime() - today.getTime()) / 86_400_000);
    // 86_400_000 = 24 * 60 * 60 * 1000 (миллисекунд в дне)
    // возвращает: -2 (просрочен 2 дня), 0 (сегодня), 5 (через 5 дней)
}

deadlineColor(task: Task): DeadlineColor {
    if (d <= 0) return 'red';      // просрочен или сегодня
    if (d <= 2) return 'yellow';   // 1-2 дня
    return 'green';                // 3+ дней
}
```

В HTML цвет применяется через `data-attribute`:
```html
<div class="task-card" [attr.data-deadline]="ts.deadlineColor(task)">
```
```css
.task-card[data-deadline="red"] { border-left-color: #ef4444; background: #fef2f2; }
```

---

## AI советы — приоритизация

```typescript
// task.service.ts
const scored = all.map(entry => {
    const deadlineScore = d !== null ? d : 999;
    const timeScore = this.timeToMinutes(entry.task.time);
    return { ...entry, score: deadlineScore * 10000 + entry.dayIndex * 1000 + timeScore };
}).sort((a, b) => a.score - b.score);
```

Формула: `deadline * 10000 + день_недели * 1000 + время`.
Чем меньше score — тем срочнее.
Просроченная задача (-2) получит score `-20000`, задача через 5 дней — `50000`.
Первый в списке = делай первым.

---

## Как Angular знает что обновить

```typescript
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor]))
// Одна строка — регистрирует и HttpClient и interceptor глобально.

// app.routes.ts
canActivate: [authGuard]
// Angular вызывает authGuard перед каждым переходом на защищённый роут.

// header.html
@if (auth.isAuthenticated()) { ... } @else { ... }
// @if — новый Angular control flow (вместо *ngIf).
// auth.isAuthenticated() — signal, Angular автоматически перерисовывает при изменении.
```

---

## 7. `frontend/src/app/services/notification.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
    private ts = inject(TaskService);          // берём задачи из TaskService

    refresh(): void {
        const all = this.ts.getAllTasks();
        for (const { task } of all) {
            const d = this.ts.daysUntilDeadline(task);
            if (d === null) continue;
            if (d !== 0 && d !== 1) continue;  // только сегодня и завтра

            const urgency = d === 0 ? 'today' : 'tomorrow';
            const message = d === 0
                ? `"${task.title}" is due today.`
                : `"${task.title}" is due tomorrow.`;

            // сохраняем read состояние если уведомление уже было
            const prev = existing.get(id);
            next.push({ id, message, urgency, read: prev ? prev.read : false });
        }
    }

    markRead(id: string): void { ... }     // отметить одно как прочитанное
    markAllRead(): void { ... }            // отметить все
}
```

**Ключевое:** notifications НЕ ходят на бэкенд. Они генерируются на фронте из задач с дедлайном сегодня/завтра.

---

## Шпаргалка: что за что отвечает

| Вопрос | Ответ |
|--------|-------|
| Где хранятся данные? | SQLite (`db.sqlite3`) через Django ORM |
| Как защищены роуты? | `authGuard` проверяет токен в localStorage |
| Как токен попадает в запрос? | `authInterceptor` добавляет `Authorization: Bearer` |
| Почему логин по email? | `USERNAME_FIELD = 'email'` в модели User |
| Как бэк знает чьи задачи? | `filter(user=request.user)` в ViewSet |
| Как задачи попадают в нужный день? | Поле `day_of_week` (0=Mon, 6=Sun) |
| Как работают цвета? | `daysUntilDeadline()` считает дни, `deadlineColor()` возвращает red/yellow/green |
| Как AI даёт совет? | Формула score на фронте, сортировка, первый = самый срочный |
| Зачем PATCH а не PUT? | PATCH отправляет только `{done}`, PUT требует ВСЕ поля |
| Где код для DELETE? | `ModelViewSet` наследует `DestroyModelMixin`, всё встроено |
