# TapMenu Armenia — SaaS Цифровое Меню для Ресторанов

## Обзор проекта
**TapMenu Armenia** — SaaS платформа для ресторанов Армении: NFC/QR-меню с поддержкой 6 языков, аналитикой, AI-переводами блюд и управлением через web-кабинет.

## 🌐 URLs

### Лендинг (статический сайт)
- **Главная**: https://tapmenu.am (или локально из `/home/user/webapp/index.html`)
- **Как это работает**: `how-it-works.html`
- **Тарифы**: `pricing.html`
- **Контакты**: `contact.html`
- **LUXE тариф**: `luxe.html`
- **PWA Приложение**: `app.html` (адаптивный: phone-mode на мобильных, fullscreen на desktop)

### Next.js 14 SaaS App (sandbox)
- **Публичное меню**: https://3000-iwohn6b22s796hxme59pt-b32ec7bb.sandbox.novita.ai/menu/araratrest
- **Вход**: `/login`
- **Регистрация**: `/register` (3 шага)
- **Восстановление пароля**: `/forgot-password`
- **Dashboard**: `/dashboard` (защищён middleware)
- **Admin Panel**: `/admin`

### GitHub
- **Репозиторий**: https://github.com/radarbinyan-design/Taptomenu

## ✅ Реализованные функции

### Лендинг (index.html)
- [x] Полная i18n система (RU/EN/HY/AR) с `data-i18n` атрибутами
- [x] Секция «Зачем TapMenu?»: удобство гостей, NFC тренд 2024–2025, экономия времени официантов
- [x] **Статистика потерь времени**: ~21 ч/нед = 2ч/день доставка меню + 1ч/день объяснения блюд + 0.5ч/день поиск столиков
- [x] **ROI +10% к прибыли** через рост среднего чека при использовании цифрового меню
- [x] PWA (`manifest.json` + `sw.js`): автоматически открывает `app.html` на мобильных
- [x] Swiper карусель для демо секций
- [x] 4 интерактивных превью ресторанов

### Next.js 14 SaaS App
- [x] **Публичное меню** (`/menu/[slug]`): SSR + ISR (60с), переключение языка, конвертация валют (AMD/USD/EUR/RUB)
- [x] **Dashboard Layout**: адаптивный sidebar, breadcrumbs, уведомления
- [x] **Обзор** (`/dashboard`): KPI карточки, последние просмотры, быстрые действия
- [x] **Библиотека блюд** (`/dashboard/dishes`): фильтры, поиск, dietary badges (Vegan/GF/Spicy), мультиязычность
- [x] **Добавление блюда** (`/dashboard/dishes/new`): 3-табовая форма (Основное / Переводы / Нутриция), AI-перевод, аллергены
- [x] **Меню** (`/dashboard/menus`): 3 меню, лимит тарифа, быстрые действия
- [x] **Столики** (`/dashboard/tables`): QR-коды, статусы
- [x] **Аналитика** (`/dashboard/analytics`): просмотры, устройства, языки, топ блюда
- [x] **AI Ассистент** (`/dashboard/ai-assistant`): чат с GPT-4 (требует OpenAI API ключ)
- [x] **Настройки** (`/dashboard/settings`): ресторан, QR, уведомления, тарифы
- [x] **Super Admin** (`/admin`): MRR/ARR/ARPU, рестораны, план-дистрибуция, алерты
- [x] **Авторизация**: Login, Register (3 шага с выбором тарифа), Forgot Password
- [x] **Middleware**: защита `/dashboard` и `/admin` через JWT cookies

## 📦 Архитектура

```
/home/user/webapp/
├── index.html           # Главный лендинг (i18n, PWA, Swiper)
├── app.html             # PWA приложение (phone-mode / fullscreen)
├── manifest.json        # PWA манифест
├── sw.js                # Service Worker
├── css/main.css         # Стили лендинга
├── js/main.js           # Скрипты лендинга
└── nextjs-app/          # Next.js 14 SaaS приложение
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/      # login, register, forgot-password
    │   │   ├── admin/       # Super Admin панель
    │   │   ├── api/         # API роуты (auth, dishes, ai, exchange-rates, upload)
    │   │   ├── dashboard/   # Owner Dashboard (dishes, menus, tables, analytics, settings, ai-assistant)
    │   │   └── menu/[slug]/ # Публичное меню (SSR/ISR)
    │   ├── components/ui/   # Button, Card, Badge, Input
    │   ├── lib/             # prisma, openai, currency, supabase, security, translations
    │   └── types/           # TypeScript типы + SUPPORTED_LANGUAGES, CURRENCIES константы
    ├── prisma/schema.prisma # Схема БД (Restaurant, Dish, Menu, Order, Subscription...)
    └── supabase/migrations/ # SQL миграции
```

## 🛠 Технологии

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 14 (App Router) |
| Язык | TypeScript |
| Стили | Tailwind CSS |
| UI компоненты | Radix UI + shadcn/ui |
| ORM | Prisma (PostgreSQL) |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4 |
| Анимации | Framer Motion |
| Иконки | Lucide React |
| Состояние | Zustand |
| Запросы | TanStack Query |

## 📊 Бизнес-данные (для лендинга)

### Потери времени официантов
- **2 ч/день** — доставка и уборка физических меню
- **1 ч/день** — объяснение состава блюд гостям  
- **0.5 ч/день** — поиск свободных столиков
- **Итого: ~21 ч/неделю** на одного официанта

### ROI от TapMenu
- **+10% к прибыли** за счёт роста среднего чека
- Гости дольше изучают меню → чаще заказывают доп. позиции
- Официанты обслуживают на 30% больше столиков

### NFC тренд 2024–2025
- +340% роста использования NFC-меню в ресторанах Армении
- 78% гостей предпочитают цифровое меню при наличии выбора

## 🔐 Переменные окружения

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-...
JWT_SECRET=...
```

## 🚀 Запуск (dev)

```bash
cd nextjs-app
DATABASE_URL="postgresql://..." npm run build
pm2 start ecosystem.config.cjs
# Открыть http://localhost:3000
```

## 🗺 Roadmap

### Неделя 3 (Owner Dashboard)
- [ ] CRUD категорий меню (drag&drop порядок)
- [ ] Загрузка фото блюд (Supabase Storage / Sharp.js resize)
- [ ] QR-код генерация и печать (PDF)
- [ ] Настройка темы ресторана (цвета, логотип, шрифт)

### Неделя 4 (Публичное меню v2)
- [ ] Корзина и предзаказ
- [ ] Кнопка «Позвать официанта»
- [ ] Аллергены с иконками
- [ ] Инфо о столике (QR-параметр `?table=5`)

### Неделя 5 (Производство)
- [ ] Деплой на Vercel (Production + Preview)
- [ ] Подключение реальной Supabase БД
- [ ] Stripe / местные платёжные системы
- [ ] Email уведомления (Resend)
- [ ] SEO оптимизация публичного меню

## Статус деплоя

| Компонент | Статус |
|-----------|--------|
| Лендинг | ✅ index.html с i18n и PWA |
| Next.js App | ✅ Dev сервер (sandbox) |
| GitHub | ✅ https://github.com/radarbinyan-design/Taptomenu |
| Vercel | ⏳ Планируется |
| База данных | ⏳ Demo данные (Supabase планируется) |

---
*Последнее обновление: Март 2025 · TapMenu Armenia*
