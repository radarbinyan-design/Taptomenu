import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cart store for guest ordering (Phase 01).
 * Gated by FF_GUEST_ORDERING at the component level.
 */

export interface CartItem {
  dishId: string
  name: string
  price: number // AMD
  quantity: number
  specialInstructions?: string
  imageUrl?: string | null
}

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  tableId: string | null

  // Actions
  setContext: (restaurantId: string, tableId?: string) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  updateInstructions: (dishId: string, instructions: string) => void
  clearCart: () => void

  // Computed-like helpers
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      tableId: null,

      setContext: (restaurantId, tableId) => {
        const current = get()
        // If switching restaurants, clear cart
        if (current.restaurantId && current.restaurantId !== restaurantId) {
          set({ items: [], restaurantId, tableId: tableId || null })
        } else {
          set({ restaurantId, tableId: tableId || null })
        }
      },

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.dishId === item.dishId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dishId === item.dishId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        })
      },

      removeItem: (dishId) => {
        set((state) => ({
          items: state.items.filter((i) => i.dishId !== dishId),
        }))
      },

      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(dishId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.dishId === dishId ? { ...i, quantity: Math.min(quantity, 99) } : i
          ),
        }))
      },

      updateInstructions: (dishId, instructions) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.dishId === dishId ? { ...i, specialInstructions: instructions } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'tapmenu-cart',
      partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        tableId: state.tableId,
      }),
    }
  )
)
