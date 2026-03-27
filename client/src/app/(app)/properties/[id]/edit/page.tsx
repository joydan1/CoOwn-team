"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { propertiesApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

type PropertyType = "apartment" | "house" | "land" | "commercial"

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "apartment" as PropertyType,
    description: "",
    imageUrl: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    void loadProperty()
  }, [isAuthenticated, router, propertyId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await propertiesApi.getOne(propertyId)
      const p = res.data
      setForm({
        title: p.title || "",
        location: p.location || "",
        price: String(p.price || ""),
        type: (p.type || "apartment") as PropertyType,
        description: p.description || "",
        imageUrl: p.image || p.images?.[0] || "",
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load property.")
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
    if (!form.title.trim() || !form.location.trim() || !form.price) {
      setError("Title, location and price are required.")
      return
    }
    const price = Number(form.price)
    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        location: form.location.trim(),
        price,
        type: form.type,
        description: form.description.trim(),
      }
      if (form.imageUrl.trim()) payload.images = [form.imageUrl.trim()]
      await propertiesApi.update(propertyId, payload as any)
      router.push(`/listings/${propertyId}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update property.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm("Delete this property? This cannot be undone.")
    if (!ok) return
    setDeleting(true)
    setError("")
    try {
      await propertiesApi.delete(propertyId)
      router.push("/listings")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete property.")
      setDeleting(false)
    }
  }

  if (loading) {
    return <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "28px", color: "#5C6B5E" }}>Loading property...</main>
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 20px 56px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", color: "#0D1F0F", marginBottom: "8px" }}>Edit Property</h1>
        <p style={{ color: "#5C6B5E", marginBottom: "16px" }}>Update listing details or remove this property.</p>
        {error && <div style={{ color: "#b91c1c", marginBottom: "10px" }}>{error}</div>}

        <form onSubmit={handleSave} style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "16px", padding: "18px" }}>
          <Field label="Title"><input value={form.title} onChange={(e) => onChange("title", e.target.value)} style={inputStyle} /></Field>
          <Field label="Location"><input value={form.location} onChange={(e) => onChange("location", e.target.value)} style={inputStyle} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Price (NGN)">
              <input type="number" min="1" value={form.price} onChange={(e) => onChange("price", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={(e) => onChange("type", e.target.value)} style={inputStyle}>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </Field>
          </div>
          <Field label="Image URL"><input value={form.imageUrl} onChange={(e) => onChange("imageUrl", e.target.value)} style={inputStyle} /></Field>
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
