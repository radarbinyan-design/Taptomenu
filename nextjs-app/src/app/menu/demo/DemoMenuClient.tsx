'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

// ─── Types ───────────────────────────────────────────────────────────────────

type LangCode = 'RU' | 'EN' | 'HY' | 'AR'
type CurrencyCode = 'AMD' | 'USD' | 'EUR' | 'RUB'

interface DishItem {
  id: string
  name: Record<LangCode, string>
  description: Record<LangCode, string>
  price: number // AMD
  image: string
  tag?: { emoji: string; label: Record<LangCode, string> }
  dietary?: string[]
  rating: number
}

interface CategoryData {
  id: string
  name: Record<LangCode, string>
  emoji: string
  dishes: DishItem[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LANGUAGES: { code: LangCode; name: string; flag: string }[] = [
  { code: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'HY', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'AR', name: 'العربية', flag: '🇸🇦' },
]

const CURRENCIES: { code: CurrencyCode; symbol: string; rate: number }[] = [
  { code: 'AMD', symbol: '֏', rate: 1 },
  { code: 'USD', symbol: '$', rate: 400 },
  { code: 'EUR', symbol: '€', rate: 435 },
  { code: 'RUB', symbol: '₽', rate: 4.5 },
]

const RESTAURANT_NAME: Record<LangCode, string> = {
  RU: 'Ресторан Арарат',
  EN: 'Ararat Restaurant',
  HY: 'Արdelays Ռեստորան',
  AR: 'مطعم أرارات',
}

const RESTAURANT_CITY: Record<LangCode, string> = {
  RU: 'Ереван, Армения',
  EN: 'Yerevan, Armenia',
  HY: 'Երևան, Հայաստdelays',
  AR: 'يريفان، أرمينيا',
}

const UI_TEXT = {
  all: { RU: 'Все', EN: 'All', HY: 'Բdelays', AR: 'الكل' },
  search: { RU: 'Поиск блюда...', EN: 'Search dish...', HY: 'Որdelays delays...', AR: 'بحث...' },
  cart: { RU: 'Корзина', EN: 'Cart', HY: 'Զdelays', AR: 'السلة' },
  items: { RU: 'поз.', EN: 'items', HY: 'delays.', AR: 'عنصر' },
  addToCart: { RU: 'В корзину', EN: 'Add', HY: ' Delays', AR: 'أضف' },
  callWaiter: { RU: 'Вызвать официанта', EN: 'Call waiter', HY: 'Կdelays delays', AR: 'اتصل بالنادل' },
  total: { RU: 'Итого', EN: 'Total', HY: 'Ընdelays', AR: 'المجموع' },
  close: { RU: 'Закрыть', EN: 'Close', HY: 'Փdelays', AR: 'إغلاق' },
  weight: { RU: 'Вес', EN: 'Weight', HY: 'Քdelays', AR: 'الوزن' },
  calories: { RU: 'ккал', EN: 'kcal', HY: 'kcal', AR: 'سعرة' },
  poweredBy: { RU: 'Работает на', EN: 'Powered by', HY: 'Delays', AR: 'مدعوم من' },
}

// ─── Menu Data ───────────────────────────────────────────────────────────────

const CATEGORIES: CategoryData[] = [
  {
    id: 'hot',
    name: { RU: 'Горячее', EN: 'Hot Dishes', HY: 'Տdelays ուdelays', AR: 'أطباق ساخنة' },
    emoji: '🔥',
    dishes: [
      {
        id: 'h1',
        name: { RU: 'Хоровац из баранины', EN: 'Lamb Khorovats', HY: 'Գdelays խdelays', AR: 'خروفاتس لحم الضأن' },
        description: {
          RU: 'Традиционный армянский шашлык из баранины, маринованный в луке и специях',
          EN: 'Traditional Armenian lamb kebab marinated in onions and spices',
          HY: ' Delays delays delays delays delays delays',
          AR: 'كباب لحم الضأن الأرميني التقليدي المنقوع في البصل والتوابل',
        },
        price: 4800,
        image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
        tag: { emoji: '🔥', label: { RU: 'Популярное', EN: 'Popular', HY: 'Հdelays', AR: 'شائع' } },
        rating: 4.8,
      },
      {
        id: 'h2',
        name: { RU: 'Долма', EN: 'Dolma', HY: 'Տdelays', AR: 'دولمة' },
        description: {
          RU: 'Виноградные листья, фаршированные рисом и мясом с пряностями',
          EN: 'Grape leaves stuffed with rice and spiced meat',
          HY: 'Delays delays delays delays',
          AR: 'أوراق عنب محشوة بالأرز واللحم المتبل',
        },
        price: 2800,
        image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&h=300&fit=crop',
        tag: { emoji: '⭐', label: { RU: 'Рекомендуем', EN: 'Recommended', HY: 'Խdelays', AR: 'موصى به' } },
        rating: 4.7,
      },
      {
        id: 'h3',
        name: { RU: 'Кюфта', EN: 'Kyufta', HY: 'Կdelays', AR: 'كفتة' },
        description: {
          RU: 'Армянские мясные шарики в томатном соусе',
          EN: 'Armenian meatballs in tomato sauce',
          HY: 'Delays delays delays',
          AR: 'كرات اللحم الأرمنية في صلصة الطماطم',
        },
        price: 3200,
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
        rating: 4.5,
      },
      {
        id: 'h4',
        name: { RU: 'Тжвжик', EN: 'Tjvjik', HY: 'Թdelays', AR: 'تجفجيك' },
        description: {
          RU: 'Жареная печень с луком по-армянски',
          EN: 'Armenian-style fried liver with onions',
          HY: 'Delays delays delays',
          AR: 'كبد مقلي مع البصل على الطريقة الأرمنية',
        },
        price: 2400,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        tag: { emoji: '🆕', label: { RU: 'Новинка', EN: 'New', HY: 'Նdelays', AR: 'جديد' } },
        rating: 4.3,
      },
      {
        id: 'h5',
        name: { RU: 'Хаш', EN: 'Khash', HY: 'Խdelays', AR: 'خاش' },
        description: {
          RU: 'Традиционный армянский суп из говяжьих ног',
          EN: 'Traditional Armenian soup made from beef feet',
          HY: 'Delays delays delays',
          AR: 'حساء أرميني تقليدي من أقدام البقر',
        },
        price: 1800,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
        rating: 4.6,
      },
    ],
  },
  {
    id: 'salads',
    name: { RU: 'Салаты', EN: 'Salads', HY: 'Աdelays', AR: 'سلطات' },
    emoji: '🥗',
    dishes: [
      {
        id: 's1',
        name: { RU: 'Греческий салат', EN: 'Greek Salad', HY: 'Հdelays delays', AR: 'سلطة يونانية' },
        description: {
          RU: 'Свежие овощи, маслины, сыр фета, оливковое масло',
          EN: 'Fresh vegetables, olives, feta cheese, olive oil',
          HY: 'Delays delays delays',
          AR: 'خضروات طازجة، زيتون، جبنة فيتا، زيت زيتون',
        },
        price: 2500,
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
        dietary: ['vegetarian'],
        rating: 4.4,
      },
      {
        id: 's2',
        name: { RU: 'Салат Арарат', EN: 'Ararat Salad', HY: 'Արdelays delays', AR: 'سلطة أرارات' },
        description: {
          RU: 'Авторский салат со свежими овощами и фирменной заправкой',
          EN: 'Signature salad with fresh vegetables and house dressing',
          HY: 'Delays delays delays',
          AR: 'سلطة مميزة مع خضروات طازجة وصلصة خاصة',
        },
        price: 1900,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        rating: 4.2,
      },
      {
        id: 's3',
        name: { RU: 'Табуле', EN: 'Tabbouleh', HY: 'Թdelays', AR: 'تبولة' },
        description: {
          RU: 'Ливанский салат из булгура, петрушки и мяты с лимонной заправкой',
          EN: 'Lebanese salad with bulgur, parsley, mint and lemon dressing',
          HY: 'Delays delays delays',
          AR: 'سلطة لبنانية مع البرغل والبقدونس والنعناع وعصير الليمون',
        },
        price: 2100,
        image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop',
        dietary: ['vegan'],
        rating: 4.3,
      },
    ],
  },
  {
    id: 'drinks',
    name: { RU: 'Напитки', EN: 'Drinks', HY: ' Delays', AR: 'مشروبات' },
    emoji: '🍹',
    dishes: [
      {
        id: 'd1',
        name: { RU: 'Армянский коньяк Арарат', EN: 'Ararat Armenian Brandy', HY: 'Delays delays', AR: 'براندي أرارات الأرمني' },
        description: {
          RU: 'Выдержанный армянский коньяк, 5 звёзд, 50 мл',
          EN: 'Aged Armenian brandy, 5 stars, 50ml',
          HY: 'Delays delays delays',
          AR: 'براندي أرمني معتق، 5 نجوم، 50 مل',
        },
        price: 3500,
        image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop',
        rating: 4.9,
      },
      {
        id: 'd2',
        name: { RU: 'Тан', EN: 'Tan (Yogurt drink)', HY: 'Delays', AR: 'تان' },
        description: {
          RU: 'Кисломолочный напиток с солью и мятой',
          EN: 'Fermented milk drink with salt and mint',
          HY: 'Delays delays delays',
          AR: 'مشروب حليب مخمر بالملح والنعناع',
        },
        price: 800,
        image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop',
        dietary: ['vegetarian'],
        rating: 4.1,
      },
      {
        id: 'd3',
        name: { RU: 'Лимонад домашний', EN: 'Homemade Lemonade', HY: 'Delays delays', AR: 'ليموناضة منزلية' },
        description: {
          RU: 'Освежающий лимонад из свежих лимонов с мятой',
          EN: 'Refreshing lemonade made from fresh lemons with mint',
          HY: 'Delays delays delays',
          AR: 'ليموناضة منعشة من الليمون الطازج مع النعناع',
        },
        price: 1200,
        image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
        rating: 4.5,
      },
      {
        id: 'd4',
        name: { RU: 'Минеральная вода', EN: 'Mineral Water', HY: 'Delays delays', AR: 'مياه معدنية' },
        description: {
          RU: 'Армянская минеральная вода Джермук, 0.5 л',
          EN: 'Jermuk Armenian mineral water, 0.5L',
          HY: 'Delays delays delays',
          AR: 'مياه جيرموك المعدنية الأرمنية، 0.5 لتر',
        },
        price: 600,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop',
        rating: 4.0,
      },
    ],
  },
  {
    id: 'desserts',
    name: { RU: 'Десерты', EN: 'Desserts', HY: 'Delays', AR: 'حلويات' },
    emoji: '🍰',
    dishes: [
      {
        id: 'ds1',
        name: { RU: 'Пахлава', EN: 'Baklava', HY: 'Delays', AR: 'بقلاوة' },
        description: {
          RU: 'Слоёное тесто с орехами и мёдом',
          EN: 'Layered pastry with nuts and honey',
          HY: 'Delays delays delays',
          AR: 'معجنات طبقات مع المكسرات والعسل',
        },
        price: 1500,
        image: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=400&h=300&fit=crop',
        rating: 4.6,
      },
      {
        id: 'ds2',
        name: { RU: 'Гата', EN: 'Gata', HY: 'Delays', AR: 'غاتا' },
        description: {
          RU: 'Традиционная армянская сладкая выпечка',
          EN: 'Traditional Armenian sweet pastry',
          HY: 'Delays delays delays',
          AR: 'معجنات أرمنية حلوة تقليدية',
        },
        price: 1200,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
        rating: 4.4,
      },
    ],
  },
]

// ─── Helper Components ───────────────────────────────────────────────────────

function DishCard({
  dish,
  lang,
  currency,
  onAdd,
  qty,
  onRemove,
  onClick,
}: {
  dish: DishItem
  lang: LangCode
  currency: CurrencyCode
  onAdd: () => void
  qty: number
  onRemove: () => void
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const displayPrice = formatCurrency(dish.price, currency)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <button onClick={onClick} className="relative flex-shrink-0">
          <img
            src={dish.image}
            alt={dish.name[lang]}
            className="w-24 h-24 rounded-xl object-cover"
            loading="lazy"
          />
          {dish.tag && (
            <span className="absolute -top-1.5 -left-1.5 bg-white/90 backdrop-blur-sm text-xs px-1.5 py-0.5 rounded-full font-semibold shadow-sm border border-gray-100">
              {dish.tag.emoji} {dish.tag.label[lang]}
            </span>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <button onClick={onClick} className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">
              {dish.name[lang]}
            </h3>
          </button>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed flex-1">
            {dish.description[lang]}
          </p>

          {/* Dietary badges */}
          {dish.dietary && dish.dietary.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {dish.dietary.includes('vegetarian') && (
                <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md">🌱 {lang === 'RU' ? 'Вегетарианское' : lang === 'EN' ? 'Vegetarian' : 'Veg'}</span>
              )}
              {dish.dietary.includes('vegan') && (
                <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md">🌿 {lang === 'RU' ? 'Веганское' : lang === 'EN' ? 'Vegan' : 'Vegan'}</span>
              )}
            </div>
          )}

          {/* Price + Cart */}
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-base text-[#F5A623]">{displayPrice}</span>
            {qty === 0 ? (
              <button
                onClick={(e) => { e.stopPropagation(); onAdd() }}
                className="flex items-center gap-1 h-8 px-3 rounded-xl text-xs font-semibold text-white bg-[#F5A623] hover:bg-[#e09510] active:scale-95 transition-all shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {UI_TEXT.addToCart[lang]}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove() }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-700 active:scale-95 transition-transform"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="w-5 text-center text-sm font-bold text-gray-900">{qty}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onAdd() }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white bg-[#F5A623] shadow-sm active:scale-95 transition-transform"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatCurrency(amountAMD: number, currency: CurrencyCode): string {
  const curr = CURRENCIES.find(c => c.code === currency)!
  if (currency === 'AMD') return `${amountAMD.toLocaleString('ru-AM')}${curr.symbol}`
  const converted = Math.round((amountAMD / curr.rate) * 100) / 100
  return `${curr.symbol}${converted.toFixed(2)}`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DemoMenuClient() {
  const [lang, setLang] = useState<LangCode>('RU')
  const [currency, setCurrency] = useState<CurrencyCode>('AMD')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [showCart, setShowCart] = useState(false)
  const [selectedDish, setSelectedDish] = useState<DishItem | null>(null)
  const [orderSent, setOrderSent] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  const filteredCategories = useMemo(() => {
    if (!activeCategory) return CATEGORIES
    return CATEGORIES.filter(c => c.id === activeCategory)
  }, [activeCategory])

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0)
  const cartTotal = useMemo(() => {
    let total = 0
    for (const cat of CATEGORIES) {
      for (const dish of cat.dishes) {
        if (cart[dish.id]) total += dish.price * cart[dish.id]
      }
    }
    return total
  }, [cart])

  const addToCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  const removeFromCart = (id: string) => setCart(prev => {
    const next = { ...prev }
    if (next[id] > 1) next[id]--
    else delete next[id]
    return next
  })

  const sendOrder = () => {
    setOrderSent(true)
    setTimeout(() => {
      setOrderSent(false)
      setCart({})
      setShowCart(false)
    }, 3000)
  }

  const getDishById = (id: string): DishItem | undefined => {
    for (const cat of CATEGORIES) {
      const d = cat.dishes.find(d => d.id === id)
      if (d) return d
    }
    return undefined
  }

  const isRtl = lang === 'AR'

  return (
    <div
      className="min-h-screen bg-gray-50 max-w-[480px] mx-auto relative"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ paddingBottom: cartCount > 0 ? '80px' : '20px' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#F5A623] shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                TM
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">{RESTAURANT_NAME[lang]}</h1>
                <p className="text-white/70 text-xs">{RESTAURANT_CITY[lang]}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Currency picker */}
              <div className="relative">
                <button
                  onClick={() => { setShowCurrencyPicker(!showCurrencyPicker); setShowLangPicker(false) }}
                  className="flex items-center gap-1 text-xs bg-white/20 text-white rounded-lg px-2 py-1.5 font-medium"
                >
                  {CURRENCIES.find(c => c.code === currency)!.symbol} {currency}
                </button>
                {showCurrencyPicker && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 min-w-32 z-50">
                    {CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${currency === c.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className="font-medium">{c.symbol}</span>
                        <span>{c.code}</span>
                        {currency === c.code && <span className="ml-auto text-amber-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language picker */}
              <div className="relative">
                <button
                  onClick={() => { setShowLangPicker(!showLangPicker); setShowCurrencyPicker(false) }}
                  className="flex items-center gap-1 text-xs bg-white/20 text-white rounded-lg px-2 py-1.5 font-medium"
                >
                  {LANGUAGES.find(l => l.code === lang)!.flag} {lang}
                </button>
                {showLangPicker && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 min-w-40 z-50">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setShowLangPicker(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${lang === l.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                        {lang === l.code && <span className="ml-auto text-amber-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-[52px] z-30 bg-gray-50 border-b border-gray-100">
        <div ref={tabsRef} className="flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeCategory === null
                ? 'bg-[#F5A623] text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {UI_TEXT.all[lang]}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id === activeCategory ? null : cat.id)
              }}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#F5A623] text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.emoji} {cat.name[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Menu content */}
      <div className="px-4 py-4 space-y-6">
        {filteredCategories.map(cat => (
          <section key={cat.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.emoji}</span>
              <h2 className="text-base font-bold text-gray-900">{cat.name[lang]}</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {cat.dishes.length}
              </span>
            </div>
            <div className="space-y-3">
              {cat.dishes.map(dish => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  lang={lang}
                  currency={currency}
                  qty={cart[dish.id] || 0}
                  onAdd={() => addToCart(dish.id)}
                  onRemove={() => removeFromCart(dish.id)}
                  onClick={() => setSelectedDish(dish)}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Footer */}
        <div className="text-center pt-4 pb-6">
          <p className="text-xs text-gray-400">{UI_TEXT.poweredBy[lang]}</p>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">TapMenu Armenia 🇦🇲</p>
          <p className="text-xs text-gray-300 mt-2">
            {lang === 'RU' ? 'Это демо-меню для демонстрации возможностей TapMenu' : 'This is a demo menu showcasing TapMenu features'}
          </p>
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
            className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl text-white shadow-2xl z-40 bg-[#F5A623] max-w-[460px] w-[calc(100%-32px)]"
          >
            <span className="text-lg">🛒</span>
            <span className="font-semibold flex-1 text-left">{UI_TEXT.cart[lang]} · {cartCount} {UI_TEXT.items[lang]}</span>
            <span className="font-bold bg-white/20 px-2.5 py-1 rounded-xl text-sm">
              {formatCurrency(cartTotal, currency)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col max-w-[480px] mx-auto"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-lg font-bold text-gray-900">🛒 {UI_TEXT.cart[lang]}</h2>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {!orderSent ? (
                <>
                  <div className="overflow-y-auto flex-1 px-5 space-y-2">
                    {Object.entries(cart).map(([id, qty]) => {
                      const dish = getDishById(id)
                      if (!dish) return null
                      return (
                        <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                          <img src={dish.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{dish.name[lang]}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(dish.price, currency)}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => removeFromCart(id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                            <span className="w-5 text-center text-sm font-bold">{qty}</span>
                            <button
                              onClick={() => addToCart(id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-white bg-[#F5A623]"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                          </div>
                          <div className="text-sm font-bold text-gray-900 w-16 text-right">
                            {formatCurrency(dish.price * qty, currency)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-5 pt-3 pb-6 border-t border-gray-100 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-semibold text-gray-700">{UI_TEXT.total[lang]}</span>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(cartTotal, currency)}</span>
                    </div>
                    <button
                      onClick={sendOrder}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#e09510] active:scale-[0.98] transition-all"
                    >
                      📤 {UI_TEXT.callWaiter[lang]}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      {lang === 'RU' ? 'Официант подойдёт и примет заказ' : 'The waiter will come and take your order'}
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
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {lang === 'RU' ? 'Официант вызван!' : 'Waiter called!'}
                  </h3>
                  <p className="text-gray-500 text-center text-sm">
                    {lang === 'RU'
                      ? 'Ваш заказ передан. Официант подойдёт к вам в ближайшее время.'
                      : 'Your order has been sent. The waiter will come to you shortly.'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dish detail modal */}
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto max-w-[480px] mx-auto"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur flex justify-end p-3 rounded-t-3xl">
                <button
                  onClick={() => setSelectedDish(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="px-5 pb-8">
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name[lang]}
                  className="w-full h-48 object-cover rounded-2xl mb-4"
                />

                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex-1">
                    {selectedDish.name[lang]}
                  </h2>
                  <div className="text-xl font-bold text-[#F5A623]">
                    {formatCurrency(selectedDish.price, currency)}
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {selectedDish.description[lang]}
                </p>

                <StarRating rating={selectedDish.rating} />

                {/* Dietary + tags */}
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {selectedDish.tag && (
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-medium">
                      {selectedDish.tag.emoji} {selectedDish.tag.label[lang]}
                    </span>
                  )}
                  {selectedDish.dietary?.includes('vegetarian') && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-medium">
                      🌱 {lang === 'RU' ? 'Вегетарианское' : 'Vegetarian'}
                    </span>
                  )}
                  {selectedDish.dietary?.includes('vegan') && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-medium">
                      🌿 {lang === 'RU' ? 'Веганское' : 'Vegan'}
                    </span>
                  )}
                </div>

                {/* Add to cart */}
                {(cart[selectedDish.id] || 0) === 0 ? (
                  <button
                    onClick={() => { addToCart(selectedDish.id); setSelectedDish(null) }}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg bg-[#F5A623] hover:bg-[#e09510] active:scale-[0.98] transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {UI_TEXT.addToCart[lang]} · {formatCurrency(selectedDish.price, currency)}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5 flex-1">
                      <button
                        onClick={() => removeFromCart(selectedDish.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span className="flex-1 text-center text-lg font-bold text-gray-900">
                        {cart[selectedDish.id]}
                      </span>
                      <button
                        onClick={() => addToCart(selectedDish.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-white bg-[#F5A623]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                    <button
                      onClick={() => { setShowCart(true); setSelectedDish(null) }}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold shadow-lg bg-[#F5A623]"
                    >
                      🛒 {UI_TEXT.cart[lang]}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlay close pickers */}
      {(showLangPicker || showCurrencyPicker) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowLangPicker(false); setShowCurrencyPicker(false) }}
        />
      )}
    </div>
  )
}
