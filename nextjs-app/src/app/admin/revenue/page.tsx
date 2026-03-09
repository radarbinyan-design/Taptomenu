import type { Metadata } from 'next'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, BarChart3, ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Финансы | Admin — TapMenu Armenia' }

const monthlyData = [
  { month: 'Окт 2024', mrr: 820, arr: 9840, newSubs: 5, churned: 1 },
  { month: 'Ноя 2024', mrr: 920, arr: 11040, newSubs: 6, churned: 1 },
  { month: 'Дек 2024', mrr: 1010, arr: 12120, newSubs: 7, churned: 2 },
  { month: 'Янв 2025', mrr: 1080, arr: 12960, newSubs: 8, churned: 1 },
  { month: 'Фев 2025', mrr: 1180, arr: 14160, newSubs: 9, churned: 2 },
  { month: 'Мар 2025', mrr: 1340, arr: 16080, newSubs: 11, churned: 2 },
]

const planRevenue = [
  { plan: 'LUXE',    count: 3,  price: 50, total: 150,  color: 'bg-purple-500', pct: 33 },
  { plan: 'Premium', count: 3,  price: 45, total: 135,  color: 'bg-amber-500',  pct: 30 },
  { plan: 'Pro',     count: 18, price: 25, total: 450,  color: 'bg-blue-500',   pct: 100 },
  { plan: 'Starter', count: 9,  price: 15, total: 135,  color: 'bg-gray-400',   pct: 30 },
]

const recentPayments = [
  { id: 'PAY-001', restaurant: 'Ресторан Арарат', amount: 50, plan: 'LUXE', date: '15 мар 2025', status: 'paid' },
  { id: 'PAY-002', restaurant: 'Таверна Ноев Ковчег', amount: 25, plan: 'Pro', date: '3 мар 2025', status: 'paid' },
  { id: 'PAY-003', restaurant: 'Bistro Yerevan', amount: 25, plan: 'Pro', date: '12 мар 2025', status: 'paid' },
  { id: 'PAY-004', restaurant: 'Пиццерия Milano', amount: 25, plan: 'Pro', date: '20 фев 2025', status: 'paid' },
  { id: 'PAY-005', restaurant: 'Мини-отель Sevan', amount: 45, plan: 'Premium', date: '1 фев 2025', status: 'failed' },
  { id: 'PAY-006', restaurant: 'Кафе Арагац', amount: 15, plan: 'Starter', date: '10 окт 2024', status: 'paid' },
]

export default function AdminRevenuePage() {
  const current = monthlyData[monthlyData.length - 1]
  const prev = monthlyData[monthlyData.length - 2]
  const mrrGrowth = (((current.mrr - prev.mrr) / prev.mrr) * 100).toFixed(1)
  const maxMrr = Math.max(...monthlyData.map(m => m.mrr))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Финансы</h1>
        <p className="text-gray-400 text-sm mt-1">Выручка, MRR и история платежей</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: `$${current.mrr.toLocaleString()}`, change: `+${mrrGrowth}%`, positive: true, icon: DollarSign },
          { label: 'ARR', value: `$${current.arr.toLocaleString()}`, change: '+22%', positive: true, icon: TrendingUp },
          { label: 'ARPU', value: '$35.3', change: '+5%', positive: true, icon: BarChart3 },
          { label: 'Churn Rate', value: '2.1%', change: '-0.3%', positive: true, icon: TrendingDown },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">{card.label}</span>
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className={`text-xs mt-1 font-medium ${card.positive ? 'text-green-400' : 'text-red-400'}`}>
                {card.change} к прошлому месяцу
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Chart */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">MRR по месяцам</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map(m => {
              const height = Math.round((m.mrr / maxMrr) * 100)
              const isLast = m.month === current.month
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-xs font-medium ${isLast ? 'text-amber-400' : 'text-gray-500'}`}>
                    ${m.mrr}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${isLast ? 'bg-amber-500' : 'bg-gray-600'}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-600 truncate w-full text-center">{m.month.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Доход по тарифам</h2>
          <div className="space-y-4">
            {planRevenue.map(p => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{p.plan}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">${p.total}</span>
                    <span className="text-xs text-gray-500 ml-1">({p.count} шт)</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.color}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-700 flex justify-between">
              <span className="text-xs text-gray-500">Итого MRR</span>
              <span className="text-sm font-bold text-amber-400">$1,340</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Последние платежи</h2>
          <button className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
            Все платежи <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-gray-700/50">
          {recentPayments.map(p => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{p.restaurant}</div>
                  <div className="text-xs text-gray-500">{p.id} · {p.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{p.plan}</span>
                <span className="text-sm font-semibold text-white">${p.amount}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {p.status === 'paid' ? 'Оплачен' : 'Ошибка'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
