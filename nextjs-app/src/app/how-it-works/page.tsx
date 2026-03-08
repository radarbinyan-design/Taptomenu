import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Как работает TapMenu — NFC-меню для ресторанов',
  description: 'Узнайте как TapMenu работает: 4 простых шага от регистрации до NFC-меню на столиках. Настройка за 15 минут.',
}

const STEPS = [
  {
    step: '01',
    emoji: '📝',
    title: 'Регистрация',
    subtitle: '2 минуты',
    description:
      'Создайте аккаунт — введите email, название ресторана и выберите тариф. Никакой карты. 14 дней бесплатно.',
    details: [
      'Заполните имя ресторана и адрес',
      'Выберите тарифный план (или начните бесплатно)',
      'Подтвердите email — и готово',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: '02',
    emoji: '🍽️',
    title: 'Загрузите меню',
    subtitle: '15–30 минут',
    description:
      'Добавьте блюда: фото, цены, описания, состав, КБЖУ и теги. AI автоматически переведёт всё меню на выбранные языки.',
    details: [
      'Создайте категории (Горячее, Закуски, Напитки...)',
      'Добавьте блюда с фото и ценами в AMD',
      'AI переводит на 33 языка одной кнопкой',
    ],
    color: 'from-orange-500 to-amber-500',
  },
  {
    step: '03',
    emoji: '📡',
    title: 'NFC-стикеры',
    subtitle: '5 минут',
    description:
      'Получите NFC-стикеры и QR-коды. Наклейте на столики. Привяжите Wi-Fi пароль — гость подключится автоматически.',
    details: [
      'Мы высылаем настроенные NFC-стикеры',
      'Наклейте на подставку или стол',
      'Опционально: привяжите Wi-Fi пароль к NFC',
    ],
    color: 'from-purple-500 to-violet-500',
  },
  {
    step: '04',
    emoji: '🚀',
    title: 'Гости видят меню',
    subtitle: 'Мгновенно',
    description:
      'Гость подносит телефон → меню открывается на его языке. Без приложений. Работает на любом смартфоне с 2018 года.',
    details: [
      'Касание NFC или сканирование QR',
      'Меню открывается за < 2 секунд',
      'Язык и валюта переключаются одним тапом',
    ],
    color: 'from-green-500 to-emerald-500',
  },
]

const FEATURES = [
  { emoji: '📱', title: 'Без приложения', desc: 'Открывается в браузере — ничего скачивать не нужно' },
  { emoji: '🌍', title: '33 языка', desc: 'Гость видит меню на своём родном языке автоматически' },
  { emoji: '💱', title: 'Валюты CBA', desc: 'AMD, USD, EUR, RUB, GBP — курсы ЦБА обновляются ежедневно' },
  { emoji: '🔒', title: 'Wi-Fi через NFC', desc: 'Одно касание — и гость в Wi-Fi без паролей и объяснений' },
  { emoji: '📊', title: 'Аналитика', desc: 'Топ-5 блюд, языки гостей, часы активности, устройства' },
  { emoji: '⚡', title: '< 2 сек загрузка', desc: 'ISR кэш, WebP-изображения, оптимизация под мобильный' },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">TM</span>
            </div>
            <span className="text-white font-bold text-xl">TapMenu</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {[
              { href: '/', label: 'Главная' },
              { href: '/pricing', label: 'Тарифы' },
              { href: '/how-it-works', label: 'Как работает' },
              { href: '/contact', label: 'Контакты' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  l.href === '/how-it-works' ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <span>RU</span><span>|</span><span>EN</span><span>|</span><span>HY</span>
            </div>
          </div>

          <Link href="/contact">
            <Button className="bg-orange-500 hover:bg-orange-600">Написать нам</Button>
          </Link>
        </nav>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-6 tracking-widest uppercase">
          Как работает
        </div>

        <h1 className="text-white text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Запуск за{' '}
          <span className="text-orange-400">15 минут</span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl mb-4 max-w-2xl mx-auto">
          Не нужны технические знания. Не нужен разработчик. Работает сразу после регистрации.
        </p>
        <p className="text-slate-400 mb-12">4 шага — и ваш ресторан в цифре.</p>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <div className="bg-green-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            ✓ 14 дней бесплатно
          </div>
          <div className="bg-orange-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            ⚡ Настройка 15 мин
          </div>
          <div className="bg-blue-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            📱 Без приложения
          </div>
        </div>

        {/* ─── Steps ──────────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto space-y-6 mb-20">
          {STEPS.map((step, i) => (
            <div
              key={step.step}
              className={`flex flex-col md:flex-row gap-6 bg-slate-800/60 border border-slate-700 rounded-2xl p-6 sm:p-8 text-left ${
                i % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Step icon */}
              <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 shrink-0">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-4xl shadow-lg`}
                >
                  {step.emoji}
                </div>
                <div className="md:text-center">
                  <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Шаг</p>
                  <p className="text-white text-3xl font-black leading-none">{step.step}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-white text-xl font-extrabold">{step.title}</h2>
                  <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
                    {step.subtitle}
                  </span>
                </div>
                <p className="text-slate-300 mb-4 leading-relaxed">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-orange-400 font-bold mt-0.5 shrink-0">→</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Features grid ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-white text-3xl font-bold mb-4 text-center">Что умеет TapMenu</h2>
          <p className="text-slate-400 mb-10 text-center">Всё необходимое — в одном решении</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-left hover:border-orange-500/50 transition-colors"
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="text-white font-bold text-base mb-1">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Demo phone mockup ──────────────────────────────────────────────── */}
        <div className="max-w-sm mx-auto mb-20">
          <h2 className="text-white text-2xl font-bold mb-6 text-center">Как видит гость</h2>
          <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border border-gray-700 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
            <div className="bg-gray-950 rounded-[2rem] overflow-hidden">
              {/* Status bar */}
              <div className="flex items-center justify-between px-5 py-2 text-white text-xs">
                <span>9:41</span><span>●●●</span>
              </div>
              {/* Menu header */}
              <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">Ресторан Арарат</p>
                  <p className="text-orange-200 text-xs">Столик 5 · NFC</p>
                </div>
                <div className="flex gap-1.5">
                  <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg">AMD ֏</div>
                  <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg">RU</div>
                </div>
              </div>
              {/* Categories */}
              <div className="flex gap-2 px-3 py-2">
                <div className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">Все</div>
                <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">🔥 Горячие</div>
                <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">🥗</div>
              </div>
              {/* Dishes */}
              <div className="px-3 pb-3 space-y-2">
                {[
                  { name: 'Хоровац из баранины', price: '4 800 ֏', emoji: '🥩' },
                  { name: 'Греческий салат', price: '2 500 ֏', emoji: '🥗', vegan: true },
                  { name: 'Долма', price: '2 800 ֏', emoji: '🫑' },
                ].map((d) => (
                  <div key={d.name} className="bg-gray-800 rounded-xl p-2.5 flex gap-2.5">
                    <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {d.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold">{d.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-orange-400 text-xs font-bold">{d.price}</p>
                        <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Cart bar */}
              <div className="mx-3 mb-3 bg-orange-500 rounded-2xl py-2 px-4 flex justify-between">
                <span className="text-white text-xs font-bold">🛒 2 позиции</span>
                <span className="text-white text-xs font-black">7 300 ֏</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-xs text-center mt-4">
            Открывается мгновенно · Без приложений · Работает с 2018 года
          </p>
        </div>

        {/* ─── CTA ────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-2xl p-10 max-w-2xl mx-auto">
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-white text-2xl font-bold mb-3">Попробуйте прямо сейчас</h2>
          <p className="text-slate-300 mb-6">14 дней бесплатно. Настройка за 15 минут. Мы помогаем.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl text-base">
                🚀 Начать бесплатно
              </Button>
            </Link>
            <Link href="/menu/araratrest" target="_blank">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 px-8 py-3 rounded-xl text-base">
                🍽️ Демо меню
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="container mx-auto px-4 py-10 mt-12 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TM</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">TapMenu Armenia</span>
          </Link>
          <p className="text-slate-600 text-xs">© 2026 TapMenu Armenia. Все права защищены.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Конфиденциальность</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Условия</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
