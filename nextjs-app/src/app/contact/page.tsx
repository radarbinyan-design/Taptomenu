'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type FormState = {
  name: string
  restaurant: string
  phone: string
  email: string
  plan: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    restaurant: '',
    phone: '',
    email: '',
    plan: 'pro',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await new Promise((res) => setTimeout(res, 1200))
      setStatus('success')
      setForm({ name: '', restaurant: '', phone: '', email: '', plan: 'pro', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/pricing', label: 'Тарифы' },
    { href: '/how-it-works', label: 'Как работает' },
    { href: '/contact', label: 'Контакты' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">TM</span>
            </div>
            <span className="text-white font-bold text-xl">TapMenu</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  l.href === '/contact'
                    ? 'text-orange-400'
                    : 'text-white hover:text-orange-400'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <span>RU</span><span>|</span><span>EN</span><span>|</span><span>HY</span>
            </div>
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link href="/contact" className="hidden md:block">
              <Button className="bg-orange-500 hover:bg-orange-600">Написать нам</Button>
            </Link>
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Меню"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-4 bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block text-sm font-medium text-white hover:text-orange-400 py-1"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-700">
              <Link href="/login" className="block text-center py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl">
                Войти
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <main className="container mx-auto px-4 py-16 text-center">
        {/* Badge */}
        <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-6 tracking-widest uppercase">
          Контакты
        </div>

        <h1 className="text-white text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Свяжитесь с{' '}
          <span className="text-orange-400">командой</span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl mb-3 max-w-2xl mx-auto">
          Мы поможем каждому ресторану найти подходящий тариф.
        </p>
        <p className="text-slate-400 mb-10">Ответим в течение 24 часов.</p>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="bg-green-600/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur">
            ✓ Ответ до 24 часов
          </div>
          <div className="bg-red-600/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur">
            📍 Мы из Армении
          </div>
          <div className="bg-blue-600/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur">
            💬 Говорим RU / HY / EN
          </div>
        </div>

        {/* ─── Cards + Form ─────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 text-left mt-8">

          {/* Left — contact cards */}
          <div className="space-y-5">
            {[
              {
                icon: '✉️',
                title: 'Email',
                value: 'hello@tapmenu.am',
                sub: 'Ответим в течение 24 часов',
                href: 'mailto:hello@tapmenu.am',
              },
              {
                icon: '📞',
                title: 'Телефон',
                value: '+374 91 000 000',
                sub: 'Пн–Пт, 10:00–19:00 AMT',
                href: 'tel:+37491000000',
              },
              {
                icon: '✈️',
                title: 'Telegram',
                value: '@tapmenu_am',
                sub: 'Быстрый ответ в мессенджере',
                href: 'https://t.me/tapmenu_am',
              },
              {
                icon: '📍',
                title: 'Офис',
                value: 'Ереван, ул. Абовяна 12',
                sub: 'Армения — работаем с ресторанами СНГ',
                href: null,
              },
            ].map(({ icon, title, value, sub, href }) => {
              const inner = (
                <div className="flex items-start gap-4 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-2xl p-5 transition-colors cursor-default group">
                  <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{title}</p>
                    <p className="text-white font-bold text-base group-hover:text-orange-400 transition-colors">{value}</p>
                    <p className="text-slate-500 text-sm mt-0.5">{sub}</p>
                  </div>
                </div>
              )
              return href ? (
                <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={title}>{inner}</div>
              )
            })}

            {/* Social links */}
            <div className="flex gap-3 pt-2">
              {[
                { label: 'Telegram', href: 'https://t.me/tapmenu_am', bg: 'bg-blue-500 hover:bg-blue-600', icon: '✈️' },
                { label: 'WhatsApp', href: '#', bg: 'bg-green-500 hover:bg-green-600', icon: '💬' },
                { label: 'Instagram', href: 'https://instagram.com/tapmenu.am', bg: 'bg-pink-500 hover:bg-pink-600', icon: '📷' },
              ].map(({ label, href, bg, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2.5 ${bg} text-white rounded-xl text-sm font-semibold transition-colors`}
                >
                  <span>{icon}</span>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 sm:p-8">
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-white text-2xl font-bold mb-2">Заявка отправлена!</h3>
                <p className="text-slate-400 text-base">
                  Мы свяжемся с вами в течение <strong className="text-white">1 рабочего часа</strong>.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Отправить ещё раз
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-white text-xl font-bold">Заявка на демо</h2>
                  <p className="text-slate-400 text-sm mt-1">14 дней бесплатно · Без привязки карты</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1">
                      Ваше имя <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Арам Петросян"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1">
                      Ресторан <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="restaurant"
                      value={form.restaurant}
                      onChange={handleChange}
                      required
                      placeholder="Ararat Restaurant"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1">
                      Телефон <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+374 91 000 000"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="owner@restaurant.am"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Интересующий тариф</label>
                  <select
                    name="plan"
                    value={form.plan}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white outline-none transition"
                  >
                    <option value="starter">Starter — $15/мес (1 меню, 50 блюд)</option>
                    <option value="pro">Pro — $25/мес (3 меню, 100 блюд)</option>
                    <option value="premium">Premium — $45/мес (10 меню, 500 блюд)</option>
                    <option value="luxe">LUXE — $50+/мес (AI-ассистент, V-шаблон)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Комментарий</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Сколько столиков, есть ли сеть ресторанов, особые пожелания..."
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-white placeholder-slate-500 outline-none transition resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-sm">
                    Ошибка отправки. Попробуйте ещё раз или напишите напрямую на hello@tapmenu.am
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold rounded-xl py-3 text-base transition-colors"
                >
                  {status === 'loading' ? '⏳ Отправляем...' : '🚀 Запросить демо бесплатно'}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  14 дней бесплатно · Без привязки карты · Ответ в течение 1 часа
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-slate-500 text-sm space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="mailto:hello@tapmenu.am" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              📧 hello@tapmenu.am
            </a>
            <a href="tel:+37491000000" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              📞 +374 91 000 000
            </a>
            <a href="https://t.me/tapmenu_am" className="flex items-center gap-2 hover:text-orange-400 transition-colors" target="_blank" rel="noopener noreferrer">
              ✈️ @tapmenu_am
            </a>
          </div>
        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="container mx-auto px-4 py-10 mt-12 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TM</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">TapMenu Armenia</span>
          </Link>
          <p className="text-slate-600 text-xs">© 2026 TapMenu Armenia. Все права защищены.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Конфиденциальность</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Условия</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
