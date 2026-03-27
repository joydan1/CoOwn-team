"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { poolsApi, contributionsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Pool {
  id: string
  name: string
  propertyTitle: string
  propertyLocation: string
  targetAmount: number
  raisedAmount: number
  memberCount: number
  memberLimit: number
  deadline: string
  status: string
  userContribution?: number
  userOwnership?: number
}

interface PaymentMethod {
  id: string
  name: string
  type: "local" | "international"
}

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

const paymentMethods: PaymentMethod[] = [
  { id: "card", name: "Debit Card", type: "local" },
  { id: "transfer", name: "Bank Transfer", type: "local" },
  { id: "usd", name: "Pay from Abroad (USD)", type: "international" },
  { id: "gbp", name: "Pay from Abroad (GBP)", type: "international" },
]

export default function ContributePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const poolId = params.id as string

  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string>("card")
  const [showCurrencySelector, setShowCurrencySelector] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<"NGN" | "USD" | "GBP">("NGN")

  useEffect(() => {
    fetchPoolData()
  }, [poolId])

  const fetchPoolData = async () => {
    try {
      setLoading(true)
      const res = await poolsApi.getOne(poolId)
      const data = res.data
      
      const transformedPool: Pool = {
        id: data.id,
        name: data.name,
        propertyTitle: data.property?.title || data.property_title || "Property",
        propertyLocation: data.property?.location || data.property_location || "Location",
        targetAmount: data.target_amount || 0,
        raisedAmount: data.raised_amount || 0,
        memberCount: data.member_count || 0,
        memberLimit: data.member_limit || 0,
        deadline: data.deadline,
        status: data.status,
        userContribution: data.user_contribution || data.userContribution || 0,
        userOwnership: data.user_ownership || data.userOwnership || 0
      }
      
      setPool(transformedPool)
    } catch (err: any) {
      console.error("Failed to fetch pool:", err)
      setError(err.response?.data?.message || "Failed to load pool")
    } finally {
      setLoading(false)
    }
  }

  const fetchExchangeRate = async (currency: string) => {
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`)
      const data = await res.json()
      setExchangeRate(data.rates.NGN)
    } catch (err) {
      console.error("Failed to fetch exchange rate:", err)
      setExchangeRate(currency === "USD" ? 1500 : 1900)
    }
  }

  const handleCurrencySelect = (currency: "USD" | "GBP") => {
    setSelectedCurrency(currency)
    fetchExchangeRate(currency)
    setShowCurrencySelector(false)
  }

  const getAmountInNGN = (): number => {
    const inputAmount = parseFloat(amount)
    if (isNaN(inputAmount)) return 0
    
    if (selectedCurrency === "NGN") return inputAmount
    if (exchangeRate) return inputAmount * exchangeRate
    
    return inputAmount * (selectedCurrency === "USD" ? 1500 : 1900)
  }

  const handleContribute = async () => {
    const contributionAmount = parseFloat(amount)
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (pool && contributionAmount > (pool.targetAmount - pool.raisedAmount)) {
      setError(`Maximum contribution is ${fmt(pool.targetAmount - pool.raisedAmount)}`)
      return
    }

    setProcessing(true)
    setError("")

    try {
      const amountInNGN = getAmountInNGN()
      
      // Map payment method to API expected values
      let paymentMethodValue = "card"
      if (selectedMethod === "transfer") {
        paymentMethodValue = "bank_transfer"
      } else if (selectedMethod === "usd" || selectedMethod === "gbp") {
        paymentMethodValue = "cross_border"
      }
      
      const payload: any = {
        pool_id: poolId,
        user_id: user?.id,
        amount: amountInNGN,
        currency: selectedCurrency === "NGN" ? "NGN" : 
                  selectedCurrency === "USD" ? "USD" : "GBP",
        paymentMethod: paymentMethodValue
      }
      
      if (selectedCurrency !== "NGN") {
        payload.original_amount = contributionAmount
        payload.exchange_rate = exchangeRate
      }

      console.log("Payment payload:", JSON.stringify(payload, null, 2))

      const response = await contributionsApi.pay(payload)
      
      console.log("Payment response:", response.data)
      
      if (response.data.paymentUrl) {
        router.push(response.data.paymentUrl)
      } else if (response.data.payment_ref) {
        router.push(`/pools/${poolId}?payment=success&ref=${response.data.payment_ref}`)
      } else {
        router.push(`/pools/${poolId}`)
      }
    } catch (err: any) {
      console.error("Payment failed:", err)
      
      if (err.response) {
        console.error("Error status:", err.response.status)
        console.error("Error data:", err.response.data)
      }
      
      let errorMessage = "Payment failed. Please try again."
      
      if (err.response?.data?.message) {
        if (typeof err.response.data.message === 'object') {
          const msgObj = err.response.data.message
          if (msgObj.fields) {
            const fieldErrors = Object.values(msgObj.fields).map((f: any) => f.message).join(', ')
            errorMessage = fieldErrors
          } else {
            errorMessage = JSON.stringify(msgObj)
          }
        } else {
          errorMessage = err.response.data.message
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      
      setError(errorMessage)
      setProcessing(false)
    }
  }

  const getSuggestedAmounts = (): number[] => {
    if (!pool) return []
    const remaining = pool.targetAmount - pool.raisedAmount
    const minAmount = Math.min(50000, remaining / 10)
    return [
      minAmount,
      Math.min(100000, remaining / 5),
      Math.min(250000, remaining / 2),
      remaining
    ].filter(a => a > 0 && a <= remaining)
  }

  const getNewOwnership = (): number => {
    if (!pool) return 0
    const contributionAmount = getAmountInNGN()
    if (contributionAmount <= 0) return pool.userOwnership || 0
    const totalAfter = pool.raisedAmount + contributionAmount
    const currentUserTotal = (pool.userContribution || 0) + contributionAmount
    return (currentUserTotal / totalAfter) * 100
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
          <p style={{ color: "#5C6B5E" }}>Loading pool information</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  if (error && !pool) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={() => router.push("/pools")}
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
            Back to My Pools
          </button>
        </div>
      </main>
    )
  }

  if (!pool) return null

  const remainingStake = pool.targetAmount - pool.raisedAmount
  const suggestedAmounts = getSuggestedAmounts()
  const newOwnership = getNewOwnership()
  const isInternational = selectedMethod === "usd" || selectedMethod === "gbp"

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
            onClick={() => router.push(`/pools/${poolId}`)}
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
            Contribute to {pool.name}
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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "#5C6B5E" }}>Pool Progress</span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#0D1F0F" }}>
              {fmt(pool.raisedAmount)} / {fmt(pool.targetAmount)}
            </span>
          </div>
          <div style={{ height: "8px", background: "#E5E5E0", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{
              height: "100%",
              width: `${(pool.raisedAmount / pool.targetAmount) * 100}%`,
              background: "#00C853",
              borderRadius: "999px"
            }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Remaining Stake</p>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#F97316" }}>{fmt(remainingStake)}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Your Current Stake</p>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#00C853" }}>
                {fmt(pool.userContribution || 0)} ({pool.userOwnership?.toFixed(1) || 0}%)
              </p>
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
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "12px" }}>
              Payment Method
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  style={{
                    padding: "12px",
                    background: selectedMethod === method.id ? "rgba(0,200,83,0.1)" : "#F5F5F0",
                    border: selectedMethod === method.id ? "2px solid #00C853" : "1px solid #E5E5E0",
                    borderRadius: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>{method.name}</span>
                  {method.type === "international" && (
                    <span style={{
                      display: "inline-block",
                      marginLeft: "8px",
                      padding: "2px 6px",
                      background: "rgba(0,200,83,0.1)",
                      borderRadius: "4px",
                      fontSize: "10px",
                      color: "#00C853"
                    }}>
                      Cross-border
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#2A3D2C", marginBottom: "8px" }}>
              Amount
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                {isInternational ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setShowCurrencySelector(!showCurrencySelector)}
                      style={{
                        padding: "14px 16px",
                        background: "#F5F5F0",
                        border: "1px solid #E5E5E0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        minWidth: "80px"
                      }}
                    >
                      {selectedCurrency} ▼
                    </button>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      style={{
                        flex: 1,
                        padding: "14px 16px",
                        background: "#F5F5F0",
                        border: "1px solid #E5E5E0",
                        borderRadius: "12px",
                        fontSize: "18px",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
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
                )}
              </div>
            </div>

            {showCurrencySelector && (
              <div style={{
                position: "absolute",
                background: "#fff",
                border: "1px solid #E5E5E0",
                borderRadius: "12px",
                padding: "8px",
                marginTop: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 100
              }}>
                <button
                  onClick={() => handleCurrencySelect("USD")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "8px"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F5F5F0")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  USD - US Dollar
                </button>
                <button
                  onClick={() => handleCurrencySelect("GBP")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "8px"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F5F5F0")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  GBP - British Pound
                </button>
              </div>
            )}

            {isInternational && exchangeRate && parseFloat(amount) > 0 && (
              <p style={{ fontSize: "12px", color: "#8A9E8C", marginTop: "8px" }}>
                ≈ {fmt(getAmountInNGN())} NGN at rate 1 {selectedCurrency} = ₦{exchangeRate}
              </p>
            )}

            {!isInternational && (
              <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {suggestedAmounts.map(suggested => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => setAmount(suggested.toString())}
                    style={{
                      padding: "6px 12px",
                      background: "#F5F5F0",
                      border: "none",
                      borderRadius: "999px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    {fmt(suggested)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {parseFloat(amount) > 0 && (
            <div style={{
              background: "rgba(0,200,83,0.08)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <p style={{ fontSize: "13px", color: "#2A3D2C", marginBottom: "4px" }}>Your new ownership stake</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#00C853" }}>
                {newOwnership.toFixed(1)}%
              </p>
              <p style={{ fontSize: "12px", color: "#5C6B5E", marginTop: "4px" }}>
                After contributing {isInternational ? `${selectedCurrency} ${parseFloat(amount).toLocaleString()}` : fmt(parseFloat(amount))}
              </p>
            </div>
          )}

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
            onClick={handleContribute}
            disabled={processing || !amount}
            style={{
              width: "100%",
              padding: "16px",
              background: (processing || !amount) ? "#BDBDBD" : "#00C853",
              color: (processing || !amount) ? "#6E6E6E" : "#0D1F0F",
              border: "none",
              borderRadius: "999px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: (processing || !amount) ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {processing ? "Processing..." : "Continue to Payment"}
          </button>
        </div>

        <div style={{
          background: "rgba(0,200,83,0.05)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(0,200,83,0.1)"
        }}>
          <p style={{ fontSize: "13px", color: "#2A3D2C", marginBottom: "8px", fontWeight: 600 }}>
            About contributions
          </p>
          <p style={{ fontSize: "12px", color: "#5C6B5E", lineHeight: 1.5 }}>
            Your contribution will be held in escrow until the pool reaches its target. 
            If the pool does not reach the target by the deadline, all funds will be 
            automatically refunded to contributors.
          </p>
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