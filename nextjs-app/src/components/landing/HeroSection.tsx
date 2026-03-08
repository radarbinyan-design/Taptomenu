import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/15 border border-amber-500/30 rounded-full mb-8">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-300 text-sm font-medium">NFC-меню нового поколения · Армения 2026</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
          Цифровое меню{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            одним касанием
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Гость подносит телефон к NFC-стикеру на столике — и сразу видит ваше меню на своём языке.
          Без приложений. Без QR-кодов на бумаге. Без ожидания официанта.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg rounded-2xl transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5"
          >
            🚀 Начать бесплатно — 14 дней
          </Link>
          <Link
            href="/menu/araratrest"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white/10 hover:bg-white/15 text-white font-semibold text-lg rounded-2xl border border-white/20 transition-all backdrop-blur"
          >
            🍽️ Посмотреть демо меню
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="text-green-400">✓</span> Без кредитной карты
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-400">✓</span> Настройка за 15 минут
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-400">✓</span> 33 языка
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-400">✓</span> Отмена в любой момент
          </span>
        </div>

        {/* Phone mockup */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="w-full max-w-2xl h-32 bg-gradient-to-t from-gray-950 to-transparent" />
          </div>

          <div className="flex justify-center items-end gap-4 sm:gap-6">
            {/* NFC sticker mockup */}
            <div className="hidden sm:flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/40">
                <div className="text-3xl mb-1">📡</div>
                <p className="text-white text-xs font-bold">NFC</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                NFC-стикер
              </div>
            </div>

            {/* Phone mockup */}
            <div className="relative">
              <div className="w-64 sm:w-72 bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border border-gray-700">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <div className="bg-gray-950 rounded-[2rem] overflow-hidden h-[480px] sm:h-[520px]">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 py-2 text-white text-xs">
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  {/* Menu preview */}
                  <div className="bg-amber-500 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-sm">Ресторан Арарат</p>
                      <p className="text-amber-200 text-xs">Столик 5</p>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg">AMD ֏</div>
                      <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg">RU</div>
                    </div>
                  </div>
                  {/* Category chips */}
                  <div className="flex gap-2 px-3 py-2 overflow-x-hidden">
                    <div className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">Все</div>
                    <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full whitespace-nowrap">🔥 Горячие</div>
                    <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full whitespace-nowrap">🥗 Салаты</div>
                  </div>
                  {/* Dish cards */}
                  <div className="px-3 space-y-2">
                    {[
                      { name: 'Хоровац из баранины', price: '4 800 ֏', emoji: '🥩', cal: '485 ккал' },
                      { name: 'Греческий салат', price: '2 500 ֏', emoji: '🥗', cal: '210 ккал', vegan: true },
                      { name: 'Долма', price: '2 800 ֏', emoji: '🫑', cal: '320 ккал' },
                    ].map(d => (
                      <div key={d.name} className="bg-gray-800 rounded-xl p-2.5 flex gap-2.5">
                        <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {d.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold leading-tight mb-0.5">{d.name}</p>
                          <p className="text-gray-500 text-xs">{d.cal}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-amber-400 text-xs font-bold">{d.price}</p>
                            {d.vegan && <span className="text-green-400 text-xs">🌱</span>}
                            <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">+</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cart hint */}
                  <div className="absolute bottom-0 left-0 right-0 mx-3 mb-3">
                    <div className="bg-amber-500 rounded-2xl py-2.5 px-4 flex items-center justify-between shadow-xl">
                      <span className="text-white text-xs font-bold">🛒 Корзина · 2 поз.</span>
                      <span className="text-white text-xs font-black">7 300 ֏</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-4 bg-amber-500/10 rounded-[3rem] blur-2xl -z-10" />
            </div>

            {/* Stats card */}
            <div className="hidden sm:flex flex-col gap-3">
              <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-4 border border-gray-700 w-36">
                <p className="text-3xl font-black text-white">+21ч</p>
                <p className="text-xs text-gray-400 mt-0.5">сэкономлено<br />в неделю</p>
              </div>
              <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-4 border border-gray-700 w-36">
                <p className="text-3xl font-black text-amber-400">+10%</p>
                <p className="text-xs text-gray-400 mt-0.5">рост выручки<br />в среднем</p>
              </div>
              <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-4 border border-gray-700 w-36">
                <p className="text-3xl font-black text-white">33</p>
                <p className="text-xs text-gray-400 mt-0.5">языка меню<br />автоматически</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
