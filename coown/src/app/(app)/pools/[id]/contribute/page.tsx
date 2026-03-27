"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { contributionsApi, poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function ContributePage() {
  const router = useRouter()
  const params = useParams()
  const poolId = params.id as string
  const { user } = useAuthStore()

  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [error, setError] = useState("")
  const [poolName, setPoolName] = useState("this pool")

  // Load Interswitch script on mount
  useEffect(() => {
    // Fetch pool name for display
    poolsApi.getOne(poolId).then((data: any) => {
      setPoolName(data?.name || "this pool")
    }).catch(() => {})

    // Check if already loaded
    if (typeof (window as any).webpayCheckout === "function") {
      setScriptReady(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://newwebpay.qa.interswitchng.com/inline-checkout.js"
    script.async = true
    script.onload = () => {
      console.log(" Interswitch script loaded")
      setScriptReady(true)
    }
    script.onerror = () => {
      console.error("Failed to load Interswitch script")
      setError("Payment provider failed to load. Please refresh and try again.")
    }
    document.body.appendChild(script)

    return () => {
      // Don't remove — keep for reuse
    }
  }, [poolId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const contributionAmount = parseFloat(amount)
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!scriptReady || typeof (window as any).webpayCheckout !== "function") {
      setError("Payment provider not ready. Please wait a moment and try again.")
      return
    }

    setLoading(true)

    try {
      // Call backend to create the contribution record and get a payment ref
      const response = await contributionsApi.pay({
        pool_id: poolId,
        user_id: user?.id,
        amount: contributionAmount,
        currency: "NGN",
        paymentMethod: "card",
      })

      const paymentRef =
        response?.payment_ref ||
        response?.paymentRef ||
        response?.reference ||
        response?.id ||
        `COOWN-${Date.now()}`

      console.log(" Payment ref:", paymentRef)

      const paymentData = {
        merchantCode: "MX275869",
        payItemID: "Default_Payable_MX275869",
        amount: Math.round(contributionAmount * 100).toString(), // in kobo
        currencyCode: "566", // NGN
        customerEmail: user?.email || "customer@example.com",
        transactionReference: paymentRef,
        siteRedirectURL: `${window.location.origin}/payments/callback`,
        mode: "TEST",
      }

      console.log("🚀 Launching Interswitch with:", paymentData)

      if (!(window as any).webpayCheckout) {
        setError("Payment provider not ready. Please refresh the page and try again.");
        setLoading(false);
        return;
      }

      ;(window as any).webpayCheckout(paymentData, {
        onComplete: (res: any) => {
          console.log("Payment completed:", res)
          setLoading(false)
          router.push(`/pools/${poolId}?payment=success`)
        },
        onClose: () => {
          console.log("Modal closed by user")
          setLoading(false)
        },
        onError: (err: any) => {
          console.error(" Payment error:", err)
          setError("Payment was not completed. Please try again.")
          setLoading(false)
        },
      })

    } catch (err: any) {
      console.error("Backend error:", err)
      setError(err.response?.data?.message || "Failed to initiate payment. Please try again.")
      setLoading(false)
    }
  }

  const fmt = (n: number) => {
    if (!n || isNaN(n)) return ""
    return "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1_000).toFixed(0) + "K")
  }

  const amountNum = parseFloat(amount)
  const amountPreview = !isNaN(amountNum) && amountNum > 0 ? fmt(amountNum) : ""

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>
      <nav style={{
        background: "#0D1F0F", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(0,200,83,0.15)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "25px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>
          <button
            onClick={() => router.back()}
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "999px", padding: "8px 20px", fontSize: "14px", cursor: "pointer" }}
          >
             Back
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "500px", margin: "60px auto", padding: "0 24px" }}>
        <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", border: "1px solid #E5E5E0", boxShadow: "0 4px 24px rgba(13,31,15,0.06)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "#0D1F0F", marginBottom: "8px" }}>
            Contribute
          </h1>
          <p style={{ color: "#5C6B5E", marginBottom: "32px", fontSize: "15px" }}>
            Contributing to <strong>{poolName}</strong>
          </p>

          {!scriptReady && !error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,200,83,0.06)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
              <div style={{ width: "14px", height: "14px", border: "2px solid #E5E5E0", borderTopColor: "#00C853", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }}/>
              <span style={{ fontSize: "13px", color: "#5C6B5E" }}>Loading payment provider...</span>
            </div>
          )}

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "14px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
                Amount (₦)
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
                  fontSize: "20px", fontWeight: 600, color: "#0D1F0F", pointerEvents: "none"
                }}>₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  style={{
                    width: "100%", padding: "16px 16px 16px 36px",
                    border: "1px solid #E5E5E0", borderRadius: "12px",
                    fontSize: "20px", fontWeight: 600, outline: "none",
                    boxSizing: "border-box", color: "#0D1F0F",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#00C853")}
                  onBlur={e => (e.target.style.borderColor = "#E5E5E0")}
                  required
                />
              </div>
              {amountPreview && (
                <p style={{ fontSize: "13px", color: "#00C853", fontWeight: 600, marginTop: "6px" }}>
                  = {amountPreview}
                </p>
              )}
            </div>

            {/* Quick amounts */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
              {[100000, 250000, 500000, 1000000].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  style={{
                    padding: "8px 16px",
                    background: amount === preset.toString() ? "#00C853" : "#F5F5F0",
                    color: amount === preset.toString() ? "#0D1F0F" : "#5C6B5E",
                    border: "none", borderRadius: "999px",
                    fontSize: "13px", fontWeight: 500, cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {fmt(preset)}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !scriptReady}
              style={{
                width: "100%", padding: "16px",
                background: loading || !scriptReady ? "#BDBDBD" : "#00C853",
                color: loading || !scriptReady ? "#6E6E6E" : "#0D1F0F",
                border: "none", borderRadius: "999px",
                fontSize: "16px", fontWeight: 700,
                cursor: loading || !scriptReady ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
                  Processing...
                </>
              ) : (
                `Pay ${amountPreview || "now"} →`
              )}
            </button>
          </form>

          <p style={{ fontSize: "12px", color: "#8A9E8C", textAlign: "center", marginTop: "20px" }}>
            Secured by Interswitch. You will be redirected to complete payment.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}