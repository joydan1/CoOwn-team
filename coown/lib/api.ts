import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://coown-team.onrender.com'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('coown_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth ──────────────────────────────────────────
export const authApi = {
  register: (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),
}

// ── Properties ────────────────────────────────────
export const propertiesApi = {
  list: (params?: { type?: string; minPrice?: number; maxPrice?: number; location?: string }) =>
    api.get('/properties', { params }),

  getOne: (id: string) => api.get(`/properties/${id}`),
}

// ── Pools ─────────────────────────────────────────
export const poolsApi = {
  create: (data: {
    propertyId: string
    name: string
    targetAmount: number
    deadline: string
    memberLimit: number
  }) => api.post('/pools', data),

  getOne: (id: string) => api.get(`/pools/${id}`),

  join: (inviteCode: string) => api.post(`/pools/join/${inviteCode}`),

  myPools: () => api.get('/pools/my'),

  openPools: () => api.get('/pools/open'),
}

// ── Contributions ─────────────────────────────────
export const contributionsApi = {
  contribute: (poolId: string, data: { amount: number; currency?: string }) =>
    api.post(`/pools/${poolId}/contributions`, data),

  getPoolContributions: (poolId: string) =>
    api.get(`/pools/${poolId}/contributions`),
}

// ── Milestones ────────────────────────────────────
export const milestonesApi = {
  vote: (milestoneId: string) => api.post(`/milestones/${milestoneId}/vote`),
  list: (poolId: string) => api.get(`/pools/${poolId}/milestones`),
}