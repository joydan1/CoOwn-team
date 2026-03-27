"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { poolsApi, contributionsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Pool {
  id: string
  name: string
  propertyId: string
  propertyTitle: string
  propertyLocation: string
  propertyImage: string
  targetAmount: number
  raisedAmount: number
  memberCount: number
  memberLimit: number
  deadline: string
  status: "open" | "funding" | "active" | "completed"
  isPublic: boolean
  remainingStake?: number
  description?: string
}

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

export default function JoinPoolPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const poolId = params.id as string

  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const [contribution, setContribution] = useState("")
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/pools/join/${poolId}`)
      return
    }
    fetchPool()
  }, [isAuthenticated, router, poolId])

  const fetchPool = async () => {
    try {
      setLoading(true)
      const res = await poolsApi.getJoinInfo(poolId)
      setPool(res.data)
      
      if (res.data.isPublic && res.data.remainingStake) {
        setContribution(res.data.remainingStake.toString())
      }
    } catch (err: any) {
      console.error("Failed to fetch pool:", err)
      setError(err.response?.data?.message || "Pool not found or no longer available")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!agreed) {
      setError("You must agree to the co-ownership agreement")
      return
    }
    
    const amount = parseFloat(contribution)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid contribution amount")
      return
    }
    
    if (pool?.isPublic && pool.remainingStake && amount > pool.remainingStake) {
      setError(`Maximum contribution is ${fmt(pool.remainingStake)}`)
      return
    }

    setJoining(true)
    setError("")
    
    try {
      // Join the pool
      await poolsApi.join(poolId)
      
      // If contribution amount specified, create payment intent
      if (amount > 0) {
        // Use snake_case for payment payload
        const paymentPayload = {
          pool_id: poolId,
          user_id: user?.id,
          amount: amount,
          currency: "NGN",
          paymentMethod: "bank_transfer"
        }
        
        const paymentRes = await contributionsApi.pay(paymentPayload)
        
        if (paymentRes.data.paymentUrl) {
          router.push(paymentRes.data.paymentUrl)
        } else {
          router.push(`/pools/${poolId}`)
        }
      } else {
        router.push(`/pools/${poolId}`)
      }
    } catch (err: any) {
      console.error("Failed to join pool:", err)
      
      let errorMessage = "Failed to join pool"
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(errorMessage)
      setJoining(false)
    }
  }

  const calculateOwnership = () => {
    if (!pool) return 0
    const amount = parseFloat(contribution) || 0
    const totalAfter = pool.raisedAmount + amount
    return (amount / totalAfter) * 100
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
          <p style={{ color: "#5C6B5E" }}>Loading pool information...</p>
        </div>
      </main>
    )
  }

  if (error || !pool) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error || "Pool not found"}</p>
          <button
            onClick={() => router.push("/listings")}
            style={{
              padding: "12px 24px",
              background: "#00C853",
              color: "#0D1F0F",
              border: "none",
              borderRadius: "999px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Browse Properties
          </button>
        </div>
      </main>
    )
  }

  const isOpenPool = pool.isPublic && pool.status === "open"
  const remainingStake = pool.targetAmount - pool.raisedAmount
  const suggestedAmount = isOpenPool ? remainingStake : Math.min(remainingStake, pool.targetAmount / 4)

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>

      <nav style={{
        background: "#0D1F0F",
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(0,200,83,0.15)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "25px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" }}>
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
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 36px)",
            fontWeight: 700,
            color: "#0D1F0F",
            marginBottom: "8px"
          }}>
            Join {pool.name}
          </h1>
          <p style={{ fontSize: "16px", color: "#5C6B5E" }}>
            {pool.propertyTitle} • {pool.propertyLocation}
          </p>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "32px",
          border: "1px solid #E5E5E0"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Target Amount</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#0D1F0F" }}>{fmt(pool.targetAmount)}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Raised So Far</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#00C853" }}>{fmt(pool.raisedAmount)}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Remaining</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#F97316" }}>{fmt(remainingStake)}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Members</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#0D1F0F" }}>{pool.memberCount} / {pool.memberLimit}</p>
            </div>
          </div>
          
          <div style={{ marginTop: "20px" }}>
            <div style={{ height: "8px", background: "#E5E5E0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(pool.raisedAmount / pool.targetAmount) * 100}%`,
                background: "#00C853",
                borderRadius: "999px"
              }} />
            </div>
          </div>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          border: "1px solid #E5E5E0",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D1F0F", marginBottom: "20px" }}>
            Your Contribution
          </h3>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
              Amount (₦)
            </label>
            <input
              type="number"
              value={contribution}
              onChange={e => setContribution(e.target.value)}
              placeholder="e.g., 500000"
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "#F5F5F0",
                border: "1px solid #E5E5E0",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: 600,
                outline: "none"
              }}
            />
            {isOpenPool && (
              <p style={{ fontSize: "12px", color: "#8A9E8C", marginTop: "6px" }}>
                Maximum: {fmt(remainingStake)}
              </p>
            )}
            {!isOpenPool && (
              <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setContribution(Math.floor(suggestedAmount / 4).toString())}
                  style={{ padding: "6px 12px", background: "#F5F5F0", border: "none", borderRadius: "999px", fontSize: "12px", cursor: "pointer" }}
                >
                  {fmt(suggestedAmount / 4)}
                </button>
                <button
                  type="button"
                  onClick={() => setContribution(Math.floor(suggestedAmount / 2).toString())}
                  style={{ padding: "6px 12px", background: "#F5F5F0", border: "none", borderRadius: "999px", fontSize: "12px", cursor: "pointer" }}
                >
                  {fmt(suggestedAmount / 2)}
                </button>
                <button
                  type="button"
                  onClick={() => setContribution(Math.floor(suggestedAmount).toString())}
                  style={{ padding: "6px 12px", background: "#F5F5F0", border: "none", borderRadius: "999px", fontSize: "12px", cursor: "pointer" }}
                >
                  {fmt(suggestedAmount)}
                </button>
              </div>
            )}
          </div>

          {parseFloat(contribution) > 0 && (
            <div style={{
              background: "rgba(0,200,83,0.08)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px"
            }}>
              <p style={{ fontSize: "13px", color: "#2A3D2C", marginBottom: "4px" }}>Your estimated ownership after contribution</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#00C853" }}>
                {calculateOwnership().toFixed(1)}%
              </p>
              <p style={{ fontSize: "12px", color: "#5C6B5E", marginTop: "4px" }}>
                Based on total pool funds of {fmt(pool.raisedAmount + parseFloat(contribution))}
              </p>
            </div>
          )}

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: "2px", width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "14px", color: "#5C6B5E", lineHeight: 1.5 }}>
                I agree to the Co-Ownership Agreement, confirming that I understand my contribution gives me ownership rights in this property, and that all funds will be held in escrow until the pool reaches its target.
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "20px",
              color: "#dc2626",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={joining || !agreed || !contribution}
            style={{
              width: "100%",
              padding: "16px",
              background: (joining || !agreed || !contribution) ? "#BDBDBD" : "#00C853",
              color: (joining || !agreed || !contribution) ? "#6E6E6E" : "#0D1F0F",
              border: "none",
              borderRadius: "999px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: (joining || !agreed || !contribution) ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {joining ? "Processing..." : "Confirm & Continue"}
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(0,200,83,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span style={{ fontSize: "12px", color: "#5C6B5E" }}>Funds held in escrow</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(0,200,83,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span style={{ fontSize: "12px", color: "#5C6B5E" }}>Legal agreement included</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(0,200,83,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span style={{ fontSize: "12px", color: "#5C6B5E" }}>BVN-verified members</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}