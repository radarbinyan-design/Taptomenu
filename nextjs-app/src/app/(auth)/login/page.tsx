'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Zap, Shield, Loader2 } from 'lucide-react'

const DEMO_ACCOUNTS = [
  {
    label: '👤 Владелец ресторана',
    email: 'owner@demo.com',
    password: 'demo1234',
    role: 'owner',
    desc: 'Dashboard, меню, блюда, аналитика',
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    label: '🛡️ Супер-администратор',
    email: 'admin@tapmenu.am',
    password: 'admin1234',
    role: 'superadmin',
    desc: 'Все рестораны, финансы, пользователи',
    color: 'bg-red-50 border-red-200 hover:border-red-400',
    badge: 'bg-red-100 text-red-700',
  },
]

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null)

  const doLogin = async (e?: string, p?: string) => {
    const loginEmail = e ?? email
    const loginPassword = p ?? password
    if (!loginEmail || !loginPassword) return
    if (e) setLoadingDemo(e)
    else setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Неверный email или пароль')
        return
      }

      if (data.user?.role === 'superadmin' || data.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push(redirect === '/admin' ? '/dashboard' : redirect)
      }
      router.refresh()
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
      setLoadingDemo(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <span className="text-white font-bold text-2xl">TM</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl">TapMenu Armenia</div>
              <div className="text-gray-400 text-sm">SaaS платформа цифровых NFC-меню</div>
            </div>
          </Link>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Quick demo access — top banner */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Быстрый демо-вход</span>
            </div>
            <Link
              href="/register"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Зарегистрироваться <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Demo buttons */}
          <div className="px-6 pt-4 pb-2 grid grid-cols-2 gap-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => doLogin(acc.email, acc.password)}
                disabled={!!loadingDemo || isLoading}
                className={`text-left p-3 rounded-xl border-2 transition-all ${acc.color} disabled:opacity-60`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800">{acc.label}</span>
                  {loadingDemo === acc.email && (
                    <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                  )}
                </div>
                <div className="text-xs text-gray-500">{acc.desc}</div>
                <div className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${acc.badge}`}>
                  {acc.email}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-6 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">или войдите вручную</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Manual form */}
          <div className="px-6 pb-6">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@restaurant.am"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link href="/forgot-password" className="text-xs text-amber-500 hover:underline">
                    Забыли пароль?
                  </Link>
                </div>
              </div>

              <button
                onClick={() => doLogin()}
                disabled={!email || !password || isLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Входим...</>
                ) : (
                  <>Войти <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>

          {/* Footer with register link */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">Нет аккаунта?</span>
            <Link
              href="/register"
              className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Зарегистрироваться бесплатно
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Credentials hint below card */}
        <div className="mt-4 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Демо-пароли:
          </p>
          <div className="space-y-1 font-mono text-xs">
            <div className="text-amber-300">owner@demo.com → <span className="text-white">demo1234</span></div>
            <div className="text-red-300">admin@tapmenu.am → <span className="text-white">admin1234</span></div>
          </div>
        </div>

        {/* Bottom register CTA */}
        <div className="mt-4 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium rounded-xl transition-all"
          >
            ✨ Создать аккаунт для своего ресторана
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
