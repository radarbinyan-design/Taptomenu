import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, QrCode, Wifi, Edit2, Trash2, Download, Table2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Столики' }

const tables = [
  { id: 't1', name: 'Столик 1', nfcTagId: 'NFC-A1B2C3', qrCode: true, isActive: true, views: 124 },
  { id: 't2', name: 'Столик 2', nfcTagId: 'NFC-D4E5F6', qrCode: true, isActive: true, views: 98 },
  { id: 't3', name: 'Столик 3', nfcTagId: 'NFC-G7H8I9', qrCode: true, isActive: true, views: 76 },
  { id: 't4', name: 'Столик 4', nfcTagId: null, qrCode: true, isActive: true, views: 54 },
  { id: 't5', name: 'Терраса 1', nfcTagId: 'NFC-J0K1L2', qrCode: true, isActive: true, views: 210 },
  { id: 't6', name: 'Терраса 2', nfcTagId: null, qrCode: false, isActive: false, views: 0 },
  { id: 't7', name: 'Бар 1', nfcTagId: 'NFC-M3N4O5', qrCode: true, isActive: true, views: 187 },
  { id: 't8', name: 'Банкетный зал', nfcTagId: 'NFC-P6Q7R8', qrCode: true, isActive: true, views: 42 },
]

export default function TablesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NFC-столики</h1>
          <p className="text-gray-500 mt-1">8 столиков · 6 с NFC · Pro план: 8/5 NFC</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Скачать все QR
          </Button>
          <Button>
            <Plus className="w-4 h-4" />
            Добавить столик
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div className="text-2xl">📡</div>
        <div>
          <p className="text-sm font-medium text-blue-800">Как настроить NFC-тег</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Запишите URL <span className="font-mono bg-blue-100 px-1 rounded">https://menu.tapmenu.am/araratrest?table=СТОЛИК_ID</span> на NFC-стикер с помощью приложения NFC Tools (iOS/Android).
          </p>
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className={!table.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              {/* Table icon */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Table2 className="w-5 h-5 text-gray-600" />
                </div>
                <Badge variant={table.isActive ? 'success' : 'outline'}>
                  {table.isActive ? 'Активен' : 'Откл.'}
                </Badge>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-gray-900 text-sm mb-2">{table.name}</h3>

              {/* Tags */}
              <div className="space-y-1.5 mb-3">
                {table.nfcTagId ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1">
                    <span>📡</span>
                    <span className="font-mono truncate">{table.nfcTagId}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg px-2 py-1">
                    <span>📡</span>
                    <span>NFC не привязан</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 rounded-lg px-2 py-1">
                  <QrCode className="w-3 h-3" />
                  <span>QR-код активен</span>
                </div>
              </div>

              {/* Views */}
              <div className="text-xs text-gray-400 mb-3">
                👁️ {table.views} просмотров
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button className="flex-1 text-xs text-center py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-1">
                  <QrCode className="w-3 h-3" />
                  QR
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add new */}
        <button className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-amber-400 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-amber-600 min-h-40">
          <Plus className="w-6 h-6" />
          <span className="text-xs font-medium">Добавить</span>
        </button>
      </div>
    </div>
  )
}
