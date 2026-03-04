# TapMenu Armenia — NFC Digital Menu SaaS Platform

**Website:** https://tapmenu.am  
**Stack:** HTML5 · CSS3 (custom variables + responsive) · Vanilla JS  
**Last updated:** 2026-03-03

---

## 📌 О проекте

TapMenu Armenia — платформа NFC-меню по подписке для ресторанов Армении.  
Гость подносит телефон к метке → меню открывается мгновенно в браузере.  
Никаких приложений. Три языка: RU / EN / HY.

---

## ✅ Реализованные страницы

| Файл | URL | Описание |
|------|-----|----------|
| `index.html` | `/` | Главная лендинг-страница |
| `pricing.html` | `/pricing` | Тарифы + таблица сравнения + FAQ |
| `luxe.html` | `/luxe` | Премиум лендинг LUXE (золотой стиль) |
| `how-it-works.html` | `/how-it-works` | Как работает + FAQ |
| `contact.html` | `/contact` | Форма заявки |
| `demo/index.html` | `/demo/` | Галерея всех демо-меню |
| `demo/araks-restaurant.html` | `/demo/araks-restaurant` | Демо: армянский ресторан |
| `demo/cafe-nairi.html` | `/demo/cafe-nairi` | Демо: кофейня/кафе |
| `demo/bar-masis.html` | `/demo/bar-masis` | Демо: коктейль-бар |
| `demo/noyan-tapan.html` | `/demo/noyan-tapan` | Демо: fine dining ресторан |

---

## 🗂️ Структура файлов

```
/
├── index.html                 — Главная страница
├── pricing.html               — Тарифы
├── luxe.html                  — LUXE-лендинг
├── how-it-works.html          — Как работает
├── contact.html               — Контакты / Заявка
├── css/
│   ├── main.css               — Основные стили (все страницы)
│   └── luxe.css               — Доп. стили для /luxe
├── js/
│   └── main.js                — Основная логика (i18n, анимации, форма)
└── demo/
    ├── index.html             — Галерея демо-меню
    ├── araks-restaurant.html  — 🏺 Армянский ресторан
    ├── cafe-nairi.html        — ☕ Кофейня
    ├── bar-masis.html         — 🍸 Коктейль-бар
    └── noyan-tapan.html       — ✦ Fine Dining (gold design)
```

---

## 🎨 Цветовая схема

### Основные страницы (index, pricing, how-it-works, contact)
| Переменная | Значение | Описание |
|-----------|---------|---------|
| `--bg` | `#0f0f1a` | Фон — глубокий тёмно-синий |
| `--bg-card` | `#1a1a2e` | Карточки |
| `--accent` | `#6366f1` | Акцент — Electric Indigo |
| `--accent-hover` | `#818cf8` | Hover акцента |
| `--teal` | `#06b6d4` | Вторичный акцент — Cyan |
| `--cta` | `#8b5cf6` | CTA-кнопки — Violet |
| `--text` | `#f0f0ff` | Основной текст |
| `--text-secondary` | `#8b93b8` | Вторичный текст |
| `--gold` | `#D4AF37` | Gold (для LUXE и акцентов) |

### LUXE страница (`luxe.html`)
| Свойство | Значение |
|----------|---------|
| Фон | `#0a0a0a` / `#080808` |
| Акцент | `#D4AF37` (gold) |
| Шрифт заголовков | Playfair Display (serif) |

---

## 💳 Тарифные планы

| Тариф | Цена | Описание |
|-------|------|---------|
| **Starter** | $15/мес | 1 меню, 50 блюд, 3 языка, 4 NFC-метки |
| **Pro** | $25/мес | 3 меню, 150 блюд, 10 языков, 8 меток, аналитика |
| **Premium** | $45/мес | Без лимитов, 20+ языков, 12 меток, AI-аналитика |
| **LUXE** | от $50/мес | Всё Premium + custom дизайн, персональный менеджер |

---

## 📱 Демо-меню

Четыре живых демо-примера, открываемые как NFC-меню:

### 1. 🏺 Ресторан «Аракс» (`demo/araks-restaurant.html`)
- Стиль: тёмно-зелёный, армянский колорит
- Категории: закуски, салаты, шашлык, долма, напитки
- Функции: поиск, корзина, вызов официанта, 3 языка

### 2. ☕ Кафе «Наири» (`demo/cafe-nairi.html`)
- Стиль: тёмный с cyan-акцентами
- Категории: кофе, чай, завтраки, десерты, снеки
- Функции: карточки напитков, корзина, 3 языка

### 3. 🍸 Bar Masis (`demo/bar-masis.html`)
- Стиль: ночной нео-noir, violet + pink
- Категории: коктейли, виски, пиво, закуски, события
- Функции: нео-карточки напитков, корзина, 3 языка

### 4. ✦ Noyan Tapan Fine Dining (`demo/noyan-tapan.html`)
- Стиль: роскошный gold/black, Playfair Display
- Категории: холодные/горячие закуски, супы, основные, десерты, вино
- Функции: дегустационное меню 7 перемен, карта вин, gold-дизайн

---

## 🌐 Локализация

Все страницы и демо-меню поддерживают 3 языка:
- 🇷🇺 RU — Русский (по умолчанию)
- 🇬🇧 EN — English  
- 🇦🇲 HY — Հայերեն (Армянский)

Переключение через `js/main.js` (функция `setLanguage()`) и/или встроенный JS в каждом демо.

---

## 🔧 Технические детали

### CSS архитектура
- CSS-переменные (`--accent`, `--bg`, `--gold`, и т.д.) в `:root`
- Mobile-first responsive (320px / 768px / 1280px / 1920px)
- Scroll-reveal через IntersectionObserver
- Hover-анимации через CSS transitions

### JS функции (`js/main.js`)
- `setLanguage(lang)` — переключение языка интерфейса
- `initScrollReveal()` — анимации при прокрутке
- `initCounters()` — анимированные счётчики статистики
- `toggleFAQ(item)` — аккордеон FAQ
- `handleContactForm()` — отправка формы (имитация → Telegram Bot в production)
- `initPricingCarousel()` — карусель тарифов на мобильных

### Форма связи
В production-версии (Next.js) форма отправляет данные на:
- `POST /api/contact` — общая форма
- `POST /api/luxe` — форма LUXE-заявки

Env variables: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

---

## 🚀 Деплой

### Static HTML (текущая версия)
Загрузить через **Publish** в TapMenu Admin Panel или на любой статический хостинг (Vercel, Netlify, GitHub Pages).

### Production (Next.js)
```bash
npx create-next-app@latest tapmenu-armenia --typescript
# Добавить компоненты из HTML-прототипа
# Настроить .env.local
vercel deploy
```

---

## 📋 Что ещё можно добавить

- [ ] Страница `/blog` с SEO-статьями
- [ ] Онлайн-конструктор меню с превью в реальном времени
- [ ] Панель аналитики (демо-дашборд)
- [ ] Интеграция с системами бронирования
- [ ] Страница с отзывами и кейсами клиентов
- [ ] Карта ресторанов-партнёров
- [ ] Видео-демонстрация работы NFC
- [ ] A/B тестирование тарифных карточек

---

## 📞 Контакты

**Site:** https://tapmenu.am  
**Email:** hello@tapmenu.am  
**Telegram:** @tapmenu_armenia
