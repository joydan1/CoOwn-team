"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { propertiesApi, poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
  description: string
  image: string
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
  memberCount: number
  memberLimit: number
  deadline: string
  status: "open" | "funding" | "active" | "completed"
}

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const [property, setProperty] = useState<Property | null>(null)
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"details" | "pools">("details")

  const propertyId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchData()
  }, [isAuthenticated, router, propertyId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch property details
      const propRes = await propertiesApi.getOne(propertyId)
      setProperty(propRes.data)
      
      // Fetch pools for this property
      const poolsRes = await poolsApi.list()
      const propertyPools = (poolsRes.data || []).filter(
        (pool: any) => pool.propertyId === propertyId
      )
      setPools(propertyPools)
      
    } catch (err: any) {
      console.error("Failed to fetch property:", err)
      setError(err.response?.data?.message || "Failed to load property")
    } finally {
      setLoading(false)
    }
  }

  const handleStartPool = () => {
    router.push(`/pools/create?propertyId=${propertyId}`)
  }

  const handleJoinPool = (poolId: string) => {
    router.push(`/pools/${poolId}/join`)
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #E5E5E0",
            borderTopColor: "#00C853",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#5C6B5E" }}>Loading property details...</p>
        </div>
      </main>
    )
  }

  if (error || !property) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error || "Property not found"}</p>
          <button
            onClick={() => router.push("/listings")}
            style={{
              padding: "12px 24px",
              background: "#00C853",
              color: "#0D1F0F",
              border: "none",
              borderRadius: "999px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Back to listings
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      
      {/* Navigation */}
      <nav style={{
        background: "#0D1F0F",
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(0,200,83,0.15)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "25px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>
          <button
            onClick={() => router.push("/listings")}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "8px 20px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Hero Image */}
      <div style={{ height: "400px", position: "relative", overflow: "hidden" }}>
        <img
          src={property.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef"}
          alt={property.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(13,31,15,0.8) 0%, transparent 50%)"
        }} />
        <div style={{
          position: "absolute",
          bottom: "40px",
          left: "24px",
          right: "24px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "8px",
            letterSpacing: "-1px"
          }}>
            {property.title}
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)" }}>
            {property.location}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Price Card */}
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "14px", color: "#5C6B5E", marginBottom: "4px" }}>Property Value</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 700, color: "#0D1F0F" }}>
                {fmt(property.price)}
              </p>
            </div>
            <button
              onClick={handleStartPool}
              style={{
                padding: "14px 32px",
                background: "#00C853",
                color: "#0D1F0F",
                border: "none",
                borderRadius: "999px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#00E676"; e.currentTarget.style.transform = "translateY(-2px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#00C853"; e.currentTarget.style.transform = "translateY(0)" }}
            >
              Start a Pool
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #E5E5E0", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab("details")}
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              fontSize: "16px",
              fontWeight: activeTab === "details" ? 600 : 400,
              color: activeTab === "details" ? "#00C853" : "#5C6B5E",
              borderBottom: activeTab === "details" ? "2px solid #00C853" : "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("pools")}
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              fontSize: "16px",
              fontWeight: activeTab === "pools" ? 600 : 400,
              color: activeTab === "pools" ? "#00C853" : "#5C6B5E",
              borderBottom: activeTab === "pools" ? "2px solid #00C853" : "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Active Pools ({pools.length})
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D1F0F", marginBottom: "16px" }}>Description</h3>
              <p style={{ fontSize: "16px", color: "#5C6B5E", lineHeight: 1.6 }}>
                {property.description || "No description available."}
              </p>
            </div>

            {(property.bedrooms || property.bathrooms || property.squareMeters) && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D1F0F", marginBottom: "16px" }}>Features</h3>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {property.bedrooms && (
                    <div>
                      <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Bedrooms</p>
                      <p style={{ fontSize: "24px", fontWeight: 600, color: "#0D1F0F" }}>{property.bedrooms}</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div>
                      <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Bathrooms</p>
                      <p style={{ fontSize: "24px", fontWeight: 600, color: "#0D1F0F" }}>{property.bathrooms}</p>
                    </div>
                  )}
                  {property.squareMeters && (
                    <div>
                      <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Size</p>
                      <p style={{ fontSize: "24px", fontWeight: 600, color: "#0D1F0F" }}>{property.squareMeters} sqm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {property.aiValuation && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D1F0F", marginBottom: "16px" }}>AI Valuation</h3>
                <div style={{
                  background: "rgba(0,200,83,0.06)",
                  border: "1px solid rgba(0,200,83,0.15)",
                  borderRadius: "16px",
                  padding: "20px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "14px", color: "#2A3D2C" }}>Estimated Range</span>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: property.aiValuation.confidence === "High" ? "rgba(74,222,128,0.2)" : "rgba(245,158,11,0.2)",
                      color: property.aiValuation.confidence === "High" ? "#4ADE80" : "#F59E0B"
                    }}>
                      {property.aiValuation.confidence} Confidence
                    </span>
                  </div>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: "#0D1F0F" }}>
                    {fmt(property.aiValuation.min)} - {fmt(property.aiValuation.max)}
                  </p>
                  {property.aiValuation.factors && (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "8px" }}>Factors</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {property.aiValuation.factors.map((factor, i) => (
                          <span key={i} style={{
                            padding: "4px 12px",
                            background: "#fff",
                            borderRadius: "999px",
                            fontSize: "12px",
                            color: "#2A3D2C"
                          }}>
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

        {/* Pools Tab */}
        {activeTab === "pools" && (
          <div>
            {pools.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "16px" }}>
                <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "16px" }}>No active pools for this property yet</p>
                <button
                  onClick={handleStartPool}
                  style={{
                    padding: "12px 24px",
                    background: "#00C853",
                    color: "#0D1F0F",
                    border: "none",
                    borderRadius: "999px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Be the first to start a pool
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {pools.map(pool => (
                  <div
                    key={pool.id}
                    onClick={() => router.push(`/pools/${pool.id}`)}
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      border: "1px solid #E5E5E0",
                      padding: "20px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,31,15,0.1)" }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D1F0F", marginBottom: "12px" }}>{pool.name}</h3>
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#5C6B5E", marginBottom: "6px" }}>
                        <span>Progress</span>
                        <span>{fmt(pool.currentAmount)} / {fmt(pool.targetAmount)}</span>
                      </div>
                      <div style={{ height: "8px", background: "#E5E5E0", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${(pool.currentAmount / pool.targetAmount) * 100}%`,
                          background: "#00C853",
                          borderRadius: "999px"
                        }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "16px" }}>
                      <span style={{ color: "#5C6B5E" }}>{pool.memberCount}/{pool.memberLimit} members</span>
                      <span style={{ color: "#5C6B5E" }}>Closes {new Date(pool.deadline).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoinPool(pool.id) }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "rgba(0,200,83,0.1)",
                        color: "#00C853",
                        border: "1px solid rgba(0,200,83,0.3)",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,200,83,0.2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,200,83,0.1)")}
                    >
                      Join Pool
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}