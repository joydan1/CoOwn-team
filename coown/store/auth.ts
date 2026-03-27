import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  verified: boolean
}

interface AuthStore {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setAuth: (user: User, token: string, refreshToken?: string) => void
  updateUser: (partial: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        })
        // No manual localStorage here — let Zustand persist handle it
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        // Zustand persist will automatically clear localStorage
      },
    }),

    {
      name: 'coown-auth',
      storage: createJSONStorage(() => localStorage),   // explicit & reliable

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),

      // This runs AFTER rehydration is complete
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          // Optional: you can do extra things here if needed
          console.log('Auth rehydrated successfully')
        }
      },
    }
  )
)