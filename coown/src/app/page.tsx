"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const IconPool = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4" fill="currentColor" fillOpacity="0.15"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const IconEscrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z"/>
    <path d="M9 12l2 2 4-4" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconAI = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="8.5" cy="10" r="1.5" fill="white"/>
    <circle cx="15.5" cy="10" r="1.5" fill="white"/>
    <path d="M8.5 13.5s1 1.5 3.5 1.5 3.5-1.5 3.5-1.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const features = [
  { Icon: IconPool,   title: "Pool & co-own",          desc: "Buy property you couldn't afford alone. Split the cost, share the title." },
  { Icon: IconEscrow, title: "Escrow-protected",        desc: "Every kobo held in escrow. Auto-refund if target isn't reached." },
  { Icon: IconAI,     title: "AI-powered valuations",   desc: "Know if you're getting a fair deal before you commit a naira." },
]

const stats = [
  { value: "₦2.1B+",   label: "Pooled annually" },
  { value: "12,000+",  label: "Co-owners" },
  { value: "98%",      label: "Escrow success" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t1 = setTimeout(() => setHeroVisible(true), 80)
    const t2 = setTimeout(() => setFeaturesVisible(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const fadeUp = (visible: boolean, delay = "0s") => ({
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
  })

  return (
    <main style={{ 
      minHeight: "100vh", 
      width: "100%", 
      background: "var(--cream-100)", 
      fontFamily: "var(--font-body)", 
      overflowX: "hidden" 
    }}>

      {/* Background decoration */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ 
          position: "absolute", 
          width: 700, height: 700, 
          top: -200, right: -200, 
          borderRadius: "50%", 
          background: "radial-gradient(circle, rgba(0,217,126,0.10) 0%, transparent 65%)", 
          animation: "floatSlow 12s ease-in-out infinite", 
          opacity: mounted ? 1 : 0, 
          transition: "opacity 1.8s ease" 
        }} />
        
        <div style={{ 
          position: "absolute", 
          width: 500, height: 500, 
          bottom: -100, left: -150, 
          borderRadius: "50%", 
          background: "radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 65%)", 
          animation: "floatSlow 16s ease-in-out infinite reverse", 
          animationDelay: "4s", 
          opacity: mounted ? 1 : 0, 
          transition: "opacity 2s ease" 
        }} />

        {[640, 420, 220].map((size, i) => (
          <div 
            key={size} 
            style={{ 
              position: "absolute", 
              borderRadius: "50%", 
              width: size, 
              height: size, 
              top: -size / 3, 
              right: -size / 4, 
              border: `1px solid rgba(0,217,126,${0.05 + i * 0.03})`, 
              animation: `spinSlow ${28 + i * 10}s linear infinite`, 
              opacity: mounted ? 1 : 0, 
              transition: `opacity ${1.5 + i * 0.3}s ease` 
            }} 
          />
        ))}

        <div style={{ 
          position: "absolute", 
          inset: 0, 
          backgroundImage: "radial-gradient(circle, rgba(13,31,15,0.07) 1px, transparent 1px)", 
          backgroundSize: "32px 32px", 
          opacity: mounted ? 1 : 0, 
          transition: "opacity 2.5s ease" 
        }} />
      </div>

      {/* Page content */}
      <div style={{ 
        position: "relative", 
        zIndex: 10, 
        maxWidth: "1100px", 
        margin: "0 auto", 
        padding: "0 clamp(16px, 4vw, 32px) 80px" 
      }}>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0", ...fadeUp(heroVisible) }}>
          <span style={{ 
            fontFamily: "var(--font-display)", 
            fontSize: "clamp(22px, 3vw, 28px)", 
            fontWeight: 700, 
            color: "var(--ink)", 
            letterSpacing: "-0.5px" 
          }}>
            Co<span style={{ color: "var(--accent)" }}>Own</span>
          </span>
          <button 
            onClick={() => router.push("/login")} 
            style={{ 
              background: "transparent", 
              border: "1.5px solid var(--border)", 
              borderRadius: "var(--radius-pill)", 
              padding: "10px 24px", 
              color: "var(--ink)", 
              fontSize: "15px", 
              fontWeight: 500, 
              cursor: "pointer", 
              fontFamily: "var(--font-body)", 
              transition: "border-color 0.2s, background 0.2s, transform 0.15s cubic-bezier(0.34,1.56,0.64,1)" 
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.borderColor = "var(--accent)"; 
              e.currentTarget.style.background = "var(--accent-dim)"; 
              e.currentTarget.style.transform = "translateY(-2px)" 
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.borderColor = "var(--border)"; 
              e.currentTarget.style.background = "transparent"; 
              e.currentTarget.style.transform = "translateY(0)" 
            }}
          >
            Sign in
          </button>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: "clamp(32px, 6vw, 60px)", paddingBottom: "20px" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            background: "var(--accent-dim)", 
            border: "1px solid rgba(0,217,126,0.28)", 
            borderRadius: "var(--radius-pill)", 
            padding: "7px 18px", 
            marginBottom: "32px", 
            ...fadeUp(heroVisible) 
          }}>
            <span style={{ 
              width: "7px", 
              height: "7px", 
              borderRadius: "50%", 
              background: "var(--accent)", 
              display: "inline-block", 
              animation: "accentPulse 2.4s ease-in-out infinite" 
            }} />
            <span style={{ fontSize: "13px", color: "var(--green-800)", fontWeight: 600, letterSpacing: "0.03em" }}>
              Nigeria&apos;s #1 co-ownership platform
            </span>
          </div>

          <h1 style={{ 
            fontFamily: "var(--font-display)", 
            fontSize: "clamp(44px, 9vw, 88px)", 
            fontWeight: 700, 
            color: "var(--ink)", 
            letterSpacing: "clamp(-1.5px, -0.03em, -3px)", 
            lineHeight: 1.0, 
            marginBottom: "28px", 
            ...fadeUp(heroVisible, "0.1s") 
          }}>
            Own your piece<br />
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>of Nigeria.</em>
          </h1>

          <p style={{ 
            fontSize: "clamp(16px, 2.5vw, 21px)", 
            color: "var(--muted)", 
            lineHeight: 1.75, 
            maxWidth: "560px", 
            margin: "0 auto 48px", 
            ...fadeUp(heroVisible, "0.2s") 
          }}>
            Pool funds with friends, colleagues, or strangers. Buy land and property together with full protection and financial transparency.
          </p>

          <div style={{ 
            display: "flex", 
            gap: "14px", 
            justifyContent: "center", 
            flexWrap: "wrap", 
            ...fadeUp(heroVisible, "0.3s") 
          }}>
            <button 
              onClick={() => router.push("/register")} 
              style={{ 
                background: "var(--accent)", 
                color: "var(--grey-950)", 
                border: "none", 
                borderRadius: "var(--radius-pill)", 
                padding: "clamp(14px,2vw,18px) clamp(28px,4vw,44px)", 
                fontSize: "clamp(15px,2vw,17px)", 
                fontWeight: 700, 
                cursor: "pointer", 
                fontFamily: "var(--font-body)", 
                transition: "background 0.18s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s", 
                boxShadow: "0 8px 32px rgba(0,217,126,0.35)" 
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = "var(--accent-vivid)"; 
                e.currentTarget.style.transform = "translateY(-4px)"; 
                e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,230,118,0.4)" 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = "var(--accent)"; 
                e.currentTarget.style.transform = "translateY(0)"; 
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,217,126,0.35)" 
              }}
            >
              Get started, it&apos;s free
            </button>

            <button 
              onClick={() => router.push("/listings")} 
              style={{ 
                background: "transparent", 
                color: "var(--ink)", 
                border: "1.5px solid var(--border)", 
                borderRadius: "var(--radius-pill)", 
                padding: "clamp(13px,2vw,17px) clamp(28px,4vw,44px)", 
                fontSize: "clamp(15px,2vw,17px)", 
                fontWeight: 500, 
                cursor: "pointer", 
                fontFamily: "var(--font-body)", 
                transition: "border-color 0.18s, background 0.18s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1)" 
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.borderColor = "var(--accent)"; 
                e.currentTarget.style.background = "var(--accent-dim)"; 
                e.currentTarget.style.transform = "translateY(-4px)" 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.borderColor = "var(--border)"; 
                e.currentTarget.style.background = "transparent"; 
                e.currentTarget.style.transform = "translateY(0)" 
              }}
            >
              Browse properties
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "clamp(10px,2vw,16px)", 
          margin: "clamp(48px,6vw,72px) auto 0", 
          maxWidth: "700px", 
          ...fadeUp(heroVisible, "0.4s") 
        }}>
          {stats.map((s, i) => (
            <div 
              key={s.label} 
              style={{ 
                background: "var(--bg-surface)", 
                border: "1px solid var(--border)", 
                borderRadius: "var(--radius-lg)", 
                padding: "clamp(16px,2vw,24px) 16px", 
                textAlign: "center", 
                transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)", 
                cursor: "default" 
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.borderColor = "var(--accent)"; 
                e.currentTarget.style.boxShadow = "var(--shadow-md), 0 0 0 1px var(--accent)"; 
                e.currentTarget.style.transform = "translateY(-4px)" 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.borderColor = "var(--border)"; 
                e.currentTarget.style.boxShadow = "none"; 
                e.currentTarget.style.transform = "translateY(0)" 
              }}
            >
              <div style={{ 
                fontFamily: "var(--font-display)", 
                fontSize: "clamp(20px,4vw,34px)", 
                fontWeight: 700, 
                color: "var(--accent)", 
                letterSpacing: "-1px" 
              }}>
                {s.value}
              </div>
              <div style={{ 
                fontSize: "clamp(11px,1.5vw,13px)", 
                color: "var(--muted)", 
                marginTop: "6px", 
                fontWeight: 500 
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ 
          height: "1px", 
          background: "var(--border)", 
          margin: "clamp(48px,6vw,72px) 0 56px", 
          ...fadeUp(featuresVisible) 
        }} />

        {/* Features */}
        <div style={{ ...fadeUp(featuresVisible, "0.1s") }}>
          <p style={{ 
            fontSize: "11px", 
            fontWeight: 700, 
            letterSpacing: "0.14em", 
            textTransform: "uppercase", 
            color: "var(--faint)", 
            marginBottom: "28px", 
            textAlign: "center" 
          }}>
            Why CoOwn
          </p>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
            gap: "16px" 
          }}>
            {features.map((f, i) => (
              <div 
                key={f.title} 
                style={{ 
                  background: "var(--bg-surface)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius-lg)", 
                  padding: "28px 24px", 
                  display: "flex", 
                  gap: "20px", 
                  alignItems: "flex-start", 
                  transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.1}s, border-color 0.22s, box-shadow 0.22s`, 
                  opacity: featuresVisible ? 1 : 0, 
                  transform: featuresVisible ? "translateY(0)" : "translateY(24px)", 
                  cursor: "default" 
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.borderColor = "var(--accent)"; 
                  e.currentTarget.style.boxShadow = "var(--shadow-md), 0 0 0 1px var(--accent)" 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.borderColor = "var(--border)"; 
                  e.currentTarget.style.boxShadow = "none" 
                }}
              >
                <div style={{ 
                  width: "52px", 
                  height: "52px", 
                  flexShrink: 0, 
                  borderRadius: "var(--radius-md)", 
                  background: "var(--accent-dim)", 
                  border: "1px solid rgba(0,217,126,0.2)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "var(--accent)" 
                }}>
                  <f.Icon />
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 600, color: "var(--ink)", marginBottom: "8px" }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.65 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "clamp(64px,8vw,96px)", 
          ...fadeUp(featuresVisible, "0.5s") 
        }}>
          <p style={{ 
            fontFamily: "var(--font-display)", 
            fontSize: "clamp(24px,5vw,44px)", 
            fontWeight: 700, 
            color: "var(--ink)", 
            letterSpacing: "-1px", 
            marginBottom: "12px" 
          }}>
            Ready to own your first property?
          </p>
          <p style={{ 
            fontSize: "clamp(15px,2vw,18px)", 
            color: "var(--muted)", 
            marginBottom: "36px" 
          }}>
            Join thousands of Nigerians building wealth together.
          </p>
          <button 
            onClick={() => router.push("/register")} 
            style={{ 
              background: "var(--accent)", 
              color: "var(--grey-950)", 
              border: "none", 
              borderRadius: "var(--radius-pill)", 
              padding: "18px 56px", 
              fontSize: "17px", 
              fontWeight: 700, 
              cursor: "pointer", 
              fontFamily: "var(--font-body)", 
              transition: "background 0.18s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s", 
              boxShadow: "0 8px 32px rgba(0,217,126,0.32)" 
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = "var(--accent-vivid)"; 
              e.currentTarget.style.transform = "translateY(-4px)"; 
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,230,118,0.4)" 
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = "var(--accent)"; 
              e.currentTarget.style.transform = "translateY(0)"; 
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,217,126,0.32)" 
            }}
          >
            Start for free today
          </button>
          <p style={{ fontSize: "15px", color: "var(--faint)", marginTop: "20px" }}>
            Already have an account?{" "}
            <span 
              onClick={() => router.push("/login")} 
              style={{ 
                color: "var(--accent)", 
                cursor: "pointer", 
                fontWeight: 600, 
                transition: "opacity 0.15s" 
              }} 
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} 
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Sign in
            </span>
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          flexWrap: "wrap", 
          gap: "12px", 
          borderTop: "1px solid var(--border)", 
          marginTop: "80px", 
          paddingTop: "32px", 
          ...fadeUp(featuresVisible, "0.6s") 
        }}>
          <span style={{ 
            fontFamily: "var(--font-display)", 
            fontSize: "20px", 
            fontWeight: 700, 
            color: "var(--faint)", 
            letterSpacing: "-0.5px" 
          }}>
            Co<span style={{ color: "var(--accent)" }}>Own</span>
          </span>
          <span style={{ fontSize: "14px", color: "var(--faint)" }}>
            © 2026 CoOwn · Enyata x Interswitch Hackathon
          </span>
        </div>
      </div>

      <style>{`
        @keyframes accentPulse { 
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,217,126,0.45); } 
          50% { box-shadow: 0 0 0 10px rgba(0,217,126,0); } 
        }
        @keyframes floatSlow { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-18px); } 
        }
        @keyframes spinSlow { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </main>
  )
}