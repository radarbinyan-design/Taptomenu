import type { Metadata } from 'next'
import { CreditCard, Crown, Zap, Star, Globe, CheckCircle, Clock, AlertCircle, Ban, TrendingUp, Search, Filter } from 'lucide-react'

export const metadata: Metadata = { title: 'Подписки | Admin — TapMenu Armenia' }

const subscriptions = [
  { id: '1', restaurant: 'Ресторан Арарат', owner: 'Арам Петросян', plan: 'luxe', status: 'active', price: 50, billing: 'monthly', nextBill: '15 апр 2025', started: '15 мар 2024', menus: '∞', dishes: '∞', languages: 20 },
  { id: '2', restaurant: 'Таверна Ноев Ковчег', owner: 'Давид Саркисян', plan: 'pro', status: 'active', price: 25, billing: 'monthly', nextBill: '3 апр 2025', started: '3 мар 2025', menus: 3, dishes: 100, languages: 5 },
  { id: '3', restaurant: 'Bistro Yerevan', owner: 'Нарек Григорян', plan: 'pro', status: 'active', price: 25, billing: 'monthly', nextBill: '12 апр 2025', started: '12 мар 2025', menus: 3, dishes: 100, languages: 5 },
  { id: '4', restaurant: 'Пиццерия Milano', owner: 'Карен Авагян', plan: 'pro', status: 'active', price: 25, billing: 'monthly', nextBill: '20 апр 2025', started: '20 фев 2025', menus: 3, dishes: 100, languages: 5 },
  { id: '5', restaurant: 'Мини-отель Sevan', owner: 'Марина Оганян', plan: 'premium', status: 'grace', price: 45, billing: 'monthly', nextBill: 'Просрочено', started: '1 фев 2025', menus: 10, dishes: 500, languages: 20 },
  { id: '6', restaurant: 'Кофе Берд', owner: 'Ани Карапетян', plan: 'starter', status: 'trial', price: 0, billing: 'trial', nextBill: '25 мар 2025', started: '18 мар 2025', menus: 1, dishes: 50, languages: 2 },
  { id: '7', restaurant: 'Lavash House', owner: 'Лусине Асатрян', plan: 'starter', status: 'trial', price: 0, billing: 'trial', nextBill: '26 мар 2025', started: '19 мар 2025', menus: 1, dishes: 50, languages: 2 },
  { id: '8', restaurant: 'Кафе Арагац', owner: 'Сусан Мкртчян', plan: 'starter', status: 'blocked', price: 15, billing: 'monthly', nextBill: '—', started: '10 окт 2024', menus: 1, dishes: 50, languages: 2 },
]

const planConfig: Record<string, { color: string; label: string; icon: React.ElementType; bg: string }> = {
  luxe:    { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'LUXE',    icon: Crown },
  premium: { color: 'text-amber-400',  bg: 'bg-amber-500/20',  label: 'Premium', icon: Star },
  pro:     { color: 'text-blue-400',   bg: 'bg-blue-500/20',   label: 'Pro',     icon: Zap },
  starter: { color: 'text-gray-400',   bg: 'bg-gray-500/20',   label: 'Starter', icon: Globe },
}

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  active:  { color: 'bg-green-100 text-green-700',  label: 'Активна',  icon: CheckCircle },
  trial:   { color: 'bg-amber-100 text-amber-700',  label: 'Триал',    icon: Clock },
  grace:   { color: 'bg-orange-100 text-orange-700',label: 'Grace',    icon: AlertCircle },
  blocked: { color: 'bg-red-100 text-red-700',      label: 'Блок',     icon: Ban },
}

export default function AdminSubscriptionsPage() {
  const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0)
  const active = subscriptions.filter(s => s.status === 'active').length
  const trial = subscriptions.filter(s => s.status === 'trial').length
  const grace = subscriptions.filter(s => s.status === 'grace').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Подписки</h1>
        <p className="text-gray-400 text-sm mt-1">Управление тарифами и биллингом</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: `$${mrr}`, color: 'text-green-400', sub: 'Ежемесячный доход' },
          { label: 'Активных', value: active, color: 'text-white', sub: 'Оплачивают' },
          { label: 'На триале', value: trial, color: 'text-amber-400', sub: 'До 14 дней' },
          { label: 'Grace period', value: grace, color: 'text-orange-400', sub: 'Требуют внимания' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-600 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по ресторану или владельцу..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
          <Filter className="w-4 h-4" /> Фильтр
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Ресторан</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Тариф</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Статус</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Цена</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Следующий платёж</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Лимиты</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {subscriptions.map(s => {
                const plan = planConfig[s.plan]
                const status = statusConfig[s.status]
                const PlanIcon = plan.icon
                const StatusIcon = status.icon
                return (
                  <tr key={s.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${plan.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <PlanIcon className={`w-4 h-4 ${plan.color}`} />
                        </div>
                        <div>
                          <div className="font-medium text-white">{s.restaurant}</div>
                          <div className="text-xs text-gray-500">{s.owner}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-sm font-semibold ${plan.color}`}>{plan.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />{status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="text-white font-medium">
                        {s.price === 0 ? 'Бесплатно' : `$${s.price}/мес`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className={s.nextBill === 'Просрочено' ? 'text-red-400 font-medium text-xs' : 'text-gray-400 text-xs'}>
                        {s.nextBill}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <div className="text-xs text-gray-400">{s.menus} меню · {s.dishes} блюд</div>
                      <div className="text-xs text-gray-600">{s.languages} языков</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
          Показано {subscriptions.length} из 47 подписок
        </div>
      </div>
    </div>
  )
}
