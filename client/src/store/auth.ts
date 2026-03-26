import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string, refreshToken?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken = null) => {
        console.log('Setting auth - token:', token);
        set({ 
          user, 
          token, 
          refreshToken: refreshToken !== undefined ? refreshToken : null,
          isAuthenticated: true 
        });
      },
      logout: () => set({ 
        user: null, 
        token: null, 
        refreshToken: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'coown-auth',
    }
  )
);