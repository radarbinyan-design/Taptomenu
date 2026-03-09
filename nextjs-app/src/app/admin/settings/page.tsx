import type { Metadata } from 'next'
import { Settings, Globe, Mail, Shield, Bell, Palette, Database, Key, Save, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Настройки | Admin — TapMenu Armenia' }

const sections = [
  {
    id: 'general',
    icon: Globe,
    title: 'Общие настройки',
    description: 'Название платформы, домен, часовой пояс',
    fields: [
      { label: 'Название платформы', type: 'text', value: 'TapMenu Armenia', placeholder: '' },
      { label: 'Домен', type: 'text', value: 'tapmenu.am', placeholder: '' },
      { label: 'Email поддержки', type: 'email', value: 'hello@tapmenu.am', placeholder: '' },
      { label: 'Часовой пояс', type: 'text', value: 'Asia/Yerevan (UTC+4)', placeholder: '' },
    ],
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Email-уведомления',
    description: 'Настройки Resend для отправки писем',
    fields: [
      { label: 'RESEND_API_KEY', type: 'password', value: 're_••••••••••••••••', placeholder: 're_...' },
      { label: 'Email отправителя', type: 'email', value: 'noreply@tapmenu.am', placeholder: '' },
      { label: 'Email для лидов', type: 'email', value: 'admin@tapmenu.am', placeholder: '' },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Безопасность',
    description: 'JWT-секреты, шифрование Wi-Fi паролей',
    fields: [
      { label: 'WIFI_ENCRYPTION_KEY', type: 'password', value: '••••••••••••••••••••••••••••••••', placeholder: '32-byte hex key' },
      { label: 'CRON_SECRET', type: 'password', value: '••••••••••••••••••••••••••••••••', placeholder: '' },
    ],
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Уведомления',
    description: 'Когда отправлять алерты администратору',
    toggles: [
      { label: 'Новая заявка с сайта (leads)', enabled: true },
      { label: 'Новая регистрация', enabled: true },
      { label: 'Истекает триал (3 дня)', enabled: true },
      { label: 'Ошибка оплаты', enabled: true },
      { label: 'Ресторан заблокирован', enabled: false },
      { label: 'Превышение лимита блюд', enabled: false },
    ],
  },
]

const statCards = [
  { label: 'Версия приложения', value: 'v2.0.0', icon: Database },
  { label: 'Next.js', value: '14.2.35', icon: Globe },
  { label: 'Node.js', value: '20.x', icon: Key },
  { label: 'Supabase', value: 'Connected', icon: Database, ok: true },
]

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки платформы</h1>
          <p className="text-gray-400 text-sm mt-1">Конфигурация TapMenu Armenia</p>
        </div>
      </div>

      {/* System status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <div className={`text-sm font-semibold ${s.ok ? 'text-green-400' : 'text-white'}`}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Settings sections */}
      <div className="space-y-4">
        {sections.map(section => {
          const Icon = section.icon
          return (
            <div key={section.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {/* Section header */}
              <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{section.title}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
              </div>

              <div className="p-5">
                {/* Fields */}
                {section.fields && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map(field => (
                      <div key={field.label}>
                        <label className="block text-xs text-gray-400 mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          defaultValue={field.value}
                          placeholder={field.placeholder}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Toggles */}
                {section.toggles && (
                  <div className="space-y-3">
                    {section.toggles.map(toggle => (
                      <div key={toggle.label} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-300">{toggle.label}</span>
                        <div className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${toggle.enabled ? 'bg-amber-500' : 'bg-gray-600'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${toggle.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.fields && (
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                      <Save className="w-3.5 h-3.5" /> Сохранить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Danger zone */}
      <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-red-400 mb-3">⚠️ Опасная зона</h2>
        <div className="space-y-3">
          {[
            { label: 'Очистить кэш системы', desc: 'Сбросить все кэшированные данные' },
            { label: 'Экспорт всех данных (CSV)', desc: 'Скачать полный дамп данных платформы' },
            { label: 'Техническое обслуживание', desc: 'Включить режим maintenance для пользователей' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-red-900/30 last:border-0">
              <div>
                <div className="text-sm text-red-300">{item.label}</div>
                <div className="text-xs text-red-900/80 text-red-400/50">{item.desc}</div>
              </div>
              <button className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-900/50 rounded-lg hover:border-red-700 transition-colors">
                Выполнить <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
