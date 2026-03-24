"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const features = [
  { icon: "🏡", title: "Pool & co-own", desc: "Buy property you couldn't afford alone. Split the cost, share the title." },
  { icon: "🔒", title: "Escrow-protected", desc: "Every kobo held in escrow. Auto-refund if target isn't reached." },
  { icon: "🤖", title: "AI-powered valuations", desc: "Know if you're getting a fair deal before you commit a naira." },
]

const stats = [
  { value: "₦2.1B+", label: "Pooled annually" },
  { value: "12,000+", label: "Co-owners" },
  { value: "98%", label: "Escrow success" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t1 = setTimeout(() => setHeroVisible(true), 100)
    const t2 = setTimeout(() => setFeaturesVisible(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const fadeUp = (visible: boolean, delay = "0s") => ({
    transition: `opacity 0.9s ease ${delay}, transform 0.9s ease ${delay}`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
  })

  return (
    <main style={{ minHeight: "100vh", width: "100%", background: "var(--navy-950)", fontFamily: "var(--font-body)", overflowX: "hidden" }}>

      {/* ── Background circles ── */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[600, 400, 200].map((size, i) => (
          <div key={size} style={{
            position: "absolute", borderRadius: "50%",
            width: size, height: size,
            top: -size / 3, right: -size / 4,
            border: `1px solid rgba(255,255,255,${0.03 + i * 0.02})`,
            transition: "opacity 1.5s ease",
            opacity: mounted ? 1 : 0,
          }} />
        ))}
        <div style={{
          position: "absolute", width: 600, height: 600,
          bottom: "5%", left: "-150px",
          border: "1px solid rgba(249,115,22,0.07)",
          borderRadius: "50%",
          transition: "opacity 2s ease",
          opacity: mounted ? 1 : 0,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(249,115,22,0.05) 0%, transparent 70%)",
          transition: "opacity 2s ease",
          opacity: mounted ? 1 : 0,
        }} />
      </div>

      {/* ── Page content — centered ── */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: "1100px", margin: "0 auto", padding: "0 32px 80px" }}>

        {/* ── Nav ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 0", ...fadeUp(heroVisible) }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
            Co<span style={{ color: "var(--terra-500)" }}>Own</span>
          </span>
          <button
            onClick={() => router.push("/login")}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "var(--radius-pill)", padding: "10px 26px",
              color: "rgba(255,255,255,0.85)", fontSize: "20px", fontWeight: 500,
              cursor: "pointer", fontFamily: "var(--font-body)", transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            Sign in
          </button>
        </div>

        {/* ── Hero ── */}
        <div style={{ textAlign: "center", paddingTop: "60px", paddingBottom: "20px" }}>

          {/* Tag pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.22)",
            borderRadius: "var(--radius-pill)", padding: "7px 18px", marginBottom: "32px",
            ...fadeUp(heroVisible),
          }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--terra-400)", display: "inline-block" }} />
            <span style={{ fontSize: "14px", color: "var(--terra-300)", fontWeight: 600, letterSpacing: "0.03em" }}>
              Nigeria&apos;s #1 co-ownership platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(52px, 9vw, 88px)",
            fontWeight: 700, color: "#fff",
            letterSpacing: "-3px", lineHeight: 1.0,
            marginBottom: "28px",
            ...fadeUp(heroVisible, "0.1s"),
          }}>
            Own your piece<br />
            <em style={{ color: "var(--terra-400)", fontStyle: "italic" }}>of Nigeria.</em>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: "clamp(17px, 2.5vw, 22px)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.75, maxWidth: "580px",
            margin: "0 auto 48px",
            ...fadeUp(heroVisible, "0.2s"),
          }}>
            Pool funds with friends, colleagues, or strangers.
            Buy land and property together with full  protection
            and financial transparency.
          </p>

          {/* CTAs */}
          <div style={{
            display: "flex", gap: "14px", justifyContent: "center",
            flexWrap: "wrap",
            ...fadeUp(heroVisible, "0.3s"),
          }}>
            <button
              onClick={() => router.push("/register")}
              style={{
                background: "var(--terra-500)", color: "#fff", border: "none",
                borderRadius: "var(--radius-pill)", padding: "18px 44px",
                fontSize: "17px", fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.15s",
                boxShadow: "0 8px 40px rgba(249,115,22,0.4)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--terra-600)"; e.currentTarget.style.transform = "translateY(-3px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--terra-500)"; e.currentTarget.style.transform = "translateY(0)" }}
            >
              Get started, it&apos;s free
            </button>
            <button
              onClick={() => router.push("/listings")}
              style={{
                background: "rgba(255,255,255,0.07)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: "var(--radius-pill)", padding: "17px 44px",
                fontSize: "17px", fontWeight: 500, cursor: "pointer",
                fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-3px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)" }}
            >
              Browse properties 
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px", margin: "72px auto 0", maxWidth: "700px",
          ...fadeUp(heroVisible, "0.4s"),
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "var(--radius-lg)", padding: "24px 16px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, color: "#fff", letterSpacing: "-1px" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "6px", fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "72px 0 56px", ...fadeUp(featuresVisible) }} />

        {/* ── Features ── */}
        <div style={{ ...fadeUp(featuresVisible, "0.1s") }}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "28px", textAlign: "center" }}>
            Why CoOwn
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "var(--radius-lg)", padding: "28px 24px",
                  display: "flex", gap: "20px", alignItems: "flex-start",
                  transition: `opacity 0.6s ease ${0.1 + i * 0.1}s, transform 0.6s ease ${0.1 + i * 0.1}s, background 0.2s, border-color 0.2s`,
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible ? "translateY(0)" : "translateY(20px)",
                  cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)" }}
              >
                <div style={{ width: "52px", height: "52px", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>{f.title}</div>
                  <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{ textAlign: "center", marginTop: "96px", ...fadeUp(featuresVisible, "0.5s") }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: "12px" }}>
            Ready to own your first property?
          </p>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", marginBottom: "36px" }}>
            Join thousands of Nigerians building wealth together.
          </p>
          <button
            onClick={() => router.push("/register")}
            style={{
              background: "var(--terra-500)", color: "#fff", border: "none",
              borderRadius: "var(--radius-pill)", padding: "18px 56px",
              fontSize: "17px", fontWeight: 700, cursor: "pointer",
              fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.15s",
              boxShadow: "0 8px 40px rgba(249,115,22,0.35)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--terra-600)"; e.currentTarget.style.transform = "translateY(-3px)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--terra-500)"; e.currentTarget.style.transform = "translateY(0)" }}
          >
            Start for free today
          </button>
          <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.25)", marginTop: "20px" }}>
            Already have an account?{" "}
            <span onClick={() => router.push("/login")} style={{ color: "var(--terra-400)", cursor: "pointer", fontWeight: 600 }}>
              Sign in
            </span>
          </p>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          marginTop: "80px", paddingTop: "32px",
          ...fadeUp(featuresVisible, "0.6s"),
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "-0.5px" }}>
            Co<span style={{ color: "var(--terra-700)" }}>Own</span>
          </span>
          <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.2)" }}>
            © 2026 CoOwn · Enyata x Interswitch Hackathon
          </span>
        </div>

      </div>
    </main>
  )
}