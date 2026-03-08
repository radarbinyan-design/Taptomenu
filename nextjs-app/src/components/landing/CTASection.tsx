import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 relative overflow-hidden">
      {/* Decorations */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
        <div className="text-5xl mb-6">🚀</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
          Готовы перевести меню<br className="hidden sm:block" />
          в цифровой формат?
        </h2>
        <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
          14 дней бесплатно. Никаких карт. Настройка за 15 минут.
          Мы поможем на каждом этапе.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg rounded-2xl transition-all shadow-2xl shadow-amber-500/30 hover:-translate-y-0.5"
          >
            Начать бесплатно — 14 дней
          </Link>
          <a
            href="https://t.me/tapmenu_am"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white/10 hover:bg-white/15 text-white font-semibold text-lg rounded-2xl border border-white/20 transition-all backdrop-blur"
          >
            💬 Написать в Telegram
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-green-400">✓</span> 14 дней бесплатно
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-green-400">✓</span> Без карты
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-green-400">✓</span> Отмена в любой момент
          </span>
        </div>
      </div>
    </section>
  )
}
