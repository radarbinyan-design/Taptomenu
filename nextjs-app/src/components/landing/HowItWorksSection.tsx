const STEPS = [
  {
    step: '01',
    emoji: '📝',
    title: 'Зарегистрируйтесь',
    desc: 'Создайте аккаунт за 2 минуты. Бесплатный пробный период 14 дней — без карты.',
  },
  {
    step: '02',
    emoji: '🍽️',
    title: 'Загрузите меню',
    desc: 'Добавьте блюда с фото, ценами, описаниями. AI автоматически переведёт на нужные языки.',
  },
  {
    step: '03',
    emoji: '📡',
    title: 'Наклейте NFC-стикеры',
    desc: 'Получите NFC-стикеры (или QR-коды) и наклейте на столики. Настройка 5 минут.',
  },
  {
    step: '04',
    emoji: '🚀',
    title: 'Гости видят меню',
    desc: 'Касание телефона → меню открывается мгновенно на языке гостя. Всё работает.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            🛠️ Как это работает
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Запустить за 15 минут
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Не нужны технические знания. Не нужен разработчик. Работает сразу после регистрации.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />

          {STEPS.map((s, i) => (
            <div key={s.step} className="relative text-center">
              <div className="relative inline-flex mb-5">
                <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
                  {s.emoji}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-black">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/register"
            className="inline-flex items-center gap-2 h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg"
          >
            Начать за 15 минут →
          </a>
        </div>
      </div>
    </section>
  )
}
