"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { propertiesApi, poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
  status?: string
  image?: string
  description?: string
  bedrooms?: number
  bathrooms?: number
  squareMeters?: number
  aiValuation?: {
    min: number
    max: number
    confidence: "High" | "Medium" | "Low"
    factors?: string[]
  }
}

interface Pool {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  raisedAmount?: number
  memberCount: number
  memberLimit: number
  deadline: string
  status: string
}

const fmt = (n: number) =>
  "₦" + (n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + "M"
    : (n / 1000).toFixed(0) + "K")

const getFallbackImage = (type: string) => {
  const images: Record<string, string> = {
    Land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    Apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    Duplex: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80",
    Commercial: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  }
  return images[type] ?? images.Apartment
}

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const { isAuthenticated } = useAuthStore()

  const [property, setProperty] = useState<Property | null>(null)
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"details" | "pools">("details")

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return }
    if (!propertyId) return
    fetchData()
  }, [isAuthenticated, propertyId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")

      const [propData, poolsData] = await Promise.all([
        propertiesApi.getOne(propertyId),
        poolsApi.list(),
      ])

      const prop = propData
      setProperty({
        id: prop.id,
        title: prop.title,
        location: prop.location,
        price: prop.price,
        type: prop.type || "Property",
        status: prop.status,
        image: prop.image || getFallbackImage(prop.type || "Apartment"),
        description: prop.description,
        bedrooms: prop.bedrooms ?? prop.beds,
        bathrooms: prop.bathrooms ?? prop.baths,
        squareMeters: prop.squareMeters ?? prop.sqm,
        aiValuation: prop.aiValuation ?? {
          min: prop.price * 0.9,
          max: prop.price * 1.1,
          confidence: "Medium",
        },
      })

      // Filter pools for this property
      const allPools: Pool[] = (poolsData || [])
        .filter((p: any) => p.propertyId === propertyId)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          targetAmount: p.targetAmount,
          currentAmount: p.raisedAmount ?? p.currentAmount ?? 0,
          memberCount: p.memberCount ?? 0,
          memberLimit: p.memberLimit ?? 10,
          deadline: p.deadline,
          status: p.status ?? "open",
        }))
      setPools(allPools)

    } catch (err: any) {
      console.error("Failed to fetch property:", err)
      setError(err.response?.data?.message || "Failed to load property details")
    } finally {
      setLoading(false)
    }
  }

  const handleStartPool = () => {
    router.push(`/pools/create?propertyId=${propertyId}`)
  }

  const handleJoinPool = (poolId: string) => {
    router.push(`/pools/${poolId}`)
  }

  // ── Loading ──
  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px",
            border: "3px solid #E5E5E0", borderTopColor: "#00C853",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}/>
          <p style={{ color: "#5C6B5E", fontSize: "15px" }}>Loading property…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  // ── Error ──
  if (error || !property) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "18px", color: "#dc2626", marginBottom: "16px" }}>
            {error || "Property not found"}
          </p>
          <button
            onClick={() => router.back()}
            style={{ padding: "12px 24px", background: "#00C853", color: "#0D1F0F", border: "none", borderRadius: "999px", fontWeight: 600, cursor: "pointer" }}
          >
            Go back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>

      {/* ── NAV ── */}
      <nav style={{ background: "#0D1F0F", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(0,200,83,0.15)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: "16px", height: "64px" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", padding: "8px 16px", color: "#fff", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ← Back
          </button>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={handleStartPool}
              style={{ background: "#00C853", color: "#0D1F0F", border: "none", borderRadius: "999px", padding: "9px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#00E676")}
              onMouseLeave={e => (e.currentTarget.style.background = "#00C853")}
            >
              Start a Pool
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO IMAGE ── */}
      <div style={{ height: "380px", position: "relative", overflow: "hidden" }}>
        <img
          src={property.image}
          alt={property.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { (e.target as HTMLImageElement).src = getFallbackImage(property.type) }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,31,15,0.8) 0%, rgba(13,31,15,0.2) 60%, transparent 100%)" }}/>
        <div style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
            <span style={{ background: "rgba(0,200,83,0.9)", color: "#0D1F0F", fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px" }}>
              {property.type}
            </span>
            {property.status && (
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "12px", fontWeight: 500, padding: "4px 12px", borderRadius: "999px" }}>
                {property.status}
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: "8px" }}>
            {property.title}
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
            📍 {property.location}
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Price + CTA */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "16px",
          background: "#fff", borderRadius: "16px", padding: "24px 28px",
          marginBottom: "28px", border: "1px solid #E8E8E3",
        }}>
          <div>
            <p style={{ fontSize: "14px", color: "#5C6B5E", marginBottom: "4px" }}>Property Value</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 700, color: "#0D1F0F", letterSpacing: "-1px" }}>
              {fmt(property.price)}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push(`/pools/create?propertyId=${propertyId}`)}
              style={{ padding: "14px 32px", background: "#00C853", color: "#0D1F0F", border: "none", borderRadius: "999px", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 6px 24px rgba(0,200,83,0.28)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#00E676"; e.currentTarget.style.transform = "translateY(-2px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#00C853"; e.currentTarget.style.transform = "translateY(0)" }}
            >
              Start a Pool
            </button>
            <button
              onClick={() => router.push(`/listings`)}
              style={{ padding: "14px 24px", background: "transparent", color: "#0D1F0F", border: "1.5px solid #D9D9D4", borderRadius: "999px", fontSize: "15px", fontWeight: 500, cursor: "pointer" }}
            >
              Back to listings
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #E8E8E3", marginBottom: "28px" }}>
          {(["details", "pools"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 28px", background: "none", border: "none",
                fontSize: "16px", fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#00C853" : "#5C6B5E",
                borderBottom: activeTab === tab ? "2px solid #00C853" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.2s",
                marginBottom: "-2px",
              }}
            >
              {tab === "details" ? "Details" : `Active Pools (${pools.length})`}
            </button>
          ))}
        </div>

        {/* ── DETAILS TAB ── */}
        {activeTab === "details" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Description */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px 28px", border: "1px solid #E8E8E3" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D1F0F", marginBottom: "14px" }}>Description</h3>
              <p style={{ fontSize: "16px", color: "#5C6B5E", lineHeight: 1.75 }}>
                {property.description || "No description available for this property."}
              </p>
            </div>

            {/* Features */}
            {(property.bedrooms || property.bathrooms || property.squareMeters) && (
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px 28px", border: "1px solid #E8E8E3" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D1F0F", marginBottom: "20px" }}>Features</h3>
                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                  {property.bedrooms && (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "32px", fontWeight: 700, color: "#0D1F0F", fontFamily: "var(--font-display)" }}>{property.bedrooms}</p>
                      <p style={{ fontSize: "13px", color: "#8A9E8C", marginTop: "4px" }}>Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "32px", fontWeight: 700, color: "#0D1F0F", fontFamily: "var(--font-display)" }}>{property.bathrooms}</p>
                      <p style={{ fontSize: "13px", color: "#8A9E8C", marginTop: "4px" }}>Bathrooms</p>
                    </div>
                  )}
                  {property.squareMeters && (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "32px", fontWeight: 700, color: "#0D1F0F", fontFamily: "var(--font-display)" }}>{property.squareMeters}</p>
                      <p style={{ fontSize: "13px", color: "#8A9E8C", marginTop: "4px" }}>sqm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Valuation */}
            {property.aiValuation && (
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px 28px", border: "1px solid #E8E8E3" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D1F0F", marginBottom: "16px" }}>AI Valuation</h3>
                <div style={{ background: "rgba(0,200,83,0.06)", border: "1px solid rgba(0,200,83,0.15)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontSize: "14px", color: "#2A3D2C" }}>Estimated Market Range</span>
                    <span style={{
                      padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                      background: property.aiValuation.confidence === "High" ? "rgba(0,200,83,0.15)" : "rgba(245,158,11,0.15)",
                      color: property.aiValuation.confidence === "High" ? "#00C853" : "#F59E0B",
                    }}>
                      {property.aiValuation.confidence} Confidence
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "#0D1F0F", letterSpacing: "-0.5px" }}>
                    {fmt(property.aiValuation.min)} — {fmt(property.aiValuation.max)}
                  </p>
                  {property.aiValuation.factors && property.aiValuation.factors.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "8px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Factors considered</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {property.aiValuation.factors.map((factor, i) => (
                          <span key={i} style={{ padding: "5px 14px", background: "#fff", borderRadius: "999px", fontSize: "13px", color: "#2A3D2C", border: "1px solid rgba(0,200,83,0.2)" }}>
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── POOLS TAB ── */}
        {activeTab === "pools" && (
          <div>
            {pools.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "20px", border: "1px solid #E8E8E3" }}>
                <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "8px" }}>No active pools for this property yet</p>
                <p style={{ fontSize: "14px", color: "#8A9E8C", marginBottom: "24px" }}>Be the first to start a co-ownership pool</p>
                <button
                  onClick={handleStartPool}
                  style={{ padding: "14px 32px", background: "#00C853", color: "#0D1F0F", border: "none", borderRadius: "999px", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
                >
                  Start a pool
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {pools.map(pool => {
                  const progress = (pool.currentAmount / pool.targetAmount) * 100
                  return (
                    <div
                      key={pool.id}
                      onClick={() => handleJoinPool(pool.id)}
                      style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E8E8E3", padding: "22px", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,31,15,0.1)" }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D1F0F", marginBottom: "14px" }}>{pool.name}</h3>
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#5C6B5E", marginBottom: "6px" }}>
                          <span>Progress</span>
                          <span style={{ fontWeight: 500 }}>{progress.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: "8px", background: "#E8E8E3", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(progress, 100)}%`, background: "#00C853", borderRadius: "999px" }}/>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8A9E8C", marginTop: "5px" }}>
                          <span>{fmt(pool.currentAmount)} raised</span>
                          <span>{fmt(pool.targetAmount)} target</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "18px", background: "#F7F7F5", borderRadius: "8px", padding: "8px 12px" }}>
                        <span style={{ color: "#5C6B5E" }}>👥 {pool.memberCount}/{pool.memberLimit} members</span>
                        <span style={{ color: "#5C6B5E" }}>📅 {new Date(pool.deadline).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleJoinPool(pool.id) }}
                        style={{ width: "100%", padding: "11px", background: "rgba(0,200,83,0.08)", color: "#00C853", border: "1px solid rgba(0,200,83,0.25)", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,200,83,0.15)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,200,83,0.08)")}
                      >
                        View Pool
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}