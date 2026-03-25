'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Globe, X, ChevronUp, Check } from 'lucide-react'
import type { GeneratedMenuData, GeneratedCategory, GeneratedDish } from '@/types'

type Lang = 'ru' | 'en' | 'hy'
const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hy', label: 'Հայերեն', flag: '🇦🇲' },
]

function formatAMD(amount: number): string {
  return new Intl.NumberFormat('hy-AM', { minimumFractionDigits: 0 }).format(amount) + ' ֏'
}

interface Props {
  params: { slug: string }
  searchParams: { lang?: string; table?: string }
}

export default function PublicMenuPage({ params, searchParams }: Props) {
  const [lang, setLang] = useState<Lang>((searchParams.lang as Lang) || 'en')
  const [menuData, setMenuData] = useState<GeneratedMenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [selectedDish, setSelectedDish] = useState<GeneratedDish | null>(null)
  const table = searchParams.table || ''

  // Load menu data
  useEffect(() => {
    fetch(`/api/public/menu/${params.slug}?lang=${lang}${table ? `&table=${table}` : ''}`)
      .then(r => r.json())
      .then(data => setMenuData(data.menu))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.slug, lang, table])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getText = (obj: { ru: string; en: string; hy: string } | undefined): string => {
    if (!obj) return ''
    return obj[lang] || obj.ru || obj.en || ''
  }

  const filteredCategories = useMemo(() => {
    if (!menuData) return []
    return menuData.categories
      .map(cat => ({
        ...cat,
        dishes: cat.dishes.filter(d => {
          if (!search) return true
          const name = getText(d.name).toLowerCase()
          const desc = getText(d.description).toLowerCase()
          return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase())
        }),
      }))
      .filter(cat => cat.dishes.length > 0)
  }, [menuData, search, lang])

  const primaryColor = menuData?.colorPalette?.primary || '#7C3AED'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍽️</div>
          <p className="text-gray-500">Загрузка меню...</p>
        </div>
      </div>
    )
  }

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold text-gray-800">Меню не найдено</h2>
          <p className="text-gray-500 mt-2">Это меню ещё не опубликовано</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center text-white font-bold">
                R
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">
                  {lang === 'ru' ? 'Мой Ресторан' : lang === 'hy' ? 'Իմ Ռեստորանը' : 'My Restaurant'}
                </h1>
                {table && (
                  <p className="text-white/70 text-xs">
                    {lang === 'ru' ? `Столик ${table}` : `Table ${table}`}
                  </p>
                )}
              </div>
            </div>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="flex items-center gap-1 text-xs bg-white/20 text-white rounded-lg px-2.5 py-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                {LANGS.find(l => l.code === lang)?.flag} {lang.toUpperCase()}
              </button>
              {showLangPicker && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowLangPicker(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-40 z-50">
                    {LANGS.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setShowLangPicker(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          lang === l.code ? 'bg-violet-50 text-violet-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                        {lang === l.code && <Check className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ru' ? 'Поиск блюда...' : lang === 'hy' ? 'Օրոնել ուտեստ...' : 'Search dishes...'}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-14 z-30 bg-gray-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2.5">
            <button
              onClick={() => { setActiveCategory(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === null ? 'text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
              }`}
              style={activeCategory === null ? { backgroundColor: primaryColor } : {}}
            >
              {lang === 'ru' ? 'Все' : lang === 'hy' ? 'Բոլորը' : 'All'}
            </button>
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  document.getElementById(`pub-cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id ? 'text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: primaryColor } : {}}
              >
                {cat.emoji} {getText(cat.name)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-8">
        {filteredCategories.map(cat => (
          <section key={cat.id} id={`pub-cat-${cat.id}`}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {cat.emoji && <span className="text-2xl">{cat.emoji}</span>}
                {getText(cat.name)}
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {cat.dishes.length}
              </span>
            </div>

            <div className="space-y-3">
              {cat.dishes.map(dish => (
                <div
                  key={dish.id}
                  onClick={() => setSelectedDish(dish)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-3 p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt={getText(dish.name)} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{getText(dish.name)}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{getText(dish.description)}</p>
                      <div className="font-bold text-base mt-2" style={{ color: primaryColor }}>
                        {formatAMD(dish.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-700 font-medium">
              {lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}
            </p>
            <button onClick={() => setSearch('')} className="mt-3 text-sm text-violet-500 hover:text-violet-600 font-medium">
              {lang === 'ru' ? 'Очистить поиск' : 'Clear search'}
            </button>
          </div>
        )}

        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-400">Powered by</p>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">TapToMenu 🇦🇲</p>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-4 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white z-40"
          style={{ backgroundColor: primaryColor }}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Dish detail modal */}
      {selectedDish && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setSelectedDish(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="sticky top-0 bg-white/90 backdrop-blur flex justify-end p-3 rounded-t-3xl">
              <button onClick={() => setSelectedDish(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-5 pb-8">
              {selectedDish.imageUrl ? (
                <img src={selectedDish.imageUrl} alt="" className="w-full h-48 object-cover rounded-2xl mb-4" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl flex items-center justify-center text-7xl mb-4">
                  🍽️
                </div>
              )}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-xl font-bold text-gray-900 flex-1">{getText(selectedDish.name)}</h2>
                <div className="text-xl font-bold" style={{ color: primaryColor }}>
                  {formatAMD(selectedDish.price)}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{getText(selectedDish.description)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
