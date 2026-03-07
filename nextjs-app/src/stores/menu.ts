import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MenuState {
  selectedLang: string
  selectedCurrency: string
  searchQuery: string
  selectedCategory: string | null
  setLang: (lang: string) => void
  setCurrency: (currency: string) => void
  setSearch: (query: string) => void
  setCategory: (categoryId: string | null) => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      selectedLang: 'ru',
      selectedCurrency: 'AMD',
      searchQuery: '',
      selectedCategory: null,
      setLang: (selectedLang) => set({ selectedLang }),
      setCurrency: (selectedCurrency) => set({ selectedCurrency }),
      setSearch: (searchQuery) => set({ searchQuery }),
      setCategory: (selectedCategory) => set({ selectedCategory }),
    }),
    {
      name: 'tapmenu-menu-prefs',
      partialize: (state) => ({
        selectedLang: state.selectedLang,
        selectedCurrency: state.selectedCurrency,
      }),
    }
  )
)
