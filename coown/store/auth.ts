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
  isLoading: boolean          // ← This is the key fix

  setAuth: (user: User, token: string, refreshToken?: string) => void
  updateUser: (partial: Partial<User>) => void
  logout: () => void
  initializeAuth: () => void   // ← Optional but recommended
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,                    // ← Start as true

      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
          isLoading: false,                 // ← Important
        })
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
          isLoading: false,
        })
      },

      // Call this once when app starts (e.g. in layout or root page)
      initializeAuth: () => {
        const state = get()
        if (state.token) {
          set({ 
            isAuthenticated: true,
            isLoading: false 
          })
        } else {
          set({ 
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },
    }),

    {
      name: 'coown-auth',
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist isLoading
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          // After rehydration, mark loading as done
          setTimeout(() => {
            set({ isLoading: false })
          }, 10)
        }
      },
    }
  )
)
