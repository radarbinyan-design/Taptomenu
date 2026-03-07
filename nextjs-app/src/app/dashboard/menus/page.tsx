import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Plus,
  BookOpen,
  Globe,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Settings,
  ExternalLink,
  Check,
  Star,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Меню' }

const menus = [
  {
    id: '1',
    name: 'Основное меню',
    status: 'active',
    isDefault: true,
    categories: 4,
    dishes: 47,
    languages: ['RU', 'EN', 'HY', 'AR'],
    updatedAt: '2 часа назад',
  },
  {
    id: '2',
    name: 'Бизнес-ланч',
    status: 'active',
    isDefault: false,
    categories: 2,
    dishes: 12,
    languages: ['RU', 'EN'],
    updatedAt: '3 дня назад',
  },
  {
    id: '3',
    name: 'Барное меню',
    status: 'draft',
    isDefault: false,
    categories: 3,
    dishes: 24,
    languages: ['RU'],
    updatedAt: '1 неделя назад',
  },
]

export default function MenusPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Меню</h1>
          <p className="text-gray-500 mt-1">Управление меню ресторана · Pro план: 2/3 меню</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Создать меню
        </Button>
      </div>

      {/* Plan limit bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
        <BookOpen className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-amber-800 font-medium">Использовано меню</span>
            <span className="text-amber-600">2 / 3</span>
          </div>
          <div className="h-2 bg-amber-200 rounded-full">
            <div className="h-2 bg-amber-500 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>
        <Link href="/dashboard/settings" className="text-xs text-amber-600 hover:underline whitespace-nowrap">
          Улучшить план →
        </Link>
      </div>

      {/* Menus grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <Card key={menu.id} className="relative">
            {menu.isDefault && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                  <Star className="w-3 h-3" />
                  По умолчанию
                </span>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <h3 className="font-semibold text-gray-900 truncate">{menu.name}</h3>
                  <Badge
                    variant={menu.status === 'active' ? 'success' : 'warning'}
                    className="mt-1"
                  >
                    {menu.status === 'active' ? 'Активно' : 'Черновик'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{menu.categories}</div>
                  <div className="text-xs text-gray-500">Категории</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{menu.dishes}</div>
                  <div className="text-xs text-gray-500">Блюда</div>
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-center gap-1 mb-3 flex-wrap">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {menu.languages.map((lang) => (
                  <span key={lang} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                    {lang}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-4">Обновлено: {menu.updatedAt}</p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                  Редактировать
                </button>
                <Link
                  href={`/menu/araratrest`}
                  target="_blank"
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                  title="Открыть меню"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                  title={menu.status === 'active' ? 'Скрыть' : 'Опубликовать'}
                >
                  {menu.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add new menu card */}
        <button className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-amber-400 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-amber-600 min-h-48">
          <Plus className="w-8 h-8" />
          <span className="text-sm font-medium">Создать новое меню</span>
        </button>
      </div>
    </div>
  )
}
