import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Eye,
  UtensilsCrossed,
  BookOpen,
  Table2,
  TrendingUp,
  Plus,
  ExternalLink,
  Smartphone,
  Globe,
  Wifi,
  ArrowUpRight,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

const stats = [
  {
    label: 'Просмотры сегодня',
    value: '142',
    change: '+12%',
    positive: true,
    icon: Eye,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    label: 'Блюд в меню',
    value: '47',
    change: '3 добавлено',
    positive: true,
    icon: UtensilsCrossed,
    color: 'text-amber-500 bg-amber-50',
  },
  {
    label: 'Активных меню',
    value: '2',
    change: 'из 3 доступных',
    positive: true,
    icon: BookOpen,
    color: 'text-green-500 bg-green-50',
  },
  {
    label: 'NFC-столиков',
    value: '8',
    change: '6 активных',
    positive: true,
    icon: Table2,
    color: 'text-purple-500 bg-purple-50',
  },
]

const recentViews = [
  { time: '14:32', device: 'mobile', lang: 'RU', table: 'Столик 5' },
  { time: '14:28', device: 'mobile', lang: 'EN', table: 'Столик 2' },
  { time: '14:15', device: 'mobile', lang: 'HY', table: 'Столик 8' },
  { time: '13:55', device: 'desktop', lang: 'RU', table: 'QR-код' },
  { time: '13:42', device: 'mobile', lang: 'AR', table: 'Столик 3' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Добрый день, Арам! 👋</h1>
          <p className="text-gray-500 mt-1">Ресторан Арарат · araratrest.tapmenu.am</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/menu/araratrest" target="_blank" className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors">
              <ExternalLink className="w-4 h-4" />
              Открыть меню
          </Link>
          <Link href="/dashboard/dishes?action=new" className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            Добавить блюдо
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Последние просмотры</CardTitle>
                <Link href="/dashboard/analytics" className="text-sm text-amber-500 hover:underline flex items-center gap-1">
                  Все <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentViews.map((view, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                    <div className="text-xs text-gray-400 font-mono w-10">{view.time}</div>
                    <div className="flex items-center gap-1 text-gray-500">
                      {view.device === 'mobile' ? (
                        <Smartphone className="w-3.5 h-3.5" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 text-sm text-gray-700">{view.table}</div>
                    <Badge variant="outline" className="text-xs">{view.lang}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/dashboard/dishes?action=new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Plus className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Добавить блюдо</div>
                  <div className="text-xs text-gray-500">В библиотеку ресторана</div>
                </div>
              </Link>
              <Link
                href="/dashboard/menus"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Управление меню</div>
                  <div className="text-xs text-gray-500">Категории и блюда</div>
                </div>
              </Link>
              <Link
                href="/dashboard/tables"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Table2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">NFC-столики</div>
                  <div className="text-xs text-gray-500">Генерация QR-кодов</div>
                </div>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Wifi className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Wi-Fi для гостей</div>
                  <div className="text-xs text-gray-500">Настроить QR-код</div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Plan info */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Pro план</span>
              </div>
              <div className="text-xs text-amber-700 space-y-1">
                <div>Блюд: 47 / 100</div>
                <div>Меню: 2 / 3</div>
                <div>Языки: 4 / 5</div>
                <div className="pt-2">
                  <div className="h-1.5 bg-amber-200 rounded-full">
                    <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: '47%' }}></div>
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3" variant="outline">
                Улучшить план
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
