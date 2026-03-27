import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://coown-team.onrender.com'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Read token from Zustand's persist blob ────────
// Zustand stores { state: { token, user, ... }, version: 0 }
// under the key defined in persist({ name: 'coown-auth' })
function getAuthState(): { token: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') return { token: null, refreshToken: null }
  try {
    const raw = localStorage.getItem('coown-auth')
    if (!raw) return { token: null, refreshToken: null }
    const parsed = JSON.parse(raw)
    const tokenData = parsed?.state?.token
    const rt = parsed?.state?.refreshToken

    // Handle token stored as object { accessToken, refreshToken }
    if (tokenData && typeof tokenData === 'object') {
      return {
        token: tokenData.accessToken ?? null,
        refreshToken: tokenData.refreshToken ?? rt ?? null,
      }
    }

    // Handle token stored as string (fallback)
    if (typeof tokenData === 'string') {
      return {
        token: tokenData ?? null,
        refreshToken: rt ?? null,
      }
    }

    return { token: null, refreshToken: null }
  } catch (error) {
    console.error('Error reading auth state:', error)
    return { token: null, refreshToken: null }
  }
}

function getStoredToken(): string | null {
  return getAuthState().token
}

function getStoredRefreshToken(): string | null {
  return getAuthState().refreshToken
}

// ── Attach JWT to every request ──────────────────
api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auto-refresh on 401 ───────────────────────────
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

        // Update token in Zustand storage
        const raw = localStorage.getItem('coown-auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          // Handle both object and string token formats
          if (parsed?.state?.token && typeof parsed.state.token === 'object') {
            parsed.state.token.accessToken = newToken
            if (newRefreshToken) parsed.state.token.refreshToken = newRefreshToken
          } else {
            parsed.state.token = newToken
            if (newRefreshToken) parsed.state.refreshToken = newRefreshToken
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

// ─────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }) => api.post('/auth/register', data),

  login: (data: {
    email: string
    password: string
  }) => api.post('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: () => api.delete('/auth/logout'),

  loginWithGoogle: () => {
    window.location.href = `${BASE_URL}/auth/google`
  },
}

// ─────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────
export const usersApi = {
  list: () =>
    api.get('/users'),

  getOne: (id: string) =>
    api.get(`/users/${id}`),

  update: (id: string, data: Partial<{
    firstName: string
    lastName: string
    email: string
    phone: string
  }>) => api.put(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete(`/users/${id}`),
}

// ─────────────────────────────────────────────────
// PROPERTIES
// ─────────────────────────────────────────────────
export const propertiesApi = {
  list: (params?: {
    type?: string
    minPrice?: number
    maxPrice?: number
    location?: string
  }) => api.get('/properties', { params }),

  create: (data: {
    title: string
    description?: string
    price: number
    location: string
    type?: string
  }) => api.post('/properties', data),

  listings: (params?: {
    type?: string
    minPrice?: number
    maxPrice?: number
    location?: string
  }) => api.get('/properties/listings', { params }),

  getOne: (id: string) =>
    api.get(`/properties/${id}`),

  update: (id: string, data: Partial<{
    title: string
    description: string
    price: number
    location: string
    type: string
  }>) => api.put(`/properties/${id}`, data),

  delete: (id: string) =>
    api.delete(`/properties/${id}`),

  getValuation: (id: string) =>
    api.get(`/properties/${id}/valuation`),
}

// ─────────────────────────────────────────────────
// POOLS
// ─────────────────────────────────────────────────
export const poolsApi = {
  list: () =>
    api.get('/pools'),

  create: (data: {
    property_id: string
    name: string
    target_amount: number
    deadline: string
    member_limit: number
    description?: string
    min_contribution?: number
  }) => api.post('/pools', data),

  public: () =>
    api.get('/pools/public'),

  getOne: (id: string) =>
    api.get(`/pools/${id}`),

  update: (id: string, data: Partial<{
    name: string
    targetAmount: number
    deadline: string
    memberLimit: number
  }>) => api.put(`/pools/${id}`, data),

  delete: (id: string) =>
    api.delete(`/pools/${id}`),

  getInvite: (id: string) =>
    api.get(`/pools/${id}/invite`),

  getJoinInfo: (id: string) =>
    api.get(`/pools/${id}/join`),

  join: (id: string) =>
    api.put(`/pools/${id}/join`),

  getDashboard: (id: string) =>
    api.get(`/pools/${id}/dashboard`),

  getMembers: (id: string) =>
    api.get(`/pools/${id}/users`),

  togglePublic: (id: string) =>
    api.put(`/pools/${id}/toggle-public`),
}

// ─────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────
export const milestonesApi = {
  list: () =>
    api.get('/milestones'),

  create: (data: {
    poolId: string
    title: string
    description?: string
    targetAmount: number
    dueDate?: string
  }) => api.post('/milestones', data),

  getOne: (id: string) =>
    api.get(`/milestones/${id}`),

  update: (id: string, data: Partial<{
    title: string
    description: string
    targetAmount: number
    dueDate: string
  }>) => api.put(`/milestones/${id}`, data),

  delete: (id: string) =>
    api.delete(`/milestones/${id}`),

  vote: (id: string) =>
    api.post(`/milestones/${id}/vote`),
}

// ─────────────────────────────────────────────────
// CONTRIBUTIONS
// ─────────────────────────────────────────────────
export const contributionsApi = {
  list: () =>
    api.get('/contributions'),

  getOne: (id: string) =>
    api.get(`/contributions/${id}`),

  update: (id: string, data: Partial<{
    amount: number
    status: string
  }>) => api.put(`/contributions/${id}`, data),

  delete: (id: string) =>
    api.delete(`/contributions/${id}`),

  pay: (data: {
    pool_id: string
    user_id?: string
    amount: number
    currency: string
    paymentMethod?: string
    original_amount?: number
    exchange_rate?: number
  }) => api.post('/contributions/pay', data),
}