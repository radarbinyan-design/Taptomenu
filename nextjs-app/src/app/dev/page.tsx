import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dev Nav — TapMenu Armenia',
  robots: { index: false, follow: false },
}

export default function DevPage() {
  // Block in production — redirect to landing
  if (process.env.NODE_ENV === 'production') {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="text-center max-w-lg w-full">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl shadow-2xl mb-6">
          <span className="text-white font-bold text-xl">TM</span>
        </div>

        <h1 className="text-white text-3xl font-bold mb-1">TapMenu Armenia</h1>
        <p className="text-slate-400 mb-2">SaaS платформа цифровых NFC-меню</p>

        {/* Dev badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30 mb-8">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          <span className="text-orange-300 text-xs font-medium">DEV MODE — не отображается в production</span>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard"
            className="block p-5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors border border-slate-600"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">Dashboard</div>
            <div className="text-xs text-slate-400 mt-0.5">Кабинет владельца</div>
          </Link>

          <Link
            href="/admin"
            className="block p-5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors border border-slate-600"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-semibold">Admin Panel</div>
            <div className="text-xs text-slate-400 mt-0.5">Суперадмин</div>
          </Link>

          <Link
            href="/menu/araratrest"
            className="block p-5 bg-amber-600 hover:bg-amber-500 rounded-xl text-white transition-colors border border-amber-500"
          >
            <div className="text-2xl mb-2">🍽</div>
            <div className="font-semibold">Публичное меню</div>
            <div className="text-xs text-amber-200 mt-0.5">Демо ресторан</div>
          </Link>

          <Link
            href="/login"
            className="block p-5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors border border-slate-600"
          >
            <div className="text-2xl mb-2">🔐</div>
            <div className="font-semibold">Войти</div>
            <div className="text-xs text-slate-400 mt-0.5">Авторизация</div>
          </Link>
        </div>

        {/* Extra dev links */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { href: '/register', label: 'Регистрация' },
            { href: '/forgot-password', label: 'Сброс пароля' },
            { href: '/dashboard/dishes', label: 'Блюда' },
            { href: '/dashboard/menus', label: 'Меню' },
            { href: '/dashboard/tables', label: 'Столики' },
            { href: '/dashboard/analytics', label: 'Аналитика' },
            { href: '/dashboard/settings', label: 'Настройки' },
            { href: '/dashboard/ai-assistant', label: 'AI Ассистент' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Demo credentials */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 text-left">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Demo credentials</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">👤 Owner</span>
              <span className="font-mono text-amber-300 text-xs">owner@demo.com / demo1234</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">🔑 Admin</span>
              <span className="font-mono text-amber-300 text-xs">admin@tapmenu.am / admin1234</span>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs mt-4">
          / — landing page &nbsp;·&nbsp; /dev — this page (dev only)
        </p>
      </div>
    </div>
  )
}
