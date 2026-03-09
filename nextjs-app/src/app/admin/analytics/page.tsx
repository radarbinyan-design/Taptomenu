import type { Metadata } from 'next'
import { BarChart3, TrendingUp, Eye, Globe, Smartphone, Monitor, Clock, MapPin } from 'lucide-react'

export const metadata: Metadata = { title: 'Аналитика | Admin — TapMenu Armenia' }

const topRestaurants = [
  { name: 'Ресторан Арарат', views: 18940, growth: '+23%', city: 'Ереван' },
  { name: 'Bistro Yerevan', views: 6830, growth: '+15%', city: 'Ереван' },
  { name: 'Таверна Ноев Ковчег', views: 8240, growth: '+31%', city: 'Ереван' },
  { name: 'Пиццерия Milano', views: 4210, growth: '+8%', city: 'Ереван' },
  { name: 'Мини-отель Sevan', views: 1450, growth: '-5%', city: 'Севан' },
]

const topLangs = [
  { lang: 'RU', label: 'Русский',  pct: 52, count: 18400 },
  { lang: 'HY', label: 'Армянский', pct: 28, count: 9900 },
  { lang: 'EN', label: 'English',  pct: 14, count: 4950 },
  { lang: 'AR', label: 'Arabic',   pct: 4,  count: 1415 },
  { lang: 'FR', label: 'French',   pct: 2,  count: 710 },
]

const deviceStats = [
  { device: 'Mobile', icon: Smartphone, pct: 84, color: 'bg-amber-500' },
  { device: 'Desktop', icon: Monitor, pct: 11, color: 'bg-blue-500' },
  { device: 'Tablet', icon: Globe, pct: 5, color: 'bg-gray-500' },
]

const hourlyData = [
  { h: '08', v: 120 }, { h: '09', v: 240 }, { h: '10', v: 310 },
  { h: '11', v: 480 }, { h: '12', v: 820 }, { h: '13', v: 960 },
  { h: '14', v: 880 }, { h: '15', v: 740 }, { h: '16', v: 620 },
  { h: '17', v: 590 }, { h: '18', v: 760 }, { h: '19', v: 1020 },
  { h: '20', v: 1180 }, { h: '21', v: 940 }, { h: '22', v: 560 },
  { h: '23', v: 280 },
]
const maxH = Math.max(...hourlyData.map(d => d.v))

export default function AdminAnalyticsPage() {
  const totalViews = topRestaurants.reduce((s, r) => s + r.views, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Аналитика</h1>
        <p className="text-gray-400 text-sm mt-1">Просмотры меню по всей платформе</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Просмотров сегодня', value: '4 820', change: '+18%', color: 'text-amber-400', icon: Eye },
          { label: 'Всего просмотров', value: totalViews.toLocaleString(), change: '+34%', color: 'text-white', icon: BarChart3 },
          { label: 'Среднее время', value: '2м 14с', change: '+12с', color: 'text-green-400', icon: Clock },
          { label: 'Уникальных гостей', value: '32 100', change: '+21%', color: 'text-blue-400', icon: Globe },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{card.label}</span>
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-green-400 mt-1">{card.change} к прошлой неделе</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly chart */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Активность по часам (сегодня)</h2>
          <div className="flex items-end gap-1 h-32">
            {hourlyData.map(d => {
              const h = Math.round((d.v / maxH) * 100)
              const isPeak = d.v >= 900
              return (
                <div key={d.h} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${d.v >= 900 ? 'bg-amber-500' : 'bg-gray-600'}`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-xs text-gray-600">{d.h}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">Пик активности: 19:00 – 21:00</div>
        </div>

        {/* Devices */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Устройства гостей</h2>
          <div className="space-y-4">
            {deviceStats.map(d => {
              const Icon = d.icon
              return (
                <div key={d.device}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{d.device}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{d.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">84% открывают с телефона — NFC работает!</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top restaurants */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-white">Топ ресторанов по просмотрам</h2>
          </div>
          <div className="divide-y divide-gray-700/50">
            {topRestaurants.map((r, i) => (
              <div key={r.name} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-700/30 transition-colors">
                <span className="text-sm font-bold text-gray-600 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{r.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{r.city}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-white text-sm font-medium">
                    <Eye className="w-3 h-3 text-gray-500" />{r.views.toLocaleString()}
                  </div>
                  <div className={`text-xs ${r.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {r.growth}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-white">Топ языков меню</h2>
          </div>
          <div className="p-5 space-y-3">
            {topLangs.map(l => (
              <div key={l.lang}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-400 w-6">{l.lang}</span>
                    <span className="text-sm text-gray-300">{l.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-white">{l.pct}%</span>
                    <span className="text-xs text-gray-500 ml-1">({l.count.toLocaleString()})</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${l.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
