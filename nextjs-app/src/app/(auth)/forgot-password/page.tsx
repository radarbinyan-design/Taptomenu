'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check, RefreshCw } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'sent'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ошибка отправки. Попробуйте позже.')
        return
      }

      setStep('sent')
    } catch {
      setError('Ошибка соединения. Проверьте интернет.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <span className="text-white font-bold text-lg">TM</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 text-lg leading-none">TapMenu</div>
              <div className="text-xs text-gray-400 leading-none mt-0.5">Armenia</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          {step === 'email' ? (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 w-fit transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад к входу
              </Link>

              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-7 h-7 text-amber-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Восстановление пароля</h1>
              <p className="text-gray-500 text-sm mb-6">
                Введите email, привязанный к вашему аккаунту. Мы отправим ссылку для сброса пароля.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aram@ararat.am"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!email || loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    'Отправить ссылку'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-8 h-8 text-green-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Письмо отправлено!</h1>
              <p className="text-gray-500 text-sm text-center mb-2">
                Мы отправили инструкции по сбросу пароля на:
              </p>
              <p className="text-center font-semibold text-gray-900 mb-6">{email}</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Не получили письмо?</p>
                <ul className="text-xs text-gray-400 space-y-1 list-none">
                  <li>• Проверьте папку «Спам» или «Нежелательная почта»</li>
                  <li>• Убедитесь, что email указан верно</li>
                  <li>• Письмо может прийти в течение нескольких минут</li>
                </ul>
              </div>

              <button
                onClick={() => { setStep('email'); setError('') }}
                className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <RefreshCw className="w-4 h-4" />
                Отправить повторно
              </button>

              <Link
                href="/login"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Вернуться к входу
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
