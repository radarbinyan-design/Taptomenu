import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Restaurant, Subscription } from '@/types'

interface AuthState {
  user: User | null
  restaurant: Restaurant | null
  subscription: Subscription | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setRestaurant: (restaurant: Restaurant | null) => void
  setSubscription: (subscription: Subscription | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      restaurant: null,
      subscription: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setRestaurant: (restaurant) => set({ restaurant }),
      setSubscription: (subscription) => set({ subscription }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, restaurant: null, subscription: null }),
    }),
    {
      name: 'tapmenu-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
