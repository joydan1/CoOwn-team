"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { propertiesApi } from "@/lib/api"

interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
  status: "available" | "pooling" | "open_pool"
  image: string
  aiValuation?: { min: number; max: number; confidence: "High" | "Medium" | "Low" }
  stakeLeft?: number
  beds?: number
  baths?: number
  sqm?: number
}

const FILTERS = ["All", "Land", "Apartment", "Duplex", "Commercial"]

const IMAGES: Record<string, string[]> = {
  Land: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    "https://images.unsplash.com/photo-1416169607655-0c2b3ce2e1cc?w=600&q=80",
  ],
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  ],
  Duplex: [
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  ],
  Commercial: [
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&q=80",
  ],
}

const getImage = (type: string, id: string) => {
  const pool = IMAGES[type] ?? IMAGES.Apartment
  return pool[parseInt(id) % pool.length]
}

const MOCK: Property[] = [
  { id: "1", title: "Lekki Phase 1 Land", location: "Lekki, Lagos", price: 45000000, type: "Land", status: "pooling", image: getImage("Land", "1"), aiValuation: { min: 42000000, max: 50000000, confidence: "High" }, stakeLeft: 32, sqm: 600 },
  { id: "2", title: "3-Bed Apartment, Ikoyi", location: "Ikoyi, Lagos", price: 78000000, type: "Apartment", status: "available", image: getImage("Apartment", "2"), aiValuation: { min: 74000000, max: 85000000, confidence: "High" }, beds: 3, baths: 3, sqm: 180 },
  { id: "3", title: "Corner Duplex, Maitama", location: "Maitama, Abuja", price: 120000000, type: "Duplex", status: "open_pool", image: getImage("Duplex", "3"), aiValuation: { min: 110000000, max: 130000000, confidence: "Medium" }, stakeLeft: 25, beds: 4, baths: 4, sqm: 320 },
  { id: "4", title: "Serviced Land, Ajah", location: "Ajah, Lagos", price: 18000000, type: "Land", status: "available", image: getImage("Land", "4"), aiValuation: { min: 16500000, max: 20000000, confidence: "High" }, sqm: 450 },
  { id: "5", title: "Mini Flat, Victoria Island", location: "VI, Lagos", price: 35000000, type: "Apartment", status: "pooling", image: getImage("Apartment", "5"), aiValuation: { min: 32000000, max: 38000000, confidence: "Medium" }, stakeLeft: 60, beds: 1, baths: 1, sqm: 75 },
  { id: "6", title: "Commercial Plaza, Ikeja", location: "Ikeja, Lagos", price: 200000000, type: "Commercial", status: "open_pool", image: getImage("Commercial", "6"), aiValuation: { min: 185000000, max: 220000000, confidence: "Low" }, stakeLeft: 40, sqm: 800 },
]

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")
const confidenceColor = (c: string) => c === "High" ? "#4ADE80" : c === "Medium" ? "var(--terra-400)" : "#F87171"

const statusLabel = (p: Property) => {
  if (p.status === "pooling") return { label: "Pooling in progress", bg: "rgba(249,115,22,0.85)", color: "#fff" }
  if (p.status === "open_pool") return { label: `${p.stakeLeft}% stake available`, bg: "rgba(74,222,128,0.85)", color: "#052e16" }
  return { label: "Available", bg: "rgba(12,27,51,0.75)", color: "#fff" }
}

export default function ListingsPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>(MOCK)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
    propertiesApi.list().then(res => {
      if (res.data?.length) setProperties(res.data)
    }).catch(() => {})
  }, [])

  const filtered = properties.filter(p => {
    const matchFilter = filter === "All" || p.type === filter
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <main style={{ minHeight: "100vh", background: "var(--warm-50)", fontFamily: "var(--font-body)" }}>

      {/* ── Sticky top nav ── */}
      <nav style={{
        background: "var(--navy-900)", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: "16px", height: "64px" }}>
          <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "25px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer", flexShrink: 0 }}>
            Co<span style={{ color: "var(--terra-500)" }}>Own</span>
          </span>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: "460px", position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: "15px" }}>⌕</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search properties or locations…"
              style={{
                width: "100%", padding: "10px 16px 10px 38px",
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-pill)", fontSize: "14px",
                color: "#fff", fontFamily: "var(--font-body)", outline: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--terra-500)"; e.target.style.background = "rgba(255,255,255,0.1)" }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)" }}
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => router.push("/pools/create")}
              style={{
                background: "var(--terra-500)", color: "#fff", border: "none",
                borderRadius: "var(--radius-pill)", padding: "9px 20px",
                fontSize: "15px", fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--terra-600)"; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--terra-500)"; e.currentTarget.style.transform = "translateY(0)" }}
            >
              + New Pool
            </button>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--terra-500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff", cursor: "pointer", flexShrink: 0 }}>
              E
            </div>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div style={{ background: "var(--navy-900)", padding: "32px 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Good morning 👋</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: "24px" }}>
            Find your next property
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "8px 18px", borderRadius: "var(--radius-pill)",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "var(--font-body)", border: "none",
                  background: filter === f ? "var(--terra-500)" : "rgba(255,255,255,0.08)",
                  color: filter === f ? "#fff" : "rgba(255,255,255,0.55)",
                  transition: "all 0.2s",
                  transform: filter === f ? "scale(1.04)" : "scale(1)",
                }}
              >
                {f}
              </button>
            ))}
            <div style={{ marginLeft: "auto", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "var(--radius-pill)", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
              <span style={{ fontSize: "12px", color: "#4ADE80", fontWeight: 600 }}>{filtered.length} listings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {filtered.map((p, i) => {
            const status = statusLabel(p)
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/listings/${p.id}`)}
                style={{
                  background: "#fff", borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-light)", overflow: "hidden",
                  cursor: "pointer", transition: "transform 0.25s, box-shadow 0.25s",
                  boxShadow: "var(--shadow-sm)",
                  opacity: loaded ? 1 : 0,
                  transitionDelay: `${i * 0.07}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(12,27,51,0.14)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)"
                }}
              >
                {/* ── Photo ── */}
                <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {/* Dark overlay at bottom */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />

                  {/* Status badge */}
                  <div style={{
                    position: "absolute", top: "12px", left: "12px",
                    background: status.bg, borderRadius: "var(--radius-pill)",
                    padding: "5px 12px", fontSize: "11px", fontWeight: 700,
                    color: status.color, backdropFilter: "blur(6px)",
                  }}>
                    {status.label}
                  </div>

                  {/* Type badge */}
                  <div style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "rgba(0,0,0,0.5)", borderRadius: "var(--radius-pill)",
                    padding: "5px 12px", fontSize: "11px", fontWeight: 600,
                    color: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)",
                  }}>
                    {p.type}
                  </div>

                  {/* Price over image */}
                  <div style={{ position: "absolute", bottom: "12px", left: "14px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                      {fmt(p.price)}
                    </div>
                  </div>

                  {/* Pool progress bar */}
                  {(p.status === "pooling" || p.status === "open_pool") && p.stakeLeft && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "rgba(0,0,0,0.3)" }}>
                      <div style={{ height: "100%", width: `${100 - p.stakeLeft}%`, background: "var(--terra-500)", transition: "width 0.6s ease" }} />
                    </div>
                  )}
                </div>

                {/* ── Card body ── */}
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)", marginBottom: "3px" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    
                  </div>

                  {/* Specs */}
                  {(p.beds || p.baths || p.sqm) && (
                    <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "var(--muted)", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--border-light)" }}>
                      {p.beds !== undefined && p.beds > 0 && <span>🛏 {p.beds} bed{p.beds > 1 ? "s" : ""}</span>}
                      {p.baths !== undefined && p.baths > 0 && <span>🚿 {p.baths} bath{p.baths > 1 ? "s" : ""}</span>}
                      {p.sqm && <span> {p.sqm} sqm</span>}
                    </div>
                  )}

                  {/* AI valuation */}
                  {p.aiValuation && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      background: "var(--terra-50)", border: "1px solid var(--terra-100)",
                      borderRadius: "var(--radius-sm)", padding: "8px 12px", marginBottom: "14px",
                    }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--terra-500)", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--terra-700)", fontWeight: 500, flex: 1 }}>
                        AI est. {fmt(p.aiValuation.min)} — {fmt(p.aiValuation.max)}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: "rgba(0,0,0,0.06)", color: confidenceColor(p.aiValuation.confidence) }}>
                        {p.aiValuation.confidence}
                      </span>
                    </div>
                  )}

                  {/* CTAs */}
                  <div style={{ display: "grid", gridTemplateColumns: p.status === "open_pool" ? "1fr 1fr" : "1fr 1fr 1fr", gap: "7px" }}>
                    <button onClick={e => { e.stopPropagation(); router.push(`/listings/${p.id}`) }}
                      style={{ padding: "10px 4px", background: "var(--navy-900)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", transition: "background 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--navy-700)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--navy-900)")}
                    >
                      Buy alone
                    </button>
                    <button onClick={e => { e.stopPropagation(); router.push(`/pools/create?propertyId=${p.id}`) }}
                      style={{ padding: "10px 4px", background: "var(--terra-500)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", transition: "background 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--terra-600)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--terra-500)")}
                    >
                      Start pool
                    </button>
                    {p.status !== "open_pool" && (
                      <button onClick={e => { e.stopPropagation(); router.push(`/pools?join=${p.id}`) }}
                        style={{ padding: "10px 4px", background: "var(--warm-100)", color: "var(--navy-900)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", transition: "background 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--warm-200)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--warm-100)")}
                      >
                        Join pool
                      </button>
                    )}
                    {p.status === "open_pool" && (
                      <button onClick={e => { e.stopPropagation(); router.push(`/pools/open/${p.id}`) }}
                        style={{ padding: "10px 4px", background: "rgba(74,222,128,0.1)", color: "#16a34a", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}
                      >
                        Buy {p.stakeLeft}% stake
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>No properties found</p>
            <p style={{ fontSize: "15px", color: "var(--muted)" }}>Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid var(--border-light)",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 20px", boxShadow: "0 -4px 20px rgba(12,27,51,0.07)", zIndex: 50,
      }}>
        {[
          { icon: "🏘️", label: "Explore", path: "/listings", active: true },
          { icon: "🤝", label: "My Pools", path: "/pools", active: false },
          { icon: "💳", label: "Payments", path: "/payments", active: false },
          { icon: "👤", label: "Profile", path: "/profile", active: false },
        ].map(item => (
          <button key={item.label} onClick={() => router.push(item.path)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", padding: "0 16px" }}>
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: 600, color: item.active ? "var(--navy-900)" : "var(--faint)" }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
    </main>
  )
}