import axios from 'axios'
import { useAuthStore } from "@/store/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://coown-team.onrender.com/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function unwrap(res: any) {
  return res?.data?.data ?? res?.data ?? res;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('coown-auth');
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const token = parsed?.state?.token?.accessToken;

    return typeof token === "string" ? token : null;
  } catch {
    return null;
  }
}

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('coown-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token?.refreshToken ?? null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token =
    useAuthStore.getState().token?.accessToken ??
    getStoredToken() ??
    undefined;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─────────────────────────────────────────────
// REFRESH TOKEN LOGIC
// ─────────────────────────────────────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const refreshToken = getStoredRefreshToken()

      if (!refreshToken) {
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })

        const newToken = data.accessToken ?? data.token
        const newRefreshToken = data.refreshToken ?? refreshToken

        const raw = localStorage.getItem('coown-auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          parsed.state.token = {
            accessToken: newToken,
            refreshToken: newRefreshToken,
          }
          localStorage.setItem('coown-auth', JSON.stringify(parsed))
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`

        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('coown-auth')
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authApi = {
  register: async (data: any) => unwrap(await api.post('/auth/register', data)),

  login: async (data: any) => unwrap(await api.post('/auth/login', data)),

  loginWithGoogle: async (code: string) => {
    // Some backends expect OAuth callback code as GET query parameters (as used by coown-team).
    const res = await api.get(`/auth/google/callback?code=${encodeURIComponent(code)}`);
    return unwrap(res);
  },

  refresh: async (refreshToken: string) => unwrap(await api.post('/auth/refresh', { refreshToken })),


  logout: async () => unwrap(await api.post('/auth/logout')),
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const usersApi = {
  list: async () => unwrap(await api.get('/users')),
  getOne: async (id: string) => unwrap(await api.get(`/users/${id}`)),
  update: async (id: string, data: any) => unwrap(await api.put(`/users/${id}`, data)),
  delete: async (id: string) => unwrap(await api.delete(`/users/${id}`)),
}

// ─────────────────────────────────────────────
// PROPERTIES
// ─────────────────────────────────────────────
export const propertiesApi = {
  listings: async (params?: any) => unwrap(await api.get('/properties/listings', { params })),
  getOne: async (id: string) => unwrap(await api.get(`/properties/${id}`)),
  create: async (data: any) => unwrap(await api.post('/properties', data)),
}

// ─────────────────────────────────────────────
// POOLS
// ─────────────────────────────────────────────
export const poolsApi = {
  list: async () => unwrap(await api.get('/pools')),
  public: async () => unwrap(await api.get('/pools/public')),
  getOne: async (id: string) => unwrap(await api.get(`/pools/${id}`)),
  create: async (data: any) => unwrap(await api.post('/pools', data)),
  togglePublic: async (id: string, data: { is_public: boolean }) =>
    unwrap(await api.put(`/pools/${id}/toggle-public`, data)),
  delete: async (id: string) => unwrap(await api.delete(`/pools/${id}`)),
  getMembers: async (id: string) => unwrap(await api.get(`/pools/${id}/users`)),
}

// ─────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────
export const milestonesApi = {
  list: async () => unwrap(await api.get('/milestones')),
  getOne: async (id: string) => unwrap(await api.get(`/milestones/${id}`)),
  create: async (data: any) => unwrap(await api.post('/milestones', data)),
  update: async (id: string, data: any) => unwrap(await api.put(`/milestones/${id}`, data)),
  delete: async (id: string) => unwrap(await api.delete(`/milestones/${id}`)),
  vote: async (id: string) => unwrap(await api.post(`/milestones/${id}/vote`)),
}

// ─────────────────────────────────────────────
// CONTRIBUTIONS
// ─────────────────────────────────────────────
export const contributionsApi = {
  list: async () => unwrap(await api.get('/contributions')),

  pay: async (data: any) => unwrap(await api.post('/contributions/pay', data)),

  verify: async (data: any) => unwrap(await api.post('/contributions/verify', data)),
}
