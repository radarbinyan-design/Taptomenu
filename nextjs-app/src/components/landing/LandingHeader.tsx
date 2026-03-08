'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#features', label: 'Возможности' },
  { href: '#how-it-works', label: 'Как это работает' },
  { href: '#pricing', label: 'Тарифы' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Контакты' },
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
        scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md group-hover:bg-amber-600 transition-colors">
            <span className="text-white font-bold text-sm">TM</span>
          </div>
          <span className={`font-bold text-lg transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            TapMenu
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            scrolled ? 'bg-amber-100 text-amber-700' : 'bg-white/20 text-white'
          }`}>
            Armenia
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                scrolled ? 'text-gray-600' : 'text-white/80'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm font-medium transition-colors hover:text-amber-500 ${
              scrolled ? 'text-gray-600' : 'text-white/80'
            }`}
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
          >
            Попробовать бесплатно
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen
            ? <X className={`w-5 h-5 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            : <Menu className={`w-5 h-5 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
          }
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="block text-sm font-medium text-gray-700 hover:text-amber-500 py-1.5"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/login" className="text-sm font-medium text-gray-700 text-center py-2">Войти</Link>
            <Link href="/register" className="block text-center py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl">
              Попробовать бесплатно
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
