# TapMenu Armenia — Supabase Database Setup

## Структура

```
supabase/
└── migrations/
    ├── 0001_initial_schema.sql   — Полная схема БД (все таблицы + индексы + триггеры)
    └── 0002_leads_table.sql      — Таблица leads + RLS политики (применять поверх существующей БД)
```

## Применение миграций

### Вариант 1 — Supabase SQL Editor (рекомендуется)

1. Открыть [Supabase Dashboard](https://app.supabase.com) → ваш проект
2. Перейти в **SQL Editor**
3. Вставить содержимое файла и нажать **Run**

**Порядок применения:**
- Новая БД → `0001_initial_schema.sql` (создаёт всё с нуля)
- Существующая БД → `0002_leads_table.sql` (добавляет только таблицу leads)

### Вариант 2 — Supabase CLI

```bash
# Установить CLI
npm install -g supabase

# Линковать к проекту
supabase link --project-ref YOUR_PROJECT_REF

# Применить миграции
supabase db push
```

### Вариант 3 — psql напрямую

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_initial_schema.sql
# или для обновления существующей:
psql "$DATABASE_URL" -f supabase/migrations/0002_leads_table.sql
```

## Таблица leads — структура

```sql
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255),
  email           VARCHAR(255) NOT NULL,      -- email или телефон
  phone           VARCHAR(50),
  plan            VARCHAR(50) NOT NULL DEFAULT 'pro',
  message         TEXT,
  status          VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## RLS политики для leads

| Политика | Роль | Операция |
|----------|------|----------|
| `leads_insert_public` | `anon`, `authenticated` | INSERT — любой может отправить форму |
| `leads_select_admin` | `authenticated` (role=admin\|superadmin) | SELECT |
| `leads_update_admin` | `authenticated` (role=admin\|superadmin) | UPDATE (смена статуса) |
| `leads_delete_superadmin` | `authenticated` (role=superadmin) | DELETE |

## Все таблицы схемы

| Таблица | Описание |
|---------|----------|
| `users` | Аккаунты владельцев, администраторов |
| `restaurants` | Рестораны (slug, цвета, Wi-Fi AES-256) |
| `subscriptions` | Подписки (Starter/Pro/Premium/LUXE) |
| `dishes` | Библиотека блюд (JSONB переводы, WebP 3 размера) |
| `menus` | Меню ресторана |
| `categories` | Категории меню |
| `menu_dishes` | Pivot: меню ↔ блюда |
| `tables` | Столики (NFC tag ID, QR) |
| `menu_views` | Аналитика просмотров |
| `exchange_rates` | Курсы ЦБА (AMD/USD/EUR/RUB/GBP) |
| `leads` | Заявки с контактной формы |
| `ai_conversations` | История AI-ассистента (LUXE) |
| `payment_history` | История платежей |

## Переменные окружения

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
