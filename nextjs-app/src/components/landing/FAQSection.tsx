'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: 'Нужно ли устанавливать приложение гостям?',
    a: 'Нет. Меню открывается в браузере телефона при касании NFC-стикера или сканировании QR-кода. Никаких приложений, никакой регистрации для гостей.',
  },
  {
    q: 'Какие телефоны поддерживают NFC?',
    a: 'Все iPhone 7 и новее (с iOS 13+), все Android-смартфоны с 2018 года. По данным 2024 года — это более 90% всех используемых смартфонов в Армении.',
  },
  {
    q: 'Как быстро обновляется меню?',
    a: 'Мгновенно. Вы изменили цену или добавили блюдо — гость уже через секунду видит актуальное меню. Не нужно перепечатывать карты и ехать по точкам.',
  },
  {
    q: 'Как работает функция Wi-Fi через NFC?',
    a: 'Вы добавляете пароль Wi-Fi в настройках ресторана. При касании NFC-стикера гость одновременно открывает меню и получает предложение подключиться к Wi-Fi. Пароль хранится зашифрованным (AES-256).',
  },
  {
    q: 'Что значит "AI перевод"? Это точно?',
    a: 'Мы используем DeepL API (LUXE/Premium) и Google Translate API (Pro). Это профессиональные переводчики, которые понимают кулинарный контекст. Вы всегда можете отредактировать перевод вручную.',
  },
  {
    q: 'Можно ли у вас купить NFC-стикеры?',
    a: 'Да! При покупке плана мы высылаем NFC-стикеры с уже прописанными URL ваших столиков. Программировать ничего не нужно — просто клейте.',
  },
  {
    q: 'Что если у меня несколько ресторанов?',
    a: 'Каждый ресторан — отдельный аккаунт с отдельным планом. Если у вас сеть из 5+ ресторанов — свяжитесь с нами, сделаем индивидуальное предложение.',
  },
  {
    q: 'Можно ли отменить подписку?',
    a: 'Да, в любой момент в настройках. Меню будет активно до конца оплаченного периода. Мы не берём штрафов за отмену.',
  },
]

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
            ❓ Частые вопросы
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Отвечаем на главные вопросы
          </h2>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:border-amber-200 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    openIdx === i ? 'rotate-180 text-amber-500' : ''
                  }`}
                />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm mb-3">Остались вопросы?</p>
          <a
            href="mailto:hello@tapmenu.am"
            className="inline-flex items-center gap-2 h-10 px-5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-amber-300 hover:text-amber-600 transition-colors"
          >
            ✉️ Написать нам
          </a>
        </div>
      </div>
    </section>
  )
}
