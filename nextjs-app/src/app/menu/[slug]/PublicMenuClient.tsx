'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, DollarSign, Wifi, ChevronUp, Leaf, Flame } from 'lucide-react'
import { SUPPORTED_LANGUAGES, CURRENCIES } from '@/types'
import { formatPrice, getExchangeRates } from '@/lib/currency'

interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string | null
  coverUrl?: string | null
  primaryColor: string
  templateId: string
  wifiName?: string | null
  menus: Array<{
    id: string
    name: string
    languages: string[]
    categories: Array<{
      id: string
      name: string
      nameTranslations?: Record<string, string> | null
      emoji?: string | null
      menuDishes: Array<{
        id: string
        isAvailable: boolean
        specialPrice?: number | null
        dish: {
          id: string
          name: string
          nameTranslations?: Record<string, string> | null
          description?: string | null
          descriptionTranslations?: Record<string, string> | null
          price: number
          imageUrl?: string | null
          calories?: number | null
          weight?: number | null
          isVegan: boolean
          isGlutenFree: boolean
          spicyLevel: number
          allergens: string[]
          tags: string[]
        } | null
      }>
    }>
  }>
  tables: Array<{ id: string; name: string }>
}

interface Props {
  restaurant: Restaurant
  initialLang: string
  initialCurrency: string
  tableId?: string
}

export default function PublicMenuClient({ restaurant, initialLang, initialCurrency, tableId }: Props) {
  const [lang, setLang] = useState(initialLang)
  const [currency, setCurrency] = useState(initialCurrency)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [rates, setRates] = useState<Record<string, number>>({ AMD: 1, USD: 390, EUR: 420, RUB: 4.3, GBP: 490 })
  const [showLangPicker, setShowLangPicker] = useState(false)

  const menu = restaurant.menus[0]

  // Load exchange rates
  useEffect(() => {
    fetch('/api/exchange-rates')
      .then((r) => r.json())
      .then((data) => data.rates && setRates(data.rates))
      .catch(() => {}) // Use fallback rates
  }, [])

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (l) => menu?.languages?.includes(l.code)
  )

  function getTranslation(
    text: string,
    translations: Record<string, string> | null | undefined
  ): string {
    if (lang === 'ru') return text
    return translations?.[lang] || text
  }

  function getPrice(dish: { price: number; specialPrice?: number | null }): string {
    const priceAMD = dish.specialPrice || dish.price
    if (currency === 'AMD') return `${priceAMD.toLocaleString('ru-AM')} ֏`
    const rate = rates[currency] || 1
    const converted = Math.round((priceAMD / rate) * 100) / 100
    const symbols: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽', GBP: '£' }
    return `${symbols[currency] || currency}${converted.toFixed(2)}`
  }

  const filteredCategories = useMemo(() => {
    if (!menu) return []
    return menu.categories
      .map((cat) => ({
        ...cat,
        menuDishes: cat.menuDishes.filter((md) => {
          if (!md.dish || !md.isAvailable) return false
          if (!search) return true
          const name = getTranslation(md.dish.name, md.dish.nameTranslations).toLowerCase()
          return name.includes(search.toLowerCase())
        }),
      }))
      .filter((cat) => cat.menuDishes.length > 0)
  }, [menu, search, lang])

  const primaryColor = restaurant.primaryColor || '#F59E0B'

  if (!menu) {
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
      <div
        className="sticky top-0 z-40 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Restaurant name */}
            <div className="flex items-center gap-3">
              {restaurant.logoUrl ? (
                <img src={restaurant.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <h1 className="text-white font-bold text-sm truncate max-w-36">{restaurant.name}</h1>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Currency */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="text-xs bg-white/20 text-white border-none rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="text-gray-900 bg-white">
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>

              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  className="flex items-center gap-1 text-xs bg-white/20 text-white rounded-lg px-2 py-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang.toUpperCase()}
                </button>
                {showLangPicker && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-36 z-50">
                    {availableLanguages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setShowLangPicker(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors ${lang === l.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-gray-700'}`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск блюда..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': primaryColor } as any}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-14 z-30 bg-gray-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            <button
              onClick={() => {
                setActiveCategory(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Все
            </button>
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'text-white'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: primaryColor } : {}}
              >
                {cat.emoji} {getTranslation(cat.name, cat.nameTranslations)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-8">
        {filteredCategories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {cat.emoji && <span>{cat.emoji}</span>}
              {getTranslation(cat.name, cat.nameTranslations)}
              <span className="text-sm font-normal text-gray-400">({cat.menuDishes.length})</span>
            </h2>

            <div className="space-y-3">
              {cat.menuDishes.map((md) => {
                if (!md.dish) return null
                const dish = md.dish
                return (
                  <motion.div
                    key={md.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="flex gap-3 p-4">
                      {/* Image */}
                      {dish.imageUrl ? (
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                          🍽️
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                            {getTranslation(dish.name, dish.nameTranslations)}
                          </h3>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-sm" style={{ color: primaryColor }}>
                              {getPrice({ price: dish.price, specialPrice: md.specialPrice })}
                            </div>
                            {md.specialPrice && (
                              <div className="text-xs text-gray-400 line-through">
                                {getPrice({ price: dish.price })}
                              </div>
                            )}
                          </div>
                        </div>

                        {dish.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {getTranslation(dish.description, dish.descriptionTranslations)}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {dish.weight && (
                            <span className="text-xs text-gray-400">{dish.weight}г</span>
                          )}
                          {dish.calories && (
                            <span className="text-xs text-gray-400">{dish.calories} ккал</span>
                          )}
                          {dish.isVegan && (
                            <span className="flex items-center gap-0.5 text-xs text-green-600">
                              <Leaf className="w-3 h-3" /> Vegan
                            </span>
                          )}
                          {dish.spicyLevel > 0 && (
                            <span className="text-xs text-red-500">
                              {'🌶'.repeat(dish.spicyLevel)}
                            </span>
                          )}
                          {dish.isGlutenFree && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">GF</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        ))}

        {/* Wi-Fi block */}
        {restaurant.wifiName && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Wifi className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">Wi-Fi для гостей</div>
                <div className="text-xs text-gray-500 font-mono">{restaurant.wifiName}</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">Ничего не найдено</p>
          </div>
        )}
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Click outside lang picker */}
      {showLangPicker && (
        <div className="fixed inset-0 z-30" onClick={() => setShowLangPicker(false)} />
      )}
    </div>
  )
}
