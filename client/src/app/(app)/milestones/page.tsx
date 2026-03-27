"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { milestonesApi, poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface PoolItem {
  id: string
  name: string
}

interface MilestoneItem {
  id: string
  pool_id: string
  title: string
  description: string
  status: string
  current_approvals: number
  required_approvals: number
  target_date?: string
}

export default function MilestonesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const initialPoolId = searchParams.get("poolId") ?? ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [poolId, setPoolId] = useState(initialPoolId)
  const [pools, setPools] = useState<PoolItem[]>([])
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    void loadData()
  }, [isAuthenticated, router])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [poolsRes, milestonesRes] = await Promise.all([poolsApi.list(), milestonesApi.list()])
      const poolData = (poolsRes.data || []).map((p: any) => ({ id: p.id, name: p.name }))
      setPools(poolData)
      setMilestones(milestonesRes.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load milestones")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!poolId) return milestones
    return milestones.filter((m) => m.pool_id === poolId)
  }, [milestones, poolId])

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "36px 20px 56px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "18px", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", color: "#0D1F0F", marginBottom: "6px" }}>Milestones</h1>
            <p style={{ color: "#5C6B5E", fontSize: "14px" }}>Track approvals and manage milestone progress.</p>
          </div>
          <button
            onClick={() => router.push(`/milestones/create${poolId ? `?poolId=${poolId}` : ""}`)}
            style={{ border: "none", borderRadius: "999px", padding: "10px 16px", cursor: "pointer", background: "#00C853", color: "#0D1F0F", fontWeight: 700 }}
          >
            + Create
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <select value={poolId} onChange={(e) => setPoolId(e.target.value)} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #DCDCD7", minWidth: "220px" }}>
            <option value="">All pools</option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {pool.name}
              </option>
            ))}
          </select>
          <button onClick={loadData} style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #DCDCD7", background: "#fff", cursor: "pointer" }}>
            Refresh
          </button>
        </div>

        {loading && <p style={{ color: "#5C6B5E" }}>Loading milestones...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "14px", padding: "26px", color: "#5C6B5E" }}>
            No milestones found.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "grid", gap: "12px" }}>
            {filtered.map((m) => (
              <div key={m.id} style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                  <h3 style={{ color: "#0D1F0F", fontSize: "17px" }}>{m.title}</h3>
                  <span style={{ fontSize: "12px", color: m.status === "completed" ? "#00C853" : "#F59E0B", fontWeight: 700 }}>{m.status}</span>
                </div>
                <p style={{ color: "#5C6B5E", fontSize: "14px", marginBottom: "10px" }}>{m.description || "No description"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#8A9E8C" }}>
                    {m.current_approvals}/{m.required_approvals} approvals
                    {m.target_date ? ` • due ${new Date(m.target_date).toLocaleDateString()}` : ""}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => router.push(`/pools/${m.pool_id}`)} style={ghostBtn}>
                      Open Pool
                    </button>
                    <button onClick={() => router.push(`/milestones/${m.id}/edit`)} style={solidBtn}>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const solidBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "999px",
  padding: "8px 12px",
  background: "#00C853",
  color: "#0D1F0F",
  fontWeight: 700,
  cursor: "pointer",
}

const ghostBtn: React.CSSProperties = {
  border: "1px solid #DCDCD7",
  borderRadius: "999px",
  padding: "8px 12px",
  background: "#fff",
  color: "#0D1F0F",
  fontWeight: 600,
  cursor: "pointer",
}
