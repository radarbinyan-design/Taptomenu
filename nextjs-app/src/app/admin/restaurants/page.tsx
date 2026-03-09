import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Store, Search, Plus, Eye, Edit2, MoreHorizontal,
  MapPin, Crown, Zap, Star, AlertCircle, CheckCircle,
  Clock, Ban, Globe, TrendingUp, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Рестораны | Admin — TapMenu Armenia' }

const restaurants = [
  { id: '1', name: 'Таверна Ноев Ковчег', owner: 'Давид Саркисян', email: 'noev@example.com', plan: 'pro', status: 'active', views: 8240, city: 'Ереван', slug: 'noev-kovcheg', dishes: 48, createdAt: '3 дня назад' },
  { id: '2', name: 'Ресторан Арарат', owner: 'Арам Петросян', email: 'ararat@example.com', plan: 'luxe', status: 'active', views: 18940, city: 'Ереван', slug: 'araratrest', dishes: 124, createdAt: '2 мес. назад' },
  { id: '3', name: 'Кофе Берд', owner: 'Ани Карапетян', email: 'berd@example.com', plan: 'starter', status: 'trial', views: 320, city: 'Гюмри', slug: 'cafe-berd', dishes: 18, createdAt: '5 дней назад' },
  { id: '4', name: 'Мини-отель Sevan', owner: 'Марина Оганян', email: 'sevan@example.com', plan: 'premium', status: 'grace', views: 1450, city: 'Севан', slug: 'sevan-hotel', dishes: 63, createdAt: '1 мес. назад' },
  { id: '5', name: 'Пиццерия Milano', owner: 'Карен Авагян', email: 'milano@example.com', plan: 'pro', status: 'active', views: 4210, city: 'Ереван', slug: 'milano', dishes: 36, createdAt: '3 нед. назад' },
  { id: '6', name: 'Кафе Арагац', owner: 'Сусан Мкртчян', email: 'aragats@example.com', plan: 'starter', status: 'blocked', views: 210, city: 'Апаран', slug: 'aragats-cafe', dishes: 22, createdAt: '6 мес. назад' },
  { id: '7', name: 'Bistro Yerevan', owner: 'Нарек Григорян', email: 'bistro@example.com', plan: 'pro', status: 'active', views: 6830, city: 'Ереван', slug: 'bistro-yerevan', dishes: 57, createdAt: '1 мес. назад' },
  { id: '8', name: 'Lavash House', owner: 'Лусине Асатрян', email: 'lavash@example.com', plan: 'starter', status: 'trial', views: 540, city: 'Ванадзор', slug: 'lavash-house', dishes: 14, createdAt: '1 неделю назад' },
]

const planConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  luxe:    { color: 'bg-purple-100 text-purple-700 border border-purple-200', label: 'LUXE',    icon: Crown },
  premium: { color: 'bg-amber-100 text-amber-700 border border-amber-200',   label: 'Premium', icon: Star },
  pro:     { color: 'bg-blue-100 text-blue-700 border border-blue-200',       label: 'Pro',     icon: Zap },
  starter: { color: 'bg-gray-100 text-gray-600 border border-gray-200',       label: 'Starter', icon: Globe },
}

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  active:    { color: 'bg-green-100 text-green-700',  label: 'Активен',     icon: CheckCircle },
  trial:     { color: 'bg-amber-100 text-amber-700',  label: 'Триал',       icon: Clock },
  grace:     { color: 'bg-orange-100 text-orange-700',label: 'Grace',       icon: AlertCircle },
  blocked:   { color: 'bg-red-100 text-red-700',      label: 'Заблокирован',icon: Ban },
  cancelled: { color: 'bg-gray-100 text-gray-600',    label: 'Отменён',     icon: Ban },
}

export default function AdminRestaurantsPage() {
  const total = restaurants.length
  const active = restaurants.filter(r => r.status === 'active').length
  const trial = restaurants.filter(r => r.status === 'trial').length
  const blocked = restaurants.filter(r => r.status === 'blocked').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Рестораны</h1>
          <p className="text-gray-400 text-sm mt-1">Управление всеми ресторанами платформы</p>
        </div>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Добавить ресторан
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего', value: total, color: 'text-white' },
          { label: 'Активных', value: active, color: 'text-green-400' },
          { label: 'На триале', value: trial, color: 'text-amber-400' },
          { label: 'Заблокировано', value: blocked, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по названию, владельцу, городу..."
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
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Владелец</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Тариф</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Статус</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Просмотры</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {restaurants.map(r => {
                const plan = planConfig[r.plan]
                const status = statusConfig[r.status]
                const PlanIcon = plan.icon
                const StatusIcon = status.icon
                return (
                  <tr key={r.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Store className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{r.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{r.city} · {r.dishes} блюд
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-gray-300 text-sm">{r.owner}</div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${plan.color}`}>
                        <PlanIcon className="w-3 h-3" />{plan.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />{status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-1 text-gray-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-sm text-white font-medium">{r.views.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">{r.createdAt}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/menu/${r.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Открыть меню"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                          title="Ещё"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>Показано {restaurants.length} из 47 ресторанов</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">← Пред</button>
            <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">3</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">След →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
