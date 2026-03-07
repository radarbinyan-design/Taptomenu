'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Check, ArrowRight, Wifi, Globe, Clock } from 'lucide-react'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    period: '/мес',
    icon: '⚡',
    features: ['1 меню', 'До 20 блюд', '2 языка', 'QR-код'],
    color: 'border-gray-200',
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$25',
    period: '/мес',
    icon: '🚀',
    features: ['3 меню', 'До 100 блюд', '4 языка', 'Аналитика', 'Приоритет поддержки'],
    color: 'border-amber-400 ring-2 ring-amber-400',
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$55',
    period: '/мес',
    icon: '💎',
    features: ['Безлимит меню', 'Безлимит блюд', '6 языков', 'AI описания', 'Брендинг'],
    color: 'border-purple-200',
    recommended: false,
  },
]

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [form, setForm] = useState({
    name: '',
    restaurantName: '',
    email: '',
    phone: '',
    password: '',
    agree: false,
  })

  const passwordStrength = (() => {
    const p = form.password
    if (!p) return { level: 0, label: '', color: '' }
    if (p.length < 6) return { level: 1, label: 'Слабый', color: 'bg-red-500' }
    if (p.length < 10) return { level: 2, label: 'Средний', color: 'bg-amber-500' }
    return { level: 3, label: 'Сильный', color: 'bg-green-500' }
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
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

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > s
                    ? 'bg-green-500 text-white'
                    : step === s
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          {/* Step 1: Account info */}
          {step === 1 && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Создать аккаунт</h1>
              <p className="text-gray-500 text-sm mb-6">Шаг 1 из 3 · Данные владельца ресторана</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Ваше имя *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Арам Петросян"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Название ресторана *</label>
                  <input
                    type="text"
                    value={form.restaurantName}
                    onChange={(e) => setForm((p) => ({ ...p, restaurantName: e.target.value }))}
                    placeholder="Ресторан Арарат"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="aram@ararat.am"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Телефон</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+374 XX XXX XXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Пароль *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Минимум 8 символов"
                      className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {form.password && (
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
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.email || !form.password}
                className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Далее — выбор тарифа
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="text-amber-600 hover:underline font-medium">
                  Войти
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Plan selection */}
          {step === 2 && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Выберите тариф</h1>
              <p className="text-gray-500 text-sm mb-2">Шаг 2 из 3 · 14 дней бесплатно на любом тарифе</p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  Бесплатный триал 14 дней — без привязки карты
                </p>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedPlan === plan.id ? plan.color : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{plan.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{plan.name}</span>
                            {plan.recommended && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                                Популярный
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {plan.features.map((f) => (
                              <span key={f} className="text-xs text-gray-500 flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-xs text-gray-400">{plan.period}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-2 flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Начать триал
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать!</h1>
              <p className="text-gray-500 text-sm mb-1">
                Аккаунт <strong>{form.restaurantName || 'вашего ресторана'}</strong> создан
              </p>
              <p className="text-gray-400 text-xs mb-6">Письмо с подтверждением отправлено на {form.email}</p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-amber-800 mb-3">Что сделать первым:</h3>
                <div className="space-y-2">
                  {[
                    { icon: '🍽️', text: 'Добавить первые блюда в меню' },
                    { icon: '📱', text: 'Настроить QR-код для столиков' },
                    { icon: Globe, text: 'Добавить переводы на нужные языки' },
                    { icon: Wifi, text: 'Указать Wi-Fi пароль для гостей' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-amber-700">
                      {typeof item.icon === 'string' ? (
                        <span>{item.icon}</span>
                      ) : (
                        <item.icon className="w-4 h-4" />
                      )}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Перейти в кабинет
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Регистрируясь, вы соглашаетесь с{' '}
          <Link href="/terms" className="text-amber-600 hover:underline">условиями</Link>{' '}
          и{' '}
          <Link href="/privacy" className="text-amber-600 hover:underline">политикой конфиденциальности</Link>
        </p>
      </div>
    </div>
  )
}
