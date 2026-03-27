"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function EditPoolPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const poolId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    memberLimit: "",
    deadline: "",
    description: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    void loadPool()
  }, [isAuthenticated, router, poolId])

  const loadPool = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await poolsApi.getOne(poolId)
      const p = res.data
      setForm({
        name: p.name || "",
        targetAmount: String(p.target_amount || p.targetAmount || ""),
        memberLimit: String(p.member_limit || p.memberLimit || ""),
        deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "",
        description: p.description || "",
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load pool.")
    } finally {
      setLoading(false)
    }
  }

  const onChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.targetAmount || !form.memberLimit || !form.deadline) {
      setError("Name, target amount, member limit and deadline are required.")
      return
    }
    const target = Number(form.targetAmount)
    const limit = Number(form.memberLimit)
    if (!Number.isFinite(target) || target <= 0) return setError("Enter a valid target amount.")
    if (!Number.isFinite(limit) || limit < 2) return setError("Member limit must be at least 2.")

    setSaving(true)
    setError("")
    try {
      const payload = {
        name: form.name.trim(),
        target_amount: target,
        member_limit: limit,
        deadline: new Date(form.deadline).toISOString(),
        description: form.description.trim(),
      }
      await poolsApi.update(poolId, payload as any)
      router.push(`/pools/${poolId}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update pool.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm("Delete this pool? This cannot be undone.")
    if (!ok) return
    setDeleting(true)
    setError("")
    try {
      await poolsApi.delete(poolId)
      router.push("/pools")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete pool.")
      setDeleting(false)
    }
  }

  if (loading) {
    return <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "28px", color: "#5C6B5E" }}>Loading pool...</main>
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 20px 56px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", color: "#0D1F0F", marginBottom: "8px" }}>Edit Pool</h1>
        <p style={{ color: "#5C6B5E", marginBottom: "16px" }}>Update pool settings or remove this pool.</p>
        {error && <div style={{ color: "#b91c1c", marginBottom: "10px" }}>{error}</div>}

        <form onSubmit={handleSave} style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "16px", padding: "18px" }}>
          <Field label="Pool Name"><input value={form.name} onChange={(e) => onChange("name", e.target.value)} style={inputStyle} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Target Amount (NGN)">
              <input type="number" min="1" value={form.targetAmount} onChange={(e) => onChange("targetAmount", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Member Limit">
              <input type="number" min="2" value={form.memberLimit} onChange={(e) => onChange("memberLimit", e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <Field label="Deadline">
            <input type="date" value={form.deadline} onChange={(e) => onChange("deadline", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => onChange("description", e.target.value)} rows={4} style={inputStyle} />
          </Field>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ ...btnBase, background: "#fff", border: "1px solid #dc2626", color: "#dc2626" }}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => router.back()} style={{ ...btnBase, background: "#fff", border: "1px solid #DCDCD7" }}>Cancel</button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#2A3D2C", fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  )
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
