"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { milestonesApi, poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface PoolItem {
  id: string
  name: string
}

export default function CreateMilestonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()

  const [pools, setPools] = useState<PoolItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    pool_id: searchParams.get("poolId") ?? "",
    title: "",
    description: "",
    target_date: "",
    required_approvals: "1",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    void loadPools()
  }, [isAuthenticated, router])

  const loadPools = async () => {
    try {
      const res = await poolsApi.list()
      setPools((res.data || []).map((p: any) => ({ id: p.id, name: p.name })))
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load pools")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.pool_id || !form.title.trim() || !form.description.trim() || !form.target_date) {
      setError("Please fill all required fields")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        pool_id: form.pool_id,
        title: form.title.trim(),
        description: form.description.trim(),
        target_date: new Date(form.target_date).toISOString(),
        required_approvals: Math.max(1, Number(form.required_approvals) || 1),
      }
      await milestonesApi.create(payload as any)
      router.push(`/pools/${form.pool_id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create milestone")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 20px 56px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", marginBottom: "6px", color: "#0D1F0F" }}>Create Milestone</h1>
        <p style={{ color: "#5C6B5E", marginBottom: "18px" }}>Add a milestone and define approval requirements.</p>

        {error && <div style={{ color: "#b91c1c", marginBottom: "12px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "16px", padding: "18px" }}>
          <label style={labelStyle}>Pool</label>
          <select
            value={form.pool_id}
            onChange={(e) => setForm((prev) => ({ ...prev, pool_id: e.target.value }))}
            style={inputStyle}
          >
            <option value="">Select a pool</option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {pool.name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>Title</label>
          <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} style={inputStyle} />

          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            style={inputStyle}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Target Date</label>
              <input type="date" value={form.target_date} onChange={(e) => setForm((prev) => ({ ...prev, target_date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Required Approvals</label>
              <input
                type="number"
                min="1"
                value={form.required_approvals}
                onChange={(e) => setForm((prev) => ({ ...prev, required_approvals: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button type="button" onClick={() => router.back()} style={{ ...btnBase, background: "#fff", border: "1px solid #DCDCD7" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ ...btnBase, background: submitting ? "#BDBDBD" : "#00C853", border: "none", color: "#0D1F0F" }}>
              {submitting ? "Creating..." : "Create Milestone"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block",
  margin: "10px 0 6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#2A3D2C",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #DCDCD7",
  fontSize: "14px",
  background: "#fff",
}

const btnBase: React.CSSProperties = {
  borderRadius: "999px",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
}
