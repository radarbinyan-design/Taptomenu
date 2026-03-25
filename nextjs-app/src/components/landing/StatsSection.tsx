export function StatsSection() {
  const stats = [
    {
      value: '+25%',
      label: 'рост маржи',
      sub: 'гости заказывают больше, видя фото блюд',
      emoji: '💰',
      color: 'text-green-600',
    },
    {
      value: 'x3',
      label: 'больше просмотров',
      sub: 'цифровое меню видят все гости за столом',
      emoji: '👀',
      color: 'text-violet-600',
    },
    {
      value: '2ч',
      label: 'экономии в день',
      sub: 'официанты не объясняют меню — гости сами видят всё',
      emoji: '⏱️',
      color: 'text-amber-600',
    },
    {
      value: '0 сек',
      label: 'ожидания для гостя',
      sub: 'одно касание — меню сразу на экране',
      emoji: '⚡',
      color: 'text-blue-600',
    },
  ]

  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section heading */}
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Цифровое меню — это больше заказов и меньше затрат
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base">
            Когда гости видят фото, описания и цены на своём телефоне — они заказывают охотнее,
            а официанты тратят время на сервис, а не на объяснение меню
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {s.emoji}
              </div>
              <div className={`text-3xl sm:text-4xl font-black mb-1 ${s.color}`}>
                {s.value}
              </div>
              <div className="text-base font-semibold text-gray-800">{s.label}</div>
              <div className="text-sm text-gray-400 mt-1 leading-snug">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Persuasion block */}
        <div className="mt-16 bg-gradient-to-r from-violet-50 to-amber-50 rounded-3xl p-8 sm:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Почему маржа растёт с цифровым меню?
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-green-500 text-lg mt-0.5">✓</span>
                  <span>
                    <strong>Фото блюд увеличивают средний чек на 20-30%</strong> — гости
                    добавляют закуски и десерты, которые не заказали бы без фотографий
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-500 text-lg mt-0.5">✓</span>
                  <span>
                    <strong>Меню на 3 языках привлекает туристов</strong> — больше
                    иностранных гостей заходят именно к вам, потому что понимают каждое блюдо
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-500 text-lg mt-0.5">✓</span>
                  <span>
                    <strong>Официанты экономят 2+ часа в день</strong> — не объясняют
                    состав и не переводят меню, а занимаются обслуживанием
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-500 text-lg mt-0.5">✓</span>
                  <span>
                    <strong>Гость не ждёт ни секунды</strong> — сел за стол, коснулся NFC
                    или отсканировал QR — меню уже на экране. Время ожидания = 0
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-sm text-gray-500 mb-4">Средний ресторан с TapMenu:</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Средний чек</span>
                    <span className="font-bold text-green-600">+20-30%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Время официанта на стол</span>
                    <span className="font-bold text-violet-600">-40%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Заказы с фото блюд</span>
                    <span className="font-bold text-amber-600">x2 чаще</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Время ожидания гостя</span>
                    <span className="font-bold text-blue-600">0 секунд</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
