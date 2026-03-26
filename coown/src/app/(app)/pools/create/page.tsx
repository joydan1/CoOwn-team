"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { poolsApi, propertiesApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
}

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

export default function CreatePoolPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()
  const propertyIdParam = searchParams.get("propertyId")

  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    memberLimit: "",
    description: "",
    minContribution: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchProperties()
  }, [isAuthenticated, router])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await propertiesApi.listings()
      const props = res.data || []
      setProperties(props)

      if (propertyIdParam) {
        const property = props.find((p: Property) => p.id === propertyIdParam)
        if (property) {
          setSelectedProperty(property)
          setForm(prev => ({
            ...prev,
            name: `${property.title} Pool`,
            targetAmount: property.price.toString(),
          }))
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch properties:", err)
      setError(err.response?.data?.message || "Failed to load properties")
    } finally {
      setLoading(false)
    }
  }

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    setForm(prev => ({
      ...prev,
      name: `${property.title} Pool`,
      targetAmount: property.price.toString(),
    }))
    setError("")
  }

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const validateForm = () => {
    if (!selectedProperty) {
      setError("Please select a property")
      return false
    }
    if (!form.name.trim()) {
      setError("Pool name is required")
      return false
    }
    const target = parseFloat(form.targetAmount)
    if (isNaN(target) || target <= 0) {
      setError("Valid target amount is required")
      return false
    }
    if (target > selectedProperty.price) {
      setError(`Target amount cannot exceed property price (${fmt(selectedProperty.price)})`)
      return false
    }
    if (!form.deadline) {
      setError("Deadline is required")
      return false
    }
    if (new Date(form.deadline) <= new Date()) {
      setError("Deadline must be in the future")
      return false
    }
    const memberLimit = parseInt(form.memberLimit)
    if (isNaN(memberLimit) || memberLimit < 2) {
      setError("Member limit must be at least 2")
      return false
    }
    if (memberLimit > 50) {
      setError("Member limit cannot exceed 50")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setCreating(true)
    setError("")

    try {
      const payload: Record<string, any> = {
        property_id: selectedProperty!.id,
        name: form.name.trim(),
        target_amount: parseFloat(form.targetAmount),
        deadline: new Date(form.deadline).toISOString(),
        member_limit: parseInt(form.memberLimit),
      }

      if (form.description.trim()) {
        payload.description = form.description.trim()
      }

      if (form.minContribution && !isNaN(parseFloat(form.minContribution))) {
        payload.min_contribution = parseFloat(form.minContribution)
      }

      console.log("Creating pool with payload:", JSON.stringify(payload, null, 2))

      const res = await poolsApi.create(payload as any)

      console.log("Pool created:", res.data)
      setSuccess("Pool created successfully!")

      setTimeout(() => {
        router.push(`/pools/${res.data.id}`)
      }, 1500)

    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create pool. Please try again."

      console.error("Pool creation failed:", err.response?.data)
      setError(serverMessage)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #E5E5E0",
            borderTopColor: "#00C853",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#5C6B5E" }}>Loading properties...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>

      <nav style={{
        background: "#0D1F0F",
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(0,200,83,0.15)",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px"
        }}>
          <span onClick={() => router.push("/")} style={{
            fontFamily: "var(--font-display)",
            fontSize: "25px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.5px",
            cursor: "pointer"
          }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>
          <button
            onClick={() => router.push("/listings")}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "8px 20px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            Cancel
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>

        <div style={{ marginBottom: "40px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 42px)",
            fontWeight: 700,
            color: "#0D1F0F",
            letterSpacing: "-1px",
            marginBottom: "12px"
          }}>
            Create a Pool
          </h1>
          <p style={{ fontSize: "18px", color: "#5C6B5E" }}>
            Start a co-ownership pool and invite others to invest together.
          </p>
        </div>

        {success && (
          <div style={{
            background: "rgba(0,200,83,0.1)",
            border: "1px solid rgba(0,200,83,0.3)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            color: "#00C853"
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            color: "#dc2626",
            fontSize: "14px"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
              Select Property
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {properties.slice(0, 6).map(prop => (
                <div
                  key={prop.id}
                  onClick={() => handlePropertySelect(prop)}
                  style={{
                    padding: "16px",
                    background: selectedProperty?.id === prop.id ? "rgba(0,200,83,0.08)" : "#fff",
                    border: selectedProperty?.id === prop.id ? "2px solid #00C853" : "1px solid #E5E5E0",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0D1F0F", marginBottom: "4px" }}>{prop.title}</h3>
                  <p style={{ fontSize: "13px", color: "#5C6B5E", marginBottom: "8px" }}>{prop.location}</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#00C853" }}>{fmt(prop.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
              Pool Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="e.g., Lekki Phase 1 Investment Pool"
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "#fff",
                border: "1px solid #E5E5E0",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={e => (e.target.style.borderColor = "#00C853")}
              onBlur={e => (e.target.style.borderColor = "#E5E5E0")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
                Target Amount (₦)
              </label>
              <input
                type="number"
                value={form.targetAmount}
                onChange={e => handleChange("targetAmount", e.target.value)}
                placeholder="e.g., 45000000"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#fff",
                  border: "1px solid #E5E5E0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={e => (e.target.style.borderColor = "#00C853")}
                onBlur={e => (e.target.style.borderColor = "#E5E5E0")}
              />
              {selectedProperty && (
                <p style={{ fontSize: "12px", color: "#8A9E8C", marginTop: "4px" }}>
                  Max: {fmt(selectedProperty.price)}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
                Member Limit
              </label>
              <input
                type="number"
                value={form.memberLimit}
                onChange={e => handleChange("memberLimit", e.target.value)}
                placeholder="e.g., 10"
                min="2"
                max="50"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#fff",
                  border: "1px solid #E5E5E0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={e => (e.target.style.borderColor = "#00C853")}
                onBlur={e => (e.target.style.borderColor = "#E5E5E0")}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
                Fundraising Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => handleChange("deadline", e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#fff",
                  border: "1px solid #E5E5E0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={e => (e.target.style.borderColor = "#00C853")}
                onBlur={e => (e.target.style.borderColor = "#E5E5E0")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
                Min Contribution (Optional)
              </label>
              <input
                type="number"
                value={form.minContribution}
                onChange={e => handleChange("minContribution", e.target.value)}
                placeholder="e.g., 500000"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#fff",
                  border: "1px solid #E5E5E0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={e => (e.target.style.borderColor = "#00C853")}
                onBlur={e => (e.target.style.borderColor = "#E5E5E0")}
              />
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
              Pool Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              placeholder="Describe the pool, investment strategy, and expectations..."
              rows={4}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "#fff",
                border: "1px solid #E5E5E0",
                borderRadius: "12px",
                fontSize: "16px",
                fontFamily: "var(--font-body)",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={e => (e.target.style.borderColor = "#00C853")}
              onBlur={e => (e.target.style.borderColor = "#E5E5E0")}
            />
          </div>

          {selectedProperty && parseFloat(form.targetAmount) > 0 && parseInt(form.memberLimit) > 0 && (
            <div style={{
              background: "#fff",
              border: "1px solid #E5E5E0",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "32px"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0D1F0F", marginBottom: "16px" }}>Pool Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Property Value</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#0D1F0F" }}>{fmt(selectedProperty.price)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Target Amount</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#00C853" }}>{fmt(parseFloat(form.targetAmount))}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Members</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#0D1F0F" }}>{form.memberLimit} people</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Avg per Member</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#0D1F0F" }}>
                    {fmt(parseFloat(form.targetAmount) / parseInt(form.memberLimit))}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={creating || !selectedProperty}
            style={{
              width: "100%",
              padding: "16px",
              background: creating || !selectedProperty ? "#BDBDBD" : "#00C853",
              color: creating || !selectedProperty ? "#6E6E6E" : "#0D1F0F",
              border: "none",
              borderRadius: "999px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: creating || !selectedProperty ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {creating ? "Creating Pool..." : "Create Pool"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}