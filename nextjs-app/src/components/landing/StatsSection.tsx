export function StatsSection() {
  const stats = [
    { value: '47+', label: 'ресторанов', sub: 'используют TapMenu', emoji: '🍽️' },
    { value: '21ч', label: 'экономии/неделю', sub: 'на объяснении меню', emoji: '⏰' },
    { value: '+10%', label: 'рост выручки', sub: 'в среднем у клиентов', emoji: '📈' },
    { value: '33', label: 'языка', sub: 'автоматический перевод', emoji: '🌍' },
  ]

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center group">
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{s.value}</div>
              <div className="text-base font-semibold text-gray-700">{s.label}</div>
              <div className="text-sm text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
