import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Token {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  user: any
  token: Token | null
  isAuthenticated: boolean
  setAuth: (user: any, token: Token) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: !!token?.accessToken,
        })
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'coown-auth',
    }
  )
)