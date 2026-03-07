import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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
  Plus,
  Edit2,
  BarChart3,
  DollarSign,
  Globe,
  Shield,
  Settings,
  ChevronRight,
  ArrowUpRight,
  Crown,
  Zap,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Super Admin | TapMenu Armenia' }

const stats = [
  { label: 'Всего ресторанов', value: '47', change: '+3 за неделю', icon: Store, color: 'blue' },
  { label: 'Активных подписок', value: '38', change: '$1,340/мес ARR', icon: CreditCard, color: 'green' },
  { label: 'На триале', value: '6', change: '7 дней осталось', icon: Clock, color: 'amber' },
  { label: 'Заблокировано', value: '3', change: 'Требует внимания', icon: Ban, color: 'red' },
]

const revenueStats = [
  { label: 'MRR', value: '$1,340', change: '+18%', positive: true },
  { label: 'ARR', value: '$16,080', change: '+22%', positive: true },
  { label: 'ARPU', value: '$35.3', change: '+5%', positive: true },
  { label: 'Churn Rate', value: '2.1%', change: '-0.3%', positive: true },
]

const recentRestaurants = [
  { id: '1', name: 'Таверна Ноев Ковчег', owner: 'Давид Саркисян', plan: 'pro', status: 'active', views: 1240, city: 'Ереван', createdAt: '3 дня назад' },
  { id: '2', name: 'Кофе Берд', owner: 'Ани Карапетян', plan: 'starter', status: 'trial', views: 320, city: 'Гюмри', createdAt: '5 дней назад' },
  { id: '3', name: 'Ресторан Арарат', owner: 'Арам Петросян', plan: 'luxe', status: 'active', views: 8940, city: 'Ереван', createdAt: '2 мес. назад' },
  { id: '4', name: 'Мини-отель Sevan', owner: 'Марина Оганян', plan: 'premium', status: 'grace', views: 450, city: 'Севан', createdAt: '1 мес. назад' },
  { id: '5', name: 'Долма House', owner: 'Самвел Арутюнян', plan: 'pro', status: 'active', views: 2100, city: 'Ереван', createdAt: '3 нед. назад' },
  { id: '6', name: 'Cafe Yerevan', owner: 'Наира Мкртчян', plan: 'starter', status: 'blocked', views: 0, city: 'Ереван', createdAt: '6 мес. назад' },
]

const planColors: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  pro: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
  luxe: 'bg-amber-100 text-amber-700',
}

const planIcons: Record<string, string> = {
  starter: '⚡',
  pro: '🚀',
  premium: '💎',
  luxe: '👑',
}

const statusConfig: Record<string, { color: string; label: string; icon: typeof CheckCircle }> = {
  active: { color: 'bg-green-100 text-green-700', label: 'Активен', icon: CheckCircle },
  trial: { color: 'bg-amber-100 text-amber-700', label: 'Триал', icon: Clock },
  grace: { color: 'bg-orange-100 text-orange-700', label: 'Grace', icon: AlertCircle },
  blocked: { color: 'bg-red-100 text-red-700', label: 'Заблокирован', icon: Ban },
  cancelled: { color: 'bg-gray-100 text-gray-600', label: 'Отменён', icon: Ban },
}

const adminMenu = [
  { href: '/admin', label: 'Обзор', icon: BarChart3, active: true },
  { href: '/admin/restaurants', label: 'Рестораны', icon: Store, badge: '47' },
  { href: '/admin/users', label: 'Пользователи', icon: Users, badge: '53' },
  { href: '/admin/subscriptions', label: 'Подписки', icon: CreditCard },
  { href: '/admin/revenue', label: 'Финансы', icon: DollarSign },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Admin Bar */}
      <div className="bg-gray-900 text-white px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-red-400" />
          <span className="text-gray-300">Super Admin Panel</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-300">TapMenu Armenia</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            Сайт
          </Link>
          <Link href="/dashboard" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Мой кабинет
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 min-h-screen sticky top-0 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">Admin</div>
                <div className="text-xs text-gray-400">TapMenu Armenia</div>
              </div>
            </div>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            {adminMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item.badge}</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs font-bold">SA</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">SuperAdmin</div>
                <div className="text-xs text-gray-400">admin@tapmenu.am</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Обзор системы</h1>
              <p className="text-gray-500 text-sm mt-1">Панель управления TapMenu Armenia · Март 2025</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4" />
                Поиск
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Добавить ресторан
              </Button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
              const colors: Record<string, string> = {
                blue: 'text-blue-500 bg-blue-50',
                green: 'text-green-500 bg-green-50',
                amber: 'text-amber-500 bg-amber-50',
                red: 'text-red-500 bg-red-50',
              }
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[stat.color]}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Revenue Stats */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Финансовые показатели</CardTitle>
                <Badge variant="success" className="text-xs">+18% к прошлому месяцу</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueStats.map((r) => (
                  <div key={r.label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl font-bold text-gray-900">{r.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.label}</div>
                    <div className={`text-xs font-medium mt-1 ${r.positive ? 'text-green-600' : 'text-red-500'}`}>{r.change}</div>
                  </div>
                ))}
              </div>

              {/* Revenue by plan */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Доход по тарифам</div>
                {[
                  { plan: 'Luxe', count: 3, revenue: '$450', color: 'bg-amber-500', width: '33%' },
                  { plan: 'Premium', count: 8, revenue: '$480', color: 'bg-purple-500', width: '36%' },
                  { plan: 'Pro', count: 18, revenue: '$270', color: 'bg-blue-500', width: '20%' },
                  { plan: 'Starter', count: 9, revenue: '$90', color: 'bg-gray-400', width: '7%' },
                ].map((item) => (
                  <div key={item.plan} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-gray-600">{item.plan}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: item.width }} />
                    </div>
                    <div className="w-12 text-xs text-right text-gray-500">{item.revenue}</div>
                    <div className="w-8 text-xs text-right text-gray-400">{item.count}ш</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Restaurants table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Последние рестораны</CardTitle>
                    <Link href="/admin/restaurants" className="text-xs text-amber-600 hover:underline flex items-center gap-1">
                      Все рестораны <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Search */}
                  <div className="px-4 pb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Поиск ресторана..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {recentRestaurants.map((r) => {
                      const status = statusConfig[r.status] || statusConfig.active
                      const StatusIcon = status.icon
                      return (
                        <div key={r.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {r.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate">{r.name}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${planColors[r.plan]}`}>
                                  {planIcons[r.plan]} {r.plan}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">{r.owner}</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{r.city}</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{r.createdAt}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-right hidden sm:block">
                                <div className="text-xs font-medium text-gray-900">{r.views.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">просм.</div>
                              </div>
                              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      Загрузить ещё рестораны
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Plan distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Распределение по тарифам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { plan: 'Starter', icon: '⚡', count: 9, total: 47, color: 'bg-gray-400' },
                      { plan: 'Pro', icon: '🚀', count: 18, total: 47, color: 'bg-blue-500' },
                      { plan: 'Premium', icon: '💎', count: 8, total: 47, color: 'bg-purple-500' },
                      { plan: 'Luxe', icon: '👑', count: 3, total: 47, color: 'bg-amber-500' },
                    ].map((item) => (
                      <div key={item.plan} className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{item.plan}</span>
                            <span className="text-gray-400">{item.count} / {item.total}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div
                              className={`h-1.5 rounded-full ${item.color}`}
                              style={{ width: `${(item.count / item.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Требует внимания
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { text: 'Grace период заканчивается у 4 ресторанов', color: 'text-orange-600 bg-orange-50', icon: '⚠️' },
                    { text: 'Мини-отель Sevan: 5 дней до блокировки', color: 'text-red-600 bg-red-50', icon: '🔴' },
                    { text: 'Cafe Yerevan: неоплаченный счёт', color: 'text-red-600 bg-red-50', icon: '💳' },
                    { text: '6 ресторанов заканчивают триал на неделе', color: 'text-amber-600 bg-amber-50', icon: '⏰' },
                  ].map((alert, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${alert.color}`}>
                      <span>{alert.icon}</span>
                      <span>{alert.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Создать ресторан', icon: Store, href: '/admin/restaurants/new' },
                    { label: 'Управление тарифами', icon: Crown, href: '/admin/plans' },
                    { label: 'Рассылка пользователям', icon: Zap, href: '/admin/broadcast' },
                    { label: 'Экспорт данных', icon: TrendingUp, href: '/admin/export' },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-gray-900"
                    >
                      <action.icon className="w-4 h-4 text-gray-400" />
                      {action.label}
                      <ChevronRight className="w-3 h-3 text-gray-300 ml-auto" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
