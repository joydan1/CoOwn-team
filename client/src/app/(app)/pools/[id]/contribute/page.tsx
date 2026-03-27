"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, contributionsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

// Interswitch configuration - will be fetched from backend
let MERCHANT_CODE = "MX275869"
let PAY_ITEM_ID = "Default_Payable_MX275869"
const CURRENCY_NUMERIC = 566 // NGN

export default function ContributePage() {
  // State to track if Interswitch script is loaded
  const [scriptLoaded, setScriptLoaded] = useState(false);
    // Dynamically load Interswitch script
    useEffect(() => {
      if (typeof window === "undefined") return;
      if ((window as any).webpayCheckout) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://newwebpay.qa.interswitchng.com/inline-checkout.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setScriptLoaded(false);
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }, []);
  const router = useRouter()
  const params = useParams()
  const poolId = params.id as string
  const { user, token } = useAuthStore()

  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [configLoaded, setConfigLoaded] = useState(false)


  // Fetch merchant configuration from backend
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        console.log("📋 Fetching payment configuration from backend...")
        const response = await api.get("/config/payment")
        const config = response.data

        MERCHANT_CODE = config.merchantCode
        PAY_ITEM_ID = config.payItemId
        console.log("✅ Payment config loaded:", { merchantCode: MERCHANT_CODE, payItemId: PAY_ITEM_ID })
        setConfigLoaded(true)
      } catch (err) {
        console.warn("⚠️ Could not fetch payment config:", err)
        setConfigLoaded(true) // Allow to proceed with defaults
      }
    }

    fetchPaymentConfig()
  }, [])

  const handlePaymentComplete = async (response: any, paymentData: any) => {
    console.log('💳 Interswitch callback response:', response)

    if (response.resp !== '00') {
      setError(`Payment failed: ${response.resp}`)
      setLoading(false)
      return
    }

    // Use txn_ref/payment_ref from Interswitch response
    const transactionRef = response.txnref || response.payRef || paymentData.payment_ref;
    const verifyPayload = {
      ...paymentData,
      payment_ref: transactionRef,
    };

    try {
      console.log('📤 Verifying payment with backend...')
      const verifyResponse = await contributionsApi.verify(verifyPayload)
      console.log('✅ Backend verification response:', verifyResponse.data)
      setLoading(false)
      alert(`Payment successful! You have contributed ₦${paymentData.amount / 100}`)
      router.push(`/pools/${poolId}`)
    } catch (err: any) {
      console.error('❌ Verification error:', err)
      setError(`Payment verification failed: ${err.response?.data?.message || err.message}`)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const contributionAmount = parseFloat(amount)
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!user?.id) {
      setError("User ID not found")
      return
    }

    setLoading(true)
    setError("")

        try {
          // Prepare payment data for Interswitch
          const amountInKobo = Math.floor(contributionAmount * 100)

          // Generate txn_ref (restore previous logic)
          const txnRef = `COOWN-${poolId}-${user.id}-${Date.now()}`

          const paymentData = {
            pool_id: poolId,
            user_id: user.id,
            merchant_code: MERCHANT_CODE,
            amount: amountInKobo,
            currency: 'NGN',
            payment_ref: txnRef // Will be set after payment
          }

          // Wait for Interswitch script to be loaded
          if (!scriptLoaded || typeof (window as any).webpayCheckout !== 'function') {
            setLoading(false);
            setError('Interswitch checkout script not loaded. Please try again in a moment.');
            return;
          }

          (window as any).webpayCheckout({
            merchant_code: MERCHANT_CODE,
            pay_item_id: PAY_ITEM_ID,
            txn_ref: txnRef, // Restore txn_ref logic
            amount: amountInKobo,
            currency: CURRENCY_NUMERIC,
            cust_email: user.email,
            mode: 'TEST',
            site_redirect_url: `${window.location.origin}/pools/${poolId}/contribute`,
            onComplete: function(response: any) {
              console.log('✅ Payment complete callback:', response)
              handlePaymentComplete(response, paymentData)
            },
            onError: function(error: any) {
              console.error('❌ Interswitch error:', error)
              setError(`Payment error: ${error?.message || JSON.stringify(error)}`)
              setLoading(false)
            }
          });

        } catch (err: any) {
          console.error("❌ Payment error:", err)
          setError(err.response?.data?.message || err.message || "Failed to start payment")
          setLoading(false)
        }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px 24px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <button 
          onClick={() => router.back()} 
          style={{ background: "none", border: "none", marginBottom: "24px", cursor: "pointer", fontSize: "16px" }}
        >
          ← Back to Pool
        </button>

        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>Contribute to Pool</h1>
        <p style={{ color: "#5C6B5E", marginBottom: "32px" }}>Enter the amount you want to contribute</p>

        {error && (
          <div style={{ 
            background: "#fee2e2", 
            color: "#dc2626", 
            padding: "14px", 
            borderRadius: "8px", 
            marginBottom: "20px" 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ₦ (e.g. 50000)"
            style={{ 
              width: "100%", 
              padding: "14px", 
              border: "1px solid #ddd", 
              borderRadius: "8px", 
              marginBottom: "20px", 
              fontSize: "16px" 
            }}
            required
          />

          <button
            type="submit"
            disabled={loading || !configLoaded}
            style={{ 
              width: "100%", 
              padding: "16px", 
              background: (loading || !configLoaded) ? "#9CA3AF" : "#00C853", 
              color: "#0D1F0F", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: 600, 
              fontSize: "16px",
              cursor: loading || !configLoaded ? "not-allowed" : "pointer"
            }}
          >
            {loading
              ? "Processing..."
              : !configLoaded
                ? "Loading Config..."
                : !scriptLoaded
                  ? "Loading Payment..."
                  : "Continue to Pay"}
          </button>
        </form>
      </div>
    </main>
  )
}