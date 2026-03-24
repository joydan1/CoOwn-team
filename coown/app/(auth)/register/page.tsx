"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

const steps = ["Account", "Personal", "Verify"]

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bvn: "",
  })

  const set = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }))
    setError("")
  }

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
    if (step === 2) {
      if (!form.bvn || form.bvn.length !== 11) return "Enter a valid 11-digit BVN."
    }
    return ""
  }

  const handleNext = async () => {
    const err = validateStep()
    if (err) { setError(err); return }

    if (step < 2) { setStep(s => s + 1); return }

    // Final step — submit
    setLoading(true)
    try {
      const res = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      const { user, token, accessToken } = res.data
      setAuth(user, token ?? accessToken)
      router.push("/listings")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%", padding: "14px 18px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "var(--radius-md)", fontSize: "16px",
    color: "#fff", fontFamily: "var(--font-body)", outline: "none",
    transition: "border-color 0.2s",
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "12px", fontWeight: 600,
    letterSpacing: "0.06em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)", marginBottom: "8px",
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "var(--font-body)", background: "var(--navy-950)",
    }}>

      {/* ── Left decorative panel (desktop) ── */}
      <div className="left-panel" style={{
        display: "none", flex: "0 0 44%",
        background: "linear-gradient(160deg, var(--navy-900) 0%, var(--navy-950) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        padding: "56px 48px", flexDirection: "column",
        justifyContent: "space-between", position: "relative", overflow: "hidden",
      }}>
        {[500, 320, 180].map((s, i) => (
          <div key={s} style={{
            position: "absolute", borderRadius: "50%",
            width: s, height: s, top: -s / 4, left: -s / 3,
            border: `1px solid rgba(249,115,22,${0.04 + i * 0.03})`,
          }} />
        ))}

        <span style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", position: "relative", zIndex: 1 }}>
          Co<span style={{ color: "var(--terra-500)" }}>Own</span>
        </span>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "50px", fontWeight: 700, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "20px" }}>
            Your journey<br />to ownership<br />
            <em style={{ color: "var(--terra-400)", fontStyle: "italic" }}>starts here.</em>
          </p>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "300px", marginBottom: "40px" }}>
            Join thousands of Nigerians pooling funds to buy property together, safely and transparently.
          </p>

          {/* Trust signals */}
          {[
            { icon: "🔒", text: "BVN-verified members only" },
            { icon: "🏦", text: "Funds held in escrow" },
            { icon: "📄", text: "Legal co-ownership agreements" },

          ].map(t => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                {t.icon}
              </div>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)" }}>{t.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", position: "relative", zIndex: 1 }}>
          © 2026 CoOwn · Enyata x Interswitch
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>

          {/* Mobile logo */}
          <div style={{ marginBottom: "36px" }}>
            <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" }}>
              Co<span style={{ color: "var(--terra-500)" }}>Own</span>
            </span>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "40px" }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700,
                    background: i < step ? "var(--terra-500)" : i === step ? "var(--terra-500)" : "rgba(255,255,255,0.08)",
                    color: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
                    border: i === step ? "2px solid var(--terra-300)" : "none",
                    transition: "all 0.3s ease",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: i === step ? 600 : 400, color: i === step ? "#fff" : "rgba(255,255,255,0.3)", transition: "color 0.3s" }}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: "1px", background: i < step ? "var(--terra-500)" : "rgba(255,255,255,0.1)", margin: "0 12px", transition: "background 0.3s" }} />
                )}
              </div>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: "8px" }}>
            {step === 0 && "Create account"}
            {step === 1 && "Your details"}
            {step === 2 && "Verify identity"}
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", marginBottom: "36px", lineHeight: 1.6 }}>
            {step === 0 && "Start your co-ownership journey today."}
            {step === 1 && "Tell us a bit about yourself."}
            {step === 2 && "Your BVN protects every member in the pool."}
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

          {/* ── Step 0: Credentials ── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input type="email" placeholder="emeka@example.com" value={form.email}
                  onChange={e => set("email", e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={form.password}
                    onChange={e => set("password", e.target.value)}
                    style={{ ...inputStyle, paddingRight: "60px" }}
                    onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--terra-400)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm password</label>
                <input type="password" placeholder="Repeat your password" value={form.confirmPassword}
                  onChange={e => set("confirmPassword", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleNext()}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Personal details ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input type="text" placeholder="Emeka" value={form.firstName}
                    onChange={e => set("firstName", e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input type="text" placeholder="Okonkwo" value={form.lastName}
                    onChange={e => set("lastName", e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Phone number</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ ...inputStyle, width: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", paddingLeft: "14px", paddingRight: "14px", fontSize: "15px" }}>
                    🇳🇬 <span style={{ color: "rgba(255,255,255,0.6)" }}>+234</span>
                  </div>
                  <input type="tel" placeholder="0812 345 6789" value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleNext()}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: BVN ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{
                background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)",
                borderRadius: "var(--radius-md)", padding: "14px 16px",
                display: "flex", gap: "12px", alignItems: "flex-start",
              }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Why we need your BVN</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                    Your BVN verifies your identity and protects all pool members. We never store your full BVN — only a secure hash.
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bank Verification Number (BVN)</label>
                <input
                  type="text" placeholder="Enter your 11-digit BVN" value={form.bvn}
                  maxLength={11}
                  onChange={e => set("bvn", e.target.value.replace(/\D/g, ""))}
                  onKeyDown={e => e.key === "Enter" && handleNext()}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--terra-500)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              {/* BVN digit progress */}
              <div style={{ display: "flex", gap: "5px" }}>
                {Array.from({ length: 11 }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: "3px", borderRadius: "999px",
                    background: i < form.bvn.length ? "var(--terra-500)" : "rgba(255,255,255,0.1)",
                    transition: "background 0.2s",
                  }} />
                ))}
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                {form.bvn.length}/11 digits entered
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "36px" }}>
            {step > 0 && (
              <button
                onClick={() => { setStep(s => s - 1); setError("") }}
                style={{
                  flex: "0 0 auto", padding: "15px 24px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "var(--radius-pill)", fontSize: "15px",
                  color: "rgba(255,255,255,0.7)", cursor: "pointer",
                  fontFamily: "var(--font-body)", transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                 Back
              </button>
            )}
            <button
              onClick={handleNext} disabled={loading}
              style={{
                flex: 1, padding: "16px",
                background: loading ? "var(--terra-700)" : "var(--terra-500)",
                color: "#fff", border: "none",
                borderRadius: "var(--radius-pill)", fontSize: "16px",
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.15s",
                boxShadow: "0 6px 32px rgba(249,115,22,0.3)",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)" }}
            >
              {loading ? "Creating account…" : step === 2 ? "Create account" : "Continue "}
            </button>
          </div>

          {/* Sign in link */}
          <p style={{ textAlign: "center", fontSize: "15px", color: "rgba(255,255,255,0.35)", marginTop: "28px" }}>
            Already have an account?{" "}
            <span onClick={() => router.push("/login")} style={{ color: "var(--terra-400)", fontWeight: 600, cursor: "pointer" }}>
              Sign in
            </span>
          </p>

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .left-panel { display: flex !important; }
        }
      `}</style>
    </main>
  )
}