import type { Metadata } from 'next'
import { MessageSquare, Clock, CheckCircle, XCircle, PhoneCall, Mail, ChevronRight, Filter, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Заявки | Admin — TapMenu Armenia' }

const leads = [
  { id: 'lead-001', name: 'Гагик Арутюнян', email: 'gagik@cafeyerevan.am', phone: '+374 91 111222', restaurant: 'Кафе Ереван', plan: 'pro', message: 'Хочу подключить своё кафе. 60 мест, 50 позиций в меню.', status: 'new', createdAt: '5 мин назад' },
  { id: 'lead-002', name: 'Наира Степанян', email: 'naira@dolmama.am', phone: '+374 93 333444', restaurant: 'Долмама', plan: 'premium', message: 'Нас интересует Premium. Есть 3 зала.', status: 'contacted', createdAt: '2 часа назад' },
  { id: 'lead-003', name: 'Тигран Бабаян', email: 'tigran@kharcho.am', phone: '+374 77 555666', restaurant: 'Харчо', plan: 'starter', message: 'Небольшое кафе, хотим попробовать.', status: 'converted', createdAt: '1 день назад' },
  { id: 'lead-004', name: 'Алина Акопян', email: 'alina@veranda.am', phone: '+374 94 777888', restaurant: 'Веранда', plan: 'luxe', message: 'Сеть из 5 ресторанов. Нужен корпоративный тариф.', status: 'new', createdAt: '3 часа назад' },
  { id: 'lead-005', name: 'Рубен Карапетян', email: 'ruben@pizza.am', phone: '+374 96 999000', restaurant: 'PizzaTime', plan: 'pro', message: 'Хочу узнать подробнее о Pro тарифе.', status: 'rejected', createdAt: '3 дня назад' },
  { id: 'lead-006', name: 'Сирануш Мкртчян', email: 'siranush@vino.am', phone: '+374 91 123321', restaurant: 'Vino Bar', plan: 'premium', message: '', status: 'contacted', createdAt: '5 часов назад' },
]

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  new:       { color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/30',   label: 'Новая',    icon: MessageSquare },
  contacted: { color: 'text-amber-400',  bg: 'bg-amber-500/10 border border-amber-500/30', label: 'В работе', icon: PhoneCall },
  converted: { color: 'text-green-400',  bg: 'bg-green-500/10 border border-green-500/30', label: 'Закрыта',  icon: CheckCircle },
  rejected:  { color: 'text-gray-500',   bg: 'bg-gray-500/10 border border-gray-500/30',   label: 'Отклонена',icon: XCircle },
}

const planLabels: Record<string, string> = {
  starter: 'Starter $15/мес',
  pro: 'Pro $25/мес',
  premium: 'Premium $45/мес',
  luxe: 'LUXE $50+/мес',
}

export default function AdminLeadsPage() {
  const total = leads.length
  const newLeads = leads.filter(l => l.status === 'new').length
  const inProgress = leads.filter(l => l.status === 'contacted').length
  const converted = leads.filter(l => l.status === 'converted').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Заявки с сайта</h1>
        <p className="text-gray-400 text-sm mt-1">Лиды из формы /contact</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего', value: total, color: 'text-white' },
          { label: 'Новых', value: newLeads, color: 'text-blue-400' },
          { label: 'В работе', value: inProgress, color: 'text-amber-400' },
          { label: 'Конвертировано', value: converted, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по имени, email, ресторану..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
          <Filter className="w-4 h-4" /> Фильтр
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {leads.map(lead => {
          const status = statusConfig[lead.status]
          const StatusIcon = status.icon
          return (
            <div key={lead.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-400 font-bold text-sm">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{lead.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />{status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                      {lead.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><PhoneCall className="w-3 h-3" />{lead.phone}</span>}
                    </div>
                    {lead.restaurant && (
                      <div className="text-xs text-gray-400 mt-1">
                        🏪 {lead.restaurant} · <span className="text-amber-400">{planLabels[lead.plan]}</span>
                      </div>
                    )}
                    {lead.message && (
                      <div className="text-xs text-gray-500 mt-2 bg-gray-900 rounded-lg px-3 py-2 line-clamp-2">
                        "{lead.message}"
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />{lead.createdAt}
                  </div>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
