"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { usersApi } from "@/lib/api"

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

const IconGoogle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
    if (isHydrated && isAuthenticated) {
      router.replace("/listings")
    }
  }, [isHydrated, isAuthenticated, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "oauth_failed") {
      setError("Google sign-in failed. Please try again.")
    }
  }, [])

  if (!isHydrated) {
    return <div style={{ minHeight: "100vh", background: "#F5F5F0" }} />
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

 const handleSubmit = async () => {
  if (!form.email || !form.password) {
    setError("Please fill in all fields.")
    triggerShake()
    return
  }
  setLoading(true)
  try {
    const res = await authApi.login({ 
      email: form.email, 
      password: form.password 
    })
    
    console.log("Login response:", res.data)
    
    const { user, token, accessToken, refreshToken } = res.data
    const finalToken = token ?? accessToken
    if (!finalToken) throw new Error("No token received")

    useAuthStore.getState().setAuth(user, finalToken, refreshToken)
    router.push("/listings")
  } catch (err: any) {
    console.error("Full error:", err)
    console.error("Error response data:", err.response?.data)
    console.error("Error status:", err.response?.status)
    console.error("Error headers:", err.response?.headers)
    
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
  // Redirect the whole page to backend
  window.location.href = `${apiBase}/auth/google`
}
  return (
    <main style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "var(--font-body)",
      background: "#F5F5F0",
    }}>

      {/* LEFT — Art panel with animations */}
      <div className="left-panel" style={{
        display: "none", flex: "0 0 46%",
        background: "#0D1F0F",
        borderRight: "1px solid rgba(0,200,83,0.08)",
        padding: "56px 48px", flexDirection: "column",
        justifyContent: "center", gap: "40px",
        position: "relative", overflow: "hidden",
      }}>
        <svg viewBox="0 0 480 520" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 1, transition: "opacity 1.8s ease" }}>
          <defs>
            <radialGradient id="gA" cx="65%" cy="25%" r="55%">
              <stop offset="0%" stopColor="#00C853" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#00C853" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="gB" cx="15%" cy="85%" r="45%">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.10"/>
              <stop offset="100%" stopColor="#00E676" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="480" height="520" fill="url(#gA)"/>
          <rect width="480" height="520" fill="url(#gB)"/>
          {[190,135,80].map((r, i) => (
            <circle key={r} cx="430" cy="55" r={r} fill="none"
              stroke="#00C853" strokeWidth="0.6" strokeOpacity={0.18 - i * 0.04}
              style={{ transformOrigin: "430px 55px", animation: `spinSlow ${42 - i * 10}s linear infinite ${i % 2 ? "reverse" : ""}` }}/>
          ))}
          {[150,95].map((r, i) => (
            <circle key={r} cx="30" cy="470" r={r} fill="none"
              stroke="#00E676" strokeWidth="0.5" strokeOpacity={0.14 - i * 0.04}
              style={{ transformOrigin: "30px 470px", animation: `spinSlow ${55 + i * 15}s linear infinite ${i % 2 ? "reverse" : ""}` }}/>
          ))}
          <g style={{ transformOrigin: "240px 265px", animation: "floatGeo 8s ease-in-out infinite" }}>
            <rect x="198" y="223" width="84" height="84" rx="4" fill="none" stroke="#00C853" strokeWidth="1" strokeOpacity="0.22" transform="rotate(45 240 265)"/>
            <rect x="214" y="239" width="52" height="52" rx="2" fill="none" stroke="#00C853" strokeWidth="0.6" strokeOpacity="0.13" transform="rotate(45 240 265)"/>
            <rect x="228" y="253" width="24" height="24" rx="1" fill="#00C853" fillOpacity="0.09" transform="rotate(45 240 265)"/>
          </g>
          {[60,140,220,300,380,460].flatMap(x =>
            [60,145,230,315,400,490].map(y => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#00C853" fillOpacity="0.11"/>
            ))
          )}
          <circle cx="298" cy="408" r="6" fill="#00C853" fillOpacity="0.7" style={{ animation: "accentPop 3.2s ease-in-out infinite" }}/>
          <circle cx="298" cy="408" r="18" fill="none" stroke="#00C853" strokeWidth="0.9" strokeOpacity="0.28" style={{ animation: "accentPop 3.2s ease-in-out infinite 0.5s" }}/>
          <circle cx="128" cy="86" r="5" fill="#00E676" fillOpacity="0.6" style={{ animation: "accentPop 4s ease-in-out infinite 1.2s" }}/>
        </svg>

        <span style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", position: "relative", zIndex: 2 }}>
          Co<span style={{ color: "#00C853" }}>Own</span>
        </span>

        <div style={{ position: "relative", zIndex: 2 }}>
          <p style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "clamp(44px, 4vw, 52px)", fontWeight: 700, color: "#fff", letterSpacing: "-2px", lineHeight: 1.05, marginBottom: "20px" }}>
            Welcome<br/>back.
          </p>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.42)", lineHeight: 1.8, maxWidth: "290px", marginBottom: "44px" }}>
            Your pool is waiting. Check contributions, invite members, and move closer to ownership.
          </p>

          <div style={{ display: "flex", gap: "36px" }}>
            {[
              { value: "₦2.1B+", label: "Pooled" },
              { value: "12k+", label: "Co-owners" },
              { value: "98%", label: "Success" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "28px", fontWeight: 700, color: "#00C853", letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.32)", marginTop: "4px", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.18)", position: "relative", zIndex: 2 }}>
          © 2026 CoOwn · Enyata x Interswitch
        </p>
      </div>

      {/* RIGHT — Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px clamp(20px, 5vw, 48px)" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          <div style={{ marginBottom: "44px" }}>
            <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "26px", fontWeight: 700, color: "#0D1F0F", letterSpacing: "-0.5px", cursor: "pointer" }}>
              Co<span style={{ color: "#00C853" }}>Own</span>
            </span>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", fontSize: "clamp(38px, 5vw, 48px)", fontWeight: 700, color: "#0D1F0F", letterSpacing: "-2px", lineHeight: 1.0, marginBottom: "12px" }}>
              Sign in
            </h1>
            <p style={{ fontSize: "18px", color: "#5C6B5E", lineHeight: 1.65 }}>
              Continue building your property portfolio.
            </p>
          </div>

          {/* Error banner */}
          <div style={{ overflow: "hidden", maxHeight: error ? "90px" : "0px", opacity: error ? 1 : 0, transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease", marginBottom: error ? "24px" : "0px" }}>
            <div style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: "12px", padding: "13px 16px", fontSize: "15px", color: "#dc2626", display: "flex", alignItems: "flex-start", gap: "10px", animation: shake ? "shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97)" : "none" }}>
              <IconAlert />{error}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#2A3D2C", marginBottom: "10px", letterSpacing: "0.01em" }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#8A9E8C", pointerEvents: "none", display: "flex" }}>
                <IconMail />
              </span>
              <input
                name="email" type="email" placeholder="emeka@example.com"
                value={form.email} onChange={handleChange}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ width: "100%", padding: "16px 18px 16px 48px", background: "rgba(13,31,15,0.04)", border: "1.5px solid #D9D9D4", borderRadius: "12px", fontSize: "17px", color: "#0D1F0F", fontFamily: "var(--font-body)", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#00C853"; e.target.style.boxShadow = "0 0 0 3px rgba(0,200,83,0.12)" }}
                onBlur={e => { e.target.style.borderColor = "#D9D9D4"; e.target.style.boxShadow = "none" }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, height: "2px", borderRadius: "0 0 12px 12px", background: "#00C853", width: form.email ? "100%" : "0%", transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)" }}/>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#2A3D2C", marginBottom: "10px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#8A9E8C", pointerEvents: "none", display: "flex" }}>
                <IconLock />
              </span>
              <input
                name="password" type={showPass ? "text" : "password"} placeholder="Your password"
                value={form.password} onChange={handleChange}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ width: "100%", padding: "16px 56px 16px 48px", background: "rgba(13,31,15,0.04)", border: "1.5px solid #D9D9D4", borderRadius: "12px", fontSize: "17px", color: "#0D1F0F", fontFamily: "var(--font-body)", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#00C853"; e.target.style.boxShadow = "0 0 0 3px rgba(0,200,83,0.12)" }}
                onBlur={e => { e.target.style.borderColor = "#D9D9D4"; e.target.style.boxShadow = "none" }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, height: "2px", borderRadius: "0 0 12px 12px", background: "#00C853", width: form.password ? "100%" : "0%", transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)" }}/>
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: showPass ? "#00C853" : "#8A9E8C", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", transition: "color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00C853")}
                onMouseLeave={e => (e.currentTarget.style.color = showPass ? "#00C853" : "#8A9E8C")}
              >
                <IconEye off={showPass} />
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginBottom: "32px" }}>
            <span style={{ fontSize: "15px", color: "#00C853", fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Forgot password?
            </span>
          </div>

          {/* Submit Button */}
          <div style={{ marginBottom: "18px" }}>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: "18px", background: loading ? "#BDBDBD" : "#00C853", color: loading ? "#6E6E6E" : "#0D1F0F", border: "none", borderRadius: "999px", fontSize: "17px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s", boxShadow: loading ? "none" : "0 8px 32px rgba(0,200,83,0.30)", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 44px rgba(0,200,83,0.40)" } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 8px 32px rgba(0,200,83,0.30)" }}
            >
              {loading && (
                <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmerBtn 1.2s ease-in-out infinite" }}/>
              )}
              <span style={{ position: "relative", zIndex: 1 }}>
                {loading ? "Signing in" : "Sign in"}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "4px 0 18px" }}>
            <div style={{ flex: 1, height: "1px", background: "#D9D9D4" }}/>
            <span style={{ fontSize: "14px", color: "#8A9E8C" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#D9D9D4" }}/>
          </div>

          {/* Google Button */}
          <div>
            <button onClick={handleGoogle} disabled={googleLoading}
              style={{ width: "100%", padding: "16px", background: "#fff", border: "1.5px solid #D9D9D4", borderRadius: "999px", color: "#0D1F0F", fontSize: "16px", fontWeight: 500, cursor: googleLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "border-color 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s", opacity: googleLoading ? 0.7 : 1, position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.borderColor = "#00C853"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(13,31,15,0.08)" } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#D9D9D4"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
            >
              {googleLoading && (
                <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(0,200,83,0.08) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmerBtn 1.2s ease-in-out infinite" }}/>
              )}
              <IconGoogle />
              <span style={{ position: "relative", zIndex: 1 }}>
                {googleLoading ? "Processing" : "Continue with Google"}
              </span>
            </button>
          </div>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: "16px", color: "#5C6B5E", marginTop: "32px" }}>
            Don't have an account?{" "}
            <span onClick={() => router.push("/register")} style={{ color: "#00C853", fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Create one
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .left-panel { display: flex !important; } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floatGeo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes accentPop { 0%, 100% { opacity: 0.65; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 15% { transform: translateX(-8px); } 30% { transform: translateX(7px); } 45% { transform: translateX(-5px); } 60% { transform: translateX(4px); } 75% { transform: translateX(-2px); } }
        @keyframes shimmerBtn { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        input::placeholder { color: #8A9E8C; font-size: 16px; }
      `}</style>
    </main>
  )
}