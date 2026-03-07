import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Flame,
  Leaf,
  Wheat,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Блюда' }

const dishes = [
  {
    id: '1',
    name: 'Греческий салат',
    price: 2500,
    category: 'Салаты',
    image: '🥗',
    status: 'active',
    isVegan: true,
    isGlutenFree: true,
    spicyLevel: 0,
    translations: ['EN', 'HY', 'AR'],
  },
  {
    id: '2',
    name: 'Хоровац из ягнёнка',
    price: 4800,
    category: 'Горячее',
    image: '🍖',
    status: 'active',
    isVegan: false,
    isGlutenFree: true,
    spicyLevel: 1,
    translations: ['EN', 'HY', 'FR'],
  },
  {
    id: '3',
    name: 'Долма с мясом',
    price: 3200,
    category: 'Горячее',
    image: '🫑',
    status: 'active',
    isVegan: false,
    isGlutenFree: false,
    spicyLevel: 0,
    translations: ['EN', 'HY'],
  },
  {
    id: '4',
    name: 'Лаваш армянский',
    price: 500,
    category: 'Хлеб',
    image: '🫓',
    status: 'active',
    isVegan: true,
    isGlutenFree: false,
    spicyLevel: 0,
    translations: ['EN', 'HY', 'AR', 'FR'],
  },
  {
    id: '5',
    name: 'Армянское вино Араратское',
    price: 1800,
    category: 'Напитки',
    image: '🍷',
    status: 'inactive',
    isVegan: true,
    isGlutenFree: true,
    spicyLevel: 0,
    translations: ['EN'],
  },
]

export default function DishesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Библиотека блюд</h1>
          <p className="text-gray-500 mt-1">47 блюд · 5 категорий</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Добавить блюдо
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4" />
          Фильтры
        </Button>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">Все категории</option>
          <option value="salads">Салаты</option>
          <option value="hot">Горячее</option>
          <option value="drinks">Напитки</option>
          <option value="desserts">Десерты</option>
        </select>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button className="px-3 py-2 bg-amber-50 text-amber-600 text-sm font-medium">Активные</button>
          <button className="px-3 py-2 text-gray-500 text-sm hover:bg-gray-50">Все</button>
          <button className="px-3 py-2 text-gray-500 text-sm hover:bg-gray-50">Архив</button>
        </div>
      </div>

      {/* Dishes list */}
      <div className="space-y-3">
        {dishes.map((dish) => (
          <Card key={dish.id} hover>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {/* Image/emoji */}
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {dish.image}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">{dish.category}</span>
                        {/* Tags */}
                        {dish.isVegan && (
                          <span title="Веганское" className="flex items-center gap-1 text-xs text-green-600">
                            <Leaf className="w-3 h-3" />
                            Vegan
                          </span>
                        )}
                        {dish.isGlutenFree && (
                          <span title="Без глютена" className="flex items-center gap-1 text-xs text-blue-600">
                            <Wheat className="w-3 h-3" />
                            GF
                          </span>
                        )}
                        {dish.spicyLevel > 0 && (
                          <span className="flex items-center gap-1 text-xs text-red-500">
                            {'🌶'.repeat(dish.spicyLevel)}
                          </span>
                        )}
                      </div>
                      {/* Translations */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {dish.translations.map((lang) => (
                          <span key={lang} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            {lang}
                          </span>
                        ))}
                        <button className="text-xs px-1.5 py-0.5 border border-dashed border-gray-300 text-gray-400 rounded hover:border-amber-400 hover:text-amber-500 transition-colors">
                          + Перевод
                        </button>
                      </div>
                    </div>

                    {/* Price & status */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-gray-900">
                        {dish.price.toLocaleString('ru-AM')} ֏
                      </div>
                      <Badge variant={dish.status === 'active' ? 'success' : 'warning'} className="mt-1">
                        {dish.status === 'active' ? 'Активно' : 'Скрыто'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    title="Редактировать"
                    className="p-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-gray-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title={dish.status === 'active' ? 'Скрыть' : 'Показать'}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    {dish.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    title="Дублировать"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    title="Удалить"
                    className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state placeholder */}
      <div className="text-center py-8 text-sm text-gray-400">
        Показано 5 из 47 блюд
      </div>
    </div>
  )
}
