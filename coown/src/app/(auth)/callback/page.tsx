'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.token);

  useEffect(() => {
    const code = searchParams.get('code')
    const directAccessToken = searchParams.get('accessToken')
    const directRefreshToken = searchParams.get('refreshToken')

    const setTokenAndRedirect = (accessToken: string, refreshToken: string) => {
      localStorage.setItem('coown-auth', JSON.stringify({ state: { token: accessToken, refreshToken } }))
      useAuthStore.getState().setAuth(null, { accessToken, refreshToken })
      router.push('/listings')
    }

    if (directAccessToken && directRefreshToken) {
      setTokenAndRedirect(directAccessToken, directRefreshToken)
      return
    }

    if (!code) {
      console.error('No code found in callback')
      router.push('/login')
      return
    }

    const loginWithGoogle = async () => {
      try {
        const res = await authApi.loginWithGoogle(code)

        // Some APIs may return token in several nested/plain forms
        const payload = res?.token || res?.data?.token || res?.data || res
        const accessToken = payload?.accessToken || payload?.access_token || payload?.token?.accessToken || payload?.token?.access_token
        const refreshToken = payload?.refreshToken || payload?.refresh_token || payload?.token?.refreshToken || payload?.token?.refresh_token

        if (!accessToken || !refreshToken) {
          throw new Error('Missing tokens from Google callback')
        }

        setTokenAndRedirect(accessToken, refreshToken)
      } catch (err) {
        console.error('Google login failed:', err)
        router.push('/login')
      }
    }

    loginWithGoogle()
  }, [searchParams, router])

  return <p>Signing you in...</p>;
}