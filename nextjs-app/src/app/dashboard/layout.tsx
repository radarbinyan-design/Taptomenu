'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Table2,
  BarChart3,
  Settings,
  Bot,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell,
  Crown,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Обзор', exact: true },
  { href: '/dashboard/dishes', icon: UtensilsCrossed, label: 'Блюда' },
  { href: '/dashboard/menus', icon: BookOpen, label: 'Меню' },
  { href: '/dashboard/tables', icon: Table2, label: 'Столики' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Аналитика' },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'AI Ассистент', badge: 'LUXE' },
  { href: '/dashboard/settings', icon: Settings, label: 'Настройки' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col',
          'transition-transform duration-200',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TM</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">TapMenu</div>
              <div className="text-xs text-gray-400">Armenia</div>
            </div>
          </Link>
        </div>

        {/* Restaurant selector */}
        <div className="p-4 border-b border-gray-100">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              А
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">Ресторан Арарат</div>
              <div className="text-xs text-gray-400">Pro план</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: Subscription plan + logout */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          {/* Plan badge */}
          <div className="flex items-center gap-3 px-3 py-2 bg-amber-50 rounded-lg">
            <Crown className="w-4 h-4 text-amber-600" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-amber-700">Pro план</div>
              <div className="text-xs text-amber-500">$25/мес · до 100 блюд</div>
            </div>
          </div>

          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 lg:ml-0 ml-2">
            {/* Breadcrumb or page title will go here */}
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User avatar */}
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                А
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Арам</span>
              <ChevronDown className="hidden sm:block w-3 h-3 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
