'use client'

import { useState } from 'react'

export function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    restaurant: '',
    phone: '',
    email: '',
    plan: 'pro',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          restaurantName: form.restaurant,
          phone: form.phone,
          email: form.email,
          plan: form.plan,
          message: form.message,
        }),
      })

      if (!res.ok) throw new Error('Server error')

      setStatus('success')
      setForm({ name: '', restaurant: '', phone: '', email: '', plan: 'pro', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — Info */}
          <div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full mb-4">
              Запросить демо
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Попробуйте TapMenu бесплатно
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Оставьте заявку — мы подключим ваш ресторан, настроим первое меню и покажем как всё
              работает. <strong>14 дней бесплатно</strong>, без привязки карты.
            </p>

            {/* Contact info */}
            <div className="space-y-4 mb-8">
              {[
                { emoji: '📞', label: 'Телефон', value: '+374 91 000 000' },
                { emoji: '✉️', label: 'Email', value: 'hello@tapmenu.am' },
                { emoji: '📍', label: 'Офис', value: 'Ереван, ул. Абовяна 12' },
                { emoji: '⏰', label: 'Режим работы', value: 'Пн–Пт 10:00–19:00 AMT' },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {emoji}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-gray-800 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {[
                { label: 'Telegram', href: '#', bg: 'bg-blue-500', emoji: '✈️' },
                { label: 'WhatsApp', href: '#', bg: 'bg-green-500', emoji: '💬' },
                { label: 'Instagram', href: '#', bg: 'bg-pink-500', emoji: '📷' },
              ].map(({ label, href, bg, emoji }) => (
                <a
                  key={label}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 ${bg} text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity`}
                >
                  <span>{emoji}</span>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            {status === 'success' ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка отправлена!</h3>
                <p className="text-gray-600">
                  Мы свяжемся с вами в течение <strong>1 рабочего часа</strong>.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 px-6 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  Отправить ещё раз
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка на демо</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ваше имя <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Арам Петросян"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ресторан <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="restaurant"
                      value={form.restaurant}
                      onChange={handleChange}
                      required
                      placeholder="Ararat Restaurant"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 bg-white"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+374 91 000 000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="owner@restaurant.am"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Интересующий тариф
                  </label>
                  <select
                    name="plan"
                    value={form.plan}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 bg-white"
                  >
                    <option value="starter">Starter — $15/мес (1 меню, 50 блюд)</option>
                    <option value="pro">Pro — $25/мес (3 меню, 100 блюд)</option>
                    <option value="premium">Premium — $45/мес (10 меню, 500 блюд)</option>
                    <option value="luxe">LUXE — $50+/мес (AI-ассистент, V-шаблон)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Сколько столиков, есть ли сеть ресторанов, особые пожелания..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 bg-white resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-600 text-sm">
                    Ошибка отправки. Попробуйте ещё раз или напишите нам напрямую.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl transition-colors text-lg"
                >
                  {status === 'loading' ? '⏳ Отправляем...' : '🚀 Запросить демо бесплатно'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  14 дней бесплатно · Без привязки карты · Ответ в течение 1 часа
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
