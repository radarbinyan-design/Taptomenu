const FEATURES = [
  {
    emoji: '📡',
    title: 'NFC и QR одновременно',
    description:
      'Гость прикладывает телефон к стикеру — и меню открывается мгновенно. Или сканирует QR-код. Работает без приложений на любом смартфоне с 2018 года.',
    highlight: 'iOS + Android',
  },
  {
    emoji: '🌍',
    title: '33 языка, одним кликом',
    description:
      'GPT-4o автоматически переводит всё меню на выбранные языки. Русский, Армянский, Английский, Арабский, Французский и ещё 28 языков.',
    highlight: 'AI перевод',
  },
  {
    emoji: '⏰',
    title: 'Официант экономит 21 ч/нед',
    description:
      'Без объяснений что есть в меню (1 ч/день), без ожидания доставки меню (2 ч/день), без поиска свободных столиков (0.5 ч/день). Команда фокусируется на сервисе.',
    highlight: '−21 ч/неделя',
  },
  {
    emoji: '📊',
    title: 'Аналитика по блюдам',
    description:
      'Видите топ-5 самых просматриваемых блюд, время активности гостей, языки и устройства. Принимайте решения по меню на основе данных, а не интуиции.',
    highlight: 'Pro план',
  },
  {
    emoji: '💱',
    title: 'Валюты в реальном времени',
    description:
      'Курсы ЦБА (Центральный банк Армении) обновляются ежедневно. Цены автоматически показываются в AMD, USD, EUR, RUB, GBP без ручного пересчёта.',
    highlight: 'AMD + 4 валюты',
  },
  {
    emoji: '🔒',
    title: 'Wi-Fi пароль через NFC',
    description:
      'Гость касается NFC-стикера — получает меню и автоматически подключается к Wi-Fi ресторана. Больше не нужно писать пароль на доске или объяснять официанту.',
    highlight: 'Уникальная функция',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
            ✨ Возможности
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Всё что нужно ресторану —<br className="hidden sm:block" />
            в одной платформе
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            TapMenu — это не просто QR-меню. Это полноценная SaaS-платформа для управления
            цифровым меню, аналитикой и взаимодействием с гостями.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 text-base leading-snug">{f.title}</h3>
                <span className="shrink-0 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {f.highlight}
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
