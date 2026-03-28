"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { milestonesApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function EditMilestonePage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const milestoneId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [poolId, setPoolId] = useState("")
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_date: "",
    status: "pending",
  })

  const loadMilestone = useCallback(async () => {
    try {
      setLoading(true)
      const res = await milestonesApi.getOne(milestoneId)
      const m = res.data
      setPoolId(m.pool_id)
      setForm({
        title: m.title || "",
        description: m.description || "",
        target_date: m.target_date ? new Date(m.target_date).toISOString().slice(0, 10) : "",
        status: m.status || "pending",
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load milestone")
    } finally {
      setLoading(false)
    }
  }, [milestoneId])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    void loadMilestone()
  }, [isAuthenticated, router, loadMilestone])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await milestonesApi.update(milestoneId, {
        title: form.title.trim(),
        description: form.description.trim(),
        target_date: form.target_date ? new Date(form.target_date).toISOString() : undefined,
        status: form.status,
      } as any)
      router.push(poolId ? `/pools/${poolId}` : "/milestones")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update milestone")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm("Delete this milestone?")
    if (!ok) return
    setDeleting(true)
    setError("")
    try {
      await milestonesApi.delete(milestoneId)
      router.push(poolId ? `/pools/${poolId}` : "/milestones")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete milestone")
      setDeleting(false)
    }
  }

  if (loading) {
    return <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "30px", color: "#5C6B5E" }}>Loading milestone...</main>
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 20px 56px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", marginBottom: "6px", color: "#0D1F0F" }}>Edit Milestone</h1>
        <p style={{ color: "#5C6B5E", marginBottom: "18px" }}>Update details or remove this milestone.</p>

        {error && <div style={{ color: "#b91c1c", marginBottom: "12px" }}>{error}</div>}

        <form onSubmit={handleSave} style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "16px", padding: "18px" }}>
          <label style={labelStyle}>Title</label>
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} style={inputStyle} />

          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} style={inputStyle} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Target Date</label>
              <input type="date" value={form.target_date} onChange={(e) => setForm((p) => ({ ...p, target_date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={inputStyle}>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "space-between" }}>
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ ...btnBase, background: "#fff", border: "1px solid #dc2626", color: "#dc2626" }}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => router.back()} style={{ ...btnBase, background: "#fff", border: "1px solid #DCDCD7" }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ ...btnBase, background: saving ? "#BDBDBD" : "#00C853", border: "none", color: "#0D1F0F" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
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
