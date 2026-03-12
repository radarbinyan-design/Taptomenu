import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">TM</span>
              </div>
              <span className="text-white font-bold text-lg">TapMenu</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              NFC-меню для ресторанов Армении. Одно касание — и гость видит меню на своём языке.
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">Работает 24/7</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Продукт</p>
            <ul className="space-y-2.5 text-sm">
              {[
                ['#features', 'Возможности'],
                ['#how-it-works', 'Как работает'],
                ['#pricing', 'Тарифы'],
                ['/menu/demo', 'Демо меню'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="hover:text-white transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Компания</p>
            <ul className="space-y-2.5 text-sm">
              {[
                ['#', 'О нас'],
                ['#', 'Блог'],
                ['#faq', 'FAQ'],
                ['#contact', 'Контакты'],
              ].map(([href, label]) => (
                <li key={`${href}-${label}`}>
                  <a href={href} className="hover:text-white transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Контакты</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:hello@tapmenu.am" className="hover:text-white transition-colors flex items-center gap-1.5">
                  ✉️ hello@tapmenu.am
                </a>
              </li>
              <li>
                <a href="https://t.me/tapmenu_am" className="hover:text-white transition-colors flex items-center gap-1.5">
                  💬 Telegram
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  📍 Ереван, Армения
                </span>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="https://t.me/tapmenu_am" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-sm transition-colors">
                ✈️
              </a>
              <a href="https://instagram.com/tapmenu.am" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-sm transition-colors">
                📸
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2026 TapMenu Armenia. Все права защищены.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
