# TapMenu Armenia — NFC Digital Menu SaaS Platform

**Website:** https://tapmenu.am  
**Stack:** HTML5 · CSS3 (custom variables + responsive) · Vanilla JS  
**Last updated:** 2026-03-05

---

## 📌 О проекте

TapMenu Armenia — платформа NFC-меню по подписке для ресторанов Армении.  
Гость подносит телефон к метке → меню открывается мгновенно в браузере.  
Никаких приложений. Три языка: RU / EN / HY.

---

## ✅ Реализованные страницы

### 🌐 Лендинг (публичные страницы)
| Файл | URL | Описание |
|------|-----|----------|
| `index.html` | `/` | Главная лендинг-страница |
| `pricing.html` | `/pricing` | Тарифы + таблица сравнения + FAQ |
| `luxe.html` | `/luxe` | Премиум лендинг LUXE (золотой стиль) |
| `how-it-works.html` | `/how-it-works` | Как работает + FAQ |
| `contact.html` | `/contact` | Форма заявки |

### 📱 Демо-меню
| Файл | URL | Описание |
|------|-----|----------|
| `demo/index.html` | `/demo/` | Галерея всех демо-меню |
| `demo/araks-restaurant.html` | `/demo/araks-restaurant` | Армянский ресторан |
| `demo/cafe-nairi.html` | `/demo/cafe-nairi` | Кофейня/кафе |
| `demo/bar-masis.html` | `/demo/bar-masis` | Коктейль-бар |
| `demo/noyan-tapan.html` | `/demo/noyan-tapan` | Fine dining (LUXE) |

### 🖥️ Дашборд (мок owner-панели)
| Файл | URL | Описание |
|------|-----|----------|
| `login.html` | `/login` | Форма входа владельца |
| `menu.html` | `/menu` | Управление меню и блюдами |
| `analytics.html` | `/analytics` | Аналитика с Chart.js |
| `waiter.html` | `/waiter` | Панель вызовов официанта |
| `settings.html` | `/settings` | Настройки ресторана и аккаунта |

### 📄 Документация
| Файл | Описание |
|------|----------|
| `TapMenu_Armenia_TZ.html` | Техническое задание v2.1 |
| `competitor_analysis.html` | Анализ конкурентов |

---

## 🗂️ Структура файлов

```
/
├── index.html                 — Главная страница
├── pricing.html               — Тарифы
├── luxe.html                  — LUXE-лендинг
├── how-it-works.html          — Как работает
├── contact.html               — Контакты / Заявка
├── login.html                 — Вход в дашборд
├── menu.html                  — Управление меню
├── analytics.html             — Аналитика
├── waiter.html                — Вызовы официанта
├── settings.html              — Настройки
├── css/
│   ├── main.css               — Основные стили лендинга
│   ├── luxe.css               — Доп. стили для /luxe
│   └── dashboard.css          — Стили дашборда
├── js/
│   ├── main.js                — i18n, анимации, формы
│   ├── dashboard.js           — helpers дашборда
│   └── supabase-config.js     — Конфиг Supabase (заполнить!)
└── demo/
    ├── index.html             — Галерея демо-меню
    ├── araks-restaurant.html  — 🏺 Армянский ресторан
    ├── cafe-nairi.html        — ☕ Кофейня
    ├── bar-masis.html         — 🍸 Коктейль-бар
    └── noyan-tapan.html       — ✦ Fine Dining (LUXE дизайн)
```

---

## 🎨 Цветовая схема

### Лендинг (Noir de Vigne палитра)
| Переменная | Значение | Описание |
|-----------|---------|---------|
| `--bg` | `#111A19` | Noir de Vigne — главный фон |
| `--bg-card` | `#1E3330` | Карточки — тёплый тёмно-зелёный |
| `--accent` | `#B86830` | Egyptian Earth |
| `--gold` | `#F8D794` | Creased Khaki — акценты, цифры |
| `--text` | `#FFFFFF` | Основной текст |
| `--text-secondary` | `#809076` | Вторичный текст (Wasabi) |

### Дашборд
| Переменная | Значение |
|----------|---------|
| `--db-bg` | `#0b1410` |
| `--db-bg-card` | `#111e17` |
| `--accent` | `#B86830` |
| `--gold` | `#F8D794` |

---

## 💳 Тарифные планы

| Тариф | Цена | Меню | Блюда | Языки | NFC |
|-------|------|------|-------|-------|-----|
| **Starter** | $15/мес | 1 | 50 | 3 | 4 |
| **Pro** | $25/мес | 3 | 150 | 3 | 8 |
| **Premium** | $45/мес | ∞ | ∞ | 20+ | 12 |
| **LUXE** | от $50/мес | ∞ | ∞ | 33 | ∞ |

---

## 📱 Демо-меню

Четыре живых демо-примера (самодостаточные HTML-файлы, стили встроены):

| # | Файл | Стиль | Фичи |
|---|------|-------|------|
| 1 | `araks-restaurant.html` | Тёмно-зелёный, армянский | поиск, корзина, вызов, 3 языка |
| 2 | `cafe-nairi.html` | Тёмный + gold | карточки напитков, корзина |
| 3 | `bar-masis.html` | Нео-noir violet/pink | ночной стиль, коктейли |
| 4 | `noyan-tapan.html` | Роскошный gold/black | fine dining, карта вин, LUXE |

---

## 🖥️ Дашборд (мок Owner Panel)

Демонстрационный прототип владельца ресторана:

| Страница | Функции |
|----------|---------|
| `login.html` | Форма входа с Supabase Auth |
| `menu.html` | CRUD блюд, категории, drag-and-drop, стоп-лист |
| `analytics.html` | Chart.js графики, просмотры, топ блюд, периоды |
| `waiter.html` | Real-time вызовы официанта, статусы |
| `settings.html` | Профиль, языки, NFC-метки, функции, Wi-Fi, подписка |

---

## 🌐 Локализация

Все страницы лендинга поддерживают 3 языка:
- 🇷🇺 RU — Русский (по умолчанию)
- 🇬🇧 EN — English  
- 🇦🇲 HY — Հայերեն (Армянский)

Реализовано через `js/main.js` → функция `applyTranslations(lang)` + `localStorage`.

---

## 🔧 Технические детали

### CSS архитектура
- CSS-переменные в `:root` — единая тема
- Mobile-first responsive (320px / 768px / 1280px)
- Scroll-reveal через `IntersectionObserver`
- Hover-анимации через CSS transitions

### JS функции (js/main.js)
- `applyTranslations(lang)` — i18n переключатель
- `initScrollReveal()` — анимации при прокрутке
- `initCounters()` — анимированные счётчики
- `toggleFAQ(item)` — аккордеон FAQ
- `handleContactForm()` — отправка формы (Telegram Bot в prod)

### Supabase (js/supabase-config.js)
Заполнить перед запуском:
```js
const SUPABASE_URL = 'https://ВАШ-ПРОЕКТ.supabase.co'
const SUPABASE_KEY = 'ВАШ-ANON-KEY'
```

---

## 🚀 Запуск локально

```bash
# Простой статический сервер
npx serve .
# или
python3 -m http.server 3000
```

Открыть: http://localhost:3000

---

## 📋 Что планируется (следующие шаги)

### Фронтенд мок
- [ ] Страница `/demo` с живым конструктором меню
- [ ] Страница `/blog` с SEO-статьями
- [ ] Карта ресторанов-партнёров

### Production (Next.js + Supabase)
- [ ] Перенести HTML-прототипы в Next.js компоненты
- [ ] Подключить реальный Supabase (схема в TZ v2.1)
- [ ] Подключить Cloudflare Images для загрузки фото
- [ ] Подключить Yandex Cloud Translate для авто-перевода
- [ ] Добавить OpenAI GPT-4o для LUXE-тарифа

---

## 📞 Контакты

**Site:** https://tapmenu.am  
**Email:** hello@tapmenu.am  
**Telegram:** @tapmenu_armenia  
**GitHub:** https://github.com/radarbinyan-design/Taptomenu
