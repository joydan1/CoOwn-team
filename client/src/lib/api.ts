import axios from 'axios'

// Determine default API URL based on environment
const getDefaultApiUrl = (): string => {
  // If explicitly set via environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Auto-detect based on current environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    
    // If running on localhost, connect to local server on port 5000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api'
    }
    
    // Otherwise use production (Render)
    return 'https://coown-team.onrender.com/api'
  }
  
  // Server-side default (build time)
  return 'https://coown-team.onrender.com/api'
}

const BASE_URL = getDefaultApiUrl()

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Read token from Zustand's persist blob ────────
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('coown-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('coown-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.refreshToken ?? null
  } catch {
    return null
  }
}

// ── Attach JWT to every request ──────────────────
api.interceptors.request.use((config) => {
  const token = getStoredToken()
  console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`, {
    tokenExists: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? token.substring(0, 30) + '...' : 'NO_TOKEN'
  })
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('⚠️  No token found in localStorage')
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
    
    console.error(`❌ [${original?.method?.toUpperCase()}] ${original?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message,
      errorData: error.response?.data
    })

    if (error.response?.status === 401 && !original._retry) {
      console.warn('🔄 [AUTH] 401 Received, attempting token refresh...')
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
        console.error('🔐 [AUTH] No refresh token available, redirecting to login')
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        console.log('🔐 [AUTH] Requesting new token with refresh token...')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = data.accessToken ?? data.token
        const newRefreshToken = data.refreshToken ?? refreshToken

        console.log('✅ [AUTH] New token received, updating headers and localStorage')
        
        // Write new tokens back to Zustand's localStorage blob
        const raw = localStorage.getItem('coown-auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          parsed.state.token = newToken
          parsed.state.refreshToken = newRefreshToken
          localStorage.setItem('coown-auth', JSON.stringify(parsed))
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        console.error('❌ [AUTH] Token refresh failed')
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
    bvn?: string
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
    target_amount: number
    deadline: string
    member_limit: number
  }>) => api.put(`/pools/${id}`, data),

  delete: (id: string) =>
    api.delete(`/pools/${id}`),

  getInvite: (id: string) =>
    api.get(`/pools/${id}/invite`),

  getJoinInfo: (id: string) =>
    api.get(`/pools/${id}/join`),

  join: (id: string, data: {
    investment_amount: number
    user_id: string
    currency: 'NGN' | 'USD' | 'GBP' | 'EUR'
  }) =>
    api.put(`/pools/${id}/join`, data),

  getDashboard: (id: string) =>
    api.get(`/pools/${id}/dashboard`),

  getMembers: (id: string) =>
    api.get(`/pools/${id}/users`),

  togglePublic: (id: string, data: { is_public: boolean }) =>
    api.put(`/pools/${id}/toggle-public`, data),
}

// ─────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────
export const milestonesApi = {
  list: () =>
    api.get('/milestones'),

  create: (data: {
    pool_id: string
    title: string
    description?: string
    target_date?: string
    required_approvals?: number
  }) => api.post('/milestones', data),

  getOne: (id: string) =>
    api.get(`/milestones/${id}`),

  update: (id: string, data: Partial<{
    title: string
    description: string
    target_date: string
  }>) => api.put(`/milestones/${id}`, data),

  delete: (id: string) =>
    api.delete(`/milestones/${id}`),

  vote: (id: string, data: { approve: boolean }) =>
    api.post(`/milestones/${id}/vote`, data),
}

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
  }) => api.post('/contributions/pay', data),

  verify: (data: {
    pool_id: string
    user_id: string
    merchant_code: string
    amount: number
    currency: string
    payment_ref: string
  }) => api.post('/contributions/verify', data),
}