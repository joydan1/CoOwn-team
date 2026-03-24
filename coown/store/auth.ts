import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('coown_token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('coown_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'coown-auth' }
  )
)