'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', label: 'Главная', exact: true },
  { href: '/how-it-works', label: 'Как работает', exact: false },
  { href: '/pricing', label: 'Тарифы', exact: false },
  { href: '#faq', label: 'FAQ', exact: false, anchor: true },
  { href: '/contact', label: 'Контакты', exact: false },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/95 backdrop-blur shadow-md border-b border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* ─── Logo ──────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:bg-orange-600 transition-colors">
            <span className="text-white font-bold text-sm">TM</span>
          </div>
          <span className="font-bold text-lg text-white">TapMenu</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/15 text-white/80">
            Armenia
          </span>
        </Link>

        {/* ─── Desktop nav ───────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) =>
            l.anchor ? (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/70 hover:text-orange-400 transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/70 hover:text-orange-400 transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        {/* ─── CTA + lang ────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language switcher */}
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">RU</span>
            <span className="text-slate-600">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">EN</span>
            <span className="text-slate-600">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">HY</span>
          </div>

          <Link
            href="/login"
            className="text-sm font-medium text-white/70 hover:text-orange-400 transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-1.5 h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
          >
            Написать нам
          </Link>
        </div>

        {/* ─── Mobile menu button ─────────────────────────────────────────── */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Открыть меню"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── Mobile dropdown ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-sm font-medium text-slate-300 hover:text-orange-400 py-1.5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex justify-center gap-3 text-sm text-slate-500 pb-1">
              <span className="hover:text-white cursor-pointer">RU</span>
              <span>|</span>
              <span className="hover:text-white cursor-pointer">EN</span>
              <span>|</span>
              <span className="hover:text-white cursor-pointer">HY</span>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 text-center py-2 hover:text-orange-400 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Войти
            </Link>
            <Link
              href="/contact"
              className="block text-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Написать нам
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
