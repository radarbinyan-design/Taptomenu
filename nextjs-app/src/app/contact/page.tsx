'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ─── Nav links ─────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/pricing', label: 'Тарифы' },
  { href: '/how-it-works', label: 'Как работает' },
  { href: '/contact', label: 'Контакты', active: true },
]

/* ─── Contact cards ─────────────────────────────────────────────────────── */
const CONTACTS = [
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
    sub: 'Работаем с ресторанами СНГ',
    href: null,
  },
]

/* ─────────────────────────────────────────────────────────────────────────── */

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    restaurantName: '',
    email: '',
    phone: '',
    plan: 'pro',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  /* ─── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.error ?? 'Ошибка отправки. Попробуйте ещё раз.')
      }
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ─── Success screen ──────────────────────────────────────────────────── */
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-white text-3xl font-bold mb-4">Спасибо!</h1>
          <p className="text-slate-300 text-lg mb-8">
            Мы получили вашу заявку и свяжемся в течение{' '}
            <strong className="text-white">24 часов</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => (window.location.href = '/')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Вернуться на главную
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Отправить ещё раз
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Main page ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
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
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  l.active ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center space-x-2 text-slate-400 text-sm select-none">
              <span className="hover:text-white cursor-pointer transition-colors">RU</span>
              <span>|</span>
              <span className="hover:text-white cursor-pointer transition-colors">EN</span>
              <span>|</span>
              <span className="hover:text-white cursor-pointer transition-colors">HY</span>
            </div>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link href="/contact">
              <Button className="bg-orange-500 hover:bg-orange-600">Написать нам</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Меню"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-4 bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block text-sm font-medium py-1.5 transition-colors ${
                  l.active ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-700">
              <Link
                href="/login"
                className="block text-center py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl"
                onClick={() => setMobileOpen(false)}
              >
                Войти
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <main className="container mx-auto px-4 py-12 text-center">
        <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-6 tracking-widest uppercase">
          Контакты
        </div>

        <h1 className="text-white text-5xl md:text-6xl font-bold mb-5 leading-tight">
          Свяжитесь с{' '}
          <span className="text-orange-400">командой</span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl mb-3 max-w-2xl mx-auto">
          Мы поможем каждому ресторану найти подходящий тариф.
        </p>
        <p className="text-slate-400 mb-10">Ответим в течение 24 часов.</p>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          <div className="bg-green-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            ✓ Ответ до 24 часов
          </div>
          <div className="bg-red-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            📍 Мы из Армении
          </div>
          <div className="bg-blue-600/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            💬 Говорим RU / HY / EN
          </div>
        </div>

        {/* ─── Two-column layout ──────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 text-left">
          {/* Left: contact cards */}
          <div className="space-y-4">
            {CONTACTS.map(({ icon, title, value, sub, href }) => {
              const card = (
                <div className="flex items-start gap-4 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 hover:border-orange-500/40 rounded-2xl p-5 transition-all group cursor-default">
                  <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
                      {title}
                    </p>
                    <p className="text-white font-bold text-base group-hover:text-orange-400 transition-colors">
                      {value}
                    </p>
                    <p className="text-slate-500 text-sm mt-0.5">{sub}</p>
                  </div>
                </div>
              )

              return href ? (
                <a
                  key={title}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                >
                  {card}
                </a>
              ) : (
                <div key={title}>{card}</div>
              )
            })}

            {/* Socials */}
            <div className="flex gap-3 pt-1">
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

          {/* Right: form */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 sm:p-8">
            <div className="mb-5">
              <h2 className="text-white text-xl font-bold">Заявка на демо</h2>
              <p className="text-slate-400 text-sm mt-1">14 дней бесплатно · Без привязки карты</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    Ваше имя <span className="text-orange-400">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    Email или Телефон <span className="text-orange-400">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="email@example.com или +374..."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Restaurant */}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Название ресторана
                </label>
                <Input
                  type="text"
                  placeholder="Название вашего заведения"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Plan */}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Интересующий тариф
                </label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData({ ...formData, plan: value })}
                >
                  <SelectTrigger className="bg-slate-900/60 border-slate-600 text-white focus:ring-orange-500">
                    <SelectValue placeholder="Выберите тариф" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter ($15/мес) — 1 меню, 50 блюд</SelectItem>
                    <SelectItem value="pro">Pro ($25/мес) — 3 меню, 150 блюд</SelectItem>
                    <SelectItem value="premium">Premium ($45/мес) — Безлимит</SelectItem>
                    <SelectItem value="luxe">LUXE ($50+/мес) — Все + AI-ассистент</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Сообщение</label>
                <Textarea
                  placeholder="Расскажите о вашем ресторане, количестве столов, особых требованиях..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold rounded-xl py-3 text-base"
              >
                {isSubmitting ? '⏳ Отправляем...' : 'Отправить заявку'}
              </Button>

              <p className="text-center text-xs text-slate-500">
                14 дней бесплатно · Без привязки карты · Ответ в течение 1 часа
              </p>
            </form>
          </div>
        </div>

        {/* Bottom contacts */}
        <div className="mt-14 text-slate-500 text-sm">
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

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
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
