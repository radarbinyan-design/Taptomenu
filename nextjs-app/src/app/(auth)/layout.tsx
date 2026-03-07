import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Авторизация',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50">
      {children}
    </div>
  )
}
