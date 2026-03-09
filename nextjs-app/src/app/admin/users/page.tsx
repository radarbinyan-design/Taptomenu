import type { Metadata } from 'next'
import { Users, Search, Plus, Mail, Phone, Shield, Crown, Zap, Star, Globe, CheckCircle, Clock, Ban, Filter, MoreHorizontal, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Пользователи | Admin — TapMenu Armenia' }

const users = [
  { id: '1', name: 'Давид Саркисян', email: 'davit@noev.am', phone: '+374 91 123456', role: 'owner', plan: 'pro', status: 'active', restaurant: 'Таверна Ноев Ковчег', joined: '3 дня назад', lastLogin: '1 час назад' },
  { id: '2', name: 'Арам Петросян', email: 'aram@araratrest.am', phone: '+374 77 234567', role: 'owner', plan: 'luxe', status: 'active', restaurant: 'Ресторан Арарат', joined: '2 мес. назад', lastLogin: '5 мин назад' },
  { id: '3', name: 'Ани Карапетян', email: 'ani@cafeberd.am', phone: '+374 93 345678', role: 'owner', plan: 'starter', status: 'trial', restaurant: 'Кофе Берд', joined: '5 дней назад', lastLogin: '2 часа назад' },
  { id: '4', name: 'Марина Оганян', email: 'marina@sevan.am', phone: '+374 94 456789', role: 'owner', plan: 'premium', status: 'grace', restaurant: 'Мини-отель Sevan', joined: '1 мес. назад', lastLogin: '3 дня назад' },
  { id: '5', name: 'Карен Авагян', email: 'karen@milano.am', phone: '+374 96 567890', role: 'owner', plan: 'pro', status: 'active', restaurant: 'Пиццерия Milano', joined: '3 нед. назад', lastLogin: 'вчера' },
  { id: '6', name: 'Сусан Мкртчян', email: 'susan@aragats.am', phone: '+374 91 678901', role: 'owner', plan: 'starter', status: 'blocked', restaurant: 'Кафе Арагац', joined: '6 мес. назад', lastLogin: '2 мес. назад' },
  { id: '7', name: 'Admin TapMenu', email: 'admin@tapmenu.am', phone: '+374 99 000001', role: 'superadmin', plan: 'luxe', status: 'active', restaurant: '—', joined: '1 год назад', lastLogin: 'сейчас' },
  { id: '8', name: 'Нарек Григорян', email: 'narek@bistro.am', phone: '+374 77 789012', role: 'owner', plan: 'pro', status: 'active', restaurant: 'Bistro Yerevan', joined: '1 мес. назад', lastLogin: '30 мин назад' },
  { id: '9', name: 'Лусине Асатрян', email: 'lusine@lavash.am', phone: '+374 93 890123', role: 'owner', plan: 'starter', status: 'trial', restaurant: 'Lavash House', joined: '1 неделю назад', lastLogin: '4 часа назад' },
]

const roleConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  superadmin: { color: 'bg-red-100 text-red-700 border border-red-200', label: 'Super Admin', icon: Shield },
  admin: { color: 'bg-orange-100 text-orange-700 border border-orange-200', label: 'Admin', icon: Shield },
  owner: { color: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'Владелец', icon: Users },
}

const planConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  luxe:    { color: 'bg-purple-100 text-purple-700', label: 'LUXE',    icon: Crown },
  premium: { color: 'bg-amber-100 text-amber-700',   label: 'Premium', icon: Star },
  pro:     { color: 'bg-blue-100 text-blue-700',     label: 'Pro',     icon: Zap },
  starter: { color: 'bg-gray-100 text-gray-600',     label: 'Starter', icon: Globe },
}

const statusConfig: Record<string, { color: string; label: string }> = {
  active:  { color: 'bg-green-100 text-green-700',  label: 'Активен' },
  trial:   { color: 'bg-amber-100 text-amber-700',  label: 'Триал' },
  grace:   { color: 'bg-orange-100 text-orange-700',label: 'Grace' },
  blocked: { color: 'bg-red-100 text-red-700',      label: 'Заблокирован' },
}

export default function AdminUsersPage() {
  const total = users.length
  const active = users.filter(u => u.status === 'active').length
  const trial = users.filter(u => u.status === 'trial').length
  const blocked = users.filter(u => u.status === 'blocked').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-gray-400 text-sm mt-1">Все зарегистрированные аккаунты</p>
        </div>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Добавить пользователя
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего', value: total, color: 'text-white' },
          { label: 'Активных', value: active, color: 'text-green-400' },
          { label: 'На триале', value: trial, color: 'text-amber-400' },
          { label: 'Заблокировано', value: blocked, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по имени, email, ресторану..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
          <Filter className="w-4 h-4" /> Фильтр
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Пользователь</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Контакты</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Роль</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Тариф</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Статус</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Последний вход</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {users.map(u => {
                const role = roleConfig[u.role] ?? roleConfig.owner
                const plan = planConfig[u.plan] ?? planConfig.starter
                const status = statusConfig[u.status] ?? statusConfig.active
                const RoleIcon = role.icon
                const PlanIcon = plan.icon
                const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-amber-400 text-xs font-bold">
                          {initials}
                        </div>
                        <div>
                          <div className="font-medium text-white">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.restaurant}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />{u.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Phone className="w-3 h-3" />{u.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${role.color}`}>
                        <RoleIcon className="w-3 h-3" />{role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${plan.color}`}>
                        <PlanIcon className="w-3 h-3" />{plan.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <div className="text-xs text-gray-400">{u.lastLogin}</div>
                      <div className="text-xs text-gray-600">{u.joined}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Редактировать">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors" title="Ещё">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>Показано {users.length} из 53 пользователей</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">← Пред</button>
            <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">След →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
