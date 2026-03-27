"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { contributionsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Contribution {
  id: string
  poolId: string
  poolName: string
  amount: number
  status: string
  createdAt: string
  reference: string
}

const fmt = (n: number) => {
  if (!n || isNaN(n)) return "₦0"
  return "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1_000).toFixed(0) + "K")
}

export default function PaymentsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return }
    fetchContributions()
  }, [isAuthenticated])

  const fetchContributions = async () => {
    try {
      setLoading(true)
      const data = await contributionsApi.list()
      const list = Array.isArray(data) ? data : []
      const formatted: Contribution[] = list.map((c: any) => ({
        id: c.id,
        poolId: c.pool_id || c.poolId || "",
        poolName: c.pool?.name || c.poolName || c.pool_name || "Pool",
        amount: parseFloat(c.amount || 0),
        status: c.status || "completed",
        createdAt: c.created_at || c.createdAt || new Date().toISOString(),
        reference: c.payment_ref || c.reference || c.id || "-",
      }))
      setContributions(formatted)
    } catch (err: any) {
      console.error("Failed to load payments:", err)
      setError(err.response?.data?.message || "Failed to load payment history")
    } finally {
      setLoading(false)
    }
  }

  const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0)

  const statusColor = (status: string) => {
    if (status === "completed" || status === "success") return { bg: "rgba(0,200,83,0.1)", color: "#00C853" }
    if (status === "pending") return { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" }
    return { bg: "rgba(220,38,38,0.1)", color: "#dc2626" }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <nav style={{ background: "#0D1F0F", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(0,200,83,0.15)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "25px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>
          <button
            onClick={() => router.push("/listings")}
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "999px", padding: "8px 20px", fontSize: "14px", cursor: "pointer" }}
          >
            ← Back
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: "#0D1F0F", marginBottom: "8px" }}>
          Payment History
        </h1>
        <p style={{ color: "#5C6B5E", marginBottom: "32px" }}>Your contributions across all pools</p>

        {!loading && contributions.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #E5E5E0" }}>
              <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Total Contributed</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#00C853" }}>{fmt(totalContributed)}</p>
            </div>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #E5E5E0" }}>
              <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Transactions</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#0D1F0F" }}>{contributions.length}</p>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#dc2626" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid #E5E5E0", borderTopColor: "#00C853", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}/>
            <p style={{ color: "#5C6B5E" }}>Loading payments...</p>
          </div>
        ) : contributions.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "80px 40px", textAlign: "center", border: "1px solid #E5E5E0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💳</div>
            <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "8px" }}>No payments yet</p>
            <p style={{ fontSize: "14px", color: "#8A9E8C", marginBottom: "24px" }}>Your contributions will appear here after you contribute to a pool.</p>
            <button
              onClick={() => router.push("/listings?tab=openPools")}
              style={{ padding: "12px 28px", background: "#00C853", color: "#0D1F0F", border: "none", borderRadius: "999px", fontWeight: 600, cursor: "pointer", fontSize: "15px" }}
            >
              Browse Open Pools
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E5E0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#F5F5F0" }}>
                <tr>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Pool</th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Reference</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Amount</th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Status</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => {
                  const sc = statusColor(c.status)
                  return (
                    <tr
                      key={c.id}
                      style={{ borderTop: "1px solid #E5E5E0", cursor: "pointer", transition: "background 0.15s" }}
                      onClick={() => c.poolId && router.push(`/pools/${c.poolId}`)}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F9F9F7")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px", fontWeight: 600, color: "#0D1F0F" }}>{c.poolName}</td>
                      <td style={{ padding: "16px", color: "#8A9E8C", fontSize: "12px", fontFamily: "monospace" }}>{c.reference}</td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: 700, color: "#0D1F0F" }}>{fmt(c.amount)}</td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: sc.bg, color: sc.color }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", fontSize: "13px", color: "#5C6B5E" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}