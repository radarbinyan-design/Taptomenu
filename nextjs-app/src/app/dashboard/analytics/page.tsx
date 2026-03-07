import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, TrendingUp, Users, Globe, Smartphone, Monitor, BarChart2, Calendar } from 'lucide-react'

export const metadata: Metadata = { title: 'Аналитика' }

const weeklyData = [
  { day: 'Пн', views: 85 },
  { day: 'Вт', views: 120 },
  { day: 'Ср', views: 95 },
  { day: 'Чт', views: 142 },
  { day: 'Пт', views: 168 },
  { day: 'Сб', views: 220 },
  { day: 'Вс', views: 195 },
]

const langStats = [
  { lang: '🇷🇺 Русский', count: 485, pct: 42 },
  { lang: '🇦🇲 Армянский', count: 320, pct: 28 },
  { lang: '🇬🇧 English', count: 196, pct: 17 },
  { lang: '🇸🇦 Arabic', count: 92, pct: 8 },
  { lang: '🇫🇷 Français', count: 57, pct: 5 },
]

const maxViews = Math.max(...weeklyData.map((d) => d.views))

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-gray-500 mt-1">Статистика просмотров меню</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4" />
            7 дней
          </Button>
          <Button variant="outline" size="sm">Экспорт</Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего просмотров', value: '1 025', change: '+23%', icon: Eye, color: 'blue' },
          { label: 'Уникальных гостей', value: '847', change: '+18%', icon: Users, color: 'green' },
          { label: 'Языков использовано', value: '5', change: 'за неделю', icon: Globe, color: 'purple' },
          { label: 'Ср. время на странице', value: '2:34', change: '+0:12', icon: TrendingUp, color: 'amber' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className="text-xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-green-600 mt-0.5">{m.change}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${m.color}-50`}>
                  <m.icon className={`w-4 h-4 text-${m.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Просмотры за 7 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-40 pt-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{day.views}</span>
                <div className="w-full bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className="bg-amber-400 rounded-lg transition-all"
                    style={{ height: `${(day.views / maxViews) * 100}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language stats + Device stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Language breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              Языки меню
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {langStats.map((stat) => (
                <div key={stat.lang}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{stat.lang}</span>
                    <span className="text-gray-500">{stat.count} ({stat.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-amber-400 rounded-full"
                      style={{ width: `${stat.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-500" />
              Устройства
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { device: 'Мобильный', icon: Smartphone, pct: 78, count: 799, color: 'amber' },
                { device: 'Десктоп', icon: Monitor, pct: 15, count: 154, color: 'blue' },
                { device: 'Планшет', icon: Monitor, pct: 7, count: 72, color: 'gray' },
              ].map((d) => (
                <div key={d.device}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 text-gray-700">
                      <d.icon className="w-4 h-4 text-gray-400" />
                      {d.device}
                    </span>
                    <span className="text-gray-500">{d.count} ({d.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 bg-${d.color}-400 rounded-full`}
                      style={{ width: `${d.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* NFC vs QR */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-3">Источник перехода</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-600">68%</div>
                  <div className="text-xs text-amber-700 mt-0.5">NFC-тег</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-600">32%</div>
                  <div className="text-xs text-gray-500 mt-0.5">QR-код</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
