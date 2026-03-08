'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Smartphone,
  Monitor,
  BarChart2,
  Calendar,
  ArrowUpRight,
  Utensils,
  Clock,
  RefreshCw,
} from 'lucide-react'

const weeklyData = [
  { day: 'Пн', views: 85, unique: 62 },
  { day: 'Вт', views: 120, unique: 89 },
  { day: 'Ср', views: 95, unique: 71 },
  { day: 'Чт', views: 142, unique: 108 },
  { day: 'Пт', views: 168, unique: 124 },
  { day: 'Сб', views: 220, unique: 165 },
  { day: 'Вс', views: 195, unique: 147 },
]

const monthlyData = [
  { day: '1', views: 45 }, { day: '5', views: 78 }, { day: '10', views: 92 },
  { day: '15', views: 110 }, { day: '20', views: 135 }, { day: '25', views: 158 }, { day: '30', views: 142 },
]

const langStats = [
  { lang: '🇷🇺 Русский', count: 485, pct: 42 },
  { lang: '🇦🇲 Армянский', count: 320, pct: 28 },
  { lang: '🇬🇧 English', count: 196, pct: 17 },
  { lang: '🇸🇦 Arabic', count: 92, pct: 8 },
  { lang: '🇫🇷 Français', count: 57, pct: 5 },
]

const topDishes = [
  { name: 'Хоровац из баранины', views: 342, orders: 89, emoji: '🥩' },
  { name: 'Греческий салат', views: 287, orders: 72, emoji: '🥗' },
  { name: 'Долма', views: 265, orders: 68, emoji: '🫑' },
  { name: 'Армянское вино', views: 198, orders: 54, emoji: '🍷' },
  { name: 'Лаваш с сырами', views: 176, orders: 47, emoji: '🫓' },
]

const hourlyData = [
  { hour: '10', value: 12 }, { hour: '11', value: 18 }, { hour: '12', value: 45 },
  { hour: '13', value: 78 }, { hour: '14', value: 65 }, { hour: '15', value: 52 },
  { hour: '16', value: 38 }, { hour: '17', value: 42 }, { hour: '18', value: 58 },
  { hour: '19', value: 87 }, { hour: '20', value: 92 }, { hour: '21', value: 74 },
  { hour: '22', value: 45 }, { hour: '23', value: 22 },
]

// SVG Bar Chart component
function BarChart({
  data,
  height = 120,
  color = '#f59e0b',
  showSecondary = false,
}: {
  data: { day: string; views: number; unique?: number }[]
  height?: number
  color?: string
  showSecondary?: boolean
}) {
  const maxVal = Math.max(...data.map(d => d.views))
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className="relative">
      <svg
        width="100%"
        height={height + 24}
        viewBox={`0 0 ${data.length * 40} ${height + 24}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((d, i) => {
          const barH = (d.views / maxVal) * height
          const x = i * 40 + 4
          const y = height - barH
          const isHovered = hoveredIdx === i
          const secH = d.unique ? (d.unique / maxVal) * height : 0

          return (
            <g key={i}>
              {/* Secondary bar */}
              {showSecondary && d.unique && (
                <rect
                  x={x}
                  y={height - secH}
                  width={14}
                  height={secH}
                  fill="#ddd6fe"
                  rx={3}
                />
              )}
              {/* Main bar */}
              <rect
                x={showSecondary ? x + 17 : x + 4}
                y={y}
                width={showSecondary ? 14 : 24}
                height={barH}
                fill={isHovered ? '#d97706' : color}
                rx={3}
                style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect x={x - 2} y={y - 24} width={44} height={20} fill="#1f2937" rx={4} />
                  <text x={x + 20} y={y - 10} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">
                    {d.views}
                  </text>
                </g>
              )}
              {/* Label */}
              <text
                x={x + 16}
                y={height + 16}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={9}
              >
                {d.day}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Line Chart component
function LineChart({ data, height = 100 }: { data: { hour: string; value: number }[], height?: number }) {
  const maxVal = Math.max(...data.map(d => d.value))
  const w = 400
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * w,
    y: height - (d.value / maxVal) * height,
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaD = `${pathD} L${w},${height} L0,${height} Z`

  return (
    <svg width="100%" height={height + 24} viewBox={`0 0 ${w} ${height + 24}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#f59e0b" />
      ))}
      {data.map((d, i) => {
        if (i % 3 !== 0) return null
        return (
          <text key={i} x={points[i].x} y={height + 16} textAnchor="middle" fill="#9ca3af" fontSize={8}>
            {d.hour}:00
          </text>
        )
      })}
    </svg>
  )
}

// Donut chart for device split
function DonutChart({ mobile, desktop }: { mobile: number; desktop: number }) {
  const total = mobile + desktop
  const mPct = (mobile / total) * 100
  const circumference = 2 * Math.PI * 30
  const mDash = (mPct / 100) * circumference

  return (
    <div className="flex items-center gap-4">
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle cx={40} cy={40} r={30} fill="none" stroke="#e5e7eb" strokeWidth={10} />
        <circle
          cx={40} cy={40} r={30}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={10}
          strokeDasharray={`${mDash} ${circumference - mDash}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text x={40} y={36} textAnchor="middle" fill="#1f2937" fontSize={12} fontWeight="700">{Math.round(mPct)}%</text>
        <text x={40} y={50} textAnchor="middle" fill="#9ca3af" fontSize={8}>mobile</text>
      </svg>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
          <span className="text-gray-700">📱 Mobile — {Math.round(mPct)}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />
          <span className="text-gray-700">🖥 Desktop — {100 - Math.round(mPct)}%</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const chartData = period === 'week' ? weeklyData : monthlyData.map(d => ({ ...d, unique: Math.round(d.views * 0.74) }))

  const totalViews = weeklyData.reduce((s, d) => s + d.views, 0)
  const avgPerDay = Math.round(totalViews / 7)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-gray-500 mt-1">Ресторан Арарат · Данные за последние 7 дней</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['week', 'month'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 h-9 text-sm font-medium transition-colors ${
                  period === p ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p === 'week' ? 'Неделя' : 'Месяц'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Просмотров за неделю', value: totalViews.toLocaleString(), change: '+18%', positive: true, icon: Eye, color: 'text-blue-500 bg-blue-50' },
          { label: 'Среднее в день', value: avgPerDay.toString(), change: '+12%', positive: true, icon: BarChart2, color: 'text-amber-500 bg-amber-50' },
          { label: 'Уникальных гостей', value: '766', change: '+9%', positive: true, icon: Users, color: 'text-green-500 bg-green-50' },
          { label: 'Топ-блюдо просмотров', value: '342', change: 'Хоровац', positive: true, icon: Utensils, color: 'text-purple-500 bg-purple-50' },
        ].map(s => (
          <Card key={s.label} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${s.positive ? 'text-green-600' : 'text-red-500'}`}>
                {s.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {s.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2 border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Просмотры меню</CardTitle>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-2 bg-violet-200 rounded inline-block" /> Уникальные</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 bg-amber-400 rounded inline-block" /> Всего</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <BarChart data={chartData} height={140} showSecondary={true} />
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Устройства</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart mobile={78} desktop={22} />
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {[
                { label: 'iOS', value: '58%', bar: 58 },
                { label: 'Android', value: '34%', bar: 34 },
                { label: 'Desktop', value: '8%', bar: 8 },
              ].map(d => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{d.label}</span><span>{d.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${d.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly traffic */}
        <Card className="lg:col-span-2 border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Активность по времени</CardTitle>
              <Badge className="text-xs bg-amber-100 text-amber-700">🔥 Пик 20:00–21:00</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <LineChart data={hourlyData} height={100} />
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Самое активное время: <strong className="text-gray-800">19:00 – 21:00</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              Языки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {langStats.map(l => (
              <div key={l.lang}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{l.lang}</span>
                  <span className="text-gray-500 text-xs">{l.count} ({l.pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                    style={{ width: `${l.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top dishes */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Топ-5 блюд по просмотрам
            <Badge className="text-xs bg-green-100 text-green-700 ml-auto">Pro plan</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDishes.map((dish, i) => {
              const maxViews = topDishes[0].views
              return (
                <div key={dish.name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-xl">{dish.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{dish.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span><Eye className="w-3 h-3 inline mr-0.5" />{dish.views}</span>
                        <span className="text-green-600 font-medium">
                          <ArrowUpRight className="w-3 h-3 inline" />{dish.orders} заказ
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                        style={{ width: `${(dish.views / maxViews) * 100}%`, transition: 'width 0.5s' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pro upgrade hint */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="text-2xl">📊</div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Хотите больше аналитики?</p>
          <p className="text-sm text-amber-700 mt-0.5">
            В Premium плане: тепловые карты активности, сравнение по периодам, экспорт в CSV/Excel и анализ конверсий.
          </p>
        </div>
        <Button className="ml-auto shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 px-3">
          Обновить план
        </Button>
      </div>
    </div>
  )
}
