"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

/* ── Icons ── */
const IconEye = ({ off }: { off?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10.73 10.73A3 3 0 1013.27 13.27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </>
    ) : (
      <>
        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" fill="currentColor"/>
        <circle cx="12" cy="12" r="3" fill="var(--bg-surface,#fff)"/>
      </>
    )}
  </svg>
)

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
    <polyline points="22,6 12,13 2,6" fill="none" stroke="var(--cream-base,#F5F5F0)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.5" fill="var(--cream-base,#F5F5F0)"/>
  </svg>
)

const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, marginTop: "1px" }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill="white"/>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, setAuth } = useAuthStore()

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const rehydrate = async () => {
      await useAuthStore.persist.rehydrate()
      setIsHydrated(true)
    }
    rehydrate()
  }, [])

  useEffect(() => {
    if (isHydrated && isAuthenticated) router.replace("/listings")
  }, [isHydrated, isAuthenticated, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "oauth_failed") setError("Google sign-in failed. Please try again.")
  }, [])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.")
      triggerShake()
      return
    }
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const { user, token } = res.data
      const accessToken = token?.accessToken ?? res.data?.accessToken
      const refreshToken = token?.refreshToken ?? res.data?.refreshToken

      if (!accessToken || !refreshToken) throw new Error("Missing tokens")

      useAuthStore.getState().setAuth(user, accessToken, refreshToken)
      router.push("/listings")
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.response?.data?.error || "Invalid email or password."
      setError(msg)
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setGoogleLoading(true)
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "https://coown-team.onrender.com"
    window.location.href = `${apiBase}/auth/google`
  }

  if (!isHydrated) return <div style={{ minHeight: "100vh", background: "#F5F5F0" }}/>

  return (
    <main style={{ minHeight: "100vh", display: "flex", fontFamily: "var(--font-body)", background: "#F5F5F0" }}>
      {/* Left art panel omitted for brevity */}
      
      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px clamp(20px, 5vw, 48px)" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          
          {/* Logo */}
          <span onClick={() => router.push("/")} style={{ fontSize: "26px", fontWeight: 700, cursor: "pointer" }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>

          {/* Heading */}
          <h1 style={{ fontSize: "clamp(38px, 5vw, 48px)", fontWeight: 700, margin: "24px 0 12px" }}>Sign in</h1>
          <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "24px" }}>Continue building your property portfolio.</p>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: "12px", padding: "13px 16px", display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "24px", animation: shake ? "shake 0.5s" : "none" }}>
              <IconAlert /> {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <input name="email" type="email" placeholder="emeka@example.com" value={form.email} onChange={handleChange}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "16px 18px 16px 48px", borderRadius: "12px", border: "1.5px solid #D9D9D4" }} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "32px", position: "relative" }}>
            <input name="password" type={showPass ? "text" : "password"} placeholder="Your password" value={form.password} onChange={handleChange}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "16px 56px 16px 48px", borderRadius: "12px", border: "1.5px solid #D9D9D4" }} />
            <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }}>
              <IconEye off={showPass} />
            </button>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "18px", borderRadius: "999px", background: "#00C853", color: "#0D1F0F", fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading} style={{ width: "100%", padding: "16px", marginTop: "16px", borderRadius: "999px", border: "1px solid #D9D9D4", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </main>
  )
}