'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Check, RefreshCw, AlertTriangle, Lock } from 'lucide-react'

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [step, setStep] = useState<'form' | 'success' | 'error'>('form')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // If no token in URL, show error immediately
  useEffect(() => {
    if (!token) {
      setStep('error')
      setErrorMsg('Ссылка недействительна. Токен для сброса пароля отсутствует.')
    }
  }, [token])

  const passwordStrength = (() => {
    const p = password
    if (!p) return { level: 0, label: '', color: '' }
    if (p.length < 8) return { level: 1, label: 'Слабый', color: 'bg-red-500' }
    if (p.length < 12) return { level: 2, label: 'Средний', color: 'bg-amber-500' }
    return { level: 3, label: 'Сильный', color: 'bg-green-500' }
  })()

  const isValid = password.length >= 8 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !token) return

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStep('error')
        setErrorMsg(data.error || 'Произошла ошибка при сбросе пароля.')
        return
      }

      setStep('success')
    } catch (err) {
      setStep('error')
      setErrorMsg('Ошибка соединения с сервером. Попробуйте позже.')
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
          {/* Form step */}
          {step === 'form' && (
            <>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Новый пароль</h1>
              <p className="text-gray-500 text-sm mb-6">
                Введите новый пароль для вашего аккаунта TapMenu.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Минимум 8 символов"
                      required
                      minLength={8}
                      className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{passwordStrength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Подтвердить пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-red-300 focus:ring-red-400'
                          : 'border-gray-200 focus:ring-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Сохраняем...
                    </>
                  ) : (
                    'Сохранить новый пароль'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Success step */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-10 h-10 text-green-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Пароль изменён!</h1>
              <p className="text-gray-500 text-sm mb-6">
                Ваш пароль успешно обновлён. Теперь вы можете войти с новым паролем.
              </p>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors gap-2"
              >
                Войти →
              </Link>
            </div>
          )}

          {/* Error step */}
          {step === 'error' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Ссылка недействительна</h1>
              <p className="text-gray-500 text-sm mb-6">
                {errorMsg || 'Ссылка для сброса пароля недействительна или истекла.'}
              </p>

              <Link
                href="/forgot-password"
                className="w-full inline-flex items-center justify-center py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors gap-2 mb-3"
              >
                Запросить новую ссылку →
              </Link>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors gap-2"
              >
                Вернуться к входу
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 TapMenu Armenia. Все права защищены.
        </p>
      </div>
    </div>
  )
}
