'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

/* ─── Context ────────────────────────────────────────────────────────────── */
type SelectContextValue = {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue>({
  value: '',
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
})

/* ─── Root ───────────────────────────────────────────────────────────────── */
interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

function Select({ value, defaultValue = '', onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)

  const controlled = value !== undefined
  const currentValue = controlled ? value : internalValue

  const handleValueChange = React.useCallback(
    (v: string) => {
      if (!controlled) setInternalValue(v)
      onValueChange?.(v)
      setOpen(false)
    },
    [controlled, onValueChange]
  )

  // Close on outside click
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div ref={ref} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

/* ─── Trigger ────────────────────────────────────────────────────────────── */
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

/* ─── Value ──────────────────────────────────────────────────────────────── */
interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext)

  // Find label from items by scanning rendered children — we rely on item labels being stored
  const [label, setLabel] = React.useState<string>('')

  React.useEffect(() => {
    // Label is set by SelectItem via custom event
    const handler = (e: CustomEvent) => {
      if (e.detail.value === value) setLabel(e.detail.label)
    }
    document.addEventListener('select-item-mount', handler as EventListener)
    return () => document.removeEventListener('select-item-mount', handler as EventListener)
  }, [value])

  return (
    <span className={cn('block truncate', !value && 'text-gray-400')}>
      {label || (value ? value : (placeholder ?? 'Выберите...'))}
    </span>
  )
}

/* ─── Content ────────────────────────────────────────────────────────────── */
interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

function SelectContent({ children, className }: SelectContentProps) {
  const { open } = React.useContext(SelectContext)
  if (!open) return null
  return (
    <div
      className={cn(
        'absolute z-50 top-full left-0 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl',
        'overflow-hidden animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      <div className="max-h-56 overflow-y-auto py-1">{children}</div>
    </div>
  )
}

/* ─── Item ───────────────────────────────────────────────────────────────── */
interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

function SelectItem({ value, children, className }: SelectItemProps) {
  const { value: selected, onValueChange } = React.useContext(SelectContext)
  const isSelected = selected === value
  const label = typeof children === 'string' ? children : String(children)

  // Emit label on mount so SelectValue can display it
  React.useEffect(() => {
    document.dispatchEvent(
      new CustomEvent('select-item-mount', { detail: { value, label } })
    )
  }, [value, label])

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors',
        'hover:bg-amber-50 hover:text-amber-700',
        isSelected ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-700',
        className
      )}
    >
      <span className={cn('w-4 text-amber-500', isSelected ? 'opacity-100' : 'opacity-0')}>✓</span>
      {children}
    </button>
  )
}

/* ─── Separator ──────────────────────────────────────────────────────────── */
function SelectSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-gray-100', className)} />
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator }
