'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Ошибка авторизации')
        return
      }

      // Redirect based on role
      if (result.user?.role === 'superadmin' || result.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500 rounded-xl shadow-lg mb-3">
              <span className="text-white font-bold text-xl">TM</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать</h1>
          <p className="text-gray-500 mt-1">Войдите в ваш аккаунт TapMenu</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@restaurant.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                Запомнить меня
              </label>
              <Link href="/forgot-password" className="text-sm text-amber-500 hover:underline">
                Забыли пароль?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Войти
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-amber-500 font-medium hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </div>

        {/* Demo access */}
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700 font-medium mb-2">🎯 Демо-доступ:</p>
          <div className="space-y-1 text-xs text-amber-600">
            <div>Owner: <span className="font-mono">owner@demo.com</span> / <span className="font-mono">demo123</span></div>
            <div>Admin: <span className="font-mono">admin@tapmenu.am</span> / <span className="font-mono">admin123</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
