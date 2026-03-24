"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields."); return }
    setLoading(true)
    try {
      const res = await authApi.login({ email: form.email, password: form.password })
      const { user, token, accessToken } = res.data
      setAuth(user, token ?? accessToken)
      router.push("/listings")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? "Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", fontFamily: "var(--font-body)",
      background: "var(--navy-950)",
    }}>

      {/* ── Left panel — decorative (desktop only) ── */}
      <div style={{
        display: "none",
        flex: "0 0 46%",
        background: "linear-gradient(160deg, var(--navy-900) 0%, var(--navy-950) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        padding: "56px 48px",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
        className="left-panel"
      >
        {/* circles */}
        {[500, 340, 200].map((s, i) => (
          <div key={s} style={{
            position: "absolute", borderRadius: "50%",
            width: s, height: s,
            bottom: -s / 3, right: -s / 3,
            border: `1px solid rgba(249,115,22,${0.05 + i * 0.03})`,
          }} />
        ))}

        <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", position: "relative", zIndex: 1 }}>
          Co<span style={{ color: "var(--terra-500)" }}>Own</span>
        </span>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "42px", fontWeight: 700, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "20px" }}>
            Welcome<br />back.
          </p>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: "320px" }}>
            Your pool is waiting. Check contributions, invite members, and move closer to ownership.
          </p>

          {/* mini pool card */}
          <div style={{
            marginTop: "40px", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "var(--radius-lg)", padding: "20px 24px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
              Active pool
            </div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Lekki Phase 1 Land</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>4 members · ₦45M target</div>
            {/* progress */}
            <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" }}>
              <div style={{ height: "100%", width: "68%", background: "var(--terra-500)", borderRadius: "999px" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              <span>₦30.6M raised</span><span>68%</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", position: "relative", zIndex: 1 }}>
          © 2026 CoOwn · Enyata × Interswitch
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Mobile logo */}
          <div style={{ marginBottom: "36px" }}>
            <span
              onClick={() => router.push("/")}
              style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" }}>
              Co<span style={{ color: "var(--terra-500)" }}>Own</span>
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: "8px" }}>
            Sign in
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", marginBottom: "40px", lineHeight: 1.6 }}>
            Continue building your property portfolio.
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: "var(--radius-md)", padding: "12px 16px",
              fontSize: "14px", color: "#FCA5A5", marginBottom: "20px",
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
              Email address
            </label>
            <input
              name="email" type="email" placeholder="emeka@example.com"
              value={form.email} onChange={handleChange}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%", padding: "14px 18px",
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-md)", fontSize: "16px",
                color: "#fff", fontFamily: "var(--font-body)", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                name="password" type={showPass ? "text" : "password"} placeholder="Your password"
                value={form.password} onChange={handleChange}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{
                  width: "100%", padding: "14px 56px 14px 18px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "var(--radius-md)", fontSize: "16px",
                  color: "#fff", fontFamily: "var(--font-body)", outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <button
                type="button" onClick={() => setShowPass(p => !p)}
                style={{
                  position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--terra-400)",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
                }}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "right", marginBottom: "32px" }}>
            <span style={{ fontSize: "14px", color: "var(--terra-400)", fontWeight: 500, cursor: "pointer" }}>
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", padding: "16px",
              background: loading ? "var(--terra-700)" : "var(--terra-500)",
              color: "#fff", border: "none", borderRadius: "var(--radius-pill)",
              fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.15s",
              boxShadow: "0 6px 32px rgba(249,115,22,0.35)",
              marginBottom: "20px",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google */}
          <button
            style={{
              width: "100%", padding: "15px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-pill)",
              color: "#fff", fontSize: "15px", fontWeight: 500,
              cursor: "pointer", fontFamily: "var(--font-body)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          >
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#4285F4" }}>G</span>
            Continue with Google
          </button>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: "16px", color: "rgba(255,255,255,0.35)", marginTop: "28px" }}>
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              style={{ color: "var(--terra-400)", fontWeight: 600, cursor: "pointer" }}
            >
              Create one
            </span>
          </p>

        </div>
      </div>

      {/* ── Responsive: show left panel on md+ ── */}
      <style>{`
        @media (min-width: 768px) {
          .left-panel { display: flex !important; }
        }
      `}</style>
    </main>
  )
}