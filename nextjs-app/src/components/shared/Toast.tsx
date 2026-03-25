/**
 * TapMenu Armenia — Toast Notification System
 *
 * Global toast context + provider for dashboard pages.
 * Usage:
 *   const { toast } = useToast()
 *   toast('Saved!', 'success')
 *   toast('Error occurred', 'error')
 */

'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastMessage {
  id: number
  text: string
  type: ToastType
}

interface ToastContextValue {
  toast: (text: string, type?: ToastType) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
})

export const useToast = () => useContext(ToastContext)

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, typeof Check> = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
}

const COLORS: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const idRef = useRef(0)

  const addToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className={`${COLORS[t.type]} text-white text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-200`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {t.text}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
