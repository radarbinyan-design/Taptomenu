'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Plus, Search, Edit2, Trash2, Copy, Eye, EyeOff,
  Leaf, Wheat, ChevronDown, ChevronRight, X, Save,
  Flame, Check, Sparkles, Upload, ArrowUpDown,
  LayoutList, LayoutGrid, Filter,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Dish {
  id: string
  name: string
  price: number
  category: string
  image: string
  status: 'active' | 'inactive'
  isVegan: boolean
  isGlutenFree: boolean
  spicyLevel: number
  translations: string[]
  weight?: number
  calories?: number
  description?: string
  allergens: string[]
}

// ─── Initial data ─────────────────────────────────────────────────────────────
const INITIAL_DISHES: Dish[] = [
  { id: '1', name: 'Греческий салат', price: 2500, category: 'Салаты', image: '🥗', status: 'active', isVegan: true, isGlutenFree: true, spicyLevel: 0, translations: ['EN', 'HY', 'AR'], weight: 250, calories: 280, description: 'Свежие овощи, сыр фета, маслины', allergens: ['dairy'] },
  { id: '2', name: 'Хоровац из ягнёнка', price: 4800, category: 'Горячее', image: '🍖', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 1, translations: ['EN', 'HY', 'FR'], weight: 350, calories: 520, description: 'Традиционный армянский шашлык на углях', allergens: [] },
  { id: '3', name: 'Долма с мясом', price: 3200, category: 'Горячее', image: '🫑', status: 'active', isVegan: false, isGlutenFree: false, spicyLevel: 0, translations: ['EN', 'HY'], weight: 300, calories: 380, description: 'Голубцы в виноградных листьях', allergens: [] },
  { id: '4', name: 'Лаваш армянский', price: 500, category: 'Хлеб', image: '🫓', status: 'active', isVegan: true, isGlutenFree: false, spicyLevel: 0, translations: ['EN', 'HY', 'AR', 'FR'], weight: 200, calories: 180, description: 'Традиционный тонкий лаваш', allergens: ['gluten'] },
  { id: '5', name: 'Армянское вино Араратское', price: 1800, category: 'Напитки', image: '🍷', status: 'inactive', isVegan: true, isGlutenFree: true, spicyLevel: 0, translations: ['EN'], weight: 150, calories: 120, description: 'Красное сухое вино', allergens: ['sulphites'] },
  { id: '6', name: 'Куриный суп', price: 1900, category: 'Супы', image: '🍲', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 0, translations: ['EN', 'HY'], weight: 400, calories: 220, description: 'Домашний куриный бульон с овощами', allergens: [] },
  { id: '7', name: 'Пахлава', price: 1200, category: 'Десерты', image: '🍯', status: 'active', isVegan: true, isGlutenFree: false, spicyLevel: 0, translations: ['EN', 'HY', 'AR'], weight: 120, calories: 350, description: 'Традиционная армянская пахлава с орехами', allergens: ['nuts', 'gluten'] },
  { id: '8', name: 'Цыплёнок табака', price: 4200, category: 'Горячее', image: '🍗', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 2, translations: ['EN', 'HY'], weight: 500, calories: 610, description: 'Цыплёнок под прессом со специями', allergens: [] },
]

const CATEGORIES = ['Салаты', 'Горячее', 'Супы', 'Хлеб', 'Десерты', 'Напитки', 'Закуски', 'Гарниры']
const ALLERGENS_LIST = ['Молоко', 'Яйца', 'Глютен', 'Орехи', 'Рыба', 'Морепродукты', 'Сульфиты', 'Соя']
const LANGS = ['EN', 'HY', 'AR', 'FR', 'DE', 'ZH']
const EMOJIS = ['🍖', '🥗', '🍲', '🫑', '🍷', '🫓', '🍯', '🍗', '🥩', '🍝', '🥘', '🍜', '🧆', '🥙', '🍰', '🍵', '🧁', '🥗', '🫕', '🍱']

const EMPTY_DISH: Omit<Dish, 'id'> = {
  name: '', price: 0, category: '', image: '🍽️',
  status: 'active', isVegan: false, isGlutenFree: false,
  spicyLevel: 0, translations: [], allergens: [],
  weight: undefined, calories: undefined, description: '',
}

// ─── Dish Modal ───────────────────────────────────────────────────────────────
function DishModal({
  dish, onSave, onClose,
}: {
  dish: Partial<Dish> & { id?: string }
  onSave: (d: Dish) => void
  onClose: () => void
}) {
  const isNew = !dish.id
  const [form, setForm] = useState<Omit<Dish, 'id'>>({
    name: dish.name ?? '',
    price: dish.price ?? 0,
    category: dish.category ?? '',
    image: dish.image ?? '🍽️',
    status: dish.status ?? 'active',
    isVegan: dish.isVegan ?? false,
    isGlutenFree: dish.isGlutenFree ?? false,
    spicyLevel: dish.spicyLevel ?? 0,
    translations: dish.translations ?? [],
    allergens: dish.allergens ?? [],
    weight: dish.weight,
    calories: dish.calories,
    description: dish.description ?? '',
  })
  const [tab, setTab] = useState<'basic' | 'details' | 'translations'>('basic')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Введите название'
    if (!form.price || form.price <= 0) e.price = 'Укажите цену'
    if (!form.category) e.category = 'Выберите категорию'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({ ...form, id: dish.id ?? String(Date.now()) })
  }

  const toggleLang = (lang: string) => {
    setForm(f => ({
      ...f,
      translations: f.translations.includes(lang)
        ? f.translations.filter(l => l !== lang)
        : [...f.translations, lang],
    }))
  }

  const toggleAllergen = (a: string) => {
    setForm(f => ({
      ...f,
      allergens: f.allergens.includes(a)
        ? f.allergens.filter(x => x !== a)
        : [...f.allergens, a],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isNew ? '+ Добавить блюдо' : `Редактировать: ${dish.name}`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isNew ? 'Заполните данные нового блюда' : 'Измените нужные поля и сохраните'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {[
            { id: 'basic', label: '📋 Основное' },
            { id: 'details', label: '🥗 Детали' },
            { id: 'translations', label: `🌍 Переводы${form.translations.length > 0 ? ` (${form.translations.length})` : ''}` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── TAB: BASIC ── */}
          {tab === 'basic' && (
            <div className="space-y-5">
              {/* Image + Emoji */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-200 hover:border-amber-400"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Нажмите для выбора эмодзи"
                  >
                    {form.image}
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-10 grid grid-cols-5 gap-1">
                      {EMOJIS.map(e => (
                        <button
                          key={e}
                          onClick={() => { setForm(f => ({ ...f, image: e })); setShowEmojiPicker(false) }}
                          className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-2">Нажмите на иконку для выбора эмодзи</p>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Название <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Например: Хоровац из ягнёнка"
                      className={`mt-1 w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </label>
                </div>
              </div>

              {/* Category + Price */}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Категория <span className="text-red-500">*</span>
                  </span>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={`mt-1 w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white ${errors.category ? 'border-red-300' : 'border-gray-200'}`}
                  >
                    <option value="">Выберите...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__new">+ Создать категорию</option>
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Цена (֏) <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    placeholder="2500"
                    min={0}
                    className={`mt-1 w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </label>
              </div>

              {/* Description */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Описание</span>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Краткое описание блюда для гостей..."
                  rows={3}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </label>

              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Статус:</span>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setForm(f => ({ ...f, status: 'active' }))}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${form.status === 'active' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    ✓ Активно
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, status: 'inactive' }))}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${form.status === 'inactive' ? 'bg-gray-400 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Скрыто
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: DETAILS ── */}
          {tab === 'details' && (
            <div className="space-y-5">
              {/* Weight + Calories */}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Вес (г)</span>
                  <input
                    type="number"
                    value={form.weight ?? ''}
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="250"
                    className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Калории (ккал)</span>
                  <input
                    type="number"
                    value={form.calories ?? ''}
                    onChange={e => setForm(f => ({ ...f, calories: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="320"
                    className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* Dietary */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Диетические метки</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setForm(f => ({ ...f, isVegan: !f.isVegan }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${form.isVegan ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}
                  >
                    <Leaf className="w-4 h-4" /> Vegan
                    {form.isVegan && <Check className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, isGlutenFree: !f.isGlutenFree }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${form.isGlutenFree ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                  >
                    <Wheat className="w-4 h-4" /> Без глютена
                    {form.isGlutenFree && <Check className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Spicy level */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Острота</p>
                <div className="flex gap-2">
                  {[
                    { level: 0, label: 'Не острое', icon: '○' },
                    { level: 1, label: 'Слабо', icon: '🌶' },
                    { level: 2, label: 'Средне', icon: '🌶🌶' },
                    { level: 3, label: 'Остро', icon: '🌶🌶🌶' },
                  ].map(s => (
                    <button
                      key={s.level}
                      onClick={() => setForm(f => ({ ...f, spicyLevel: s.level }))}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-medium transition-all ${form.spicyLevel === s.level ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-500 hover:border-red-300'}`}
                    >
                      <div>{s.icon}</div>
                      <div className="mt-0.5">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Аллергены</p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS_LIST.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAllergen(a)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.allergens.includes(a) ? 'bg-orange-50 border-orange-400 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-300'}`}
                    >
                      {form.allergens.includes(a) && '✓ '}{a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: TRANSLATIONS ── */}
          {tab === 'translations' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700">Выберите языки, на которые переведено блюдо. AI-перевод доступен в Pro+.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'EN', flag: '🇬🇧', name: 'English' },
                  { code: 'HY', flag: '🇦🇲', name: 'Հայերեն' },
                  { code: 'AR', flag: '🇸🇦', name: 'العربية' },
                  { code: 'FR', flag: '🇫🇷', name: 'Français' },
                  { code: 'DE', flag: '🇩🇪', name: 'Deutsch' },
                  { code: 'ZH', flag: '🇨🇳', name: '中文' },
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.translations.includes(lang.code) ? 'bg-amber-50 border-amber-400' : 'border-gray-200 hover:border-amber-300'}`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-900">{lang.code}</div>
                      <div className="text-xs text-gray-400">{lang.name}</div>
                    </div>
                    {form.translations.includes(lang.code) && <Check className="w-4 h-4 text-amber-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            {form.name
              ? <span>Блюдо: <strong className="text-gray-900">{form.name}</strong>{form.price > 0 && ` · ${form.price.toLocaleString()} ֏`}</span>
              : <span className="text-gray-400">Заполните обязательные поля *</span>
            }
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
            >
              <Save className="w-4 h-4" />
              {isNew ? 'Добавить блюдо' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ dish, onConfirm, onClose }: { dish: Dish; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Удалить блюдо?</h3>
          <p className="text-gray-500 text-sm mb-1">Вы удаляете: <strong>{dish.name}</strong></p>
          <p className="text-gray-400 text-xs mb-6">Это действие нельзя отменить.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Отмена
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterTag, setFilterTag] = useState<'' | 'vegan' | 'gf' | 'spicy'>('')
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('category')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>({})

  // Modals
  const [editDish, setEditDish] = useState<Partial<Dish> | null>(null)
  const [deleteDish, setDeleteDish] = useState<Dish | null>(null)
  const [showToast, setShowToast] = useState('')

  const toast = (msg: string) => {
    setShowToast(msg)
    setTimeout(() => setShowToast(''), 2500)
  }

  // ── Actions ────────────────────────────────────────
  const handleSave = (d: Dish) => {
    setDishes(prev => {
      const exists = prev.find(x => x.id === d.id)
      if (exists) return prev.map(x => x.id === d.id ? d : x)
      return [...prev, d]
    })
    setEditDish(null)
    toast(d.name + (dishes.find(x => x.id === d.id) ? ' обновлено' : ' добавлено ✓'))
  }

  const handleToggleStatus = (id: string) => {
    setDishes(prev => prev.map(d =>
      d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d
    ))
  }

  const handleDuplicate = (dish: Dish) => {
    const copy: Dish = { ...dish, id: String(Date.now()), name: dish.name + ' (копия)' }
    setDishes(prev => [...prev, copy])
    toast(`Блюдо "${dish.name}" дублировано`)
  }

  const handleDelete = (dish: Dish) => {
    setDishes(prev => prev.filter(d => d.id !== dish.id))
    setDeleteDish(null)
    toast(`"${dish.name}" удалено`)
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
  }

  // ── Filtered + sorted list ─────────────────────────
  const filtered = useMemo(() => {
    let list = [...dishes]
    if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    if (filterCategory) list = list.filter(d => d.category === filterCategory)
    if (filterStatus === 'active') list = list.filter(d => d.status === 'active')
    if (filterStatus === 'inactive') list = list.filter(d => d.status === 'inactive')
    if (filterTag === 'vegan') list = list.filter(d => d.isVegan)
    if (filterTag === 'gf') list = list.filter(d => d.isGlutenFree)
    if (filterTag === 'spicy') list = list.filter(d => d.spicyLevel > 0)
    list.sort((a, b) => {
      let v = 0
      if (sortBy === 'name') v = a.name.localeCompare(b.name, 'ru')
      if (sortBy === 'price') v = a.price - b.price
      if (sortBy === 'category') v = a.category.localeCompare(b.category, 'ru')
      return sortDir === 'asc' ? v : -v
    })
    return list
  }, [dishes, search, filterCategory, filterStatus, filterTag, sortBy, sortDir])

  // Grouped by category
  const grouped = useMemo(() => {
    const map: Record<string, Dish[]> = {}
    filtered.forEach(d => {
      if (!map[d.category]) map[d.category] = []
      map[d.category].push(d)
    })
    return map
  }, [filtered])

  const allCategories = Array.from(new Set(dishes.map(d => d.category)))
  const activeCount = dishes.filter(d => d.status === 'active').length

  const toggleGroup = (cat: string) =>
    setGroupOpen(prev => ({ ...prev, [cat]: prev[cat] === undefined ? false : !prev[cat] }))

  const isGroupOpen = (cat: string) => groupOpen[cat] !== false

  // ── Dish Row Component ──────────────────────────────
  const DishRow = ({ dish }: { dish: Dish }) => (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm ${dish.status === 'inactive' ? 'bg-gray-50 border-gray-100 opacity-75' : 'bg-white border-gray-100 hover:border-amber-200'}`}>
      {/* Emoji */}
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        {dish.image}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{dish.name}</span>
          {dish.isVegan && <span className="text-xs text-green-600 flex items-center gap-0.5"><Leaf className="w-3 h-3" />Vegan</span>}
          {dish.isGlutenFree && <span className="text-xs text-blue-600 flex items-center gap-0.5"><Wheat className="w-3 h-3" />GF</span>}
          {dish.spicyLevel > 0 && <span className="text-xs text-red-500">{'🌶'.repeat(dish.spicyLevel)}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {dish.weight && <span className="text-xs text-gray-400">{dish.weight}г</span>}
          {dish.calories && <span className="text-xs text-gray-400">{dish.calories} ккал</span>}
          <div className="flex gap-1">
            {dish.translations.map(l => (
              <span key={l} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Price + Status */}
      <div className="text-right flex-shrink-0 mr-2">
        <div className="font-bold text-gray-900 text-sm">{dish.price.toLocaleString('ru')} ֏</div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${dish.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {dish.status === 'active' ? 'Активно' : 'Скрыто'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          title="Редактировать"
          onClick={() => setEditDish(dish)}
          className="p-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-gray-400 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          title={dish.status === 'active' ? 'Скрыть блюдо' : 'Показать блюдо'}
          onClick={() => handleToggleStatus(dish.id)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          {dish.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          title="Дублировать"
          onClick={() => handleDuplicate(dish)}
          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          title="Удалить"
          onClick={() => setDeleteDish(dish)}
          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Библиотека блюд</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {dishes.length} блюд · {allCategories.length} категорий · {activeCount} активных
          </p>
        </div>
        <button
          onClick={() => setEditDish({ ...EMPTY_DISH })}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-amber-200"
        >
          <Plus className="w-4 h-4" />
          Добавить блюдо
        </button>
      </div>

      {/* ── Filters bar ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category select */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Все категории</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status filter */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 font-medium transition-colors ${filterStatus === s ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {s === 'all' ? 'Все' : s === 'active' ? 'Активные' : 'Скрытые'}
              </button>
            ))}
          </div>

          {/* View mode */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grouped')}
              title="По категориям"
              className={`p-2 transition-colors ${viewMode === 'grouped' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Список"
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Теги:</span>
          {[
            { id: '', label: 'Все блюда' },
            { id: 'vegan', label: '🌿 Vegan' },
            { id: 'gf', label: '🌾 Без глютена' },
            { id: 'spicy', label: '🌶 Острые' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTag(t.id as any)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterTag === t.id ? 'bg-amber-100 border-amber-400 text-amber-700 font-medium' : 'border-gray-200 text-gray-500 hover:border-amber-300'}`}
            >
              {t.label}
            </button>
          ))}

          {/* Sort */}
          <div className="ml-auto flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Сорт.:</span>
            {[
              { id: 'category', label: 'Категория' },
              { id: 'name', label: 'Название' },
              { id: 'price', label: 'Цена' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => handleSort(s.id as any)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${sortBy === s.id ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {s.label}{sortBy === s.id ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {filtered.length !== dishes.length && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          Показано {filtered.length} из {dishes.length} блюд
          <button onClick={() => { setSearch(''); setFilterCategory(''); setFilterStatus('all'); setFilterTag('') }} className="text-amber-600 hover:underline text-xs">
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* ── GROUPED view ── */}
      {viewMode === 'grouped' && (
        <div className="space-y-4">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-medium">Блюда не найдены</p>
              <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, catDishes]) => (
              <div key={category} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Category header */}
                <button
                  onClick={() => toggleGroup(category)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-lg">
                    {catDishes[0]?.image || '🍽️'}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-bold text-gray-900">{category}</span>
                    <span className="ml-2 text-sm text-gray-400">{catDishes.length} {catDishes.length === 1 ? 'блюдо' : catDishes.length < 5 ? 'блюда' : 'блюд'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {catDishes.filter(d => d.status === 'active').length} активных
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); setEditDish({ ...EMPTY_DISH, category }) }}
                      className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 transition-colors"
                      title="Добавить в эту категорию"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {isGroupOpen(category)
                      ? <ChevronDown className="w-4 h-4 text-gray-400" />
                      : <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </button>

                {/* Dishes in category */}
                {isGroupOpen(category) && (
                  <div className="px-4 pb-4 space-y-2">
                    {catDishes.map(dish => <DishRow key={dish.id} dish={dish} />)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── LIST view ── */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-medium">Блюда не найдены</p>
            </div>
          ) : (
            filtered.map(dish => <DishRow key={dish.id} dish={dish} />)
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {editDish !== null && (
        <DishModal
          dish={editDish}
          onSave={handleSave}
          onClose={() => setEditDish(null)}
        />
      )}
      {deleteDish && (
        <DeleteModal
          dish={deleteDish}
          onConfirm={() => handleDelete(deleteDish)}
          onClose={() => setDeleteDish(null)}
        />
      )}

      {/* ── Toast notification ── */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          {showToast}
        </div>
      )}
    </div>
  )
}
