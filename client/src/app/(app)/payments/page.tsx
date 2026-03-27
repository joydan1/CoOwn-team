"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { contributionsApi, poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface ContributionItem {
  id: string
  pool_id: string
  user_id: string
  amount: number
  currency?: string
  payment_ref?: string
  created_at?: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [contributions, setContributions] = useState<ContributionItem[]>([])
  const [poolNames, setPoolNames] = useState<Record<string, string>>({})

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

      const [contributionsRes, poolsRes] = await Promise.all([contributionsApi.list(), poolsApi.list()])
      const allContribs: ContributionItem[] = contributionsRes.data || []
      const mine = allContribs.filter((c: any) => (c.user_id || c.userId) === user?.id)
      const normalized = mine.map((c: any) => ({
        id: c.id,
        pool_id: c.pool_id || c.poolId,
        user_id: c.user_id || c.userId,
        amount: Number(c.amount || 0),
        currency: c.currency || "NGN",
        payment_ref: c.payment_ref || c.paymentRef || "",
        created_at: c.created_at || c.createdAt,
      }))
      setContributions(normalized)

      const names: Record<string, string> = {}
      for (const p of poolsRes.data || []) {
        names[p.id] = p.name
      }
      setPoolNames(names)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load payments.")
    } finally {
      setLoading(false)
    }
  }

  const total = useMemo(() => contributions.reduce((sum, c) => sum + c.amount, 0), [contributions])
  const count = contributions.length

  const fmt = (n: number) => {
    const value = Number(n || 0)
    return "₦" + (value >= 1_000_000 ? (value / 1_000_000).toFixed(2) + "M" : value.toLocaleString())
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <nav style={{ background: "#0D1F0F", borderBottom: "1px solid rgba(0,200,83,0.15)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", height: "64px", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "25px", fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => router.push("/listings")} style={navBtn}>Listings</button>
            <button onClick={() => router.push("/pools")} style={navBtn}>My Pools</button>
            <button onClick={() => router.push("/milestones")} style={navBtn}>Milestones</button>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "34px 20px 60px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4vw, 40px)", color: "#0D1F0F", marginBottom: "8px" }}>
          Payments
        </h1>
        <p style={{ color: "#5C6B5E", marginBottom: "20px" }}>
          View your contribution payment history.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "18px" }}>
          <StatCard label="Total Paid" value={fmt(total)} accent />
          <StatCard label="Transactions" value={String(count)} />
        </div>

        {loading && <p style={{ color: "#5C6B5E" }}>Loading payments...</p>}
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

        {!loading && !error && contributions.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "14px", padding: "24px", textAlign: "center", color: "#5C6B5E" }}>
            No payment records yet.
          </div>
        )}

        {!loading && !error && contributions.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#F7F7F5" }}>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Pool</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Ref</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id} style={{ borderTop: "1px solid #EFEFEA" }}>
                    <td style={tdStyle}>{c.created_at ? new Date(c.created_at).toLocaleString() : "-"}</td>
                    <td style={tdStyle}>{poolNames[c.pool_id] || c.pool_id}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#0D1F0F" }}>{fmt(c.amount)}</td>
                    <td style={tdStyle}>{c.payment_ref || "-"}</td>
                    <td style={tdStyle}>
                      <button onClick={() => router.push(`/pools/${c.pool_id}`)} style={smallBtn}>
                        Open Pool
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "12px", padding: "14px" }}>
      <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "5px" }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: 800, color: accent ? "#00C853" : "#0D1F0F" }}>{value}</p>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: "13px",
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  fontSize: "12px",
  color: "#5C6B5E",
}

const tdStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "13px",
  color: "#2A3D2C",
}

const smallBtn: React.CSSProperties = {
  border: "1px solid #DCDCD7",
  background: "#fff",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "12px",
  cursor: "pointer",
}
