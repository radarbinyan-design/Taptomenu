'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import {
  Sparkles,
  Edit3,
  Table2,
  Settings,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Zap,
  Languages,
  Camera,
  Image as ImageIcon,
  UtensilsCrossed,
  BookOpen,
  Eye,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

function DashboardContent() {
  const searchParams = useSearchParams()
  const accessDenied = searchParams.get('access_denied') === '1'
  const [showDenied, setShowDenied] = useState(accessDenied)
  const restaurant = useAuthStore(s => s.restaurant)
  const [stats, setStats] = useState<{ dishes: number; menus: number; tables: number; views: number } | null>(null)

  useEffect(() => {
    if (accessDenied) {
      setTimeout(() => setShowDenied(false), 5000)
    }
  }, [accessDenied])

  // Load stats from real APIs when restaurant is available
  useEffect(() => {
    if (!restaurant?.id) return
    Promise.all([
      fetch(`/api/dishes?restaurantId=${restaurant.id}&limit=1`).then(r => r.ok ? r.json() : null),
      fetch(`/api/menus?restaurantId=${restaurant.id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/tables?restaurantId=${restaurant.id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/menu-views?restaurantId=${restaurant.id}&period=week`).then(r => r.ok ? r.json() : null),
    ]).then(([dishesRes, menusRes, tablesRes, viewsRes]) => {
      setStats({
        dishes: dishesRes?.total ?? 0,
        menus: menusRes?.menus?.length ?? 0,
        tables: tablesRes?.tables?.length ?? 0,
        views: viewsRes?.total ?? 0,
      })
    }).catch(() => { /* demo mode */ })
  }, [restaurant?.id])

  return (
    <div className="space-y-6">
      {/* Access denied toast */}
      {showDenied && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Доступ запрещён</p>
            <p className="text-xs text-red-600">У вас нет доступа к этому разделу. Доступные разделы: Меню, Столики, Настройки.</p>
          </div>
          <button onClick={() => setShowDenied(false)} className="text-red-400 hover:text-red-600 ml-auto">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">TapToMenu MVP</h1>
        <p className="text-gray-500 mt-1">AI-автоматизация ресторанных меню: от фото до QR за 15 минут</p>
      </div>

      {/* Hero card - main CTA */}
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-500" />
                Создайте цифровое меню за 15 минут
              </h2>
              <p className="text-gray-600 mb-4">
                Загрузите фото бумажного меню + логотип. AI распознает текст, переведёт на 3 языка
                и сгенерирует фотографии всех блюд.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { icon: Camera, text: 'OCR распознавание' },
                  { icon: Languages, text: 'RU / EN / HY перевод' },
                  { icon: ImageIcon, text: 'AI-фото блюд' },
                ].map(item => (
                  <span key={item.text} className="flex items-center gap-1.5 text-xs bg-white/80 text-violet-700 px-2.5 py-1 rounded-full">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.text}
                  </span>
                ))}
              </div>
              <Link
                href="/dashboard/menu-generator"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-4 h-4" />
                Начать генерацию
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-8xl">
              🍽️
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row — real data when available */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Блюд', value: stats.dishes, icon: UtensilsCrossed, color: 'bg-amber-50 text-amber-500' },
            { label: 'Меню', value: stats.menus, icon: BookOpen, color: 'bg-blue-50 text-blue-500' },
            { label: 'Столиков', value: stats.tables, icon: Table2, color: 'bg-green-50 text-green-500' },
            { label: 'Просмотров (7д)', value: stats.views, icon: Eye, color: 'bg-purple-50 text-purple-500' },
          ].map(s => (
            <Card key={s.label} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            href: '/dashboard/menu-generator',
            icon: Sparkles,
            title: 'AI Генерация',
            desc: 'Фото меню -> цифровое',
            color: 'bg-violet-50 text-violet-500',
            badge: 'NEW',
          },
          {
            href: '/dashboard/menu-editor',
            icon: Edit3,
            title: 'Редактор меню',
            desc: 'Правки и предпросмотр',
            color: 'bg-blue-50 text-blue-500',
          },
          {
            href: '/dashboard/tables',
            icon: Table2,
            title: 'QR-столики',
            desc: 'QR-коды для столиков',
            color: 'bg-green-50 text-green-500',
          },
          {
            href: '/dashboard/settings',
            icon: Settings,
            title: 'Настройки',
            desc: 'Логотип, языки, дизайн',
            color: 'bg-amber-50 text-amber-500',
          },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <Card hover className="h-full">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      {item.badge && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Flow diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Как работает TapToMenu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '1', emoji: '📸', title: 'Загрузите фото', desc: 'До 15 фотографий бумажного меню' },
              { step: '2', emoji: '🤖', title: 'AI обработка', desc: 'OCR + структурирование + перевод' },
              { step: '3', emoji: '🍽️', title: 'Фото блюд', desc: 'DALL-E генерирует фотографии' },
              { step: '4', emoji: '✏️', title: 'Редактирование', desc: 'Правки + live preview' },
              { step: '5', emoji: '📱', title: 'QR-меню', desc: 'Гость сканирует — видит меню' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-12 h-12 mx-auto mb-2 bg-violet-100 rounded-full flex items-center justify-center text-xl">
                  {item.emoji}
                </div>
                <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                {i < 4 && (
                  <div className="hidden sm:block absolute top-6 -right-2 text-gray-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {restaurant?.slug ? (
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Превью меню «{restaurant.name}»
          </Link>
        ) : (
          <Link
            href="/r/demo/menu?lang=en"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Превью гостевого меню
          </Link>
        )}
        <Link
          href="/menu/araratrest"
          target="_blank"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Демо-меню Арарат
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-5xl animate-bounce">🍽️</div></div>}>
      <DashboardContent />
    </Suspense>
  )
}
