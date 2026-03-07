import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Store,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Eye,
  Search,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Admin Panel | TapMenu' }

const stats = [
  { label: 'Всего ресторанов', value: '47', change: '+3 за неделю', icon: Store, color: 'blue' },
  { label: 'Активных подписок', value: '38', change: '$1,340/мес', icon: CreditCard, color: 'green' },
  { label: 'На триале', value: '6', change: '7 дней', icon: Clock, color: 'amber' },
  { label: 'Заблокировано', value: '3', change: 'Требует внимания', icon: Ban, color: 'red' },
]

const recentRestaurants = [
  { name: 'Таверна Ноев Ковчег', owner: 'Давид Саркисян', plan: 'pro', status: 'active', views: 1240 },
  { name: 'Кофе Берд', owner: 'Ани Карапетян', plan: 'starter', status: 'trial', views: 320 },
  { name: 'Ресторан Арарат', owner: 'Арам Петросян', plan: 'luxe', status: 'active', views: 8940 },
  { name: 'Мини-отель Sevan', owner: 'Марина Оганян', plan: 'premium', status: 'grace', views: 450 },
  { name: 'Долма House', owner: 'Самвел Арутюнян', plan: 'pro', status: 'active', views: 2100 },
]

const planColors: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  pro: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
  luxe: 'bg-amber-100 text-amber-700',
}

const statusColors: Record<string, string> = {
  active: 'success',
  trial: 'info',
  grace: 'warning',
  blocked: 'error',
}

const statusLabels: Record<string, string> = {
  active: 'Активен',
  trial: 'Триал',
  grace: 'Отсрочка',
  blocked: 'Заблокирован',
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-gray-500 mt-1">TapMenu Armenia — управление платформой</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
            Экспорт данных
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.change}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Доход по месяцам</CardTitle>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1">
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl flex items-end justify-around px-4 pb-4">
            {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'].map((m, i) => (
              <div key={m} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 bg-amber-400 rounded-t-lg"
                  style={{ height: `${40 + i * 12}px` }}
                ></div>
                <span className="text-xs text-gray-400">{m}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Итого за 6 месяцев:</span>
            <span className="font-bold text-gray-900">$4,820</span>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Рестораны</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none w-40"
                />
              </div>
              <Button size="sm">Все рестораны</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Ресторан</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500 hidden md:table-cell">Владелец</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">План</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Статус</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-500 hidden lg:table-cell">Просмотры</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody>
                {recentRestaurants.map((r) => (
                  <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="py-3 text-gray-500 hidden md:table-cell">{r.owner}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColors[r.plan]}`}>
                        {r.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant={statusColors[r.status] as any}>
                        {statusLabels[r.status]}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500 text-right hidden lg:table-cell">
                      {r.views.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
