'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Edit3, Save, Eye, Plus, Trash2, GripVertical, X, Check,
  ChevronDown, ChevronUp, Image as ImageIcon, Languages,
  Sparkles, ExternalLink, EyeOff, Loader2, Globe,
} from 'lucide-react'
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

export default function MenuEditorPage() {
  const [menuData, setMenuData] = useState<GeneratedMenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewLang, setPreviewLang] = useState<Lang>('ru')
  const [editingDish, setEditingDish] = useState<{ catId: string; dish: GeneratedDish } | null>(null)
  const [editingCategory, setEditingCategory] = useState<GeneratedCategory | null>(null)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(true)

  // Load menu data
  useEffect(() => {
    fetch('/api/menu/dishes')
      .then(r => r.json())
      .then(data => {
        setMenuData(data.data)
        if (data.data?.categories) {
          setExpandedCats(new Set(data.data.categories.map((c: GeneratedCategory) => c.id)))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const saveMenu = async () => {
    if (!menuData) return
    setSaving(true)
    try {
      await fetch('/api/menu/dishes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_full_menu', data: menuData }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error('Save error:', e)
    } finally {
      setSaving(false)
    }
  }

  const toggleCat = (catId: string) => {
    setExpandedCats(prev => {
      const n = new Set(prev)
      if (n.has(catId)) n.delete(catId)
      else n.add(catId)
      return n
    })
  }

  const updateDish = (catId: string, dishId: string, updates: Partial<GeneratedDish>) => {
    setMenuData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === catId
            ? { ...cat, dishes: cat.dishes.map(d => d.id === dishId ? { ...d, ...updates } : d) }
            : cat
        ),
      }
    })
  }

  const removeDish = (catId: string, dishId: string) => {
    setMenuData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === catId
            ? { ...cat, dishes: cat.dishes.filter(d => d.id !== dishId) }
            : cat
        ),
      }
    })
  }

  const addDish = (catId: string) => {
    const newDish: GeneratedDish = {
      id: `dish-new-${Date.now()}`,
      name: { ru: 'Новое блюдо', en: 'New Dish', hy: 'Նոր ուտեստ' },
      description: { ru: 'Описաние блюда', en: 'Dish description', hy: 'Ուտեստի նկարագրություն' },
      price: 0,
      generatedByAI: false,
    }
    setMenuData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === catId ? { ...cat, dishes: [...cat.dishes, newDish] } : cat
        ),
      }
    })
    setEditingDish({ catId, dish: newDish })
  }

  const addCategory = () => {
    const newCat: GeneratedCategory = {
      id: `cat-new-${Date.now()}`,
      name: { ru: 'Новая категория', en: 'New Category', hy: 'Նոր կատեգորիա' },
      emoji: '🍽️',
      dishes: [],
    }
    setMenuData(prev => {
      if (!prev) return prev
      return { ...prev, categories: [...prev.categories, newCat] }
    })
    setExpandedCats(prev => new Set([...Array.from(prev), newCat.id]))
    setEditingCategory(newCat)
  }

  const removeCategory = (catId: string) => {
    if (!confirm('Удалить категорию и все блюда в ней?')) return
    setMenuData(prev => {
      if (!prev) return prev
      return { ...prev, categories: prev.categories.filter(c => c.id !== catId) }
    })
  }

  const updateCategory = (catId: string, updates: Partial<GeneratedCategory>) => {
    setMenuData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        categories: prev.categories.map(c => c.id === catId ? { ...c, ...updates } : c),
      }
    })
  }

  const moveCat = (catId: string, dir: 'up' | 'down') => {
    setMenuData(prev => {
      if (!prev) return prev
      const cats = [...prev.categories]
      const idx = cats.findIndex(c => c.id === catId)
      if (dir === 'up' && idx > 0) {
        [cats[idx - 1], cats[idx]] = [cats[idx], cats[idx - 1]]
      } else if (dir === 'down' && idx < cats.length - 1) {
        [cats[idx], cats[idx + 1]] = [cats[idx + 1], cats[idx]]
      }
      return { ...prev, categories: cats }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <span className="ml-3 text-gray-500">Загрузка меню...</span>
      </div>
    )
  }

  if (!menuData) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Меню ещё не сгенерировано</h2>
        <p className="text-gray-500 mb-4">Сначала создайте меню через AI генератор</p>
        <Button onClick={() => window.location.href = '/dashboard/menu-generator'} className="bg-violet-500 hover:bg-violet-600">
          <Sparkles className="w-4 h-4 mr-2" />
          Генерация меню
        </Button>
      </div>
    )
  }

  const totalDishes = menuData.categories.reduce((s, c) => s + c.dishes.length, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-violet-500" />
            Редактор меню
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {menuData.categories.length} категорий, {totalDishes} блюд
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="hidden lg:flex"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showPreview ? 'Скрыть превью' : 'Показать превью'}
          </Button>
          <Button onClick={saveMenu} isLoading={saving} className="bg-violet-500 hover:bg-violet-600">
            {saved ? <><Check className="w-4 h-4" /> Сохранено</> : <><Save className="w-4 h-4 mr-1" /> Сохранить</>}
          </Button>
        </div>
      </div>

      {/* Main layout: Editor + Preview */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* LEFT: Editor Panel */}
        <div className="space-y-4">
          {/* Categories */}
          {menuData.categories.map((cat, catIdx) => (
            <Card key={cat.id} className="border-gray-200 overflow-hidden">
              {/* Category header */}
              <div
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleCat(cat.id)}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-xl">{cat.emoji || '🍽️'}</span>
                <span className="font-semibold text-gray-900 flex-1">
                  {cat.name[previewLang] || cat.name.ru}
                </span>
                <span className="text-xs text-gray-400 mr-2">{cat.dishes.length} блюд</span>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); moveCat(cat.id, 'up') }} className="p-1 hover:bg-gray-200 rounded" disabled={catIdx === 0}>
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); moveCat(cat.id, 'down') }} className="p-1 hover:bg-gray-200 rounded" disabled={catIdx === menuData.categories.length - 1}>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingCategory(cat) }} className="p-1 hover:bg-blue-100 rounded">
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); removeCategory(cat.id) }} className="p-1 hover:bg-red-100 rounded">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
                {expandedCats.has(cat.id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {/* Dishes */}
              {expandedCats.has(cat.id) && (
                <CardContent className="p-3 space-y-2">
                  {cat.dishes.map(dish => (
                    <div
                      key={dish.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors group"
                    >
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {dish.imageUrl ? (
                          <img src={dish.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {dish.name[previewLang] || dish.name.ru}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {dish.description[previewLang] || dish.description.ru}
                        </div>
                        <div className="text-sm font-bold text-violet-600 mt-0.5">
                          {formatAMD(dish.price)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingDish({ catId: cat.id, dish })}
                          className="p-1.5 hover:bg-violet-100 rounded-lg"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4 text-violet-500" />
                        </button>
                        <button
                          onClick={() => removeDish(cat.id, dish.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addDish(cat.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить блюдо
                  </button>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Add category */}
          <button
            onClick={addCategory}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Добавить категорию
          </button>
        </div>

        {/* RIGHT: Live Preview */}
        {showPreview && (
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="bg-gray-900 rounded-t-2xl px-4 py-2 flex items-center justify-between">
                <span className="text-white text-xs font-medium flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Превью гостевого меню
                </span>
                <div className="flex gap-1">
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setPreviewLang(l.code)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        previewLang === l.code ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {l.flag} {l.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 border-t-0 rounded-b-2xl bg-gray-50 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Preview Menu */}
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-4 py-6 text-center text-white">
                  <h2 className="text-lg font-bold">Мой Ресторан</h2>
                  <p className="text-white/70 text-xs mt-1">Цифровое меню</p>
                </div>

                <div className="p-4 space-y-6">
                  {menuData.categories.map(cat => (
                    <div key={cat.id}>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="text-xl">{cat.emoji}</span>
                        {cat.name[previewLang] || cat.name.ru}
                      </h3>
                      <div className="space-y-2">
                        {cat.dishes.map(dish => (
                          <div key={dish.id} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {dish.imageUrl ? (
                                <img src={dish.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm">
                                {dish.name[previewLang] || dish.name.ru}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                {dish.description[previewLang] || dish.description.ru}
                              </div>
                              <div className="font-bold text-violet-600 text-sm mt-1">
                                {formatAMD(dish.price)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4 pb-2">
                    <p className="text-xs text-gray-400">Powered by TapToMenu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DISH EDIT MODAL */}
      {editingDish && (
        <DishEditModal
          catId={editingDish.catId}
          dish={editingDish.dish}
          onSave={(catId, dishId, updates) => {
            updateDish(catId, dishId, updates)
            setEditingDish(null)
          }}
          onClose={() => setEditingDish(null)}
        />
      )}

      {/* CATEGORY EDIT MODAL */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          onSave={(catId, updates) => {
            updateCategory(catId, updates)
            setEditingCategory(null)
          }}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  )
}

// Dish editing modal
function DishEditModal({
  catId, dish, onSave, onClose
}: {
  catId: string
  dish: GeneratedDish
  onSave: (catId: string, dishId: string, updates: Partial<GeneratedDish>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    nameRu: dish.name.ru || '',
    nameEn: dish.name.en || '',
    nameHy: dish.name.hy || '',
    descRu: dish.description.ru || '',
    descEn: dish.description.en || '',
    descHy: dish.description.hy || '',
    price: dish.price || 0,
    imageUrl: dish.imageUrl || '',
  })
  const [activeTab, setActiveTab] = useState<'ru' | 'en' | 'hy'>('ru')

  const handleSave = () => {
    onSave(catId, dish.id, {
      name: { ru: form.nameRu, en: form.nameEn, hy: form.nameHy },
      description: { ru: form.descRu, en: form.descEn, hy: form.descHy },
      price: Number(form.price) || 0,
      imageUrl: form.imageUrl || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Редактирование блюда</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Language tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setActiveTab(l.code)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === l.code ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* Name field */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Название ({activeTab.toUpperCase()})
            </label>
            <input
              type="text"
              value={activeTab === 'ru' ? form.nameRu : activeTab === 'en' ? form.nameEn : form.nameHy}
              onChange={e => {
                const v = e.target.value
                if (activeTab === 'ru') setForm(f => ({ ...f, nameRu: v }))
                else if (activeTab === 'en') setForm(f => ({ ...f, nameEn: v }))
                else setForm(f => ({ ...f, nameHy: v }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Description field */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Описание ({activeTab.toUpperCase()})
            </label>
            <textarea
              rows={3}
              value={activeTab === 'ru' ? form.descRu : activeTab === 'en' ? form.descEn : form.descHy}
              onChange={e => {
                const v = e.target.value
                if (activeTab === 'ru') setForm(f => ({ ...f, descRu: v }))
                else if (activeTab === 'en') setForm(f => ({ ...f, descEn: v }))
                else setForm(f => ({ ...f, descHy: v }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Цена (AMD ֏)</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Фото блюда
            </label>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="" className="w-full h-40 object-cover rounded-xl mb-2" />
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="URL изображения"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            {dish.generatedByAI && (
              <p className="text-xs text-violet-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Сгенерировано AI
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Отмена</Button>
          <Button onClick={handleSave} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
            <Check className="w-4 h-4 mr-1" /> Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}

// Category editing modal
function CategoryEditModal({
  category, onSave, onClose
}: {
  category: GeneratedCategory
  onSave: (catId: string, updates: Partial<GeneratedCategory>) => void
  onClose: () => void
}) {
  const [nameRu, setNameRu] = useState(category.name.ru || '')
  const [nameEn, setNameEn] = useState(category.name.en || '')
  const [nameHy, setNameHy] = useState(category.name.hy || '')
  const [emoji, setEmoji] = useState(category.emoji || '🍽️')

  const handleSave = () => {
    onSave(category.id, {
      name: { ru: nameRu, en: nameEn, hy: nameHy },
      emoji,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Редактирование категории</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Эмодзи</label>
            <input
              type="text"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl"
              maxLength={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Название (RU)</label>
            <input type="text" value={nameRu} onChange={e => setNameRu(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Name (EN)</label>
            <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Անուն (HY)</label>
            <input type="text" value={nameHy} onChange={e => setNameHy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Отмена</Button>
          <Button onClick={handleSave} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
            <Check className="w-4 h-4 mr-1" /> Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}
