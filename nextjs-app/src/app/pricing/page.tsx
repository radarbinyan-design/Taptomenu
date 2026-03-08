import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Тарифы — TapMenu Armenia',
  description: 'Выберите тарифный план для вашего ресторана. Starter $15, Pro $25, Premium $45, LUXE $50+. 14 дней бесплатно.',
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 15,
    description: 'Для небольших кафе и баров',
    color: 'slate',
    features: [
      { text: '1 меню', ok: true },
      { text: '50 блюд', ok: true },
      { text: '2 языка', ok: true },
      { text: '3 NFC-стикера', ok: true },
      { text: '1 шаблон оформления', ok: true },
      { text: 'QR-коды для столиков', ok: true },
      { text: 'Базовая аналитика', ok: true },
      { text: 'Wi-Fi через NFC', ok: false },
      { text: 'Свои цвета акцента', ok: false },
      { text: 'AI-ассистент', ok: false },
    ],
    cta: 'Начать бесплатно',
    href: '/register?plan=starter',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    description: 'Для активных ресторанов',
    color: 'orange',
    features: [
      { text: '3 меню', ok: true },
      { text: '100 блюд', ok: true },
      { text: '5 языков', ok: true },
      { text: '8 NFC-стикеров', ok: true },
      { text: '3 шаблона оформления', ok: true },
      { text: 'QR-коды для столиков', ok: true },
      { text: 'Аналитика топ-блюд', ok: true },
      { text: 'Wi-Fi через NFC', ok: true },
      { text: '5 акцент-цветов', ok: true },
      { text: 'AI-ассистент', ok: false },
    ],
    cta: 'Выбрать Pro',
    href: '/register?plan=pro',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 45,
    description: 'Для сетей и премиум-ресторанов',
    color: 'purple',
    features: [
      { text: '10 меню', ok: true },
      { text: '500 блюд', ok: true },
      { text: '20 языков', ok: true },
      { text: 'Неограниченно NFC', ok: true },
      { text: '6 шаблонов оформления', ok: true },
      { text: 'QR-коды для столиков', ok: true },
      { text: 'Полная аналитика', ok: true },
      { text: 'Wi-Fi через NFC', ok: true },
      { text: 'Любые акцент-цвета', ok: true },
      { text: 'AI-ассистент', ok: false },
    ],
    cta: 'Выбрать Premium',
    href: '/register?plan=premium',
    popular: false,
  },
  {
    id: 'luxe',
    name: 'LUXE',
    price: 50,
    priceLabel: '$50+',
    description: 'Эксклюзив для luxury-ресторанов',
    color: 'amber',
    features: [
      { text: 'Неограниченно меню', ok: true },
      { text: 'Неограниченно блюд', ok: true },
      { text: '33 языка', ok: true },
      { text: 'Неограниченно NFC', ok: true },
      { text: 'V-шаблон (LUXE-эксклюзив)', ok: true },
      { text: 'QR-коды для столиков', ok: true },
      { text: 'Расширенная аналитика', ok: true },
      { text: 'Wi-Fi через NFC', ok: true },
      { text: 'Любые акцент-цвета', ok: true },
      { text: 'AI-ассистент GPT-4o + DALL-E 3', ok: true },
    ],
    cta: 'Обсудить LUXE',
    href: '/contact?plan=luxe',
    popular: false,
  },
]

const COMPARE_ROWS = [
  { feature: 'Количество меню', values: ['1', '3', '10', '∞'] },
  { feature: 'Блюд в библиотеке', values: ['50', '100', '500', '∞'] },
  { feature: 'Языков перевода', values: ['2', '5', '20', '33'] },
  { feature: 'NFC-стикеров', values: ['3', '8', '∞', '∞'] },
  { feature: 'Шаблоны оформления', values: ['1', '3', '6', 'V-шаблон'] },
  { feature: 'Акцент-цвета', values: ['—', '5', '∞', '∞'] },
  { feature: 'Wi-Fi через NFC', values: ['—', '✓', '✓', '✓'] },
  { feature: 'Аналитика', values: ['Базовая', 'Топ-блюда', 'Полная', 'Расширенная'] },
  { feature: 'AI-ассистент', values: ['—', '—', '—', 'GPT-4o'] },
  { feature: 'DALL-E 3 генерация фото', values: ['—', '—', '—', '✓'] },
]

const PLAN_COLORS: Record<string, string> = {
  slate: 'border-slate-600',
  orange: 'border-orange-500 ring-2 ring-orange-500/40',
  purple: 'border-purple-600',
  amber: 'border-amber-500',
}

const PLAN_BTN: Record<string, string> = {
  starter: 'bg-slate-700 hover:bg-slate-600 text-white',
  pro: 'bg-orange-500 hover:bg-orange-600 text-white',
  premium: 'bg-purple-600 hover:bg-purple-700 text-white',
  luxe: 'bg-amber-500 hover:bg-amber-600 text-white',
}

export default function PricingPage() {
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
                  l.href === '/pricing' ? 'text-orange-400' : 'text-white hover:text-orange-400'
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
          Тарифы
        </div>

        <h1 className="text-white text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Простые и{' '}
          <span className="text-orange-400">честные цены</span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl mb-4 max-w-2xl mx-auto">
          Выберите тарифный план — или попробуйте бесплатно 14 дней. Без карты.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <div className="bg-green-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            ✓ 14 дней бесплатно
          </div>
          <div className="bg-blue-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            ✓ Без привязки карты
          </div>
          <div className="bg-purple-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            ✓ Отмена в любой момент
          </div>
        </div>

        {/* ─── Pricing Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-800/60 border rounded-2xl p-6 text-left flex flex-col transition-transform hover:-translate-y-1 ${PLAN_COLORS[plan.color]}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  ⭐ Популярный выбор
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-white text-xl font-extrabold mb-1">{plan.name}</h2>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-white text-4xl font-black">
                  {plan.priceLabel ?? `$${plan.price}`}
                </span>
                <span className="text-slate-400 text-sm ml-1">/мес</span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(({ text, ok }) => (
                  <li key={text} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 shrink-0 ${ok ? 'text-green-400' : 'text-slate-600'}`}>
                      {ok ? '✓' : '✕'}
                    </span>
                    <span className={ok ? 'text-slate-200' : 'text-slate-600 line-through'}>{text}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${PLAN_BTN[plan.id]}`}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* ─── Comparison Table ───────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-white text-3xl font-bold mb-8 text-center">Сравнение тарифов</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="px-5 py-4 text-left text-slate-400 font-semibold">Функция</th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={`px-4 py-4 text-center font-bold ${
                        p.popular ? 'text-orange-400' : 'text-white'
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-slate-800 ${i % 2 === 0 ? 'bg-slate-900/30' : ''}`}
                  >
                    <td className="px-5 py-3.5 text-slate-300">{row.feature}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className="px-4 py-3.5 text-center">
                        <span
                          className={
                            val === '✓'
                              ? 'text-green-400 font-bold'
                              : val === '—'
                              ? 'text-slate-600'
                              : 'text-white font-medium'
                          }
                        >
                          {val}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── FAQ mini ───────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 text-center">Часто задаваемые вопросы</h2>
          <div className="space-y-4 text-left">
            {[
              {
                q: 'Нужна ли кредитная карта для пробного периода?',
                a: 'Нет. 14 дней бесплатно без карты и без автосписания.',
              },
              {
                q: 'Можно ли сменить тариф после оплаты?',
                a: 'Да, в любой момент через личный кабинет. Разница пересчитывается автоматически.',
              },
              {
                q: 'Как работает оплата?',
                a: 'Ежемесячная подписка. Оплата картой Visa/Mastercard или через Telcell/IDram (Армения).',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <p className="text-white font-semibold mb-2">{q}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CTA ────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-2xl p-10 max-w-2xl mx-auto">
          <div className="text-4xl mb-3">🚀</div>
          <h2 className="text-white text-2xl font-bold mb-3">Готовы попробовать?</h2>
          <p className="text-slate-300 mb-6">14 дней бесплатно. Мы поможем с настройкой.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl text-base">
                Начать бесплатно
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 px-8 py-3 rounded-xl text-base">
                Связаться с нами
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
