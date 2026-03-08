'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Plus,
  BookOpen,
  Globe,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  Check,
  X,
  Copy,
  Settings2,
  MoreVertical,
  Layers,
} from 'lucide-react'

interface Menu {
  id: string
  name: string
  status: 'active' | 'draft' | 'archived'
  isDefault: boolean
  categories: number
  dishes: number
  languages: string[]
  updatedAt: string
  description?: string
}

const INITIAL_MENUS: Menu[] = [
  {
    id: '1',
    name: 'Основное меню',
    status: 'active',
    isDefault: true,
    categories: 4,
    dishes: 47,
    languages: ['RU', 'EN', 'HY', 'AR'],
    updatedAt: '2 часа назад',
    description: 'Полный ассортимент блюд ресторана',
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
    description: 'Меню для ланча, Пн–Пт 12:00–15:00',
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
    description: 'Напитки, коктейли, снеки',
  },
]

const PLAN_LIMIT = 3

const AVAILABLE_LANGS = ['RU', 'EN', 'HY', 'AR', 'FR', 'DE', 'ZH', 'ES']

type ModalMode = 'create' | 'edit' | 'delete' | null

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>(INITIAL_MENUS)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formLangs, setFormLangs] = useState<string[]>(['RU'])
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('active')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreate = () => {
    setFormName('')
    setFormDesc('')
    setFormLangs(['RU'])
    setFormStatus('active')
    setSelectedMenu(null)
    setModalMode('create')
  }

  const openEdit = (menu: Menu) => {
    setFormName(menu.name)
    setFormDesc(menu.description || '')
    setFormLangs([...menu.languages])
    setFormStatus(menu.status === 'draft' ? 'draft' : 'active')
    setSelectedMenu(menu)
    setModalMode('edit')
    setOpenMenuId(null)
  }

  const openDelete = (menu: Menu) => {
    setSelectedMenu(menu)
    setModalMode('delete')
    setOpenMenuId(null)
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedMenu(null)
  }

  const handleCreate = () => {
    if (!formName.trim()) return
    const newMenu: Menu = {
      id: Date.now().toString(),
      name: formName.trim(),
      status: formStatus,
      isDefault: menus.length === 0,
      categories: 0,
      dishes: 0,
      languages: formLangs,
      updatedAt: 'только что',
      description: formDesc.trim(),
    }
    setMenus([...menus, newMenu])
    showToast(`Меню «${newMenu.name}» создано!`)
    closeModal()
  }

  const handleEdit = () => {
    if (!selectedMenu || !formName.trim()) return
    setMenus(menus.map(m =>
      m.id === selectedMenu.id
        ? { ...m, name: formName.trim(), description: formDesc.trim(), languages: formLangs, status: formStatus, updatedAt: 'только что' }
        : m
    ))
    showToast(`Меню «${formName.trim()}» обновлено!`)
    closeModal()
  }

  const handleDelete = () => {
    if (!selectedMenu) return
    setMenus(menus.filter(m => m.id !== selectedMenu.id))
    showToast(`Меню «${selectedMenu.name}» удалено`, 'error')
    closeModal()
  }

  const toggleStatus = (id: string) => {
    setMenus(menus.map(m => {
      if (m.id !== id) return m
      const newStatus = m.status === 'active' ? 'draft' : 'active'
      showToast(`Меню «${m.name}» ${newStatus === 'active' ? 'активировано' : 'скрыто'}`)
      return { ...m, status: newStatus, updatedAt: 'только что' }
    }))
    setOpenMenuId(null)
  }

  const setDefault = (id: string) => {
    setMenus(menus.map(m => ({ ...m, isDefault: m.id === id })))
    const menu = menus.find(m => m.id === id)
    showToast(`«${menu?.name}» — теперь меню по умолчанию`)
    setOpenMenuId(null)
  }

  const duplicateMenu = (menu: Menu) => {
    const copy: Menu = {
      ...menu,
      id: Date.now().toString(),
      name: `${menu.name} (копия)`,
      isDefault: false,
      updatedAt: 'только что',
    }
    setMenus([...menus, copy])
    showToast(`Меню «${copy.name}» создано`)
    setOpenMenuId(null)
  }

  const toggleLang = (lang: string) => {
    setFormLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }

  const used = menus.length
  const limitPct = Math.min((used / PLAN_LIMIT) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Меню</h1>
          <p className="text-gray-500 mt-1">{used} из {PLAN_LIMIT} меню · Pro план</p>
        </div>
        <Button
          onClick={openCreate}
          disabled={used >= PLAN_LIMIT}
          className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Создать меню
        </Button>
      </div>

      {/* Plan usage */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Использование плана</span>
          <span className="text-sm text-gray-500">{used} / {PLAN_LIMIT} меню</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${limitPct >= 100 ? 'bg-red-500' : limitPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${limitPct}%` }}
          />
        </div>
        {used >= PLAN_LIMIT && (
          <p className="text-xs text-red-600 mt-2">
            Лимит достигнут. <Link href="/dashboard/settings#subscription" className="underline">Обновите план</Link> для добавления новых меню.
          </p>
        )}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map(menu => (
          <Card key={menu.id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{menu.name}</h3>
                    {menu.description && (
                      <p className="text-xs text-gray-500 truncate">{menu.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === menu.id ? null : menu.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>

                  {openMenuId === menu.id && (
                    <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      <button
                        onClick={() => openEdit(menu)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Редактировать
                      </button>
                      <Link
                        href={`/dashboard/menus/${menu.id}/edit`}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Редактор блюд
                      </Link>
                      {!menu.isDefault && (
                        <button
                          onClick={() => setDefault(menu.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Star className="w-3.5 h-3.5" /> По умолчанию
                        </button>
                      )}
                      <button
                        onClick={() => toggleStatus(menu.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {menu.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {menu.status === 'active' ? 'Скрыть' : 'Активировать'}
                      </button>
                      <button
                        onClick={() => duplicateMenu(menu)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="w-3.5 h-3.5" /> Дублировать
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => openDelete(menu)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        disabled={menu.isDefault}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {menu.isDefault ? 'Нельзя удалить (по умолч.)' : 'Удалить'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge className={`text-xs ${menu.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {menu.status === 'active' ? '● Активно' : '○ Черновик'}
                </Badge>
                {menu.isDefault && (
                  <Badge className="text-xs bg-amber-100 text-amber-700">
                    ★ По умолчанию
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-gray-900">{menu.categories}</p>
                  <p className="text-xs text-gray-500">категорий</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-gray-900">{menu.dishes}</p>
                  <p className="text-xs text-gray-500">блюд</p>
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-center gap-1.5 mb-4">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {menu.languages.map(l => (
                  <span key={l} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                    {l}
                  </span>
                ))}
              </div>

              {/* Footer actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/dashboard/menus/${menu.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Редактор
                </Link>
                <Link
                  href={`/menu/araratrest`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Открыть
                </Link>
              </div>

              <p className="text-xs text-gray-400 mt-2 text-right">Обновлено {menu.updatedAt}</p>
            </CardContent>
          </Card>
        ))}

        {/* Create new card */}
        {used < PLAN_LIMIT && (
          <button
            onClick={openCreate}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition-all min-h-[200px]"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-amber-100">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Создать новое меню</span>
          </button>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === 'create' ? '✨ Создать меню' : '✏️ Редактировать меню'}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Название меню *</label>
                <Input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Например: Основное меню"
                  className="w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Описание</label>
                <Input
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Краткое описание меню"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Статус</label>
                <div className="flex gap-2">
                  {(['active', 'draft'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFormStatus(s)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        formStatus === s
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s === 'active' ? '● Активное' : '○ Черновик'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Языки меню</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGS.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleLang(lang)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                        formLangs.includes(lang)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {formLangs.includes(lang) && <Check className="w-3 h-3 inline mr-1" />}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 pt-0">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Отмена
              </Button>
              <Button
                onClick={modalMode === 'create' ? handleCreate : handleEdit}
                disabled={!formName.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {modalMode === 'create' ? 'Создать' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {modalMode === 'delete' && selectedMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Удалить меню?</h2>
              <p className="text-gray-500 text-sm">
                «<strong>{selectedMenu.name}</strong>» будет удалено вместе со всеми настройками. Блюда из библиотеки не удаляются.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">Отмена</Button>
              <Button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay close */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  )
}
