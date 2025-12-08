```markdown
# HackMate — Платформа для поиска и формирования команд на хакатонах
ITAM Courses Hackathon 2025

HackMate — это web-платформа, которая помогает участникам хакатонов быстро находить команду, а организаторам — управлять процессом формирования команд, анализировать состав участников и снижать хаос, возникающий при использовании Telegram-чатов.

---

## Функциональность проекта

### Для участников
- Авторизация через Telegram-код
- Выбор хакатона
- Создание анкеты (роль, навыки, опыт)
- Просмотр участников и команд
- Фильтры по ролям и стеку
- Отправка и приём приглашений
- Создание команды
- Управление составом команды

### Для организаторов
- Вход через email и пароль
- Создание / редактирование хакатонов
- Просмотр участников
- Просмотр команд
- Ручное распределение участников
- Экспорт данных (.csv)
- Базовая аналитика по ролям, навыкам и статусам

---

## Технологический стек

### Frontend
- React
- TypeScript
- Vite
- Zustand/Redux (если используется)
- Axios

### Admin-panel
- React
- TypeScript
- Таблицы/формы для управления хакатоном

### Backend
- Node.js
- NestJS / Express
- PostgreSQL
- Prisma / TypeORM
- JWT
- Telegram Auth

### Infrastructure
- Docker / Docker Compose
- Makefile
- YAML-конфиги

---

## Структура проекта

```

ITAM-courses-hackaton-2025/
│
├── backend/               # Backend API (Nest/Express)
│   ├── src/
│   ├── config/
│   ├── Dockerfile
│   └── ...
│
├── frontend/              # Web-клиент для участников
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── ...
│
├── admin/                 # Админ-панель
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yaml    # Оркестратор всех сервисов
├── Makefile               # Упрощённые команды деплоя
└── README.md

````

---

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/blx000/ITAM-courses-hackaton-2025.git
cd ITAM-courses-hackaton-2025
````

### 2. Настройка конфигурации

```bash
cp backend/config/local.example.yaml backend/config/local.yaml
```

Важно: данные внутри local.yaml выдаются разработчиками проекта.

---

## 3. Запуск проекта

### Вариант 1: запуск через Makefile (рекомендуется)

Запустить весь проект:

```bash
make up
```

Остановить сервисы:

```bash
make down
```

Остановить сервисы и удалить данные базы данных:

```bash
make down-v
```

---

### Вариант 2: запуск через Docker Compose напрямую

Запуск:

```bash
docker compose up -d --build
```

Остановка:

```bash
docker compose down
```

Остановка и удаление volumes:

```bash
docker compose down -v
```

---

## Планы развития

* AI-подбор участников и команд
* Портфолио проектов участников
* Единая экосистема для всех хакатонов
* Маркетплейс специалистов
* B2B: корпоративные хакатоны под ключ
* Избранные участники
* Мессенджер внутри команд
* Интеграция с HR-платформами

---

## Команда проекта

Product Manager — Левченков Артемий / tg:@blx000
Frontend Developer — Мушкина Виктория / tg:@ViktoriaM06
Backend Developer — Аникин Семён / tg:@gachimansemen
UI/UX Designer — Хлыстова Анастасия / tg:@voshodn
