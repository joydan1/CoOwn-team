"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { propertiesApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

type PropertyType = "apartment" | "house" | "land" | "commercial"

export default function CreatePropertyPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "apartment" as PropertyType,
    imageUrl: "",
  })

  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  const onChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const validate = () => {
    if (!form.title.trim()) return "Title is required"
    if (!form.location.trim()) return "Location is required"

    const price = Number(form.price)
    if (!Number.isFinite(price) || price <= 0) return "Enter a valid price"

    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        location: form.location.trim(),
        price: Number(form.price),
        type: form.type,
      }

      if (form.imageUrl.trim()) {
        payload.images = [form.imageUrl.trim()]
      }

      await propertiesApi.create(payload as any)
      setSuccess("Property created successfully.")

      setTimeout(() => {
        router.push("/listings")
      }, 900)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create property."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <nav style={{ background: "#0D1F0F", borderBottom: "1px solid rgba(0,200,83,0.15)" }}>
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            height: "64px",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            onClick={() => router.push("/")}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              letterSpacing: "-0.4px",
            }}
          >
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>

          <button
            onClick={() => router.push("/listings")}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Back to Listings
          </button>
        </div>
      </nav>

      <section style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px 64px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(30px, 4vw, 40px)",
            color: "#0D1F0F",
            marginBottom: "10px",
            letterSpacing: "-1px",
          }}
        >
          Create Property
        </h1>
        <p style={{ color: "#5C6B5E", marginBottom: "24px", fontSize: "16px" }}>
          Add a new property listing that can later be used to create pools.
        </p>

        {success && (
          <div
            style={{
              background: "rgba(0,200,83,0.08)",
              border: "1px solid rgba(0,200,83,0.25)",
              color: "#106b30",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "16px",
            }}
          >
            {success}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.22)",
              color: "#b91c1c",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #E8E8E3", borderRadius: "16px", padding: "20px" }}>
          <Field label="Property Title">
            <input
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="e.g., Lekki Waterfront Apartments"
              style={inputStyle}
            />
          </Field>

          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="e.g., Lekki, Lagos"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Price (NGN)">
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
                placeholder="45000000"
                style={inputStyle}
              />
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

          <Field label="Image URL (optional)">
            <input
              value={form.imageUrl}
              onChange={(e) => onChange("imageUrl", e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              borderRadius: "999px",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              background: submitting ? "#BDBDBD" : "#00C853",
              color: submitting ? "#6E6E6E" : "#0D1F0F",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            {submitting ? "Creating Property..." : "Create Property"}
          </button>
        </form>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "13px", color: "#2A3D2C", fontWeight: 600, marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: "10px",
  border: "1px solid #DCDCD7",
  fontSize: "15px",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
}
