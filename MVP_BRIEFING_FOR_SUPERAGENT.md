# TapMenu Armenia -- MVP Technical Briefing for SuperAgent

> **Цель документа:** Полный контекст проекта для суперагента, который напишет ТЗ на сборку, подготовку и запуск MVP.
> **Дата:** 2026-03-24
> **GitHub:** https://github.com/radarbinyan-design/Taptomenu

---

## 1. ЧТО ТАКОЕ TAPMENU ARMENIA

**SaaS-платформа для ресторанов Армении:** NFC/QR цифровое меню с мультиязычной поддержкой, аналитикой, AI-переводами блюд, подписочной моделью и панелью управления для владельцев ресторанов.

**Бизнес-модель:** B2B SaaS, ежемесячная/годовая подписка, 4 тарифа ($15-$50/мес).

**Целевой рынок:** Рестораны, кафе, бары Армении (первая волна: Ереван).

---

## 2. ТЕКУЩЕЕ СОСТОЯНИЕ ПРОЕКТА (КРИТИЧЕСКИ ВАЖНО)

### 2.1 Что РАБОТАЕТ прямо сейчас
| Компонент | Статус | Примечание |
|-----------|--------|------------|
| Статический лендинг (index.html) | РАБОТАЕТ | i18n RU/EN/HY/AR, PWA, Swiper, 72KB |
| Next.js App (build + start) | РАБОТАЕТ | Собирается, запускается на порту 3000 |
| Логин (демо-аккаунты) | РАБОТАЕТ | owner@demo.com / admin@tapmenu.am без БД |
| Публичное меню /menu/araratrest | РАБОТАЕТ | Demo-данные хардкодом, без БД |
| Dashboard UI (все страницы) | РАБОТАЕТ | Все UI отрендерены, но данные захардкожены |
| Admin Panel UI | РАБОТАЕТ | Все данные статические |
| API /api/auth/login | РАБОТАЕТ | Demo fallback + Supabase ready |
| API /api/leads | РАБОТАЕТ | Memory fallback + Supabase ready |
| API /api/exchange-rates | РАБОТАЕТ | CBA Armenia API + fallback rates |
| Middleware (auth guard) | РАБОТАЕТ | Cookie-based + Supabase ready |

### 2.2 Что НЕ РАБОТАЕТ / ЗАГЛУШКИ
| Компонент | Статус | Что нужно |
|-----------|--------|-----------|
| PostgreSQL / Prisma | НЕ ПОДКЛЮЧЕН | Нет реальной БД, все Prisma-запросы падают в catch |
| Supabase Auth | НЕ ПОДКЛЮЧЕН | Placeholder credentials, cookie-based fallback |
| Supabase Storage (фото блюд) | НЕ СДЕЛАНО | Нет загрузки фото, все imageUrl = null |
| CRUD блюд | ЗАГЛУШКА | API есть, но БД не подключена |
| CRUD меню/категорий | ЗАГЛУШКА | UI есть, бэкенд не подключен |
| CRUD столиков | ЗАГЛУШКА | UI есть, бэкенд не подключен |
| Аналитика (реальные данные) | ЗАГЛУШКА | UI с хардкод-данными |
| AI Ассистент | ЗАГЛУШКА | API ready, нужен OpenAI API ключ |
| Регистрация | ЗАГЛУШКА | UI есть, бэкенд не подключен |
| QR-код генерация | НЕ СДЕЛАНО | Нет библиотеки, нет PDF export |
| Drag&Drop сортировка | ЧАСТИЧНО | dnd-kit установлен, не интегрирован |
| Оплата (Stripe/местная) | НЕ СДЕЛАНО | Только UI тарифов |
| Email уведомления | ЧАСТИЧНО | Resend код есть, API ключ не подключен |
| DeepL/Google переводы | КОД ЕСТЬ | Нет API ключей, не интегрировано в UI |
| Vercel деплой | НЕ СДЕЛАНО | vercel.json готов |

### 2.3 DEMO ДАННЫЕ В КОДЕ
- **Демо-аккаунты:** `owner@demo.com` / `demo1234` (owner), `admin@tapmenu.am` / `admin1234` (superadmin)
- **Демо-ресторан:** "Ресторан Арарат" (slug: `araratrest`) -- хардкодом в `/menu/[slug]/page.tsx`
- **Демо-блюда:** 4 блюда (Греческий салат, Долма, Хоровац, Армянское вино) с переводами на EN/HY/AR
- **Dashboard данные:** Все KPI, графики, таблицы -- статические значения в TSX файлах

---

## 3. АРХИТЕКТУРА ПРОЕКТА

### 3.1 Файловая структура
```
/home/user/webapp/
├── index.html                    # Главный лендинг (i18n RU/EN/HY/AR, PWA)
├── app.html                      # PWA приложение (phone-mode / fullscreen)
├── how-it-works.html             # Страница "Как это работает"
├── pricing.html                  # Тарифы
├── contact.html                  # Контакты + форма заявки
├── luxe.html                     # LUXE тариф
├── login.html                    # Старая статическая страница логина
├── menu.html                     # Статическое демо-меню
├── analytics.html                # Статическая аналитика
├── settings.html                 # Статические настройки
├── waiter.html                   # Статическая страница официанта
├── competitor_analysis.html      # Анализ конкурентов
├── TapMenu_Armenia_TZ.html       # Техническое задание v2.1 (HTML документ)
├── manifest.json                 # PWA манифест
├── sw.js                         # Service Worker
├── css/
│   ├── main.css                  # Стили лендинга
│   ├── dashboard.css             # Стили дашборда (статический)
│   └── luxe.css                  # Стили LUXE страницы
├── js/
│   ├── main.js                   # Скрипты лендинга
│   ├── dashboard.js              # Скрипты дашборда (статический)
│   └── supabase-config.js        # Конфиг Supabase (старый)
├── demo/                         # Статические демо-рестораны
│   ├── araks-restaurant.html
│   ├── bar-masis.html
│   ├── cafe-nairi.html
│   ├── noyan-tapan.html
│   └── index.html
└── nextjs-app/                   # === ОСНОВНОЕ SaaS ПРИЛОЖЕНИЕ ===
    ├── package.json              # Dependencies + scripts
    ├── next.config.mjs           # Next.js конфиг
    ├── ecosystem.config.cjs      # PM2 конфиг
    ├── vercel.json               # Vercel деплой конфиг (crons, functions)
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── prisma/
    │   └── schema.prisma         # === СХЕМА БД (13 моделей) ===
    ├── supabase/
    │   └── migrations/
    │       ├── 0001_initial_schema.sql  # Полный SQL для БД
    │       └── 0002_leads_table.sql
    └── src/
        ├── middleware.ts          # Auth guard: Supabase + cookie fallback
        ├── app/
        │   ├── layout.tsx         # Root layout
        │   ├── page.tsx           # Лендинг Next.js (или redirect)
        │   ├── globals.css        # Tailwind + кастомные стили
        │   ├── (auth)/
        │   │   ├── layout.tsx     # Auth layout
        │   │   ├── login/page.tsx # Страница логина
        │   │   ├── register/page.tsx # Регистрация (3 шага)
        │   │   └── forgot-password/page.tsx
        │   ├── admin/             # Super Admin Panel
        │   │   ├── layout.tsx
        │   │   ├── page.tsx       # Обзор (MRR, ARR, рестораны)
        │   │   ├── analytics/page.tsx
        │   │   ├── leads/page.tsx
        │   │   ├── restaurants/page.tsx
        │   │   ├── revenue/page.tsx
        │   │   ├── settings/page.tsx
        │   │   ├── subscriptions/page.tsx
        │   │   └── users/page.tsx
        │   ├── api/
        │   │   ├── auth/login/route.ts     # POST: demo + Supabase auth
        │   │   ├── auth/logout/route.ts    # POST: clear cookies
        │   │   ├── dishes/route.ts         # GET + POST (Prisma)
        │   │   ├── leads/route.ts          # POST + GET + PATCH (Supabase + memory)
        │   │   ├── exchange-rates/route.ts # GET: CBA Armenia API
        │   │   ├── ai/chat/route.ts        # POST: OpenAI GPT-4
        │   │   └── upload/route.ts         # POST: file upload
        │   ├── dashboard/
        │   │   ├── layout.tsx     # Sidebar + Header + Responsive
        │   │   ├── page.tsx       # KPI, Recent Views, Quick Actions
        │   │   ├── dishes/page.tsx        # Библиотека блюд
        │   │   ├── dishes/new/page.tsx    # Форма добавления
        │   │   ├── dishes/[id]/page.tsx   # Редактирование блюда
        │   │   ├── menus/page.tsx         # Управление меню
        │   │   ├── menus/[id]/edit/page.tsx
        │   │   ├── tables/page.tsx        # NFC-столики
        │   │   ├── analytics/page.tsx     # Аналитика
        │   │   ├── ai-assistant/page.tsx  # AI Chat
        │   │   └── settings/page.tsx      # Настройки
        │   ├── menu/[slug]/
        │   │   ├── page.tsx              # SSR: Prisma query + demo fallback
        │   │   └── PublicMenuClient.tsx   # Client: корзина, поиск, языки, валюта
        │   ├── contact/page.tsx
        │   ├── dev/page.tsx       # Dev-only page
        │   ├── how-it-works/page.tsx
        │   └── pricing/page.tsx
        ├── components/
        │   ├── landing/           # Лендинг-секции (Hero, Features, Pricing...)
        │   └── ui/                # shadcn/ui (button, card, badge, input, select, textarea)
        ├── lib/
        │   ├── prisma.ts          # Prisma Client singleton
        │   ├── supabase.ts        # Supabase clients (anon + admin) + Database types
        │   ├── openai.ts          # OpenAI assistant helper
        │   ├── currency.ts        # CBA exchange rates + formatPrice
        │   ├── security.ts        # AES-256 WiFi encrypt + slug generator + rate limiter
        │   ├── translations.ts    # DeepL + Google Translate integration
        │   ├── image-processing.ts # Sharp image resize
        │   └── utils.ts           # cn() utility
        ├── stores/
        │   ├── auth.ts            # Zustand: user, restaurant, subscription
        │   └── menu.ts            # Zustand: menu state
        └── types/
            └── index.ts           # Все TypeScript типы + PLAN_LIMITS + SUPPORTED_LANGUAGES + CURRENCIES
```

### 3.2 Технологический стек
| Слой | Технология | Версия |
|------|-----------|--------|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript | ^5 |
| Styles | Tailwind CSS | ^3.4.1 |
| UI Components | Radix UI + shadcn/ui | latest |
| ORM | Prisma | ^5.22.0 |
| Auth | Supabase Auth (+ cookie fallback) | ^2.98.0 |
| Storage | Supabase Storage (planned) | -- |
| AI | OpenAI | ^6.27.0 |
| Animations | Framer Motion | ^12.35.1 |
| Icons | Lucide React | ^0.577.0 |
| State | Zustand (persist) | ^5.0.11 |
| Queries | TanStack React Query | ^5.90.21 |
| Forms | React Hook Form + Zod | ^7.71.2 / ^4.3.6 |
| Email | Resend | ^6.9.3 |
| Image Processing | Sharp | ^0.34.5 |
| DnD | @dnd-kit | ^6.3.1 |
| Date | date-fns | ^4.1.0 |

### 3.3 Схема базы данных (Prisma) -- 13 моделей
```
 User ──1:N──> Restaurant ──1:N──> Dish
  │                │                  │
  └──1:1──> Subscription        MenuDish (pivot)
                   │                  │
            PaymentHistory      Menu ──1:N──> Category
                                  │               │
                              MenuDish <───────────┘
                                  
 Restaurant ──1:N──> Table
 Restaurant ──1:N──> MenuView (analytics)
 Restaurant ──1:N──> AiConversation

 ExchangeRate (standalone)
 Lead (standalone)
```

**Ключевые модели:**
1. **User** -- id, email, name, phone, role(owner/admin/superadmin), avatarUrl
2. **Restaurant** -- id, userId, name, slug(unique), logo, cover, address, wifi, colors, template
3. **Subscription** -- id, userId(unique), plan(starter/pro/premium/luxe), status(trial/active/grace/blocked), limits
4. **Dish** -- id, restaurantId, name, translations(JSONB), price(AMD int), image(3 sizes), nutrition, dietary, allergens[]
5. **Menu** -- id, restaurantId, name, status(active/inactive/draft), languages[], isDefault
6. **Category** -- id, menuId, name, translations(JSONB), emoji, sortOrder
7. **MenuDish** -- menuId+dishId(unique), categoryId, sortOrder, isAvailable, specialPrice (PIVOT TABLE)
8. **Table** -- id, restaurantId, name, nfcTagId(unique), qrCode
9. **MenuView** -- restaurantId, tableId, lang, device, country, city, viewedAt (ANALYTICS)
10. **ExchangeRate** -- fromCurrency+toCurrency(unique), rate
11. **Lead** -- name, restaurant_name, email, phone, plan, message, status(new/contacted/converted/rejected)
12. **PaymentHistory** -- subscriptionId, amount, currency, plan, period, status
13. **AiConversation** -- restaurantId, userId, messages(JSONB), tokensUsed

### 3.4 Тарифные планы (из types/index.ts PLAN_LIMITS)
| | Starter | Pro | Premium | LUXE |
|---|---------|-----|---------|------|
| Цена/мес | $15 | $25 | $45 | $50 |
| Цена/год | $12/мес | $20/мес | $36/мес | $40/мес |
| Меню | 1 | 3 | 10 | Unlimited (-1) |
| Блюд | 30 | 100 | 500 | Unlimited (-1) |
| Языков | 2 | 5 | 20 | 33 |
| NFC-тегов | 1 | 5 | 20 | Unlimited (-1) |
| Аналитика | Нет | Да | Да | Да |
| AI Ассистент | Нет | Нет | Нет | Да |
| DeepL | Нет | Нет | Да | Да |
| Кастом-шаблон | Нет | Нет | Да | Да |

### 3.5 Поддерживаемые языки и валюты
- **33 языка:** RU, EN, HY, AR, ZH, FR, DE, ES, IT, JA, KO, TR, PL, PT, NL, SV, DA, FI, NO, CS, SK, HU, RO, BG, HR, SR, UK, KA, HE, FA, VI, TH, ID
- **5 валют:** AMD (драм, основная), USD, EUR, RUB, GBP
- **Курсы:** API Центрального Банка Армении (CBA), обновление ежедневно, fallback hardcoded

---

## 4. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (ПОЛНЫЙ СПИСОК)

```env
# === ОБЯЗАТЕЛЬНЫЕ для MVP ===
DATABASE_URL=postgresql://...          # Supabase PostgreSQL (Transaction pooler)
DIRECT_URL=postgresql://...            # Supabase PostgreSQL (Direct connection, для migrations)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your-jwt-secret-32chars
WIFI_ENCRYPTION_KEY=64-hex-chars       # AES-256 шифрование Wi-Fi пароля

# === ЖЕЛАТЕЛЬНЫЕ для MVP ===
OPENAI_API_KEY=sk-...                  # AI Ассистент (LUXE план)
RESEND_API_KEY=re_...                  # Email уведомления о заявках
ADMIN_EMAIL=admin@tapmenu.am           # Email для уведомлений
NEXT_PUBLIC_APP_URL=https://app.tapmenu.am

# === ОПЦИОНАЛЬНЫЕ ===
DEEPL_API_KEY=...                      # Перевод блюд (Premium/LUXE)
GOOGLE_TRANSLATE_API_KEY=...           # Fallback перевод
CRON_SECRET=...                        # Защита cron-эндпоинтов
STRIPE_SECRET_KEY=...                  # Когда подключим оплату
STRIPE_WEBHOOK_SECRET=...
```

---

## 5. КРИТИЧЕСКИЕ ЗАВИСИМОСТИ И ОГРАНИЧЕНИЯ

### 5.1 Supabase -- двойная роль
- **Auth:** регистрация, логин, сессии, refresh tokens
- **PostgreSQL:** через Prisma ORM (не через Supabase JS client!)
- **Storage:** фото блюд (bucket "dish-images") -- НЕ реализовано
- **Код написан с graceful degradation:** если Supabase не подключен -- demo-данные + cookie fallback
- **Middleware проверяет `isRealSupabase`:** если URL содержит "your-project" -> cookie-based auth

### 5.2 Prisma + PostgreSQL
- Schema: 13 таблиц, полностью описаны
- SQL миграция готова: `supabase/migrations/0001_initial_schema.sql`
- Все Prisma-запросы обёрнуты в try/catch (молча падают если БД нет)
- Нужен: `npx prisma generate` после install, `npx prisma db push` для применения

### 5.3 Что НЕТ и нужно для Production
- RLS (Row Level Security) -- политики НЕ написаны
- Real auth -- регистрация не подключена к Supabase Auth
- Image upload -- Sharp установлен, pipeline не доделан
- Тесты -- ноль тестов
- CI/CD -- нет GitHub Actions
- Monitoring -- нет Sentry / error tracking

---

## 6. API ENDPOINTS

| Method | Path | Описание | Статус |
|--------|------|----------|--------|
| POST | /api/auth/login | Логин (demo + Supabase) | Работает |
| POST | /api/auth/logout | Выход (clear cookies) | Работает |
| GET | /api/dishes?restaurantId=xxx | Список блюд (Prisma) | Нужна БД |
| POST | /api/dishes | Создание блюда (Prisma) | Нужна БД |
| POST | /api/leads | Новая заявка (Supabase + memory fallback) | Работает |
| GET | /api/leads | Список заявок (admin only) | Работает |
| PATCH | /api/leads | Обновить статус заявки | Работает |
| GET | /api/exchange-rates | Курсы валют CBA Armenia | Работает |
| POST | /api/ai/chat | AI ассистент (OpenAI GPT-4) | Нужен API ключ |
| POST | /api/upload | Загрузка файлов | Не доработан |

---

## 7. ЧТО НУЖНО ДЛЯ MVP -- ПРИОРИТИЗИРОВАННЫЙ ПЛАН

### ФАЗА 1: ИНФРАСТРУКТУРА (первым делом, без этого ничего не работает)
1. Создать Supabase проект (регион fra1 / eu-central)
2. Применить SQL миграцию `0001_initial_schema.sql`
3. Настроить Supabase Auth (email+password, подтверждение email)
4. Написать RLS политики (owner видит только свой ресторан)
5. Настроить Supabase Storage bucket "dish-images" (public read, auth write)
6. Заполнить .env реальными ключами
7. `npx prisma db push` для синхронизации Prisma с БД

### ФАЗА 2: CORE MVP (без этого нет продукта)
8. Подключить реальную регистрацию (Supabase signUp -> создание User + Restaurant + Subscription)
9. CRUD блюд с БД (создание, редактирование, удаление, загрузка фото через Storage)
10. CRUD категорий и меню (создание, drag&drop сортировка @dnd-kit, привязка блюд)
11. Публичное меню из БД (убрать DEMO_RESTAURANT хардкод, читать из Prisma)
12. QR-код генерация (npm: qrcode + jspdf для PDF печати)
13. Dashboard с реальными данными (заменить хардкод на Prisma queries)

### ФАЗА 3: UX ДЛЯ ПЕРВЫХ КЛИЕНТОВ
14. Загрузка фото блюд (Supabase Storage + Sharp resize: 1200x900 + 800x600 + 300x200 WebP)
15. Аналитика записи (MenuView при открытии /menu/[slug], агрегация по дням/устройствам/языкам)
16. Настройки ресторана (логотип, цвета, Wi-Fi, адрес, описание)
17. AI-перевод блюд (DeepL/Google Translate интеграция в форму)
18. Email уведомления (Resend: заявка, welcome, subscription reminders)

### ФАЗА 4: МОНЕТИЗАЦИЯ
19. Stripe интеграция (checkout session, webhooks, subscription management)
20. Или местный платёжный шлюз (Ameria Bank, IDram, Telcell)
21. Enforce plan limits (проверка лимитов при создании блюд/меню/столиков)
22. Grace period + blocking (автоблокировка при неоплате)

### ФАЗА 5: PRODUCTION DEPLOY
23. Vercel деплой + домен tapmenu.am
24. Тесты (минимум: API routes + middleware + auth flow)
25. CI/CD (GitHub Actions: lint + type-check + test + deploy)
26. SEO (meta tags, OG images, sitemap)
27. Monitoring (Sentry, Vercel Analytics)

---

## 8. ПРАВИЛА ДЛЯ АГЕНТА-РАЗРАБОТЧИКА

### 8.1 Структура и пути
- Все файлы в `/home/user/webapp/`
- Next.js app в `/home/user/webapp/nextjs-app/`
- Команды: `cd /home/user/webapp/nextjs-app && ...`
- TypeScript типы ТОЛЬКО из `src/types/index.ts`
- Библиотечный код в `src/lib/` -- не дублировать

### 8.2 Стиль кода
- TypeScript strict -- никаких `any` без явной причины
- Tailwind CSS -- не писать кастомный CSS
- shadcn/ui -- использовать компоненты из `src/components/ui/`
- Lucide icons -- все иконки оттуда
- Русский язык в UI (основной для платформы)
- Файлы: kebab-case, Компоненты: PascalCase, Переменные: camelCase

### 8.3 API паттерны
- Route Handlers: `src/app/api/[name]/route.ts`
- Prisma для БД: `import { prisma } from '@/lib/prisma'`
- Supabase только для Auth и Storage (НЕ для direct queries)
- Ответы: `{ data: ... }` / `{ error: 'message' }`
- Pagination: `?page=1&limit=50`

### 8.4 Auth -- КРИТИЧЕСКИ ВАЖНО
- Demo accounts ВСЕГДА должны работать (НЕ ЛОМАТЬ при подключении real auth!)
- Cookie-based fallback (`sb-access-token` + `user-role`) если Supabase не подключен
- Middleware проверяет `isRealSupabase` -- два режима работы

### 8.5 Сборка и запуск
```bash
cd /home/user/webapp/nextjs-app
npm install
npx prisma generate
DATABASE_URL="postgresql://..." npm run build
DATABASE_URL="postgresql://..." npx next start -p 3000
```

### 8.6 НЕ ТРОГАТЬ без явного запроса
- `index.html` и статические файлы лендинга
- `TapMenu_Armenia_TZ.html` (ТЗ документ)
- `demo/` директория
- Существующие shadcn/ui компоненты

---

## 9. БИЗНЕС-КОНТЕКСТ

### Целевая аудитория
- 8000+ ресторанов и кафе Армении
- Первая волна: 3500+ заведений Еревана
- Средний чек ресторана: 5000-15000 AMD ($13-$38)

### Конкурентное преимущество
- **NFC-метки** -- не просто QR, а NFC (тренд +340% в Армении)
- **33 языка** -- туристический рынок (RU/EN/HY/AR + 29 других)
- **AI-переводы** -- автоперевод с адаптацией
- **Локальная валюта** -- AMD как базовая + конвертация CBA
- **Цена** -- от $15/мес vs $30-80 у конкурентов

### KPI для MVP
- Время от регистрации до первого меню: < 15 минут
- Загрузка публичного меню: < 2 секунды
- Uptime: 99.5%+
- Цель первого месяца: 10 ресторанов

---

## 10. ЧЕКЛИСТ "MVP ГОТОВ"

- [ ] Supabase проект создан и подключен
- [ ] SQL миграция применена, 13 таблиц существуют
- [ ] RLS политики написаны и включены
- [ ] Регистрация работает (email + пароль + верификация)
- [ ] Логин работает (real auth + demo fallback)
- [ ] Владелец создаёт ресторан (name, slug, logo)
- [ ] Владелец добавляет блюдо (name, price, photo, description)
- [ ] Владелец создаёт меню и категории
- [ ] Drag&drop привязка блюд к категориям
- [ ] Публичное меню по slug из БД
- [ ] QR-код генерация + PDF export
- [ ] Аналитика записывает просмотры
- [ ] Dashboard показывает реальные данные
- [ ] Email при новой заявке
- [ ] Деплой на Vercel
- [ ] Домен tapmenu.am
- [ ] SSL
- [ ] 404 и error pages
- [ ] Lighthouse > 80

---

*Документ создан на основе полного аудита кодовой базы: 107 файлов, 13 DB моделей, 10 API endpoints.*
*2026-03-24*
