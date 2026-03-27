"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { useAuthStore } from "@/store/auth"
import { poolsApi, contributionsApi } from "@/lib/api"

interface PoolMember { name: string; contribution: number; ownershipPct: number }
interface UserPool { id: string; name: string; propertyTitle: string; targetAmount: number; raisedAmount: number; memberCount: number; memberLimit: number; deadline: string; status: string; myContribution: number; ownershipPct: number; isPublic?: boolean; members?: PoolMember[] }

let socket: Socket

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [pools, setPools] = useState<UserPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "https://coown-team.onrender.com"
    socket = io(apiBase)
    socket.emit("joinPoolsRoom", user?.id)

    socket.on("poolUpdated", (updatedPool: UserPool) => {
      setPools((prevPools) => prevPools.map((pool) => pool.id === updatedPool.id ? { ...pool, ...updatedPool } : pool))
    })

    fetchDashboardData()

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, router, user?.id])

  const fetchDashboardData = async () => {
    try {
      const response = await poolsApi.list()
      const userPools = (response.data || []).filter((pool: any) => pool.creator_id === user?.id || pool.members?.some((m: any) => m.user_id === user?.id))

      const formattedPools: UserPool[] = userPools.map((pool: any) => ({
        id: pool.id,
        name: pool.name,
        propertyTitle: pool.property?.title || "Property",
        targetAmount: parseFloat(pool.target_amount || 0),
        raisedAmount: parseFloat(pool.raised_amount || 0),
        memberCount: pool.member_count || 0,
        memberLimit: pool.member_limit || 0,
        deadline: pool.deadline,
        status: pool.status || "open",
        myContribution: 0,
        ownershipPct: 0,
        isPublic: pool.is_public || false,
        members: [],
      }))

      for (const pool of formattedPools) {
        try {
          const contributions = await contributionsApi.list()
          const poolContributions = (contributions.data || []).filter((c: any) => c.pool_id === pool.id)

          pool.myContribution = poolContributions.filter((c: any) => c.user_id === user?.id).reduce((sum: number, c: any) => sum + c.amount, 0)
          const totalRaised = poolContributions.reduce((sum: number, c: any) => sum + c.amount, 0)
          pool.raisedAmount = totalRaised
          pool.ownershipPct = totalRaised > 0 ? (pool.myContribution / totalRaised) * 100 : 0

          pool.members = poolContributions.map((c: any) => ({
            name: c.user_name || "Member",
            contribution: c.amount,
            ownershipPct: totalRaised > 0 ? (c.amount / totalRaised) * 100 : 0,
          }))
        } catch (err) {
          console.error("Failed to fetch contributions for pool", pool.id, err)
        }
      }

      setPools(formattedPools)
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err)
      setError(err.response?.data?.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p>Loading dashboard...</p>
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1>My Dashboard</h1>
        {error ? <div>{error}</div> : <p>{pools.length} pools loaded</p>}
      </div>
    </main>
  )
}
