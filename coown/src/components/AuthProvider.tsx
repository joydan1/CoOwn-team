'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback']

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  const [isHydrated, setIsHydrated] = useState(false)

  // 1. Rehydrate Zustand once
  useEffect(() => {
    const init = async () => {
      await useAuthStore.persist.rehydrate()
      setIsHydrated(true)
    }
    init()
  }, [])

  // 2. Protect private routes ONLY after hydration
  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace('/login')
    }
  }, [isHydrated, isAuthenticated, pathname, router])

  // Show nothing until hydrated to prevent flash redirects
  if (!isHydrated) {
    return <div style={{ minHeight: '100vh', background: '#F5F5F0' }} />
  }

  return <>{children}</>
}