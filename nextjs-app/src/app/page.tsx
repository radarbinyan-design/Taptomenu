import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-2xl shadow-2xl mb-4">
            <span className="text-white font-bold text-3xl">TM</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TapMenu Armenia</h1>
          <p className="text-gray-300 text-lg">SaaS платформа цифровых NFC-меню</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard"
            className="block p-4 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-white transition-colors border border-white/20"
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="font-semibold">Dashboard</div>
            <div className="text-xs text-gray-300">Кабинет владельца</div>
          </Link>
          <Link
            href="/admin"
            className="block p-4 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-white transition-colors border border-white/20"
          >
            <div className="text-2xl mb-1">⚙️</div>
            <div className="font-semibold">Admin Panel</div>
            <div className="text-xs text-gray-300">Суперадмин</div>
          </Link>
          <Link
            href="/menu/araratrest"
            className="block p-4 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur rounded-xl text-white transition-colors border border-amber-500/30"
          >
            <div className="text-2xl mb-1">🍽️</div>
            <div className="font-semibold">Публичное меню</div>
            <div className="text-xs text-gray-300">Демо ресторан</div>
          </Link>
          <Link
            href="/login"
            className="block p-4 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl text-white transition-colors border border-white/20"
          >
            <div className="text-2xl mb-1">🔐</div>
            <div className="font-semibold">Войти</div>
            <div className="text-xs text-gray-300">Авторизация</div>
          </Link>
        </div>

        {/* Landing link */}
        <p className="text-gray-400 text-sm">
          Лендинг:{' '}
          <a
            href="https://tapmenu.am"
            className="text-amber-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            tapmenu.am
          </a>
        </p>

        {/* Version */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-amber-300 text-xs font-medium">v2.0.0 MVP — Next.js 14</span>
        </div>
      </div>
    </div>
  )
}
