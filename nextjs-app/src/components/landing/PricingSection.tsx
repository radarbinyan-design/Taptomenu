import Link from 'next/link'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 15,
    period: 'мес',
    description: 'Идеально для небольших кафе',
    color: 'gray',
    features: [
      '1 меню',
      '50 блюд',
      '2 языка',
      '3 NFC-стикера',
      '1 шаблон',
      'QR-коды',
      'Базовая аналитика',
    ],
    cta: 'Начать бесплатно',
    href: '/register?plan=starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    period: 'мес',
    description: 'Для активных ресторанов',
    color: 'amber',
    popular: true,
    features: [
      '3 меню',
      '100 блюд',
      '5 языков',
      '8 NFC-стикеров',
      '3 шаблона',
      '5 акцент-цветов',
      'Аналитика топ-блюд',
      'Wi-Fi через NFC',
    ],
    cta: 'Выбрать Pro',
    href: '/register?plan=pro',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 45,
    period: 'мес',
    description: 'Для сетей и ресторанов премиум',
    color: 'purple',
    features: [
      '10 меню',
      '500 блюд',
      '20 языков',
      'Безлимит NFC',
      'Все шаблоны',
      'Все цвета',
      'Топ-аналитика',
      'DeepL переводы',
      'Приоритетная поддержка',
    ],
    cta: 'Выбрать Premium',
    href: '/register?plan=premium',
  },
  {
    id: 'luxe',
    name: 'LUXE',
    price: 50,
    period: 'мес+',
    description: 'Для luxury & fine dining',
    color: 'gold',
    features: [
      'Безлимит меню и блюд',
      '33 языка',
      'Безлимит NFC',
      'V-шаблон (LUXE)',
      'AI-ассистент GPT-4o',
      'DALL-E генерация фото',
      'Персональный менеджер',
      'Кастомный домен',
      'White-label',
    ],
    cta: 'Получить LUXE',
    href: '/register?plan=luxe',
  },
]

const colorMap: Record<string, { badge: string; button: string; border: string; highlight: string }> = {
  gray: {
    badge: '',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
    border: 'border-gray-200',
    highlight: 'text-gray-700',
  },
  amber: {
    badge: 'bg-amber-500 text-white',
    button: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30',
    border: 'border-amber-300 ring-2 ring-amber-400/50',
    highlight: 'text-amber-600',
  },
  purple: {
    badge: '',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    border: 'border-purple-200',
    highlight: 'text-purple-600',
  },
  gold: {
    badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
    button: 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white shadow-lg',
    border: 'border-yellow-300',
    highlight: 'text-yellow-600',
  },
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
            💰 Тарифы
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Простые и честные цены
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Все планы включают 14-дневный пробный период. Отмена в любой момент без штрафов.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map(plan => {
            const c = colorMap[plan.color]
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border ${c.border} p-6 flex flex-col`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3 py-1 ${c.badge} text-xs font-bold rounded-full shadow-sm`}>
                      ★ Популярный
                    </span>
                  </div>
                )}
                {plan.id === 'luxe' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3 py-1 ${c.badge} text-xs font-bold rounded-full shadow-sm`}>
                      👑 LUXE
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-black text-gray-900 text-xl mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                    <span className="text-gray-400 text-sm">/{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className={`mt-0.5 text-sm ${c.highlight} font-bold`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${c.button}`}
                >
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Guarantee */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            🔒 Безопасная оплата · 14 дней бесплатно · Без автосписания
          </p>
        </div>
      </div>
    </section>
  )
}
