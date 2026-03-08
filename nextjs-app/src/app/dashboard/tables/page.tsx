'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  QrCode,
  Wifi,
  Edit2,
  Trash2,
  Download,
  Table2,
  Check,
  X,
  Copy,
  Signal,
  Eye,
  MoreVertical,
  Smartphone,
  RefreshCw,
  Share2,
} from 'lucide-react'

interface TableItem {
  id: string
  name: string
  nfcTagId: string | null
  qrCode: boolean
  isActive: boolean
  views: number
  zone?: string
}

const INITIAL_TABLES: TableItem[] = [
  { id: 't1', name: 'Столик 1', nfcTagId: 'NFC-A1B2C3', qrCode: true, isActive: true, views: 124, zone: 'Зал' },
  { id: 't2', name: 'Столик 2', nfcTagId: 'NFC-D4E5F6', qrCode: true, isActive: true, views: 98, zone: 'Зал' },
  { id: 't3', name: 'Столик 3', nfcTagId: 'NFC-G7H8I9', qrCode: true, isActive: true, views: 76, zone: 'Зал' },
  { id: 't4', name: 'Столик 4', nfcTagId: null, qrCode: true, isActive: true, views: 54, zone: 'Зал' },
  { id: 't5', name: 'Терраса 1', nfcTagId: 'NFC-J0K1L2', qrCode: true, isActive: true, views: 210, zone: 'Терраса' },
  { id: 't6', name: 'Терраса 2', nfcTagId: null, qrCode: false, isActive: false, views: 0, zone: 'Терраса' },
  { id: 't7', name: 'Бар 1', nfcTagId: 'NFC-M3N4O5', qrCode: true, isActive: true, views: 187, zone: 'Бар' },
  { id: 't8', name: 'Банкетный зал', nfcTagId: 'NFC-P6Q7R8', qrCode: true, isActive: true, views: 42, zone: 'VIP' },
]

const BASE_URL = 'https://menu.tapmenu.am/araratrest'
const PLAN_LIMIT = 10

type ModalMode = 'create' | 'edit' | 'delete' | 'qr' | null

// Simple QR SVG generator (visual representation)
function QrPreview({ tableId, tableName }: { tableId: string; tableName: string }) {
  const url = `${BASE_URL}?table=${tableId}`
  // Generate a visual QR pattern using deterministic pixel grid
  const seed = tableId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const row = Math.floor(i / 21)
    const col = i % 21
    // Fixed finder patterns (corners)
    if ((row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7)) return true
    return ((seed * (i + 1) * 37) % 7 < 3)
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <svg width="168" height="168" viewBox="0 0 21 21">
          {cells.map((filled, i) => {
            const row = Math.floor(i / 21)
            const col = i % 21
            return filled ? (
              <rect key={i} x={col} y={row} width={1} height={1} fill="#1a1a1a" />
            ) : null
          })}
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-800 text-sm">{tableName}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[200px]">{url}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            const link = document.createElement('a')
            link.download = `qr-${tableId}.png`
            link.href = 'data:image/png;base64,iVBORw0KGgoAAAANS=' // placeholder
            // In production, use actual QR library
            navigator.clipboard.writeText(url)
            alert('URL скопирован: ' + url)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
        >
          <Copy className="w-3.5 h-3.5" />
          Копировать URL
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Скачать
        </button>
      </div>
    </div>
  )
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [openTableId, setOpenTableId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterZone, setFilterZone] = useState<string>('all')

  // Form state
  const [formName, setFormName] = useState('')
  const [formZone, setFormZone] = useState('Зал')
  const [formNfc, setFormNfc] = useState('')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const zones = ['all', ...Array.from(new Set(tables.map(t => t.zone || 'Общий')))]

  const filtered = tables.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nfcTagId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchZone = filterZone === 'all' || t.zone === filterZone
    return matchSearch && matchZone
  })

  const openCreate = () => {
    setFormName(`Столик ${tables.length + 1}`)
    setFormZone('Зал')
    setFormNfc('')
    setSelectedTable(null)
    setModalMode('create')
  }

  const openEdit = (table: TableItem) => {
    setFormName(table.name)
    setFormZone(table.zone || 'Зал')
    setFormNfc(table.nfcTagId || '')
    setSelectedTable(table)
    setModalMode('edit')
    setOpenTableId(null)
  }

  const openQr = (table: TableItem) => {
    setSelectedTable(table)
    setModalMode('qr')
    setOpenTableId(null)
  }

  const openDelete = (table: TableItem) => {
    setSelectedTable(table)
    setModalMode('delete')
    setOpenTableId(null)
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTable(null)
  }

  const handleCreate = () => {
    if (!formName.trim()) return
    const newTable: TableItem = {
      id: `t${Date.now()}`,
      name: formName.trim(),
      nfcTagId: formNfc.trim() || null,
      qrCode: true,
      isActive: true,
      views: 0,
      zone: formZone.trim() || 'Зал',
    }
    setTables([...tables, newTable])
    showToast(`Столик «${newTable.name}» добавлен!`)
    closeModal()
  }

  const handleEdit = () => {
    if (!selectedTable || !formName.trim()) return
    setTables(tables.map(t =>
      t.id === selectedTable.id
        ? { ...t, name: formName.trim(), zone: formZone, nfcTagId: formNfc.trim() || null }
        : t
    ))
    showToast(`Столик «${formName}» обновлён`)
    closeModal()
  }

  const handleDelete = () => {
    if (!selectedTable) return
    setTables(tables.filter(t => t.id !== selectedTable.id))
    showToast(`Столик удалён`, 'error')
    closeModal()
  }

  const toggleActive = (id: string) => {
    setTables(tables.map(t => {
      if (t.id !== id) return t
      showToast(`«${t.name}» ${!t.isActive ? 'активирован' : 'отключён'}`)
      return { ...t, isActive: !t.isActive }
    }))
    setOpenTableId(null)
  }

  const generateNfc = (id: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const code = 'NFC-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setTables(tables.map(t => t.id === id ? { ...t, nfcTagId: code } : t))
    showToast(`NFC код назначен: ${code}`)
    setOpenTableId(null)
  }

  const copyUrl = (tableId: string) => {
    const url = `${BASE_URL}?table=${tableId}`
    navigator.clipboard.writeText(url).then(() => showToast('URL скопирован!')).catch(() => showToast('Ошибка копирования', 'error'))
    setOpenTableId(null)
  }

  const activeCount = tables.filter(t => t.isActive).length
  const nfcCount = tables.filter(t => t.nfcTagId).length
  const totalViews = tables.reduce((s, t) => s + t.views, 0)

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NFC-столики</h1>
          <p className="text-gray-500 mt-1">{tables.length} столиков · {nfcCount} с NFC · {activeCount} активных</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const urls = tables.filter(t => t.isActive).map(t => `${t.name}: ${BASE_URL}?table=${t.id}`).join('\n')
              navigator.clipboard.writeText(urls).then(() => showToast('Все URL скопированы!'))
            }}
            className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Скачать QR</span>
          </button>
          <Button
            onClick={openCreate}
            disabled={tables.length >= PLAN_LIMIT}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Всего столиков', value: tables.length, icon: Table2, color: 'text-blue-500 bg-blue-50' },
          { label: 'С NFC-тегом', value: nfcCount, icon: Signal, color: 'text-purple-500 bg-purple-50' },
          { label: 'Сканирований', value: totalViews, icon: Eye, color: 'text-green-500 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* NFC info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div className="text-2xl">📡</div>
        <div>
          <p className="text-sm font-medium text-blue-800">Как настроить NFC-тег</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Запишите URL{' '}
            <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-xs">
              {BASE_URL}?table=СТОЛИК_ID
            </span>{' '}
            на NFC-стикер с помощью приложения{' '}
            <strong>NFC Tools</strong> (iOS/Android).
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск столиков..."
            className="pl-4"
          />
        </div>
        <div className="flex gap-2">
          {zones.map(z => (
            <button
              key={z}
              onClick={() => setFilterZone(z)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filterZone === z
                  ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {z === 'all' ? 'Все' : z}
            </button>
          ))}
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(table => (
          <Card
            key={table.id}
            className={`border transition-all ${table.isActive ? 'border-gray-200 hover:shadow-md' : 'border-gray-100 opacity-60'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    table.isActive ? 'bg-amber-50' : 'bg-gray-100'
                  }`}>
                    <Table2 className={`w-5 h-5 ${table.isActive ? 'text-amber-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{table.name}</p>
                    {table.zone && <p className="text-xs text-gray-400">{table.zone}</p>}
                  </div>
                </div>

                {/* Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenTableId(openTableId === table.id ? null : table.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  {openTableId === table.id && (
                    <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      <button onClick={() => openQr(table)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <QrCode className="w-3.5 h-3.5" /> QR-код
                      </button>
                      <button onClick={() => copyUrl(table.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Copy className="w-3.5 h-3.5" /> Копировать URL
                      </button>
                      <button onClick={() => openEdit(table)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Edit2 className="w-3.5 h-3.5" /> Редактировать
                      </button>
                      {!table.nfcTagId && (
                        <button onClick={() => generateNfc(table.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <RefreshCw className="w-3.5 h-3.5" /> Создать NFC
                        </button>
                      )}
                      <button onClick={() => toggleActive(table.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {table.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        {table.isActive ? 'Отключить' : 'Активировать'}
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => openDelete(table)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" /> Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge className={`text-xs ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {table.isActive ? '● Активен' : '○ Откл.'}
                </Badge>
                {table.nfcTagId ? (
                  <Badge className="text-xs bg-purple-100 text-purple-700">
                    📡 NFC
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-gray-100 text-gray-500">Без NFC</Badge>
                )}
                {table.qrCode && (
                  <Badge className="text-xs bg-blue-100 text-blue-700">
                    ▦ QR
                  </Badge>
                )}
              </div>

              {/* NFC ID */}
              {table.nfcTagId && (
                <div className="flex items-center gap-1.5 mb-2 bg-purple-50 rounded-lg px-2.5 py-1.5">
                  <Signal className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-mono text-purple-700">{table.nfcTagId}</span>
                </div>
              )}

              {/* Views */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{table.views} сканирований</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openQr(table)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-7 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR
                </button>
                <button
                  onClick={() => copyUrl(table.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-7 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  URL
                </button>
                <button
                  onClick={() => openEdit(table)}
                  className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add table card */}
        {tables.length < PLAN_LIMIT && (
          <button
            onClick={openCreate}
            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition-all min-h-[160px]"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Добавить столик</span>
          </button>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === 'create' ? '➕ Добавить столик' : '✏️ Редактировать столик'}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Название *</label>
                <Input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Столик 1 / Терраса / VIP"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Зона</label>
                <Input
                  value={formZone}
                  onChange={e => setFormZone(e.target.value)}
                  placeholder="Зал, Терраса, Бар, VIP..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">NFC-тег ID (опционально)</label>
                <div className="flex gap-2">
                  <Input
                    value={formNfc}
                    onChange={e => setFormNfc(e.target.value)}
                    placeholder="NFC-A1B2C3"
                    className="flex-1"
                  />
                  <button
                    onClick={() => {
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                      const code = 'NFC-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
                      setFormNfc(code)
                    }}
                    className="px-3 h-9 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 whitespace-nowrap"
                  >
                    Сгенерировать
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  QR-код создаётся автоматически для всех столиков
                </p>
              </div>

              {/* Preview URL */}
              {formName.trim() && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">URL меню будет:</p>
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {BASE_URL}?table={selectedTable?.id || 'new'}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <Button variant="outline" onClick={closeModal} className="flex-1">Отмена</Button>
              <Button
                onClick={modalMode === 'create' ? handleCreate : handleEdit}
                disabled={!formName.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {modalMode === 'create' ? 'Добавить' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {modalMode === 'qr' && selectedTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">QR-код</h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <QrPreview tableId={selectedTable.id} tableName={selectedTable.name} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalMode === 'delete' && selectedTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Удалить столик?</h2>
              <p className="text-gray-500 text-sm">«<strong>{selectedTable.name}</strong>» будет удалён. Это действие нельзя отменить.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">Отмена</Button>
              <Button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Удалить</Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay close */}
      {openTableId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenTableId(null)} />
      )}
    </div>
  )
}
