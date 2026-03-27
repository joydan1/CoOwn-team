"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { usersApi } from "@/lib/api"

const steps = ["Account", "Personal", "Verify"]

/* ── Icons ── */
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z"/>
    <path d="M9 12l2 2 4-4" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconBank = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
    <rect x="9" y="12" width="6" height="9" fill="white" opacity="0.9"/>
  </svg>
)
const IconDoc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8L14 2z"/>
    <path d="M14 2v6h6" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="8" y1="13" x2="16" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="17" x2="13" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconNigeria = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: "2px", flexShrink: 0 }}>
    <rect width="22" height="16" fill="#fff"/>
    <rect width="7" height="16" fill="#008751"/>
    <rect x="15" width="7" height="16" fill="#008751"/>
  </svg>
)
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, marginTop: "1px" }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill="white"/>
  </svg>
)
const IconGoogle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const trustSignals = [
  { Icon: IconShield, text: "BVN-verified members only" },
  { Icon: IconBank,   text: "Funds held in escrow" },
  { Icon: IconDoc,    text: "Legal co-ownership agreements" },
]

/* ── Shared style tokens ── */
const ACCENT        = "#00C853"
const ACCENT_GLOW   = "rgba(0,200,83,0.28)"
const ACCENT_RING   = "rgba(0,200,83,0.14)"
const ACCENT_DIM    = "rgba(0,200,83,0.08)"
const CHAR          = "#0D1F0F"
const CREAM         = "#F5F5F0"
const GREY_50       = "#F7F7F5"
const GREY_200      = "#D9D9D9"
const GREY_300      = "#BDBDBD"
const GREY_600      = "#6E6E6E"
const INK           = "#0D1F0F"
const INK_SOFT      = "#2A3D2C"
const MUTED         = "#5C6B5E"
const FAINT         = "#8A9E8C"
const BORDER        = "#D9D9D4"
const RED_BG        = "rgba(220,38,38,0.07)"
const RED_BORDER    = "rgba(220,38,38,0.18)"

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, setAuth } = useAuthStore()

  // ALL useState hooks first
  const [step, setStep] = useState(0)
  const [prevStep, setPrevStep] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [shake, setShake] = useState(false)
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirmPassword: "", bvn: "",
  })

  // ALL useEffect hooks (before any conditional returns)
  useEffect(() => {
    const rehydrate = async () => {
      await useAuthStore.persist.rehydrate()
      setIsHydrated(true)
    }
    rehydrate()
  }, [])

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/listings")
    }
  }, [isHydrated, isAuthenticated, router])

  // Early return AFTER all Hooks
  if (!isHydrated) {
    return <div style={{ minHeight: "100vh", background: "#F5F5F0" }} />
  }

  // Handlers
  const set = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }))
    setError("")
  }

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600) }

  const validateStep = () => {
    if (step === 0) {
      if (!form.email) return "Email is required."
      if (!form.password) return "Password is required."
      if (form.password.length < 8) return "Password must be at least 8 characters."
      if (form.password !== form.confirmPassword) return "Passwords do not match."
    }
    if (step === 1) {
      if (!form.firstName) return "First name is required."
      if (!form.lastName) return "Last name is required."
      if (!form.phone) return "Phone number is required."
    }
    if (step === 2 && (!form.bvn || form.bvn.length !== 11))
      return "Enter a valid 11-digit BVN."
    return ""
  }

 const handleNext = async () => {
  const err = validateStep()
  if (err) { setError(err); triggerShake(); return }
  if (step < 2) { setPrevStep(step); setStep(s => s + 1); return }

  setLoading(true)
  try {
    const res = await authApi.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      bvn: form.bvn,
    })

    // Backend returns { message, user, token: { accessToken, refreshToken } }
    const user = res.user
    const accessToken = res.token?.accessToken
    const refreshToken = res.token?.refreshToken

    if (!accessToken) throw new Error("No token received")

    setAuth(user, { accessToken, refreshToken })
    router.push("/listings")

  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    setError(msg ?? "Something went wrong. Please try again.")
    triggerShake()
  } finally {
    setLoading(false)
  }
}

  const handleBack = () => {
    setPrevStep(step)
    setStep(s => s - 1)
    setError("")
  }
  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const redirectUri = `${window.location.origin}/auth/callback`
      const response = await fetch(`/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`)
      const json = await response.json()

      const redirectUrl = json?.url || json?.data?.url || json?.data?.redirectUrl || json?.redirect_url
      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      const tokenPayload = json?.token || json?.data?.token || json
      const accessToken = tokenPayload?.accessToken || tokenPayload?.access_token
      const refreshToken = tokenPayload?.refreshToken || tokenPayload?.refresh_token

      if (accessToken && refreshToken) {
        localStorage.setItem('coown-auth', JSON.stringify({ state: { token: accessToken, refreshToken } }))
        useAuthStore.getState().setAuth(null, { accessToken, refreshToken })
        router.push('/listings')
        return
      }

      const fallbackAccess = json?.accessToken || json?.access_token
      const fallbackRefresh = json?.refreshToken || json?.refresh_token
      if (fallbackAccess && fallbackRefresh) {
        localStorage.setItem('coown-auth', JSON.stringify({ state: { token: fallbackAccess, refreshToken: fallbackRefresh } }))
        useAuthStore.getState().setAuth(null, { accessToken: fallbackAccess, refreshToken: fallbackRefresh })
        router.push('/listings')
        return
      }

      if (response.redirected && response.url) {
        window.location.href = response.url
        return
      }

      throw new Error('No redirect URL returned from backend')
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError('Failed to initiate Google sign-in. Check console for details.')
      triggerShake()
    } finally {
      setGoogleLoading(false)
    }
  }
  const goingForward = step > prevStep

  /* ── Shared input styles ── */
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "16px 18px",
    background: "rgba(13,31,15,0.04)",
    border: `1.5px solid ${BORDER}`,
    borderRadius: "12px",
    fontSize: "17px", color: INK,
    fontFamily: "var(--font-body)", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "15px",
    fontWeight: 600, color: INK_SOFT, marginBottom: "10px",
  }

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = ACCENT
      e.target.style.boxShadow = `0 0 0 3px ${ACCENT_RING}`
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = BORDER
      e.target.style.boxShadow = "none"
    },
  }

  /* ── Animated underline bar ── */
  const UnderlineBar = ({ active }: { active: boolean }) => (
    <div style={{
      position: "absolute", bottom: 0, left: 0, height: "2px",
      borderRadius: "0 0 12px 12px",
      background: ACCENT,
      width: active ? "100%" : "0%",
      transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}/>
  )

  /* ── Fade-up helper ── */
  const fadeUp = (delay = "0s"): React.CSSProperties => ({
    opacity: 1, transform: "translateY(0)",
    animation: `fadeUpIn 0.65s cubic-bezier(0.16,1,0.3,1) ${delay} both`,
  })

  return (
    <main style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
      background: CREAM,
    }}>

      {/* LEFT PANEL */}
      <div className="left-panel" style={{
        display: "none", flex: "0 0 44%",
        background: CHAR,
        borderRight: "1px solid rgba(0,200,83,0.08)",
        padding: "56px 48px",
        flexDirection: "column", justifyContent: "center", gap: "36px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow blobs, rings, dot grid, logo, headline, trust signals */}
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", top: -140, left: -140, background: "radial-gradient(circle, rgba(0,200,83,0.13) 0%, transparent 65%)", animation: "floatSlow 14s ease-in-out infinite" }}/>
        <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", bottom: 40, right: -80, background: "radial-gradient(circle, rgba(0,230,118,0.09) 0%, transparent 65%)", animation: "floatSlow 10s ease-in-out infinite reverse" }}/>

        {[500, 340, 190].map((s, i) => (
          <div key={s} style={{ position: "absolute", borderRadius: "50%", width: s, height: s, top: -s / 4, left: -s / 3, border: `1px solid rgba(0,200,83,${0.04 + i * 0.04})`, animation: `spinSlow ${32 + i * 9}s linear infinite` }}/>
        ))}

        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,200,83,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }}/>

        <span style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", position: "relative", zIndex: 2, ...fadeUp("0.1s") }}>
          Co<span style={{ color: ACCENT }}>Own</span>
        </span>

        <div style={{ position: "relative", zIndex: 2 }}>
          <p style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "clamp(34px, 3.2vw, 48px)", fontWeight: 700, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "20px", ...fadeUp("0.2s") }}>
            Your journey<br/>to ownership<br/>
            <em style={{ color: ACCENT, fontStyle: "italic" }}>starts here.</em>
          </p>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.42)", lineHeight: 1.75, maxWidth: "300px", marginBottom: "40px", ...fadeUp("0.3s") }}>
            Join thousands of Nigerians pooling funds to buy property together — safely and transparently.
          </p>

          {trustSignals.map((t, i) => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", animation: `slideInLeft 0.55s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.1}s both` }}>
              <div style={{ width: "42px", height: "42px", flexShrink: 0, borderRadius: "10px", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: CHAR, transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <t.Icon />
              </div>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.58)", lineHeight: 1.5 }}>{t.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.18)", position: "relative", zIndex: 2 }}>
          © 2026 CoOwn · Enyata x Interswitch
        </p>
      </div>

      {/* RIGHT PANEL — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px clamp(20px, 5vw, 48px)", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>

          {/* Mobile logo */}
          <div style={{ marginBottom: "40px", ...fadeUp("0s") }}>
            <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "26px", fontWeight: 700, color: INK, letterSpacing: "-0.5px", cursor: "pointer" }}>
              Co<span style={{ color: ACCENT }}>Own</span>
            </span>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "44px", ...fadeUp("0.08s") }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0, background: i < step ? ACCENT : i === step ? CHAR : GREY_50, color: i < step ? CHAR : i === step ? ACCENT : FAINT, border: i <= step ? `2px solid ${ACCENT}` : `2px solid ${BORDER}`, boxShadow: i === step ? `0 0 0 4px ${ACCENT_RING}` : "none", transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                    {i < step ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "drawCheck 0.35s ease forwards" }}/>
                      </svg>
                    ) : i + 1}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: i === step ? 600 : 400, color: i === step ? INK : i < step ? ACCENT : FAINT, transition: "color 0.3s", whiteSpace: "nowrap" }}>
                    {s}
                  </span>
                </div>

                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: "2px", margin: "0 14px", background: BORDER, borderRadius: "999px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: ACCENT, borderRadius: "999px", transform: i < step ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s" }}/>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Step heading */}
          <div style={{ marginBottom: "36px", overflow: "hidden", animation: `${goingForward ? "slideInRight" : "slideInLeft"} 0.42s cubic-bezier(0.16,1,0.3,1) both` }}>
            <h1 style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "clamp(32px, 4.5vw, 42px)", fontWeight: 700, color: INK, letterSpacing: "-1.5px", lineHeight: 1.0, marginBottom: "10px" }}>
              {["Create account", "Your details", "Verify identity"][step]}
            </h1>
            <p style={{ fontSize: "18px", color: MUTED, lineHeight: 1.65 }}>
              {["Start your co-ownership journey today.", "Tell us a bit about yourself.", "Your BVN protects every member in the pool."][step]}
            </p>
          </div>

          {/* Error banner */}
          <div style={{ overflow: "hidden", maxHeight: error ? "90px" : "0px", opacity: error ? 1 : 0, transition: "max-height 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease", marginBottom: error ? "24px" : "0px" }}>
            <div style={{ background: RED_BG, border: `1px solid ${RED_BORDER}`, borderRadius: "12px", padding: "13px 16px", fontSize: "15px", color: "#dc2626", display: "flex", alignItems: "flex-start", gap: "10px", animation: shake ? "shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97)" : "none" }}>
              <IconAlert />{error}
            </div>
          </div>

          {/* STEP FIELDS */}
          <div style={{ animation: `${goingForward ? "slideInRight" : "slideInLeft"} 0.42s cubic-bezier(0.16,1,0.3,1) both` }}>

            {/* Step 0: Email + Password */}
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <div style={{ position: "relative" }}>
                    <input type="email" placeholder="emeka@example.com" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} {...focusHandlers} />
                    <UnderlineBar active={!!form.email} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={e => set("password", e.target.value)} style={{ ...inputStyle, paddingRight: "80px" }} {...focusHandlers} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, height: "2px", borderRadius: "0 0 12px 12px", background: form.password.length === 0 ? "transparent" : form.password.length < 8 ? "#f97316" : ACCENT, width: form.password ? `${Math.min(100, (form.password.length / 8) * 100)}%` : "0%", transition: "width 0.3s ease, background 0.3s ease" }}/>
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: showPass ? ACCENT : FAINT, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", letterSpacing: "0.06em", transition: "color 0.18s" }}>
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {form.password.length > 0 && form.password.length < 8 && <p style={{ fontSize: "13px", color: "#f97316", marginTop: "6px" }}>{8 - form.password.length} more characters needed</p>}
                </div>

                <div>
                  <label style={labelStyle}>Confirm password</label>
                  <div style={{ position: "relative" }}>
                    <input type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} onKeyDown={e => e.key === "Enter" && handleNext()} style={inputStyle} {...focusHandlers} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, height: "2px", borderRadius: "0 0 12px 12px", background: form.confirmPassword ? (form.confirmPassword === form.password ? ACCENT : "#ef4444") : "transparent", width: form.confirmPassword ? "100%" : "0%", transition: "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s" }}/>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.password && <p style={{ fontSize: "13px", color: "#ef4444", marginTop: "6px" }}>Passwords don't match</p>}
                  {form.confirmPassword && form.confirmPassword === form.password && <p style={{ fontSize: "13px", color: ACCENT, marginTop: "6px" }}>✓ Passwords match</p>}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "4px 0 16px" }}>
                    <div style={{ flex: 1, height: "1px", background: BORDER }}/>
                    <span style={{ fontSize: "14px", color: FAINT }}>or</span>
                    <div style={{ flex: 1, height: "1px", background: BORDER }}/>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    style={{ 
                      width: "100%", padding: "15px", background: "#fff", 
                      border: `1.5px solid ${BORDER}`, borderRadius: "999px", 
                      color: INK, fontSize: "16px", fontWeight: 500, 
                      cursor: googleLoading ? "not-allowed" : "pointer", 
                      fontFamily: "var(--font-body)", display: "flex", 
                      alignItems: "center", justifyContent: "center", gap: "12px", 
                      transition: "border-color 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
                      opacity: googleLoading ? 0.7 : 1
                    }} 
                    onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(13,31,15,0.08)" } }} 
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                  >
                    <IconGoogle /> 
                    {googleLoading ? "Processing..." : "Continue with Google"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Personal details */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>First name</label>
                    <div style={{ position: "relative" }}>
                      <input type="text" placeholder="Emeka" value={form.firstName} onChange={e => set("firstName", e.target.value)} style={inputStyle} {...focusHandlers} />
                      <UnderlineBar active={!!form.firstName} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Last name</label>
                    <div style={{ position: "relative" }}>
                      <input type="text" placeholder="Okonkwo" value={form.lastName} onChange={e => set("lastName", e.target.value)} style={inputStyle} {...focusHandlers} />
                      <UnderlineBar active={!!form.lastName} />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Phone number</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ ...inputStyle, width: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: "10px", paddingLeft: "14px", paddingRight: "14px", cursor: "default" }}>
                      <IconNigeria />
                      <span style={{ fontSize: "16px", color: MUTED, fontWeight: 500 }}>+234</span>
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input type="tel" placeholder="0812 345 6789" value={form.phone} onChange={e => set("phone", e.target.value)} onKeyDown={e => e.key === "Enter" && handleNext()} style={{ ...inputStyle, width: "100%" }} {...focusHandlers} />
                      <UnderlineBar active={!!form.phone} />
                    </div>
                  </div>
                </div>

                <div style={{ background: ACCENT_DIM, border: `1px solid rgba(0,200,83,0.20)`, borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>📞</span>
                  <div style={{ fontSize: "14px", color: "#1A4D2A", lineHeight: 1.6 }}>
                    We'll use your phone to send contribution alerts and pool updates. Standard rates apply.
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: BVN */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <div style={{ background: ACCENT_DIM, border: `1px solid rgba(0,200,83,0.22)`, borderRadius: "12px", padding: "16px 18px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#1A4D2A", marginBottom: "6px" }}>Why we need your BVN</div>
                  <div style={{ fontSize: "14px", color: "#2D6B3A", lineHeight: 1.65 }}>
                    Your BVN verifies your identity and protects all pool members. We never store your full BVN — only a secure encrypted hash.
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Bank Verification Number (BVN)</label>
                  <div style={{ position: "relative" }}>
                    <input type="text" placeholder="Enter your 11-digit BVN" value={form.bvn} maxLength={11} onChange={e => set("bvn", e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && handleNext()} style={{ ...inputStyle, letterSpacing: "3px", fontSize: "20px", fontWeight: 600 }} {...focusHandlers} />
                    <UnderlineBar active={form.bvn.length === 11} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                    {Array.from({ length: 11 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: "5px", borderRadius: "999px", background: i < form.bvn.length ? ACCENT : GREY_200, transition: `background 0.18s ease ${i * 0.03}s`, boxShadow: i < form.bvn.length ? `0 0 6px ${ACCENT_GLOW}` : "none" }}/>
                    ))}
                  </div>
                  <p style={{ fontSize: "13px", color: FAINT }}>
                    {form.bvn.length}/11 digits entered
                    {form.bvn.length === 11 && <span style={{ color: ACCENT, fontWeight: 600, marginLeft: "8px" }}>✓ Complete</span>}
                  </p>
                </div>

                <div style={{ background: GREY_50, border: `1px solid ${GREY_200}`, borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>📱</span>
                  <div style={{ fontSize: "14px", color: GREY_600, lineHeight: 1.6 }}>
                    Don't know your BVN? Dial <strong style={{ color: INK, letterSpacing: "0.05em" }}>*565*0#</strong> from any Nigerian number.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "40px" }}>
            <div style={{ overflow: "hidden", maxWidth: step > 0 ? "130px" : "0px", opacity: step > 0 ? 1 : 0, transition: "max-width 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease", flexShrink: 0 }}>
              <button onClick={handleBack} style={{ padding: "17px 26px", whiteSpace: "nowrap", background: GREY_50, border: `1.5px solid ${BORDER}`, borderRadius: "999px", fontSize: "16px", color: INK, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 500, transition: "border-color 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = "translateY(-2px)" }} onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)" }}>
                 Back
              </button>
            </div>

            <button onClick={handleNext} disabled={loading} style={{ flex: 1, padding: "18px", background: loading ? GREY_300 : ACCENT, color: loading ? GREY_600 : CHAR, border: "none", borderRadius: "999px", fontSize: "17px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s", boxShadow: loading ? "none" : `0 8px 32px ${ACCENT_GLOW}`, position: "relative", overflow: "hidden" }} onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 44px rgba(0,200,83,0.40)" } }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : `0 8px 32px ${ACCENT_GLOW}` }}>
              {loading && <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmerBtn 1.2s ease-in-out infinite" }}/>}
              <span style={{ position: "relative", zIndex: 1 }}>
                {loading ? "Creating account…" : step === 2 ? "Create my account →" : "Continue →"}
              </span>
            </button>
          </div>

          {/* Sign in link */}
          <p style={{ textAlign: "center", fontSize: "16px", color: MUTED, marginTop: "32px" }}>
            Already have an account?{" "}
            <span onClick={() => router.push("/login")} style={{ color: ACCENT, fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s" }} onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Sign in
            </span>
          </p>

        </div>
      </div>

      {/* Global keyframes */}
      <style>{`
        @media (min-width: 768px) { .left-panel { display: flex !important; } }

        @keyframes fadeUpIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 15% { transform: translateX(-8px); } 30% { transform: translateX(7px); } 45% { transform: translateX(-5px); } 60% { transform: translateX(4px); } 75% { transform: translateX(-2px); } }
        @keyframes drawCheck { from { stroke-dashoffset: 14; stroke-dasharray: 14; } to { stroke-dashoffset: 0; stroke-dasharray: 14; } }
        @keyframes shimmerBtn { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        input::placeholder { color: ${FAINT}; font-size: 16px; }
        * { box-sizing: border-box; }
      `}</style>
    </main>
  )
}