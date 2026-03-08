'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Settings,
  Store,
  Palette,
  Wifi,
  Globe,
  Eye,
  EyeOff,
  Save,
  Upload,
  Crown,
  Check,
  Lock,
} from 'lucide-react'

const TEMPLATES = [
  { id: 'classic', name: 'Classic', preview: '🍽️', description: 'Классический' },
  { id: 'modern', name: 'Modern', preview: '✨', description: 'Современный' },
  { id: 'minimal', name: 'Minimal', preview: '⬜', description: 'Минималистик' },
  { id: 'luxe', name: 'Luxe V', preview: '👑', description: 'Люкс', requiresPlan: 'luxe' },
]

const ACCENT_COLORS = [
  '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6',
  '#10B981', '#EC4899', '#F97316', '#1F2937',
]

export default function SettingsPage() {
  const [tab, setTab] = useState<'restaurant' | 'appearance' | 'wifi' | 'security' | 'subscription'>('restaurant')
  const [showWifi, setShowWifi] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [selectedColor, setSelectedColor] = useState('#F59E0B')
  const [saved, setSaved] = useState(false)
  // Password change state
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [showPwCurrent, setShowPwCurrent] = useState(false)
  const [showPwNew, setShowPwNew] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePasswordChange = () => {
    setPwError('')
    if (!pwCurrent) { setPwError('Введите текущий пароль'); return }
    if (pwNew.length < 8) { setPwError('Новый пароль — минимум 8 символов'); return }
    if (pwNew !== pwConfirm) { setPwError('Пароли не совпадают'); return }
    // TODO: call API
    setPwSuccess(true)
    setPwCurrent(''); setPwNew(''); setPwConfirm('')
    setTimeout(() => setPwSuccess(false), 3000)
  }


  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
          <p className="text-gray-500 mt-1">Ресторан Арарат</p>
        </div>
        <Button onClick={handleSave} isLoading={saved}>
          {saved ? <><Check className="w-4 h-4" /> Сохранено</> : <><Save className="w-4 h-4" /> Сохранить</>}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'restaurant', label: 'Ресторан', icon: Store },
          { id: 'appearance', label: 'Внешний вид', icon: Palette },
          { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
          { id: 'security', label: 'Безопасность', icon: Lock },
          { id: 'subscription', label: 'Подписка', icon: Crown },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Restaurant Tab */}
      {tab === 'restaurant' && (
        <div className="space-y-5">
          {/* Logo upload */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl border-2 border-dashed border-gray-200">
                  А
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Логотип ресторана</p>
                  <p className="text-xs text-gray-500 mb-2">PNG, JPG, SVG до 5MB</p>
                  <button className="flex items-center gap-2 text-sm text-amber-600 hover:underline">
                    <Upload className="w-4 h-4" />
                    Загрузить логотип
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Input label="Название ресторана" defaultValue="Ресторан Арарат" />
            <Input label="Слаг (URL)" defaultValue="araratrest" hint="menu.tapmenu.am/araratrest" />
            <Input label="Описание" defaultValue="Лучшая армянская кухня в Ереване" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Телефон" defaultValue="+374 10 123456" type="tel" />
              <Input label="Город" defaultValue="Ереван" />
            </div>
            <Input label="Адрес" defaultValue="ул. Тиграняна, 42" />
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {tab === 'appearance' && (
        <div className="space-y-5">
          {/* Template */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Шаблон меню</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => !tmpl.requiresPlan && setSelectedTemplate(tmpl.id)}
                    className={`relative p-3 border-2 rounded-xl text-center transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    } ${tmpl.requiresPlan ? 'opacity-60' : ''}`}
                  >
                    <div className="text-2xl mb-1">{tmpl.preview}</div>
                    <div className="text-xs font-medium text-gray-700">{tmpl.description}</div>
                    {tmpl.requiresPlan && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        LUXE
                      </div>
                    )}
                    {selectedTemplate === tmpl.id && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accent color */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Основной цвет</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-xl transition-transform hover:scale-110 ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Выбран: <span className="font-mono">{selectedColor}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* WiFi Tab */}
      {tab === 'wifi' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-500" />
                <CardTitle className="text-base">Wi-Fi для гостей</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Гости увидят кнопку подключения к Wi-Fi прямо в меню. Пароль хранится в зашифрованном виде (AES-256).
              </p>
              <Input label="Название сети (SSID)" defaultValue="Ararat_WiFi" />
              <div className="relative">
                <Input
                  label="Пароль Wi-Fi"
                  type={showWifi ? 'text' : 'password'}
                  defaultValue="ararat2024"
                  rightIcon={
                    <button
                      onClick={() => setShowWifi(!showWifi)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showWifi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                <span className="text-green-600 text-sm">🔒</span>
                <p className="text-xs text-green-700">
                  Пароль зашифрован AES-256 и никогда не передаётся клиенту в открытом виде
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab — Change Password */}
      {tab === 'security' && (
        <div className="space-y-4 max-w-lg">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Смена пароля
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pwSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Пароль успешно изменён!
                </div>
              )}
              {pwError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  ⚠️ {pwError}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Текущий пароль</label>
                <div className="relative">
                  <input
                    type={showPwCurrent ? 'text' : 'password'}
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    placeholder="Введите текущий пароль"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button type="button" onClick={() => setShowPwCurrent(!showPwCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Новый пароль</label>
                <div className="relative">
                  <input
                    type={showPwNew ? 'text' : 'password'}
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    placeholder="Минимум 8 символов"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button type="button" onClick={() => setShowPwNew(!showPwNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwNew && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pwNew.length < 6 ? 'bg-red-400 w-1/3' : pwNew.length < 10 ? 'bg-amber-400 w-2/3' : 'bg-green-500 w-full'}`} />
                    </div>
                    <span className="text-xs text-gray-400">{pwNew.length < 6 ? 'Слабый' : pwNew.length < 10 ? 'Средний' : 'Сильный'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Подтвердите пароль</label>
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    pwConfirm && pwNew !== pwConfirm ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {pwConfirm && pwNew !== pwConfirm && (
                  <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
                )}
              </div>

              <Button onClick={handlePasswordChange} className="w-full">
                <Lock className="w-4 h-4" />
                Изменить пароль
              </Button>
            </CardContent>
          </Card>

          {/* Session info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Активные сессии</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { device: '💻 MacBook Pro', location: 'Ереван, AM', time: 'Сейчас', current: true },
                { device: '📱 iPhone 14', location: 'Ереван, AM', time: '2 часа назад', current: false },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{session.device}</div>
                    <div className="text-xs text-gray-400">{session.location} · {session.time}</div>
                  </div>
                  {session.current ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Текущая</span>
                  ) : (
                    <button className="text-xs text-red-500 hover:underline">Завершить</button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Tab */}
      {tab === 'subscription' && (
        <div className="space-y-4">
          {/* Current plan */}
          <Card className="border-amber-200">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <span className="text-lg font-bold text-gray-900">Pro план</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Активен</span>
                  </div>
                  <p className="text-sm text-gray-500">$25/мес · следующий платёж 1 апреля 2026</p>
                </div>
                <span className="text-2xl font-bold text-amber-600">$25</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Меню', used: 2, max: 3 },
                  { label: 'Блюд', used: 47, max: 100 },
                  { label: 'Языков', used: 4, max: 5 },
                  { label: 'NFC-тегов', used: 6, max: 5 },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{item.label}</span>
                      <span className={item.used > item.max ? 'text-red-500 font-medium' : ''}>{item.used}/{item.max}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${item.used > item.max ? 'bg-red-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min((item.used / item.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade options */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Premium', price: '$45', color: 'purple', features: ['10 меню', '500 блюд', '20 языков', 'DeepL переводы'] },
              { name: 'LUXE', price: 'от $50', color: 'amber', features: ['∞ меню', '∞ блюд', '33 языка', 'AI-ассистент'] },
            ].map((plan) => (
              <Card key={plan.name} className={`border-${plan.color}-200 bg-${plan.color}-50`}>
                <CardContent className="pt-4">
                  <div className="text-lg font-bold text-gray-900 mb-1">{plan.name}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-3">{plan.price}<span className="text-sm font-normal text-gray-500">/мес</span></div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                        <Check className={`w-3.5 h-3.5 text-${plan.color}-500`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full">Перейти на {plan.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
