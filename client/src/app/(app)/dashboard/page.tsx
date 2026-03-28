"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { poolsApi, contributionsApi } from "@/lib/api"

interface UserPool {
  id: string
  name: string
  propertyTitle: string
  targetAmount: number
  raisedAmount: number
  memberCount: number
  memberLimit: number
  deadline: string
  status: string
  myContribution: number
  ownershipPct: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [pools, setPools] = useState<UserPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await poolsApi.list()
      const userPools = response.data.filter((pool: any) => 
        pool.creator_id === user.id || 
        pool.members?.some((m: any) => m.user_id === user.id)
      )
      
      const formattedPools: UserPool[] = userPools.map((pool: any) => ({
        id: pool.id,
        name: pool.name,
        propertyTitle: pool.property?.title || "Property",
        targetAmount: parseFloat(pool.target_amount),
        raisedAmount: parseFloat(pool.raised_amount || 0),
        memberCount: pool.member_count || 0,
        memberLimit: pool.member_limit || 0,
        deadline: pool.deadline,
        status: pool.status || "open",
        myContribution: 0,
        ownershipPct: 0
      }))
      
      try {
        const contributions = await contributionsApi.list()
        const contributionsData = contributions.data || []
        
        for (const pool of formattedPools) {
          const myContributions = contributionsData.filter((c: any) => 
            (c.pool_id === pool.id || c.poolId === pool.id) && 
            (c.user_id === user.id || c.userId === user.id)
          )
          pool.myContribution = myContributions.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
          pool.ownershipPct = pool.targetAmount > 0 ? (pool.myContribution / pool.targetAmount) * 100 : 0
        }
      } catch (err) {
        console.error("Failed to fetch contributions:", err)
      }
      
      setPools(formattedPools)
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err)
      setError(err.response?.data?.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchDashboardData()

    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchDashboardData, router])

  const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading dashboard...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>My Dashboard</h1>
        <p style={{ color: "#5C6B5E", marginBottom: "32px" }}>Welcome back, {user?.firstName || "User"}!</p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
          {pools.map(pool => {
            const progress = (pool.raisedAmount / pool.targetAmount) * 100
            const daysLeft = Math.max(0, Math.ceil((new Date(pool.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            
            return (
              <div key={pool.id} style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #E5E5E0" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{pool.name}</h3>
                <p style={{ fontSize: "14px", color: "#5C6B5E", marginBottom: "16px" }}>{pool.propertyTitle}</p>
                
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#5C6B5E" }}>Progress</span>
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>{progress.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: "8px", background: "#E5E5E0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "#00C853" }} />
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "#8A9E8C" }}>Raised</p>
                    <p style={{ fontSize: "16px", fontWeight: 600 }}>{fmt(pool.raisedAmount)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#8A9E8C" }}>Target</p>
                    <p style={{ fontSize: "16px", fontWeight: 600 }}>{fmt(pool.targetAmount)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#8A9E8C" }}>Members</p>
                    <p style={{ fontSize: "16px", fontWeight: 600 }}>{pool.memberCount}/{pool.memberLimit}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#8A9E8C" }}>Days Left</p>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: daysLeft < 7 ? "#F97316" : "#0D1F0F" }}>{daysLeft}</p>
                  </div>
                </div>
                
                <div style={{ background: "#F7F7F5", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#5C6B5E" }}>Your Contribution</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#00C853" }}>{fmt(pool.myContribution)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#5C6B5E" }}>Your Ownership</span>
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{pool.ownershipPct.toFixed(1)}%</span>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/pools/${pool.id}`)}
                  style={{ width: "100%", padding: "12px", background: "#00C853", color: "#0D1F0F", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                >
                  View Pool Details
                </button>
              </div>
            )
          })}

          {pools.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
              <p style={{ color: "#5C6B5E", marginBottom: "16px" }}>You haven&apos;t joined any pools yet</p>
              <button onClick={() => router.push("/listings")} style={{ padding: "12px 24px", background: "#00C853", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Explore Open Pools
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}