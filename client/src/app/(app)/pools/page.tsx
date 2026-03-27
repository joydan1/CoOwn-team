"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { poolsApi, contributionsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Pool {
  id: string
  name: string
  propertyId: string
  propertyTitle?: string
  propertyLocation?: string
  targetAmount: number
  currentAmount: number
  memberCount: number
  memberLimit: number
  deadline: string
  status: "open" | "funding" | "active" | "completed"
  userRole?: "creator" | "member"
  userContribution?: number
}

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

const getStatusConfig = (status: string) => {
  switch (status) {
    case "open":
      return { label: "Open for joining", color: "#00C853", bg: "rgba(0,200,83,0.1)" }
    case "funding":
      return { label: "Funding in progress", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" }
    case "active":
      return { label: "Active", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" }
    case "completed":
      return { label: "Completed", color: "#6B7280", bg: "rgba(107,114,128,0.1)" }
    default:
      return { label: "Draft", color: "#8A9E8C", bg: "rgba(138,158,140,0.1)" }
  }
}

export default function MyPoolsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "funding" | "active" | "completed">("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchPools()
  }, [isAuthenticated, router])

  const fetchPools = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await poolsApi.list()
      setPools(res.data || [])
    } catch (err: any) {
      console.error("Failed to fetch pools:", err)
      setError(err.response?.data?.message || "Failed to load pools")
    } finally {
      setLoading(false)
    }
  }

  const filteredPools = activeFilter === "all" 
    ? pools 
    : pools.filter(pool => pool.status === activeFilter)

  const getStatusCount = (status: string) => {
    return pools.filter(p => p.status === status).length
  }

  const handleJoinPool = (poolId: string) => {
    router.push(`/pools/${poolId}/join`)
  }

  const handleViewPool = (poolId: string) => {
    router.push(`/pools/${poolId}`)
  }

  const handleContribute = (poolId: string) => {
    router.push(`/pools/${poolId}/contribute`)
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
          <p style={{ color: "#5C6B5E" }}>Loading your pools...</p>
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
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push("/milestones")}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "999px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              Milestones
            </button>
            <button
              onClick={() => router.push("/pools/create")}
              style={{
                background: "#00C853",
                color: "#0D1F0F",
                border: "none",
                borderRadius: "999px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#00E676"; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#00C853"; e.currentTarget.style.transform = "translateY(0)" }}
            >
              New Pool
            </button>
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
              Explore Properties
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 42px)",
            fontWeight: 700,
            color: "#0D1F0F",
            letterSpacing: "-1px",
            marginBottom: "8px"
          }}>
            My Pools
          </h1>
          <p style={{ fontSize: "18px", color: "#5C6B5E" }}>
            Track your active investments and co-ownership pools.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #E5E5E0" }}>
            <p style={{ fontSize: "13px", color: "#8A9E8C", marginBottom: "8px" }}>Total Pools</p>
            <p style={{ fontSize: "32px", fontWeight: 700, color: "#0D1F0F" }}>{pools.length}</p>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #E5E5E0" }}>
            <p style={{ fontSize: "13px", color: "#8A9E8C", marginBottom: "8px" }}>Active Investments</p>
            <p style={{ fontSize: "32px", fontWeight: 700, color: "#00C853" }}>{pools.filter(p => p.status === "active" || p.status === "funding").length}</p>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #E5E5E0" }}>
            <p style={{ fontSize: "13px", color: "#8A9E8C", marginBottom: "8px" }}>Total Contributed</p>
            <p style={{ fontSize: "32px", fontWeight: 700, color: "#0D1F0F" }}>
              {fmt(pools.reduce((sum, p) => sum + (p.userContribution || 0), 0))}
            </p>
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #E5E5E0" }}>
            <p style={{ fontSize: "13px", color: "#8A9E8C", marginBottom: "8px" }}>Open Opportunities</p>
            <p style={{ fontSize: "32px", fontWeight: 700, color: "#F59E0B" }}>{getStatusCount("open")}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            color: "#dc2626"
          }}>
            {error}
            <button 
              onClick={fetchPools}
              style={{ marginLeft: "12px", color: "#00C853", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px", borderBottom: "1px solid #E5E5E0", paddingBottom: "16px" }}>
          {[
            { key: "all", label: "All", count: pools.length },
            { key: "open", label: "Open", count: getStatusCount("open") },
            { key: "funding", label: "Funding", count: getStatusCount("funding") },
            { key: "active", label: "Active", count: getStatusCount("active") },
            { key: "completed", label: "Completed", count: getStatusCount("completed") }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: activeFilter === filter.key ? 600 : 400,
                background: activeFilter === filter.key ? "#00C853" : "transparent",
                color: activeFilter === filter.key ? "#0D1F0F" : "#5C6B5E",
                border: activeFilter === filter.key ? "none" : "1px solid #E5E5E0",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Pools Grid */}
        {filteredPools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "20px" }}>
            <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "16px" }}>No pools found</p>
            <button
              onClick={() => router.push("/pools/create")}
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
              Create your first pool
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
            {filteredPools.map(pool => {
              const statusConfig = getStatusConfig(pool.status)
              const progress = (pool.currentAmount / pool.targetAmount) * 100
              const daysLeft = Math.max(0, Math.ceil((new Date(pool.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
              
              return (
                <div
                  key={pool.id}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    border: "1px solid #E5E5E0",
                    overflow: "hidden",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(13,31,15,0.1)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                >
                  <div style={{ padding: "20px" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0D1F0F", marginBottom: "4px" }}>
                          {pool.name}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#5C6B5E" }}>
                          {pool.propertyLocation || "Property location"}
                        </p>
                      </div>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: statusConfig.bg,
                        color: statusConfig.color
                      }}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Role Badge */}
                    {pool.userRole && (
                      <div style={{ marginBottom: "16px" }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 500,
                          background: pool.userRole === "creator" ? "rgba(0,200,83,0.1)" : "rgba(59,130,246,0.1)",
                          color: pool.userRole === "creator" ? "#00C853" : "#3B82F6"
                        }}>
                          {pool.userRole === "creator" ? "Pool Creator" : "Pool Member"}
                        </span>
                      </div>
                    )}

                    {/* Progress */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#5C6B5E", marginBottom: "6px" }}>
                        <span>Progress</span>
                        <span>{fmt(pool.currentAmount)} / {fmt(pool.targetAmount)}</span>
                      </div>
                      <div style={{ height: "8px", background: "#E5E5E0", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${progress}%`,
                          background: "#00C853",
                          borderRadius: "999px",
                          transition: "width 0.3s"
                        }} />
                      </div>
                      <p style={{ fontSize: "12px", color: "#8A9E8C", marginTop: "6px" }}>
                        {Math.round(progress)}% funded
                      </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", padding: "12px 0", borderTop: "1px solid #E5E5E0", borderBottom: "1px solid #E5E5E0" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "#8A9E8C", marginBottom: "2px" }}>Members</p>
                        <p style={{ fontSize: "16px", fontWeight: 600, color: "#0D1F0F" }}>
                          {pool.memberCount} / {pool.memberLimit}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#8A9E8C", marginBottom: "2px" }}>Days Left</p>
                        <p style={{ fontSize: "16px", fontWeight: 600, color: daysLeft < 7 ? "#F97316" : "#0D1F0F" }}>
                          {daysLeft} days
                        </p>
                      </div>
                      {pool.userContribution && pool.userContribution > 0 && (
                        <div>
                          <p style={{ fontSize: "11px", color: "#8A9E8C", marginBottom: "2px" }}>Your Contribution</p>
                          <p style={{ fontSize: "16px", fontWeight: 600, color: "#00C853" }}>
                            {fmt(pool.userContribution)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: "11px", color: "#8A9E8C", marginBottom: "2px" }}>Deadline</p>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#5C6B5E" }}>
                          {new Date(pool.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={() => handleViewPool(pool.id)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#0D1F0F",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1A3A1C")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#0D1F0F")}
                      >
                        View Details
                      </button>
                      {pool.status === "open" && (
                        <button
                          onClick={() => handleJoinPool(pool.id)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "#00C853",
                            color: "#0D1F0F",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#00E676")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#00C853")}
                        >
                          Join Pool
                        </button>
                      )}
                      {pool.status === "funding" && (
                        <button
                          onClick={() => handleContribute(pool.id)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "rgba(0,200,83,0.1)",
                            color: "#00C853",
                            border: "1px solid rgba(0,200,83,0.3)",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,200,83,0.2)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,200,83,0.1)")}
                        >
                          Contribute
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav" style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fff",
        borderTop: "1px solid #E5E5E0",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 20px",
        zIndex: 50
      }}>
        {[
          { icon: "🏠", label: "Explore", path: "/listings", active: false },
          { icon: "👥", label: "My Pools", path: "/pools", active: true },
          { icon: "💳", label: "Payments", path: "/payments", active: false },
          { icon: "👤", label: "Profile", path: "/profile", active: false },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 16px"
            }}
          >
            <span style={{ fontSize: "22px" }}>{item.icon}</span>
            <span style={{
              fontSize: "11px",
              fontWeight: 500,
              color: item.active ? "#00C853" : "#8A9E8C"
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .bottom-nav { display: none !important; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}