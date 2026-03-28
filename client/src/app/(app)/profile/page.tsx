"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usersApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function ProfilePage() {
  const router = useRouter()
  const { user, token, refreshToken, isAuthenticated, setAuth, logout } = useAuthStore()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  // ✅ FIX: Redirect using useEffect (React-safe)
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const initials = useMemo(() => {
    const first = form.firstName?.[0] || user?.firstName?.[0] || "U"
    const last = form.lastName?.[0] || user?.lastName?.[0] || ""
    return `${first}${last}`.toUpperCase()
  }, [form.firstName, form.lastName, user])

  // ✅ Prevent UI flash
  if (!isAuthenticated) return null

  const onChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      setError("User session is missing.")
      return
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      }

      const res = await usersApi.update(user.id, payload)
      const updatedUser = { ...user, ...res.data, email: user.email }

      if (token) {
        setAuth(updatedUser, token, refreshToken)
      }

      setSuccess("Profile updated successfully.")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update profile.")
    } finally {
      setSaving(false)
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
              fontSize: "25px",
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => router.push("/listings")} style={ghostNavBtn}>
              Listings
            </button>
            <button onClick={() => router.push("/pools")} style={ghostNavBtn}>
              My Pools
            </button>
            <button onClick={logout} style={ghostNavBtn}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(30px, 4vw, 40px)",
            color: "#0D1F0F",
            marginBottom: "10px",
          }}
        >
          Profile
        </h1>

        <p style={{ color: "#5C6B5E", marginBottom: "20px" }}>
          Manage your personal details.
        </p>

        <div
          style={{
            background: "#fff",
            border: "1px solid #E8E8E3",
            borderRadius: "18px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "#00C853",
                color: "#0D1F0F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              {initials}
            </div>

            <div>
              <p style={{ fontWeight: 700, color: "#0D1F0F" }}>
                {form.firstName || "User"} {form.lastName || ""}
              </p>
              <p style={{ fontSize: "13px", color: "#8A9E8C" }}>{form.email}</p>
            </div>
          </div>

          {error && <div style={{ marginBottom: "12px", color: "#b91c1c" }}>{error}</div>}
          {success && <div style={{ marginBottom: "12px", color: "#106b30" }}>{success}</div>}

          <form onSubmit={onSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="First Name">
                <input
                  value={form.firstName}
                  onChange={(e) => onChange("firstName", e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Last Name">
                <input
                  value={form.lastName}
                  onChange={(e) => onChange("lastName", e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="Email">
              <input
                value={form.email}
                disabled
                style={{ ...inputStyle, background: "#F7F7F5", color: "#8A9E8C" }}
              />
            </Field>

            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                style={inputStyle}
                placeholder="+234..."
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "13px",
                borderRadius: "999px",
                border: "none",
                background: saving ? "#BDBDBD" : "#00C853",
                color: saving ? "#6E6E6E" : "#0D1F0F",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "#2A3D2C",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid #DCDCD7",
  fontSize: "14px",
  background: "#fff",
}

const ghostNavBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: "13px",
}