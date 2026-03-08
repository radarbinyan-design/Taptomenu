'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  UtensilsCrossed,
  Save,
  Globe,
  ExternalLink,
  Copy,
  Search,
  Star,
} from 'lucide-react'

interface Dish {
  id: string
  name: string
  price: number
  emoji: string
  status: 'active' | 'hidden'
  isVegan: boolean
  isGlutenFree: boolean
  spicyLevel: number
}

interface Category {
  id: string
  name: string
  emoji: string
  isVisible: boolean
  sortOrder: number
  dishes: Dish[]
  isExpanded: boolean
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'c1', name: 'Горячие блюда', emoji: '🔥', isVisible: true, sortOrder: 0, isExpanded: true,
    dishes: [
      { id: 'd1', name: 'Хоровац из баранины', price: 4800, emoji: '🥩', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 1 },
      { id: 'd2', name: 'Долма в виноградных листьях', price: 2800, emoji: '🫑', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 0 },
      { id: 'd3', name: 'Кюфта по-армянски', price: 3200, emoji: '🍖', status: 'active', isVegan: false, isGlutenFree: false, spicyLevel: 1 },
    ],
  },
  {
    id: 'c2', name: 'Салаты', emoji: '🥗', isVisible: true, sortOrder: 1, isExpanded: true,
    dishes: [
      { id: 'd4', name: 'Греческий салат', price: 2500, emoji: '🫒', status: 'active', isVegan: true, isGlutenFree: true, spicyLevel: 0 },
      { id: 'd5', name: 'Салат Арарат', price: 2200, emoji: '🥬', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 0 },
    ],
  },
  {
    id: 'c3', name: 'Напитки', emoji: '🥂', isVisible: true, sortOrder: 2, isExpanded: false,
    dishes: [
      { id: 'd6', name: 'Армянское вино', price: 1800, emoji: '🍷', status: 'active', isVegan: true, isGlutenFree: true, spicyLevel: 0 },
      { id: 'd7', name: 'Тан', price: 600, emoji: '🥛', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 0 },
      { id: 'd8', name: 'Лимонад домашний', price: 800, emoji: '🍋', status: 'active', isVegan: true, isGlutenFree: true, spicyLevel: 0 },
    ],
  },
  {
    id: 'c4', name: 'Хлеб и лаваш', emoji: '🫓', isVisible: false, sortOrder: 3, isExpanded: false,
    dishes: [
      { id: 'd9', name: 'Лаваш с сырами', price: 1200, emoji: '🧀', status: 'active', isVegan: false, isGlutenFree: false, spicyLevel: 0 },
    ],
  },
]

// All available dishes from library (not yet in menu)
const LIBRARY_DISHES: Dish[] = [
  { id: 'lib1', name: 'Бастурма', price: 3600, emoji: '🥩', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 2 },
  { id: 'lib2', name: 'Суджук', price: 3200, emoji: '🌭', status: 'active', isVegan: false, isGlutenFree: true, spicyLevel: 3 },
  { id: 'lib3', name: 'Пахлава', price: 1500, emoji: '🍯', status: 'active', isVegan: true, isGlutenFree: false, spicyLevel: 0 },
]

export default function MenuEditorPage({ params }: { params: { id: string } }) {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [dragCatId, setDragCatId] = useState<string | null>(null)
  const [dragDishId, setDragDishId] = useState<string | null>(null)
  const [dragFromCatId, setDragFromCatId] = useState<string | null>(null)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catEditName, setCatEditName] = useState('')
  const [catEditEmoji, setCatEditEmoji] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📋')
  const [showLibrary, setShowLibrary] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')
  const [targetCatId, setTargetCatId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const toggleCategory = (id: string) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, isExpanded: !c.isExpanded } : c))
  }

  const toggleCatVisibility = (id: string) => {
    setCategories(cats => cats.map(c => {
      if (c.id !== id) return c
      showToast(`«${c.name}» ${!c.isVisible ? 'показана' : 'скрыта'}`)
      return { ...c, isVisible: !c.isVisible }
    }))
  }

  const deleteCategory = (id: string) => {
    const cat = categories.find(c => c.id === id)
    if (!cat) return
    if (!confirm(`Удалить категорию «${cat.name}»? Блюда из библиотеки не удалятся.`)) return
    setCategories(cats => cats.filter(c => c.id !== id))
    showToast(`Категория «${cat.name}» удалена`)
  }

  const startEditCat = (cat: Category) => {
    setEditingCatId(cat.id)
    setCatEditName(cat.name)
    setCatEditEmoji(cat.emoji)
  }

  const saveEditCat = () => {
    setCategories(cats => cats.map(c =>
      c.id === editingCatId ? { ...c, name: catEditName, emoji: catEditEmoji } : c
    ))
    setEditingCatId(null)
    showToast('Категория обновлена')
  }

  const addCategory = () => {
    if (!newCatName.trim()) return
    const newCat: Category = {
      id: `c${Date.now()}`,
      name: newCatName.trim(),
      emoji: newCatEmoji,
      isVisible: true,
      sortOrder: categories.length,
      dishes: [],
      isExpanded: true,
    }
    setCategories(prev => [...prev, newCat])
    setNewCatName('')
    setNewCatEmoji('📋')
    setShowAddCat(false)
    showToast(`Категория «${newCat.name}» добавлена`)
  }

  const toggleDishStatus = (catId: string, dishId: string) => {
    setCategories(cats => cats.map(c => {
      if (c.id !== catId) return c
      return {
        ...c,
        dishes: c.dishes.map(d => {
          if (d.id !== dishId) return d
          showToast(`«${d.name}» ${d.status === 'active' ? 'скрыто' : 'активировано'}`)
          return { ...d, status: d.status === 'active' ? 'hidden' : 'active' }
        })
      }
    }))
  }

  const removeDishFromMenu = (catId: string, dishId: string) => {
    setCategories(cats => cats.map(c => {
      if (c.id !== catId) return c
      const dish = c.dishes.find(d => d.id === dishId)
      if (dish) showToast(`«${dish.name}» удалено из меню`)
      return { ...c, dishes: c.dishes.filter(d => d.id !== dishId) }
    }))
  }

  const addDishFromLibrary = (dish: Dish, catId: string) => {
    setCategories(cats => cats.map(c => {
      if (c.id !== catId) return c
      if (c.dishes.some(d => d.id === dish.id)) {
        showToast('Блюдо уже добавлено в эту категорию')
        return c
      }
      return { ...c, dishes: [...c.dishes, { ...dish }] }
    }))
    showToast(`«${dish.name}» добавлено в меню!`)
  }

  // Drag & drop categories
  const handleCatDragStart = (e: React.DragEvent, id: string) => {
    setDragCatId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleCatDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (!dragCatId || dragCatId === id) return
    setCategories(prev => {
      const fromIdx = prev.findIndex(c => c.id === dragCatId)
      const toIdx = prev.findIndex(c => c.id === id)
      if (fromIdx === -1 || toIdx === -1) return prev
      const next = [...prev]
      const [item] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, item)
      return next
    })
  }

  const handleCatDragEnd = () => setDragCatId(null)

  // Drag & drop dishes within category
  const handleDishDragStart = (e: React.DragEvent, dishId: string, catId: string) => {
    setDragDishId(dishId)
    setDragFromCatId(catId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDishDragOver = (e: React.DragEvent, dishId: string, catId: string) => {
    e.preventDefault()
    if (!dragDishId || !dragFromCatId || dragFromCatId !== catId || dragDishId === dishId) return
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c
      const fromIdx = c.dishes.findIndex(d => d.id === dragDishId)
      const toIdx = c.dishes.findIndex(d => d.id === dishId)
      if (fromIdx === -1 || toIdx === -1) return c
      const next = [...c.dishes]
      const [item] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, item)
      return { ...c, dishes: next }
    }))
  }

  const handleDishDragEnd = () => { setDragDishId(null); setDragFromCatId(null) }

  const handleSave = () => {
    setSaved(true)
    showToast('Меню сохранено!')
    setTimeout(() => setSaved(false), 2000)
  }

  const totalDishes = categories.reduce((s, c) => s + c.dishes.length, 0)
  const visibleCats = categories.filter(c => c.isVisible).length

  const filteredLibrary = LIBRARY_DISHES.filter(d =>
    d.name.toLowerCase().includes(librarySearch.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white bg-green-500">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/menus" className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Редактор меню</h1>
          <p className="text-sm text-gray-500">{categories.length} категорий · {totalDishes} блюд · {visibleCats} видимых</p>
        </div>
        <Link
          href="/menu/araratrest"
          target="_blank"
          className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          <ExternalLink className="w-4 h-4" />
          Просмотр
        </Link>
        <Button
          onClick={handleSave}
          className={`flex items-center gap-1.5 ${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} text-white`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Сохранено!' : 'Сохранить'}
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-sm text-blue-700">
        <GripVertical className="w-4 h-4 shrink-0" />
        Перетаскивайте категории и блюда для изменения порядка отображения в меню
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            draggable
            onDragStart={(e) => handleCatDragStart(e, cat.id)}
            onDragOver={(e) => handleCatDragOver(e, cat.id)}
            onDragEnd={handleCatDragEnd}
            className={`bg-white border rounded-xl transition-all ${
              dragCatId === cat.id ? 'opacity-50 border-amber-300' : 'border-gray-200'
            } ${!cat.isVisible ? 'opacity-60' : ''}`}
          >
            {/* Category header */}
            <div className="flex items-center gap-2 p-3">
              <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                <GripVertical className="w-5 h-5" />
              </div>

              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex-1 flex items-center gap-2 text-left"
              >
                <span className="text-lg">{cat.emoji}</span>
                {editingCatId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                    <input
                      value={catEditEmoji}
                      onChange={e => setCatEditEmoji(e.target.value)}
                      className="w-12 border border-gray-200 rounded px-2 py-1 text-sm text-center"
                    />
                    <Input
                      value={catEditName}
                      onChange={e => setCatEditName(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      onKeyDown={e => e.key === 'Enter' && saveEditCat()}
                      autoFocus
                    />
                    <button onClick={saveEditCat} className="w-7 h-7 flex items-center justify-center bg-green-500 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={() => setEditingCatId(null)} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg">
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">{cat.name}</span>
                    <Badge className="text-xs bg-gray-100 text-gray-600 ml-1">{cat.dishes.length}</Badge>
                    {!cat.isVisible && <Badge className="text-xs bg-gray-100 text-gray-400">скрыта</Badge>}
                  </>
                )}
              </button>

              {editingCatId !== cat.id && (
                <div className="flex items-center gap-1">
                  <button onClick={() => startEditCat(cat)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={() => toggleCatVisibility(cat.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
                    {cat.isVisible ? <Eye className="w-3.5 h-3.5 text-gray-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
                  </button>
                  <button
                    onClick={() => { setTargetCatId(cat.id); setShowLibrary(true) }}
                    className="flex items-center gap-1 h-7 px-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Блюдо
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" />
                  </button>
                  <button onClick={() => toggleCategory(cat.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
                    {cat.isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Dishes list */}
            {cat.isExpanded && (
              <div className="border-t border-gray-100">
                {cat.dishes.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-400">Нет блюд в этой категории</p>
                    <button
                      onClick={() => { setTargetCatId(cat.id); setShowLibrary(true) }}
                      className="mt-2 text-xs text-amber-500 hover:text-amber-600 font-medium"
                    >
                      + Добавить из библиотеки
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {cat.dishes.map(dish => (
                      <div
                        key={dish.id}
                        draggable
                        onDragStart={(e) => handleDishDragStart(e, dish.id, cat.id)}
                        onDragOver={(e) => handleDishDragOver(e, dish.id, cat.id)}
                        onDragEnd={handleDishDragEnd}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          dragDishId === dish.id ? 'opacity-50' : ''
                        } ${dish.status === 'hidden' ? 'opacity-60' : ''}`}
                      >
                        <div className="cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className="text-xl">{dish.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${dish.status === 'hidden' ? 'text-gray-400' : 'text-gray-900'}`}>
                            {dish.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-500">{dish.price.toLocaleString()} ֏</span>
                            {dish.isVegan && <span className="text-xs text-green-600">🌱</span>}
                            {dish.isGlutenFree && <span className="text-xs text-blue-600">GF</span>}
                            {dish.spicyLevel > 0 && <span className="text-xs">{'🌶'.repeat(dish.spicyLevel)}</span>}
                          </div>
                        </div>
                        <Badge className={`text-xs ${dish.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {dish.status === 'active' ? 'Активно' : 'Скрыто'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/dashboard/dishes/${dish.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => toggleDishStatus(cat.id, dish.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            {dish.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => removeDishFromMenu(cat.id, dish.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add category */}
      {showAddCat ? (
        <div className="bg-white border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Новая категория</p>
          <div className="flex gap-2">
            <input
              value={newCatEmoji}
              onChange={e => setNewCatEmoji(e.target.value)}
              className="w-14 border border-gray-200 rounded-lg px-2 py-2 text-center text-lg"
              maxLength={2}
            />
            <Input
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Название категории"
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              autoFocus
            />
            <Button onClick={addCategory} disabled={!newCatName.trim()} className="bg-amber-500 hover:bg-amber-600 text-white">
              Добавить
            </Button>
            <Button variant="outline" onClick={() => setShowAddCat(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddCat(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Добавить категорию</span>
        </button>
      )}

      {/* Library modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">📚 Библиотека блюд</h2>
              <button onClick={() => setShowLibrary(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  placeholder="Поиск блюда..."
                  className="pl-9"
                  autoFocus
                />
              </div>
              {targetCatId && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Добавить в: <strong>{categories.find(c => c.id === targetCatId)?.name}</strong>
                </p>
              )}
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredLibrary.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Нет блюд</p>
              ) : (
                filteredLibrary.map(dish => (
                  <div key={dish.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="text-2xl">{dish.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{dish.name}</p>
                      <p className="text-xs text-gray-500">{dish.price.toLocaleString()} ֏</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (targetCatId) {
                          addDishFromLibrary(dish, targetCatId)
                          setShowLibrary(false)
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Добавить
                    </Button>
                  </div>
                ))
              )}
              <Link
                href="/dashboard/dishes/new"
                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition-all mt-2"
                onClick={() => setShowLibrary(false)}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Создать новое блюдо</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
