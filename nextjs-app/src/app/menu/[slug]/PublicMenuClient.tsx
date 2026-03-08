'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Globe,
  Wifi,
  ChevronUp,
  Leaf,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  Flame,
  Scale,
  AlertTriangle,
  Star,
  MessageSquare,
  Send,
  Heart,
} from 'lucide-react'
import { SUPPORTED_LANGUAGES, CURRENCIES } from '@/types'
import { formatPrice, getExchangeRates } from '@/lib/currency'

interface Dish {
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
}

interface MenuDish {
  id: string
  isAvailable: boolean
  specialPrice?: number | null
  dish: Dish | null
}

interface Category {
  id: string
  name: string
  nameTranslations?: Record<string, string> | null
  emoji?: string | null
  menuDishes: MenuDish[]
}

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
    categories: Category[]
  }>
  tables: Array<{ id: string; name: string }>
}

interface CartItem {
  dishId: string
  menuDishId: string
  name: string
  emoji: string
  price: number
  qty: number
  comment?: string
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

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  // Dish detail modal
  const [selectedDish, setSelectedDish] = useState<{ dish: Dish; md: MenuDish } | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const menu = restaurant.menus[0]
  const primaryColor = restaurant.primaryColor || '#F59E0B'

  // Load exchange rates
  useEffect(() => {
    fetch('/api/exchange-rates')
      .then(r => r.json())
      .then(data => data.rates && setRates(data.rates))
      .catch(() => {})
  }, [])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const availableLanguages = SUPPORTED_LANGUAGES.filter(l => menu?.languages?.includes(l.code))

  function getTranslation(text: string, translations?: Record<string, string> | null): string {
    if (lang === 'ru') return text
    return translations?.[lang] || text
  }

  function getPriceAMD(dish: Dish, specialPrice?: number | null): number {
    return specialPrice || dish.price
  }

  function formatDisplayPrice(amdPrice: number): string {
    if (currency === 'AMD') return `${amdPrice.toLocaleString('ru-AM')} ֏`
    const rate = rates[currency] || 1
    const converted = Math.round((amdPrice / rate) * 100) / 100
    const symbols: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽', GBP: '£' }
    return `${symbols[currency] || currency}${converted.toFixed(2)}`
  }

  const filteredCategories = useMemo(() => {
    if (!menu) return []
    return menu.categories
      .map(cat => ({
        ...cat,
        menuDishes: cat.menuDishes.filter(md => {
          if (!md.dish || !md.isAvailable) return false
          if (!search) return true
          const name = getTranslation(md.dish.name, md.dish.nameTranslations).toLowerCase()
          const desc = getTranslation(md.dish.description || '', md.dish.descriptionTranslations).toLowerCase()
          const q = search.toLowerCase()
          return name.includes(q) || desc.includes(q)
        }),
      }))
      .filter(cat => cat.menuDishes.length > 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, search, lang])

  // Cart helpers
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const addToCart = (dish: Dish, md: MenuDish) => {
    const priceAMD = getPriceAMD(dish, md.specialPrice)
    setCart(prev => {
      const existing = prev.find(i => i.menuDishId === md.id)
      if (existing) {
        return prev.map(i => i.menuDishId === md.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, {
        dishId: dish.id,
        menuDishId: md.id,
        name: getTranslation(dish.name, dish.nameTranslations),
        emoji: '🍽',
        price: priceAMD,
        qty: 1,
      }]
    })
  }

  const updateQty = (menuDishId: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.menuDishId === menuDishId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    )
  }

  const getCartQty = (menuDishId: string) => cart.find(i => i.menuDishId === menuDishId)?.qty || 0

  const sendOrder = () => {
    setOrderSent(true)
    setTimeout(() => {
      setOrderSent(false)
      setCart([])
      setShowCart(false)
    }, 3000)
  }

  const toggleFavorite = (dishId: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(dishId)) next.delete(dishId)
      else next.add(dishId)
      return next
    })
  }

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
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {restaurant.logoUrl ? (
                <img src={restaurant.logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/30" />
              ) : (
                <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center text-white font-bold">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">{restaurant.name}</h1>
                {tableId && (
                  <p className="text-white/70 text-xs">
                    {restaurant.tables.find(t => t.id === tableId)?.name || `Столик ${tableId}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Currency */}
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="text-xs bg-white/20 text-white border-none rounded-lg px-2 py-1.5 focus:outline-none"
              >
                {CURRENCIES.map(c => (
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
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-40 z-50">
                    {availableLanguages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setShowLangPicker(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${lang === l.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                        {lang === l.code && <Check className="w-3.5 h-3.5 ml-auto" />}
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
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск блюда..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
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
          <div className="flex gap-2 overflow-x-auto py-2.5 scrollbar-hide">
            <button
              onClick={() => { setActiveCategory(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === null ? 'text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
              style={activeCategory === null ? { backgroundColor: primaryColor } : {}}
            >
              Все
            </button>
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id ? 'text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
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
        {filteredCategories.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {cat.emoji && <span className="text-2xl">{cat.emoji}</span>}
                {getTranslation(cat.name, cat.nameTranslations)}
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {cat.menuDishes.length}
              </span>
            </div>

            <div className="space-y-3">
              {cat.menuDishes.map(md => {
                if (!md.dish) return null
                const dish = md.dish
                const qty = getCartQty(md.id)
                const isFav = favorites.has(dish.id)
                const priceAMD = getPriceAMD(dish, md.specialPrice)

                return (
                  <motion.div
                    key={md.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3 p-4">
                      {/* Image / Emoji */}
                      <button
                        onClick={() => setSelectedDish({ dish, md })}
                        className="relative flex-shrink-0"
                      >
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-20 h-20 rounded-xl object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-4xl">
                            🍽️
                          </div>
                        )}
                        {md.specialPrice && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            SALE
                          </span>
                        )}
                        {dish.tags?.includes('#хит') && !md.specialPrice && (
                          <span className="absolute -top-1 -left-1 text-sm">🔥</span>
                        )}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <button
                            onClick={() => setSelectedDish({ dish, md })}
                            className="text-left"
                          >
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                              {getTranslation(dish.name, dish.nameTranslations)}
                            </h3>
                          </button>
                          <button onClick={() => toggleFavorite(dish.id)} className="shrink-0 ml-1">
                            <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-red-400 text-red-400' : 'text-gray-200'}`} />
                          </button>
                        </div>

                        {dish.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {getTranslation(dish.description, dish.descriptionTranslations)}
                          </p>
                        )}

                        {/* Meta badges */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {dish.weight && (
                            <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{dish.weight}г</span>
                          )}
                          {dish.calories && (
                            <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{dish.calories} ккал</span>
                          )}
                          {dish.isVegan && (
                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Leaf className="w-3 h-3" /> Vegan
                            </span>
                          )}
                          {dish.isGlutenFree && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">GF</span>
                          )}
                          {dish.spicyLevel > 0 && (
                            <span className="text-xs text-red-500">{'🌶'.repeat(dish.spicyLevel)}</span>
                          )}
                        </div>

                        {/* Price + Add to cart */}
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <div className="font-bold text-base" style={{ color: primaryColor }}>
                              {formatDisplayPrice(priceAMD)}
                            </div>
                            {md.specialPrice && (
                              <div className="text-xs text-gray-400 line-through">
                                {formatDisplayPrice(dish.price)}
                              </div>
                            )}
                          </div>

                          {qty === 0 ? (
                            <button
                              onClick={() => addToCart(dish, md)}
                              className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium text-white shadow-sm hover:shadow transition-shadow active:scale-95"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Plus className="w-4 h-4" />
                              В корзину
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                              <button
                                onClick={() => updateQty(md.id, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-700 hover:bg-gray-50 active:scale-95 transition-transform"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold text-gray-900">{qty}</span>
                              <button
                                onClick={() => updateQty(md.id, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-xl text-white shadow-sm active:scale-95 transition-transform"
                                style={{ backgroundColor: primaryColor }}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

        {/* Wi-Fi */}
        {restaurant.wifiName && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">Wi-Fi для гостей</p>
              <p className="text-xs text-gray-500 font-mono">{restaurant.wifiName}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-700 font-medium">Ничего не найдено</p>
            <p className="text-gray-400 text-sm mt-1">Попробуйте другой запрос</p>
            <button onClick={() => setSearch('')} className="mt-3 text-sm text-amber-500 hover:text-amber-600 font-medium">
              Очистить поиск
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-400">Powered by</p>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">TapMenu Armenia 🇦🇲</p>
        </div>
      </div>

      {/* Cart floating button */}
      <AnimatePresence>
        {cartCount > 0 && !showCart && (
          <motion.button
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white shadow-2xl z-40"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">Корзина · {cartCount} поз.</span>
            <span className="font-bold bg-white/20 px-2.5 py-1 rounded-xl text-sm">
              {formatDisplayPrice(cartTotal)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && cartCount === 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-4 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white z-40"
            style={{ backgroundColor: primaryColor }}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  🛒 Заказ{tableId ? ` · ${restaurant.tables.find(t => t.id === tableId)?.name || ''}` : ''}
                </h2>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Items */}
              {!orderSent ? (
                <>
                  <div className="overflow-y-auto flex-1 px-5 space-y-3">
                    {cart.map(item => (
                      <div key={item.menuDishId} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                          🍽️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatDisplayPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.menuDishId, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.menuDishId, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-xl text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-sm font-bold text-gray-900 w-16 text-right">
                          {formatDisplayPrice(item.price * item.qty)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total + confirm */}
                  <div className="px-5 pt-3 pb-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-semibold text-gray-700">Итого</span>
                      <span className="text-xl font-bold text-gray-900">{formatDisplayPrice(cartTotal)}</span>
                    </div>
                    <button
                      onClick={sendOrder}
                      className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Send className="w-5 h-5" />
                      Вызвать официанта
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Официант подойдёт и примет заказ
                    </p>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center px-5 pb-10"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Официант вызван!</h3>
                  <p className="text-gray-500 text-center text-sm">
                    Ваш заказ передан. Официант подойдёт к вам в ближайшее время.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DISH DETAIL MODAL */}
      <AnimatePresence>
        {selectedDish && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedDish(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur flex justify-end p-3 rounded-t-3xl">
                <button
                  onClick={() => setSelectedDish(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="px-5 pb-8">
                {/* Image */}
                {selectedDish.dish.imageUrl ? (
                  <img
                    src={selectedDish.dish.imageUrl}
                    alt={selectedDish.dish.name}
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center text-7xl mb-4">
                    🍽️
                  </div>
                )}

                {/* Name + price */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex-1">
                    {getTranslation(selectedDish.dish.name, selectedDish.dish.nameTranslations)}
                  </h2>
                  <div className="text-right">
                    <div className="text-xl font-bold" style={{ color: primaryColor }}>
                      {formatDisplayPrice(getPriceAMD(selectedDish.dish, selectedDish.md.specialPrice))}
                    </div>
                    {selectedDish.md.specialPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatDisplayPrice(selectedDish.dish.price)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedDish.dish.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {getTranslation(selectedDish.dish.description, selectedDish.dish.descriptionTranslations)}
                  </p>
                )}

                {/* Nutrition */}
                {(selectedDish.dish.weight || selectedDish.dish.calories) && (
                  <div className="flex gap-3 mb-4">
                    {selectedDish.dish.weight && (
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                        <Scale className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                        <p className="font-bold text-gray-900">{selectedDish.dish.weight}г</p>
                        <p className="text-xs text-gray-500">Вес</p>
                      </div>
                    )}
                    {selectedDish.dish.calories && (
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                        <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                        <p className="font-bold text-gray-900">{selectedDish.dish.calories}</p>
                        <p className="text-xs text-gray-500">ккал</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dietary badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDish.dish.isVegan && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-medium">
                      <Leaf className="w-3.5 h-3.5" /> Веган
                    </span>
                  )}
                  {selectedDish.dish.isGlutenFree && (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium">
                      Без глютена
                    </span>
                  )}
                  {selectedDish.dish.spicyLevel > 0 && (
                    <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                      {'🌶'.repeat(selectedDish.dish.spicyLevel)} Острое
                    </span>
                  )}
                </div>

                {/* Allergens */}
                {selectedDish.dish.allergens?.length > 0 && (
                  <div className="mb-5 bg-orange-50 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-orange-800 mb-1">Аллергены</p>
                      <p className="text-xs text-orange-700">{selectedDish.dish.allergens.join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Add to cart */}
                {getCartQty(selectedDish.md.id) === 0 ? (
                  <button
                    onClick={() => { addToCart(selectedDish.dish!, selectedDish.md); setSelectedDish(null) }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-5 h-5" />
                    Добавить в корзину · {formatDisplayPrice(getPriceAMD(selectedDish.dish, selectedDish.md.specialPrice))}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5 flex-1">
                      <button
                        onClick={() => updateQty(selectedDish.md.id, -1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center text-lg font-bold text-gray-900">
                        {getCartQty(selectedDish.md.id)}
                      </span>
                      <button
                        onClick={() => updateQty(selectedDish.md.id, 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => { setShowCart(true); setSelectedDish(null) }}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      В корзину
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlay close */}
      {showLangPicker && (
        <div className="fixed inset-0 z-30" onClick={() => setShowLangPicker(false)} />
      )}
    </div>
  )
}
